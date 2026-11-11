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
  const record = row => { rows.push(row); console.log(JSON.stringify(row)); };
  const navigate = async page => {
    await cdp('Page.navigate', { url: origin + '/' + page });
    await until(() => evaluate(`location.pathname === ${JSON.stringify('/' + page)} && document.readyState === 'complete'`), page + ' ready');
    await delay(600);
  };
  const capture = async file => {
    const {data} = await cdp('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
    await writeFile(resolve(output,file),Buffer.from(data,'base64'));
  };
  let held=[],failureMode=false;
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.method==='Fetch.requestPaused') {
      if(failureMode)cdp('Fetch.failRequest',{requestId:message.params.requestId,errorReason:'InternetDisconnected'}).catch(()=>{});
      else held.push(message.params.requestId);
    }
  });
  for(const {width,height} of sizes) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width===390});
    const cooldown=await cdp('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('guestbook_cooldown_target',String(Date.now()+30000));"});
    held=[];failureMode=false;
    await cdp('Fetch.enable',{patterns:[{urlPattern:'*/rest/v1/*',requestStage:'Request'}]});
    await navigate('guestbook.html');
    await until(()=>held.length>0,'guestbook request paused');
    const focusBefore=await evaluate("(() => {const e=document.querySelector('#nickname');e.focus();return {documentFocused:document.hasFocus(),active:document.activeElement===e,selectorFocused:e.matches(':focus'),border:getComputedStyle(e).borderColor};})()");
    await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});
    await cdp('Page.bringToFront');
    await evaluate("document.querySelector('#nickname').focus();document.querySelector('#cooldown-banner').scrollIntoView({block:'center',behavior:'instant'})");
    await until(()=>evaluate("document.hasFocus()&&document.activeElement===document.querySelector('#nickname')&&document.querySelector('#nickname').matches(':focus')"),'nickname receives browser focus');
    await evaluate("getComputedStyle(document.querySelector('#nickname')).borderColor");
    await until(()=>evaluate("document.querySelector('#nickname').getAnimations().every(animation=>animation.playState!=='running')"),'nickname focus transition finished');
    const loading=await evaluate(`(() => {
      const css=s=>getComputedStyle(document.querySelector(s));
      return {cooldown:css('#cooldown-banner').display,skeleton:css('#guestbook-skeleton').display,
        disabled:document.querySelector('#submit-btn').disabled,focusBorder:css('#nickname').borderColor,
        focusShadow:css('#nickname').boxShadow,documentFocused:document.hasFocus(),
        active:document.activeElement===document.querySelector('#nickname'),selectorFocused:document.querySelector('#nickname').matches(':focus'),
        runningTransitions:document.querySelector('#nickname').getAnimations().filter(animation=>animation.playState==='running').length,
        scrollWidth:document.documentElement.scrollWidth,innerWidth};
    })()`);
    record({check:'cooldown-loading-focus',width,focusBefore,...loading,passed:loading.cooldown!=='none'&&loading.skeleton!=='none'&&loading.disabled&&loading.documentFocused&&loading.active&&loading.selectorFocused&&loading.runningTransitions===0&&loading.focusBorder==='rgb(200, 16, 46)'&&loading.scrollWidth<=loading.innerWidth});
    await capture(`step3-after-guestbook-cooldown-loading-${width}.png`);
    failureMode=true;
    for(const requestId of held)await cdp('Fetch.failRequest',{requestId,errorReason:'InternetDisconnected'});
    await until(()=>evaluate("getComputedStyle(document.querySelector('#guestbook-skeleton')).display==='none'&&!!document.querySelector('.toast.show')"),'guestbook failure feedback');
    record({check:'guestbook-query-failure-feedback',width,passed:await evaluate("document.querySelectorAll('.toast.show').length===1&&document.querySelector('#submit-btn').disabled")});
    await capture(`step3-after-guestbook-query-failure-${width}.png`);
    await cdp('Fetch.disable');
    await cdp('Page.removeScriptToEvaluateOnNewDocument',{identifier:cooldown.identifier});
    await evaluate("localStorage.removeItem('guestbook_cooldown_target')");
    await navigate('guestbook.html');
    await until(()=>evaluate("document.querySelectorAll('.guestbook-card').length>0"),'guestbook live query restored');
    await evaluate("document.querySelector('.site-footer').scrollIntoView({block:'end',behavior:'instant'})");
    await delay(100);
    await capture(`step3-after-guestbook-footer-${width}.png`);
    await evaluate("document.querySelector('.home-button').click()");
    await until(()=>evaluate("location.pathname==='/index.html'&&document.querySelector('.desk-viewport')?.classList.contains('is-zoomed')"),'guestbook home return');
    record({check:'guestbook-live-recovery-home-return',width,passed:true});
    await navigate('game.html');
    await until(()=>evaluate("document.querySelectorAll('.top5-item').length===5"),'live ranking ready');
    await evaluate("document.querySelector('.sidebar-leaderboard').scrollIntoView({block:'start',behavior:'instant'});document.querySelector('.top5-item').classList.add('newly-ranked')");
    await delay(120);
    await capture(`step3-after-game-new-ranking-${width}.png`);
    await evaluate("document.querySelector('#btn-overlay-start').click();import('./game/ui.js').then(ui=>ui.updateTimerDisplay(10,100/12))");
    await evaluate("document.querySelector('.timer-box').scrollIntoView({block:'center',behavior:'instant'})");
    await capture(`step3-after-game-timer-warning-${width}.png`);
    await evaluate("import('./game/ui.js').then(ui=>ui.showResultModal({isClear:false,finalScore:12,harvestedCount:12,playDuration:120}))");
    await delay(500);
    const modal=await evaluate(`(() => {
      const e=document.querySelector('.game-modal-dialog'),r=e.getBoundingClientRect(),s=getComputedStyle(e);
      return {display:getComputedStyle(document.querySelector('#game-modal')).display,left:r.left,right:r.right,
        color:s.backgroundColor,border:s.borderColor,focused:document.activeElement.id,
        scrollWidth:document.documentElement.scrollWidth,innerWidth};
    })()`);
    record({check:'result-modal-focus-and-bounds',width,...modal,passed:modal.display==='flex'&&modal.focused==='player-nickname'&&modal.left>=0&&modal.right<=modal.innerWidth&&modal.scrollWidth<=modal.innerWidth});
    await capture(`step3-after-game-result-modal-${width}.png`);
    await evaluate("import('./game/ui.js').then(ui=>ui.closeModal())");
    failureMode=true;
    await cdp('Fetch.enable',{patterns:[{urlPattern:'*/rest/v1/*',requestStage:'Request'}]});
    await evaluate("document.querySelector('#btn-refresh-ranking').click()");
    await until(()=>evaluate("getComputedStyle(document.querySelector('#leaderboard-skeleton')).display==='none'&&!!document.querySelector('.game-toast.show')"),'ranking failure feedback');
    await evaluate("document.querySelector('.site-footer').scrollIntoView({block:'end',behavior:'instant'})");
    await capture(`step3-after-game-ranking-failure-${width}.png`);
    record({check:'ranking-query-failure-feedback',width,passed:await evaluate("document.querySelectorAll('.game-toast.show').length===1&&getComputedStyle(document.querySelector('.game-toast')).backgroundColor==='rgb(17, 17, 17)'")});
    await cdp('Fetch.disable');
  }
  record({check:'runtime-exceptions',errors,passed:errors.length===0});
  await writeFile(resolve(output,'step3-states-results.json'),JSON.stringify({rows,passed:rows.every(r=>r.passed)},null,2));
  if(rows.some(r=>!r.passed))process.exitCode=1;
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
  if (profile && resolve(profile).startsWith(output + sep) && profile.slice(output.length + 1).startsWith('chrome-profile-')) await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
