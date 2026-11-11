import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { once } from 'node:events';

const root = process.cwd();
const output = resolve(root, '.scratch/noir-remodel');
const sizes = [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
const pages = ['about.html', 'portfolio.html', 'guestbook.html', 'game.html'];
const rows = [], screenshots = [], errors = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const record = row => { rows.push(row); console.log(JSON.stringify(row)); };
const server = createServer(async (req, res) => {
  let path;
  try { path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400).end(); return; }
  const relative = path.slice(root.length + 1);
  if (!path.startsWith(root + sep) || relative.split(/[\\/]/).some(part => part.startsWith('.')) ||
      !['.html', '.css', '.js', '.svg', '.png'].includes(extname(path))) {
    res.writeHead(403).end(); return;
  }
  try {
    const data = await readFile(path);
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': mime[extname(path)] }).end(data);
  } catch { res.writeHead(404).end(); }
});
let chrome, socket, watchdog, profile, chromeExitObserved = false;
try {
  await mkdir(output, { recursive: true });
  // Retain new profiles: cleanup approval covers only the previous jLb3uY profile.
  profile = await mkdtemp(resolve(output, 'step4-chrome-profile-'));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', 'about:blank'
  ], { windowsHide: true, stdio: 'ignore' });
  chrome.once('exit', () => { chromeExitObserved = true; });
  let launchError, expired = false;
  chrome.on('error', error => { launchError = error; });
  watchdog = setTimeout(() => { expired = true; socket?.close(); chrome.kill(); }, 180000);
  const until = async (fn, label) => {
    const deadline = Date.now() + 15000;
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
    if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 10000);
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
  await cdp('Runtime.enable');
  await cdp('DOM.enable');
  await cdp('CSS.enable');
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `
    document.addEventListener('DOMContentLoaded', () => {
      if (location.pathname !== '/index.html') return;
      window.__step4InitialHome = {
        flag: sessionStorage.getItem('return_to_monitor'),
        instant: document.documentElement.classList.contains('instant-zoomed'),
        transform: getComputedStyle(document.querySelector('.desk-canvas')).transform
      };
    }, { once: true });
  ` });
  const ready = async page => {
    await until(() => evaluate(`location.pathname === ${JSON.stringify('/' + page)} && document.readyState === 'complete'`), page + ' ready');
    await evaluate('document.fonts.ready.then(() => true)');
    await delay(750);
  };
  const navigate = async page => { await cdp('Page.navigate', { url: origin + '/' + page }); await ready(page); };
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({ block: 'center', behavior: 'instant' })`);
    await delay(100);
    const point = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
    await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
  };
  const viewport = () => evaluate('({ scrollWidth: document.documentElement.scrollWidth, innerWidth })');
  const geometry = () => evaluate(`(() => {
    const rect = s => { const r = document.querySelector(s).getBoundingClientRect(); return { x:r.x, y:r.y, right:r.right, bottom:r.bottom, width:r.width, height:r.height }; };
    const monitor = rect('.monitor-screen'), titlebar = rect('.window-titlebar'), body = rect('.monitor-scrollable');
    const inside = r => r.x >= monitor.x && r.y >= monitor.y && r.right <= monitor.right && r.bottom <= monitor.bottom && r.width > 0 && r.height > 0;
    const scroll = document.querySelector('.monitor-scrollable');
    return { monitor, titlebar, body, contained: inside(titlebar) && inside(body), bodyOverflow: scroll.scrollWidth <= scroll.clientWidth,
      willChange: getComputedStyle(document.querySelector('.hero-section')).willChange,
      background: getComputedStyle(document.querySelector('.desk-canvas')).backgroundImage };
  })()`);
  const capture = async (name, width, height) => {
    const file = `step4-${name}-${width}.png`;
    const measured = await viewport();
    const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(resolve(output, file), Buffer.from(data, 'base64'));
    screenshots.push({ file, width, height });
    record({ check: 'capture-and-horizontal-overflow', screen: name, width, height, file, ...measured, passed: measured.scrollWidth <= measured.innerWidth });
  };
  const zoom = async () => {
    await click('.monitor-hint-overlay');
    await until(() => evaluate("document.querySelector('.desk-viewport').classList.contains('is-zoomed')"), 'monitor zoom');
    await delay(1250);
  };
  const escape = async () => {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await delay(1250);
  };
  for (const { width, height } of sizes) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width === 390 });
    await navigate('index.html');
    await capture('home-desk', width, height);
    await zoom();
    await capture('home-zoom', width, height);
    const bounds = await geometry();
    record({ check: 'zoomed-monitor-geometry-and-background', width, ...bounds,
      passed: bounds.contained && bounds.bodyOverflow && bounds.willChange === 'auto' && bounds.background.endsWith('/images/GPT_Gen.png")') });
    await escape();
    record({ check: 'escape-from-zoom', width, passed: await evaluate("!document.querySelector('.desk-viewport').classList.contains('is-zoomed')") });
    await zoom();
    for (const page of pages) {
      await click(`.tabs-grid a[href="${page}"]`);
      const warp = await evaluate("document.querySelector('.desk-viewport')?.classList.contains('warp-in') === true");
      await ready(page);
      record({ check: 'home-tab-warp-and-navigation', width, page, warp, passed: warp && await evaluate(`location.pathname === ${JSON.stringify('/' + page)}`) });
      if (page === 'guestbook.html') {
        await until(() => evaluate("getComputedStyle(document.querySelector('#guestbook-skeleton')).display === 'none'"), 'guestbook query completion');
      }
      if (page === 'game.html') {
        await until(() => evaluate("document.querySelectorAll('.mandarin-tile').length === 170 && getComputedStyle(document.querySelector('#leaderboard-skeleton')).display === 'none'"), 'game board and ranking completion');
      }
      await capture(page.replace('.html', ''), width, height);
      const theme = await evaluate(`(() => {
        const active = getComputedStyle(document.querySelector('.tab-item.active'));
        return { background: getComputedStyle(document.body).backgroundColor, active: active.color, underline: active.textDecorationLine };
      })()`);
      record({ check: 'common-theme', width, page, ...theme,
        passed: theme.background === 'rgb(250, 248, 244)' && theme.active === 'rgb(200, 16, 46)' && theme.underline.includes('underline') });
      await evaluate("window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })");
      await delay(750);
      const end = await viewport();
      record({ check: 'page-end-horizontal-overflow', width, page, ...end, passed: end.scrollWidth <= end.innerWidth });
      if (page === 'portfolio.html') {
        const projects = await evaluate("({ count: document.querySelectorAll('.project-list > .project-card').length, column: getComputedStyle(document.querySelector('.project-card')).gridTemplateColumns.split(' ')[0] })");
        record({ check: 'portfolio-number-column', width, ...projects, passed: projects.count === 6 && projects.column === (width === 390 ? '36px' : '90px') });
      }
      if (page === 'game.html') {
        await click('#btn-overlay-start');
        await until(() => evaluate("getComputedStyle(document.querySelector('#game-start-overlay')).display === 'none'"), 'game started');
        const playing = await evaluate("({ tiles: document.querySelectorAll('.mandarin-tile').length, remaining: parseInt(document.querySelector('#hud-remaining').textContent), timer: parseInt(document.querySelector('#hud-timer').textContent) })");
        const playingViewport = await viewport();
        record({ check: 'game-start-and-playing-overflow', width, ...playing, ...playingViewport,
          passed: playing.tiles === 170 && playing.remaining === 170 && playing.timer > 0 && playingViewport.scrollWidth <= playingViewport.innerWidth });
      }
      await click('.home-button');
      const leaving = await evaluate("({ flag: sessionStorage.getItem('return_to_monitor'), leaving: document.body.classList.contains('page-leaving') })");
      await ready('index.html');
      const returned = await evaluate("({ initial: window.__step4InitialHome, consumed: sessionStorage.getItem('return_to_monitor') === null, zoomed: document.querySelector('.desk-viewport').classList.contains('is-zoomed') })");
      record({ check: 'instant-home-return', width, page, leaving, ...returned,
        passed: leaving.flag === 'true' && leaving.leaving && returned.initial.flag === 'true' && returned.initial.instant && returned.initial.transform === 'matrix(2.22, 0, 0, 2.22, 0, 0)' && returned.consumed && returned.zoomed });
      await escape();
      const afterEscape = await viewport();
      record({ check: 'escape-after-home-return', width, page, ...afterEscape,
        passed: await evaluate("!document.querySelector('.desk-viewport').classList.contains('is-zoomed')") && afterEscape.scrollWidth <= afterEscape.innerWidth });
      await zoom();
    }
    await click('.desk-zoomout-btn');
    await delay(1250);
    record({ check: 'zoomout-button', width, passed: await evaluate("!document.querySelector('.desk-viewport').classList.contains('is-zoomed')") });
  }
  // Exercise common styles independently of the page-specific overrides.
  await evaluate(`(() => {
    const card = document.createElement('div'); card.id = 'step4-card-probe'; card.className = 'card';
    const button = document.createElement('button'); button.id = 'step4-button-probe'; button.className = 'btn btn-primary';
    for (const element of [card, button]) { element.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden'; document.body.append(element); }
  })()`);
  await delay(500);
  const baseShadow = await evaluate("getComputedStyle(document.querySelector('#step4-button-probe')).boxShadow");
  const { root: domRoot } = await cdp('DOM.getDocument');
  const probes = [];
  for (const selector of ['#step4-card-probe', '#step4-button-probe']) {
    const { nodeId } = await cdp('DOM.querySelector', { nodeId: domRoot.nodeId, selector });
    probes.push(nodeId);
    await cdp('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] });
  }
  await delay(700);
  const hover = await evaluate("({ border: getComputedStyle(document.querySelector('#step4-card-probe')).borderTopColor, shadow: getComputedStyle(document.querySelector('#step4-button-probe')).boxShadow })");
  record({ check: 'red-common-card-and-button-states', baseShadow, ...hover,
    passed: baseShadow.includes('rgba(200, 16, 46, 0.25)') && hover.border === 'rgba(200, 16, 46, 0.4)' && hover.shadow.includes('rgba(200, 16, 46, 0.35)') });
  for (const nodeId of probes) await cdp('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
  await evaluate(`(async () => {
    const button = document.querySelector('#step4-button-probe');
    button.disabled = true;
    // Flush the new style before collecting its CSS transitions.
    getComputedStyle(button).boxShadow;
    await Promise.all(button.getAnimations().map(animation => animation.finished));
    return true;
  })()`);
  const disabled = await evaluate("({ disabled: document.querySelector('#step4-button-probe').disabled, cursor: getComputedStyle(document.querySelector('#step4-button-probe')).cursor, shadow: getComputedStyle(document.querySelector('#step4-button-probe')).boxShadow })");
  record({ check: 'disabled-primary-button', ...disabled, passed: disabled.disabled && disabled.cursor === 'not-allowed' && disabled.shadow === 'none' });
  const cssSyntax = await evaluate(String.raw`(async () => {
    const results = [];
    for (const path of ['style.css', 'css/pages.css', 'css/guestbook.css', 'css/game.css']) {
      const text = (await (await fetch(path)).text()).replace(/\/\*[\s\S]*?\*\//g, '');
      const sheet = new CSSStyleSheet(); sheet.replaceSync(text);
      const count = rules => Array.from(rules).reduce((sum, r) => sum + 1 + (r.cssRules ? count(r.cssRules) : 0), 0);
      const opening = (text.match(/\{/g) || []).length, closing = (text.match(/\}/g) || []).length, parsed = count(sheet.cssRules);
      results.push({ check: 'css-rule-syntax', path, opening, closing, parsed, passed: opening === closing && opening === parsed });
    }
    return results;
  })()`);
  cssSyntax.forEach(record);
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const reduce = await evaluate("getComputedStyle(document.querySelector('.desk-canvas')).transitionDuration");
  record({ check: 'reduced-motion', duration: reduce, passed: reduce === '0s' });
  const luminance = hex => hex.match(/[a-f0-9]{2}/gi).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const contrast = (luminance('faf8f4') + .05) / (luminance('c8102e') + .05);
  record({ check: 'small-red-text-contrast', foreground: '#c8102e', background: '#faf8f4', contrast, passed: contrast >= 4.5 });
  record({ check: 'runtime-exceptions', errors, passed: errors.length === 0 });
  record({ check: 'twelve-captures', count: screenshots.length, passed: screenshots.length === 12 });
} catch (error) {
  record({ check: 'capture-execution', passed: false, detail: String(error.stack || error) });
} finally {
  clearTimeout(watchdog);
  socket?.close();
  if (chrome?.pid && !chromeExitObserved) {
    const exited = once(chrome, 'exit'); chrome.kill(); await exited;
  }
  let chromeProcessAbsent = !chrome?.pid, processProbeError;
  if (chrome?.pid) {
    try { process.kill(chrome.pid, 0); }
    catch (error) {
      chromeProcessAbsent = error.code === 'ESRCH';
      if (!chromeProcessAbsent) processProbeError = error.code;
    }
  }
  server.closeAllConnections();
  if (server.listening) await new Promise(resolve => server.close(resolve));
  record({ check: 'temporary-processes-stopped', chromePid: chrome?.pid, chromeExit: chrome?.exitCode,
    chromeSignal: chrome?.signalCode, chromeExitObserved, chromeProcessAbsent, processProbeError,
    serverListening: server.listening,
    passed: !server.listening && (!chrome?.pid || (chromeExitObserved && chromeProcessAbsent)) });
  await writeFile(resolve(output, 'step4-results.json'), JSON.stringify({ rows, screenshots, profile, passed: rows.every(r => r.passed) }, null, 2));
  if (rows.some(r => !r.passed)) process.exitCode = 1;
}
