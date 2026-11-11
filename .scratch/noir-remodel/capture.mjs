import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { once } from 'node:events';

const root = process.cwd();
const output = resolve(root, '.scratch/noir-remodel');
const sizes = [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const server = createServer(async (req, res) => {
  let path;
  try {
    path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  } catch { res.writeHead(400).end(); return; }
  const relative = path.slice(root.length + 1);
  if (!path.startsWith(root + sep) || relative.split(/[\\/]/).some(part => part.startsWith('.')) ||
      !['.html', '.css', '.js', '.svg', '.png'].includes(extname(path))) {
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
  const errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  });
  await cdp('Runtime.enable');
  const scrollMonitorTo = selector => evaluate(`(() => {
    const scroller=document.querySelector('.monitor-scrollable');
    const target=document.querySelector(${JSON.stringify(selector)});
    const bounds=scroller.getBoundingClientRect(), item=target.getBoundingClientRect();
    const scale=bounds.height/scroller.clientHeight;
    scroller.scrollTo({top:scroller.scrollTop+(item.top-bounds.top)/scale-document.querySelector('.nav-header').offsetHeight-4,behavior:'instant'});
  })()`);
  for (const { width, height } of sizes) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width === 390 });
    await cdp('Page.navigate', { url: origin + '/index.html' });
    await until(() => evaluate("location.pathname === '/index.html' && document.readyState === 'complete'"), 'home ready');
    await evaluate('document.fonts.ready.then(() => true)');
    for (const screen of ['desk', 'zoom']) {
      if (screen === 'zoom') {
        const point = await evaluate("(() => { const r=document.querySelector('.monitor-screen').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()");
        await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
        await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
        await until(() => evaluate("document.querySelector('.desk-viewport').classList.contains('is-zoomed')"), 'monitor zoom');
      }
      await delay(1250);
      const measured = await evaluate(`(() => {
        const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x:r.x, y:r.y, right:r.right, bottom:r.bottom, width:r.width, height:r.height }; };
        const monitor=rect('.monitor-screen'), titlebar=rect('.window-titlebar'), body=rect('.monitor-scrollable');
        const inside=r => r.x>=monitor.x-1 && r.y>=monitor.y-1 && r.right<=monitor.right+1 && r.bottom<=monitor.bottom+1 && r.width>0 && r.height>0;
        return { scrollWidth:document.documentElement.scrollWidth, innerWidth:innerWidth, monitor,titlebar,body, contained:inside(titlebar)&&inside(body), bodyOverflow:document.querySelector('.monitor-scrollable').scrollWidth <= document.querySelector('.monitor-scrollable').clientWidth, tabFont:getComputedStyle(document.querySelector('.tab-item')).fontSize, titleFont:getComputedStyle(document.querySelector('.page-title')).fontSize, bodyFont:getComputedStyle(document.querySelector('.page-subtitle')).fontSize };
      })()`);
      const screenshot = `home-${screen}-${width}.png`;
      const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(resolve(output, screenshot), Buffer.from(data,'base64'));
      rows.push({screen,width,height,screenshot,...measured,passed:measured.scrollWidth<=measured.innerWidth && measured.contained && measured.bodyOverflow});
      console.log(JSON.stringify(rows.at(-1)));
    }
    await delay(1400);
    await scrollMonitorTo('.copy-badge');
    await evaluate("document.querySelector('.copy-badge').click()");
    await until(() => evaluate("document.querySelector('.toast.show')?.textContent.includes('algethi97@gmail.com') || document.querySelector('.toast.show')?.textContent.includes('??')"), 'copy toast');
    const toast = await evaluate("(() => {const t=document.querySelector('.toast.show'),s=getComputedStyle(t);return {text:t.textContent,background:s.backgroundColor,border:s.borderLeftColor,borderWidth:s.borderLeftWidth,color:s.color};})()");
    const {data} = await cdp('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
    await writeFile(resolve(output,`home-toast-${width}.png`),Buffer.from(data,'base64'));
    rows.push({screen:'copy-toast',width,...toast,passed:toast.background==='rgb(17, 17, 17)' && toast.border==='rgb(242, 42, 24)' && toast.borderWidth==='4px'});
    console.log(JSON.stringify(rows.at(-1)));
    for (const [label, selector] of [['cards','.home-links-grid'],['footer','.site-footer']]) {
      await scrollMonitorTo(selector);
      await delay(900);
      const {data} = await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      await writeFile(resolve(output,`home-${label}-${width}.png`),Buffer.from(data,'base64'));
    }
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    rows.push({screen:'escape',width,passed:await evaluate("!document.querySelector('.desk-viewport').classList.contains('is-zoomed')")});
    await evaluate("document.querySelector('.monitor-screen').click()");
    await delay(1200);
    await evaluate("document.querySelector('.desk-zoomout-btn').click()");
    rows.push({screen:'zoomout-button',width,passed:await evaluate("!document.querySelector('.desk-viewport').classList.contains('is-zoomed')")});
  }
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  rows.push({screen:'reduced-motion',passed:await evaluate("getComputedStyle(document.querySelector('.desk-canvas')).transitionDuration === '0s'")});
  rows.push({screen:'runtime-exceptions',passed:errors.length===0,errors});
  // Parse inline JavaScript and verify the browser accepted each CSS rule/declaration.
  const {Script} = await import('node:vm');
  const html = await readFile(resolve(root,'index.html'),'utf8');
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new Script(match[1]);
  const cssSyntax = await evaluate(String.raw`(async () => {
    const results=[];
    for(const path of ['style.css','css/pages.css']) {
      const text=await (await fetch(path)).text();
      const sheet=new CSSStyleSheet(); sheet.replaceSync(text);
      const clean=text.replace(/\/\*[\s\S]*?\*\//g,'');
      const opening=(clean.match(/\{/g)||[]).length, closing=(clean.match(/\}/g)||[]).length;
      const count=rules=>Array.from(rules).reduce((sum,r)=>sum+1+(r.cssRules?count(r.cssRules):0),0);
      const parsed=count(sheet.cssRules);
      results.push({path,opening,closing,parsed,passed:opening===closing&&parsed===opening});
    }
    return results;
  })()`);
  rows.push(...cssSyntax);
  console.log(JSON.stringify(cssSyntax));
  const luminance = hex => {const rgb=hex.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4); return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  const contrast=(luminance('faf8f4')+.05)/(luminance('c8102e')+.05);
  rows.push({screen:'red-text-contrast',contrast,passed:contrast>=4.5});
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
