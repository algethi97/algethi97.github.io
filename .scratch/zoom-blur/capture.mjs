// Run once before editing the site, then once after: node .scratch/zoom-blur/capture.mjs before|after
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, relative, extname, sep } from 'node:path';
import { once } from 'node:events';
import { createHash } from 'node:crypto';

const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Expected before or after.');
const root = process.cwd();
const output = resolve(root, '.scratch/zoom-blur');
const resultPath = resolve(output, 'results.json');
let results = {};
try { results = JSON.parse(await readFile(resultPath, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
if (results[phase]) throw new Error(`Refusing to overwrite the ${phase} evidence.`);
if (phase === 'after' && !results.before?.passed) throw new Error('A completed baseline is required.');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const rows = [], checks = [], errors = [];
const check = (name, passed, detail) => {
  checks.push({ name, passed, detail });
  if (!passed) throw new Error(`${name}: ${JSON.stringify(detail)}`);
};
const server = createServer(async (req, res) => {
  let path;
  try { path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400).end(); return; }
  const rel = relative(root, path);
  const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
  if (!path.startsWith(root + sep) || rel.split(/[\\/]/).some(part => part.startsWith('.')) || !mime[extname(path)]) {
    res.writeHead(403).end(); return;
  }
  try { res.writeHead(200, { 'Content-Type': mime[extname(path)], 'Cache-Control': 'no-store' }).end(await readFile(path)); }
  catch { res.writeHead(404).end(); }
});
let chrome, socket, profile, watchdog;
let cdp;
const run = { capturedAt: new Date().toISOString(), rows, checks, errors, passed: false };
try {
  await mkdir(output, { recursive: true });
  run.sources = {};
  for (const name of ['style.css', 'script.js', 'index.html', 'about.html', 'css/pages.css']) {
    run.sources[name] = createHash('sha256').update(await readFile(resolve(root, name))).digest('hex');
  }
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
  watchdog = setTimeout(() => { expired = true; socket?.close(); chrome.kill(); }, 180000);
  const until = async (fn, label) => {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline && !expired) {
      if (launchError) throw launchError;
      if (await fn()) return;
      await delay(40);
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
    pending.get(message.id)?.(message);
    pending.delete(message.id);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  });
  cdp = (method, params = {}) => new Promise((resolve, reject) => {
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
  run.browser = await cdp('Browser.getVersion');
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__zoomProbe = { initial: null, transitions: [], clicks: [] };
    const observer = new MutationObserver(() => {
      const canvas = document.querySelector('.desk-canvas');
      if (!canvas) return;
      const s = getComputedStyle(canvas);
      __zoomProbe.initial = { instant: document.documentElement.classList.contains('instant-zoomed'), transform: s.transform, duration: s.transitionDuration };
      observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
    document.addEventListener('transitionrun', e => {
      if (e.target.matches('.desk-canvas')) __zoomProbe.transitions.push(e.propertyName);
    }, true);
    document.addEventListener('click', e => __zoomProbe.clicks.push({ trusted: e.isTrusted, target: e.target.closest('a,button,.monitor-hint-overlay')?.className ?? '' }), true);
  ` });
  const ready = path => until(() => evaluate(`location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete'`), path);
  const settle = async () => {
    await evaluate('document.fonts.ready.then(() => true)');
    await delay(1350); // The approved zoom transition is 1.05 seconds.
    await until(() => evaluate("!document.querySelector('.desk-canvas')?.getAnimations().some(a => a.playState === 'running')"), 'zoom transition complete');
    await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  };
  const state = () => evaluate(`(() => {
    const canvas=document.querySelector('.desk-canvas'), s=getComputedStyle(canvas);
    const r=document.querySelector('.tabs-grid').getBoundingClientRect();
    return { zoomed:document.querySelector('.desk-viewport').classList.contains('is-zoomed'), instant:document.documentElement.classList.contains('instant-zoomed'), willChange:s.willChange, transform:s.transform, transitionDuration:s.transitionDuration, transformOrigin:s.transformOrigin, devicePixelRatio, viewport:{width:innerWidth,height:innerHeight}, tabs:{x:r.x,y:r.y,width:r.width,height:r.height}, probe:__zoomProbe };
  })()`);
  const click = async selector => {
    const point = await evaluate(`(() => {
      const el=document.querySelector(${JSON.stringify(selector)});
      if (!el) throw new Error('Missing click target');
      const r=el.getBoundingClientRect(), x=r.x+r.width/2, y=r.y+r.height/2;
      if (x<0 || y<0 || x>=innerWidth || y>=innerHeight || !el.contains(document.elementFromPoint(x,y))) throw new Error('Click target is obscured');
      return { x,y };
    })()`);
    await cdp('Input.dispatchMouseEvent', { type:'mouseMoved', ...point });
    await cdp('Input.dispatchMouseEvent', { type:'mousePressed', button:'left', clickCount:1, ...point });
    await cdp('Input.dispatchMouseEvent', { type:'mouseReleased', button:'left', clickCount:1, ...point });
  };
  const zoom = async () => {
    await click('.monitor-hint-overlay');
    await until(() => evaluate("document.querySelector('.desk-viewport').classList.contains('is-zoomed')"), 'monitor click zoom');
    await settle();
  };
  const capture = async (id, device, role = 'zoomed') => {
    const measured = await state();
    check(`${id}: viewport`, measured.viewport.width === device.width && measured.viewport.height === device.height && measured.devicePixelRatio === device.deviceScaleFactor, measured.viewport);
    check(`${id}: zoom state`, measured.zoomed === (role === 'zoomed') && !measured.instant, measured);
    const { data } = await cdp('Page.captureScreenshot', { format:'png', captureBeyondViewport:false });
    // Crop the actual full screenshot at native device pixels, without resizing.
    const crop = await evaluate(`(async () => {
      const image=new Image(); image.src='data:image/png;base64,${data}'; await image.decode();
      const r=${JSON.stringify(measured.tabs)}, scale=image.width/innerWidth;
      const x=Math.floor(r.x*scale), y=Math.floor(r.y*scale), width=Math.ceil((r.x+r.width)*scale)-x, height=Math.ceil((r.y+r.height)*scale)-y;
      if (x<0 || y<0 || x+width>image.width || y+height>image.height || width<2 || height<1) throw new Error('Tabs crop outside screenshot');
      const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
      const ctx=canvas.getContext('2d', {willReadFrequently:true}); ctx.drawImage(image,-x,-y);
      const pixels=ctx.getImageData(0,0,width,height).data;
      const brightness=i=>0.2126*pixels[i]+0.7152*pixels[i+1]+0.0722*pixels[i+2];
      let sum=0;
      for(let row=0;row<height;row++) for(let col=0;col<width-1;col++) {
        const i=(row*width+col)*4; sum+=Math.abs(brightness(i+4)-brightness(i));
      }
      return {x,y,width,height,scale,pairs:(width-1)*height,sharpness:sum/((width-1)*height),png:canvas.toDataURL('image/png').split(',')[1]};
    })()`);
    const screenshot = `.scratch/zoom-blur/${phase}-${id}.png`;
    const tabsScreenshot = `.scratch/zoom-blur/${phase}-${id}-tabs.png`;
    await writeFile(resolve(root, screenshot), Buffer.from(data, 'base64'));
    await writeFile(resolve(root, tabsScreenshot), Buffer.from(crop.png, 'base64'));
    delete crop.png;
    const row = { id, role, device, screenshot, tabsScreenshot, ...measured, crop };
    rows.push(row);
    if (role === 'zoomed') {
      check(`${id}: settled will-change`, measured.willChange === (phase === 'before' ? 'transform' : 'auto'), measured.willChange);
      check(`${id}: zoom scale`, measured.transform === 'matrix(2.22, 0, 0, 2.22, 0, 0)', measured.transform);
    }
    console.log(JSON.stringify({ id, phase, willChange: measured.willChange, sharpness: crop.sharpness, screenshot }));
  };
  for (const device of [
    { name:'mobile', width:390, height:844, deviceScaleFactor:3, mobile:true },
    { name:'desktop', width:1440, height:900, deviceScaleFactor:1, mobile:false }
  ]) {
    await cdp('Emulation.setDeviceMetricsOverride', device);
    await cdp('Page.navigate', { url:origin+'/index.html' });
    await ready('/index.html');
    await settle();
    await zoom();
    await capture(`a-${device.name}`, device);
    await click('.desk-zoomout-btn');
    await settle();
    check(`${device.name}: zoom-out button`, !(await state()).zoomed, 'Actual button click returns to desk.');
    await zoom();
    await cdp('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
    await cdp('Input.dispatchKeyEvent', { type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
    await settle();
    check(`${device.name}: Escape`, !(await state()).zoomed, 'Escape returns to desk.');
    await zoom();
    await click('#tab-about');
    check(`${device.name}: warp-in`, await evaluate("document.querySelector('.desk-viewport')?.classList.contains('warp-in') === true"), 'Actual tab click starts warp-in.');
    await ready('/about.html');
    await delay(400);
    await click('a.home-button');
    await ready('/index.html');
    await until(() => evaluate("!document.documentElement.classList.contains('instant-zoomed')"), 'instant-zoomed removed');
    await settle();
    const returned = await state();
    check(`${device.name}: instant home return`, returned.probe.initial?.instant === true && returned.probe.initial.duration === '0s' && returned.probe.initial.transform === 'matrix(2.22, 0, 0, 2.22, 0, 0)' && returned.probe.transitions.length === 0 && returned.zoomed && await evaluate("sessionStorage.getItem('return_to_monitor') === null"), returned.probe);
    await capture(`b-${device.name}`, device);
    if (device.name === 'desktop') {
      await cdp('Page.navigate', { url:origin+'/index.html' });
      await ready('/index.html');
      await settle();
      await zoom();
      const timeOrigin = await evaluate('performance.timeOrigin');
      await click('a.home-button');
      await until(() => evaluate(`performance.timeOrigin !== ${timeOrigin} && document.readyState === 'complete'`), 'home button reload');
      await settle();
      await capture('c-desktop-reloaded-desk', device, 'reloaded-desk');
      check('C: decision A preserved', !(await state()).zoomed && (await state()).probe.initial.instant === false, 'Home button reloads the unzoomed desk.');
      await zoom();
      await capture('c-desktop-rezoom', device);
    }
  }
  await cdp('Emulation.setEmulatedMedia', { features:[{ name:'prefers-reduced-motion', value:'reduce' }] });
  check('reduced motion', await evaluate("getComputedStyle(document.querySelector('.desk-canvas')).transitionDuration === '0s'"), 'Zoom transition is disabled when reduced motion is requested.');
  const css = await evaluate(String.raw`(async () => {
    const rows=[];
    for(const path of ['style.css','css/pages.css']) {
      const text=await (await fetch(path)).text(), clean=text.replace(/\/\*[\s\S]*?\*\//g,'');
      const sheet=new CSSStyleSheet(); sheet.replaceSync(text);
      const count=rules=>Array.from(rules).reduce((sum,r)=>sum+1+(r.cssRules?count(r.cssRules):0),0);
      rows.push({path,opening:(clean.match(/\{/g)||[]).length,closing:(clean.match(/\}/g)||[]).length,parsed:count(sheet.cssRules)});
    }
    return rows;
  })()`);
  for (const row of css) check(`${row.path}: CSS rule syntax`, row.opening === row.closing && row.opening === row.parsed, row);
  check('runtime exceptions', errors.length === 0, errors);
  if (phase === 'after') {
    results.comparisons = rows.filter(row => row.role === 'zoomed').map(row => {
      const before = results.before.rows.find(b => b.id === row.id);
      const comparable = JSON.stringify(before.device) === JSON.stringify(row.device) && JSON.stringify(before.tabs) === JSON.stringify(row.tabs) && before.crop.width === row.crop.width && before.crop.height === row.crop.height;
      const delta = row.crop.sharpness - before.crop.sharpness;
      return { id:row.id, before:before.crop.sharpness, after:row.crop.sharpness, delta, comparable, passed:comparable && delta >= 0, outcome:delta === 0 ? 'not-reproduced' : delta > 0 ? 'improved' : 'regressed' };
    });
    check('sharpness comparison', results.comparisons.every(row => row.passed), results.comparisons);
  }
  run.passed = true;
} catch (error) {
  run.error = error.stack;
  console.error(error);
  process.exitCode = 1;
} finally {
  clearTimeout(watchdog);
  if (cdp && socket?.readyState === WebSocket.OPEN) {
    try { await cdp('Browser.close'); } catch { /* Chrome can close the socket before replying. */ }
  }
  socket?.close();
  if (chrome?.pid && chrome.exitCode === null) {
    const exited = once(chrome, 'exit');
    chrome.kill();
    await exited;
  }
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  // Only remove the one disposable profile created by this run, within the approved output directory.
  if (profile && profile.startsWith(output + sep + 'chrome-profile-')) {
    await rm(profile, { recursive:true, force:true, maxRetries:5, retryDelay:200 });
  }
  results.metric = { name:'mean horizontal adjacent-pixel brightness difference', brightness:'0.2126 R + 0.7152 G + 0.0722 B (8-bit screenshot channels)', denominator:'(crop.width - 1) * crop.height', crop:'Outward-rounded .tabs-grid bounds in native screenshot pixels; no resizing.' };
  results[phase] = run;
  await writeFile(resultPath, JSON.stringify(results, null, 2) + '\n');
}
