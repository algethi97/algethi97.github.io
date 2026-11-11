import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(root, 'screenshots');
const directions = ['a-deskterior', 'b-editorial', 'c-terminal', 'd-editorial-noir'];
const sizes = [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const server = createServer(async (req, res) => {
  let path;
  try {
    path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  } catch { res.writeHead(400).end(); return; }
  const relative = path.slice(root.length + 1);
  if (!path.startsWith(root + sep) || relative.split(/[\\/]/).some(part => part.startsWith('.')) ||
      !['.html', '.css', '.svg', '.png'].includes(extname(path))) {
    res.writeHead(403).end(); return;
  }
  try {
    const data = await readFile(path);
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
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
  watchdog = setTimeout(() => { expired = true; socket?.close(); chrome.kill(); }, 120000);
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
  for (const { width, height } of sizes) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width === 390 });
    for (const direction of directions) {
      for (const screen of ['desk', 'zoom', 'portfolio']) {
        const page = screen === 'portfolio' ? 'portfolio' : 'index';
        const pathname = `/${direction}/${page}.html`;
        await cdp('Page.navigate', { url: origin + pathname });
        await until(() => evaluate(`location.pathname === ${JSON.stringify(pathname)} && document.readyState === 'complete'`), `${direction} ${screen} ready`);
        await evaluate('document.fonts.ready.then(() => true)');
        if (screen === 'zoom') {
          await evaluate("document.querySelector('.monitor-hint-overlay').click()");
          await until(() => evaluate("document.querySelector('.desk-viewport').classList.contains('is-zoomed')"), 'monitor zoom');
        }
        await delay(1100);
        const measured = await evaluate(`({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, innerHeight: window.innerHeight })`);
        const screenshot = `${direction}-${screen}-${width}.png`;
        const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: 0, y: 0, width, height, scale: 1 } });
        await writeFile(resolve(output, screenshot), Buffer.from(data, 'base64'));
        const passed = measured.scrollWidth <= measured.innerWidth;
        rows.push({ direction, screen, width, height, screenshot, ...measured, passed });
        console.log(JSON.stringify(rows.at(-1)));
      }
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
