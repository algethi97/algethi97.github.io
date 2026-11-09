import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

const output = dirname(fileURLToPath(import.meta.url));
const root = resolve(output, '../..');
const pages = ['about', 'portfolio', 'guestbook', 'game', 'index'];
const widths = [360, 400, 700];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const server = createServer(async (req, res) => {
  const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  // Only serve the public assets needed by these five pages.
  const relative = path.slice(root.length + 1);
  if (!path.startsWith(root + sep) || relative.split(/[\\/]/).some(p => p.startsWith('.')) ||
      !/^(?:[^\\/]+\.(?:html|css|js)|(?:css|game|images)[\\/].+)$/.test(relative)) {
    res.writeHead(403).end(); return;
  }
  try {
    const data = await readFile(path);
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' }).end(data);
  } catch { res.writeHead(404).end(); }
});
let chrome, socket, profile, watchdog;
const rows = [];
try {
  await mkdir(output, { recursive: true });
  profile = await mkdtemp(resolve(output, 'chrome-profile-'));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', 'about:blank'
  ], { windowsHide: true, stdio: 'ignore' });
  let launchError;
  chrome.on('error', error => { launchError = error; });
  let expired = false;
  watchdog = setTimeout(() => { expired = true; socket?.close(); chrome.kill(); }, 60000);
  const until = async (fn, label) => {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline && !expired) {
      if (launchError) throw launchError;
      if (await fn()) return;
      await delay(50);
    }
    throw new Error(`Timed out: ${label}`);
  };
  let port;
  await until(async () => {
    try { port = Number((await readFile(resolve(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); return port > 0; }
    catch { return false; }
  }, 'Chrome debugger');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await once(socket, 'open');
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (pending.has(message.id)) {
      pending.get(message.id)(message); pending.delete(message.id);
    }
  });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 8000);
    pending.set(id, message => {
      clearTimeout(timer);
      message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await cdp('Page.enable');
  for (const width of widths) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: true });
    for (const page of pages) {
      await cdp('Page.navigate', { url: `${origin}/${page}.html` });
      await until(() => evaluate(`location.pathname === '/${page}.html' && document.readyState === 'complete' && !document.body.classList.contains('page-entering') && document.querySelectorAll('.tab-item').length === 4`), `${page} ready`);
      await evaluate('document.fonts.ready.then(() => true)');
      if (page === 'index') {
        await evaluate("document.querySelector('.monitor-screen').click()");
        await until(() => evaluate("document.querySelector('.desk-viewport').classList.contains('is-zoomed')"), 'monitor zoom');
      }
      // Allow entry and zoom transitions to settle before measuring or capturing.
      await delay(1100);
      await evaluate("window.scrollTo(0, 0); document.querySelector('.tabs-container').scrollIntoView({block: 'nearest', behavior: 'instant'}); new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
      const measured = await evaluate(`(() => {
        const rect = el => { const r = el.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height }; };
        const container = rect(document.querySelector('.tabs-container'));
        const tabs = [...document.querySelectorAll('.tab-item')].map(el => {
          const box = rect(el), style = getComputedStyle(el);
          const range = document.createRange(); range.selectNodeContents(el);
          const text = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0).map(r => ({left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}));
          const scale = box.width / parseFloat(style.width);
          const clipping = [];
          for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
            const bounds = rect(ancestor), css = getComputedStyle(ancestor);
            const clipsX = /hidden|clip|auto|scroll/.test(css.overflowX);
            const clipsY = /hidden|clip|auto|scroll/.test(css.overflowY);
            if ((clipsX && (box.left < bounds.left - 0.5 || box.right > bounds.right + 0.5)) ||
                (clipsY && (box.top < bounds.top - 0.5 || box.bottom > bounds.bottom + 0.5))) {
              clipping.push({ tag:ancestor.tagName, className:ancestor.className, bounds });
            }
          }
          return { id:el.id, fontSize:parseFloat(style.fontSize), displayedFontSize:parseFloat(style.fontSize)*scale,
            box, text, scrollWidth:el.scrollWidth, clientWidth:el.clientWidth,
            clipping, visibleInAncestors:clipping.length === 0 && box.top >= 0 && box.bottom <= innerHeight && box.width > 0 && box.height > 0,
            noOverflow:el.scrollWidth <= el.clientWidth,
            insideContainer:box.left >= container.left - 0.5 && box.right <= container.right + 0.5,
            textInside:text.every(r => r.left >= box.left - 0.5 && r.right <= box.right + 0.5 && r.top >= box.top - 0.5 && r.bottom <= box.bottom + 0.5) };
        });
        const header = document.querySelector('.nav-header');
        const headerStyle = getComputedStyle(header);
        return { viewportWidth:innerWidth, zoomed:document.querySelector('.desk-viewport')?.classList.contains('is-zoomed') ?? false,
          header: { box:rect(header), overflow:headerStyle.overflow, visibility:headerStyle.visibility, opacity:headerStyle.opacity },
          main:rect(document.querySelector('main')), scrollY, container, tabs };
      })()`);
      const screenshot = `${page}-${width}.png`;
      const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: 0, y: 0, width, height: 900, scale: 1 } });
      await writeFile(resolve(output, screenshot), Buffer.from(data, 'base64'));
      const passed = measured.viewportWidth === width && (page !== 'index' || measured.zoomed) && measured.tabs.length === 4 &&
        measured.tabs.every(t => t.noOverflow && t.insideContainer && t.textInside && t.visibleInAncestors && (page === 'index' || Math.abs(t.fontSize - 12.48) < 0.01));
      rows.push({ page, width, screenshot, passed, ...measured });
      console.log(JSON.stringify({ page, width, passed, header:measured.header, main:measured.main, scrollY:measured.scrollY, fonts:measured.tabs.map(t => t.fontSize), displayedFonts:measured.tabs.map(t => t.displayedFontSize), widths:measured.tabs.map(t => [t.scrollWidth,t.clientWidth]) }));
    }
  }
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ rows, passed: rows.every(r => r.passed) }, null, 2));
  if (rows.some(r => !r.passed)) process.exitCode = 1;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  clearTimeout(watchdog);
  socket?.close();
  if (chrome?.pid && chrome.exitCode === null) {
    const exited = once(chrome, 'exit');
    chrome.kill();
    await exited;
  }
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  if (profile) await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
