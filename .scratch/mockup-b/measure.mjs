import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

const output = dirname(fileURLToPath(import.meta.url));
const root = resolve(output, '../../design/mockups/b-editorial');
const pages = ['index', 'portfolio'];
const widths = [1440, 390];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const server = createServer(async (req, res) => {
  const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  // Only serve the public assets needed by these five pages.
  const relative = path.slice(root.length + 1);
  if (!path.startsWith(root + sep) || relative.split(/[\\/]/).some(p => p.startsWith('.')) ||
      !/^[a-z-]+\.(?:html|css|svg)$/.test(relative)) {
    res.writeHead(403).end(); return;
  }
  try {
    const data = await readFile(path);
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
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
  const errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params);
  });
  await cdp('Runtime.enable');
  const sourceHome = await readFile(resolve(root, '../../../index.html'), 'utf8');
  const sourcePortfolio = await readFile(resolve(root, '../../../portfolio.html'), 'utf8');
  const textOf = html => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&rarr;/g, '→').replace(/\s+/g, ' ').trim();
  for (const width of widths) {
    const height = width === 390 ? 844 : 900;
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width === 390 });
    for (const page of pages) {
      await cdp('Page.navigate', { url: `${origin}/${page}.html` });
      await until(() => evaluate(`location.pathname === '/${page}.html' && document.readyState === 'complete'`), `${page} ready`);
      await evaluate('document.fonts.ready.then(() => true)');
      const states = page === 'index' ? ['desk', 'zoom'] : ['portfolio'];
      for (const state of states) {
        if (state === 'zoom') {
          const point = await evaluate(`(() => { const r = document.querySelector('.monitor-hint-overlay').getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; })()`);
          await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
          await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
        }
        await delay(950);
        const measured = await evaluate(`(() => {
          const screen = document.querySelector('.monitor-screen');
          const content = document.querySelector('.monitor-scrollable');
          const bounds = element => { const r = element.getBoundingClientRect(); return {left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height}; };
          const result = {innerWidth, scrollWidth:document.documentElement.scrollWidth,
            zoomed:document.querySelector('.is-zoomed') !== null,
            cards:document.querySelectorAll('.project-card').length,
            links:[...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
            text:document.body.textContent, headings:[...document.querySelectorAll('.project-body h3')].map(e=>e.textContent),
            descriptions:[...document.querySelectorAll('.project-body p, .quick-link-card p, .page-subtitle')].map(e=>e.textContent.replace(/\\s+/g,' ').trim()),
            mainWidth:document.querySelector('main').scrollWidth, mainClientWidth:document.querySelector('main').clientWidth};
          if (screen) {
            const s=bounds(screen), c=bounds(content), t=bounds(document.querySelector('.window-titlebar'));
            result.screen=s;
            result.content=c;
            result.contained=c.left>=s.left && c.right<=s.right+0.01 && c.top>=s.top && c.bottom<=s.bottom+0.01 && t.top>=s.top && t.bottom<=s.bottom;
            result.internalOverflow=content.scrollWidth>content.clientWidth;
            result.inert=content.inert;
            result.character=document.querySelector('.mandarin') !== null;
          }
          return result;
        })()`);
        for (const href of measured.links.filter(h => !/^(https?:|mailto:|#)/.test(h))) {
          await readFile(resolve(root, href));
        }
        const original = textOf(page === 'index' ? sourceHome : sourcePortfolio);
        const contentPreserved = measured.descriptions.every(text => original.includes(text)) && measured.headings.every(text => original.includes(text));
        const passed = measured.scrollWidth <= width && measured.innerWidth === width && measured.mainWidth <= measured.mainClientWidth && contentPreserved &&
          (page === 'portfolio' ? measured.cards === 6 : measured.contained && !measured.internalOverflow && !measured.character && measured.zoomed === (state === 'zoom') && measured.inert === (state === 'desk'));
        const screenshot = `${state}-${width}.png`;
        const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        await writeFile(resolve(output, screenshot), Buffer.from(data, 'base64'));
        const { text, ...metrics } = measured;
        rows.push({page, state, width, screenshot, passed, contentPreserved, ...metrics});
        console.log(JSON.stringify({state, width, passed, scrollWidth:measured.scrollWidth, innerWidth:measured.innerWidth, contained:measured.contained, contentPreserved}));
      }
      if (page === 'index') {
        await cdp('Browser.grantPermissions', {origin, permissions:['clipboardReadWrite', 'clipboardSanitizedWrite']});
        await evaluate("document.querySelector('.copy-badge').click()");
        await until(() => evaluate("!document.querySelector('.toast').hidden"), 'clipboard toast');
        const copied = await evaluate("navigator.clipboard.readText()");
        const copyToast = await evaluate("document.querySelector('.toast').textContent === document.querySelector('.copy-badge').dataset.message");
        await evaluate(`(() => {
          window.originalWriteText = navigator.clipboard.writeText;
          navigator.clipboard.writeText = async () => { throw new Error('Forced clipboard rejection'); };
          document.querySelector('.toast').hidden = true;
          document.querySelector('.copy-badge').click();
        })()`);
        await until(() => evaluate("!document.querySelector('.toast').hidden"), 'fallback toast');
        const fallbackCopied = await evaluate("navigator.clipboard.readText()");
        const fallback = await evaluate("document.querySelector('.toast').textContent === document.querySelector('.copy-badge').dataset.message && document.querySelector('textarea') === null");
        await evaluate(`(() => {
          window.originalExecCommand = document.execCommand;
          document.execCommand = () => false;
          document.querySelector('.toast').hidden = true;
          document.querySelector('.copy-badge').click();
        })()`);
        await until(() => evaluate("!document.querySelector('.toast').hidden"), 'failure toast');
        const failureHandled = await evaluate("document.querySelector('.toast').textContent !== document.querySelector('.copy-badge').dataset.message && document.querySelector('textarea') === null");
        await evaluate("navigator.clipboard.writeText = window.originalWriteText; document.execCommand = window.originalExecCommand");
        const clipboard = {width, copied, copyToast, fallbackCopied, fallback, failureHandled};
        clipboard.passed = copied === 'algethi97@gmail.com' && copyToast && fallbackCopied === copied && fallback && failureHandled;
        rows.push({clipboard, passed:clipboard.passed});
        console.log(JSON.stringify(clipboard));
        const scrolls = await evaluate(`(() => { const el=document.querySelector('.monitor-scrollable'); el.scrollTop=el.scrollHeight; return el.scrollTop>0; })()`);
        await cdp('Input.dispatchKeyEvent', {type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27});
        const escaped = await evaluate("!document.querySelector('.is-zoomed') && document.querySelector('.monitor-scrollable').inert && document.activeElement === document.querySelector('.monitor-hint-overlay')");
        await cdp('Input.dispatchKeyEvent', {type:'keyDown', key:'Enter', code:'Enter', windowsVirtualKeyCode:13, text:'\r', unmodifiedText:'\r'});
        await cdp('Input.dispatchKeyEvent', {type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13});
        const keyboardOpened = await evaluate("!!document.querySelector('.is-zoomed')");
        await evaluate("document.querySelector('.desk-zoomout-btn').click()");
        const buttonClosed = await evaluate("!document.querySelector('.is-zoomed') && document.querySelector('.monitor-scrollable').inert");
        const interactions = {width, scrolls, escaped, keyboardOpened, buttonClosed};
        interactions.passed = scrolls && escaped && keyboardOpened && buttonClosed;
        rows.push({interactions, passed:interactions.passed});
        console.log(JSON.stringify(interactions));
        await cdp('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
        const reducedMotion = await evaluate("getComputedStyle(document.querySelector('.desk-canvas')).transitionDuration === '0s'");
        rows.push({width, reducedMotion, passed:reducedMotion});
        await cdp('Emulation.setEmulatedMedia', {features:[]});
      }
    }
  }
  rows.push({runtimeErrors:errors, passed:errors.length===0});
  const passed = rows.every(row=>row.passed);
  await writeFile(resolve(output, 'results.json'), JSON.stringify({rows, passed}, null, 2));
  if (!passed) process.exitCode = 1;
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
  if (profile) {
    if (!profile.startsWith(output + sep)) throw new Error('Profile path outside capture folder');
    await rm(profile, {recursive:true, force:true, maxRetries:5, retryDelay:200});
  }
}
