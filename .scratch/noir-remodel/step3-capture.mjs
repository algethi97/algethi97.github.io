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
  const phase = process.argv.includes('--before') ? 'before' : 'after';
  const record = row => { rows.push(row); console.log(JSON.stringify(row)); };
  const navigate = async page => {
    await cdp('Page.navigate', { url: origin + '/' + page });
    await until(() => evaluate(`location.pathname === ${JSON.stringify('/' + page)} && document.readyState === 'complete'`), page + ' ready');
    await evaluate('document.fonts.ready.then(() => true)');
    await delay(700);
  };
  const capture = async file => {
    const {data} = await cdp('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
    await writeFile(resolve(output,file),Buffer.from(data,'base64'));
  };
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await delay(150);
    const point = await evaluate(`(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
    await cdp('Input.dispatchMouseEvent', { type:'mousePressed', button:'left', clickCount:1, ...point });
    await cdp('Input.dispatchMouseEvent', { type:'mouseReleased', button:'left', clickCount:1, ...point });
  };
  const measure = async (page, width, screen) => {
    const measured = await evaluate(`(() => {
      const css=s=>getComputedStyle(document.querySelector(s));
      const active=css('.tab-item.active');
      return {scrollWidth:document.documentElement.scrollWidth,innerWidth,activeColor:active.color,
        activeUnderline:active.textDecorationLine,footerBorder:css('.site-footer').borderTopColor};
    })()`);
    record({check:'viewport-and-common-theme',phase,page,width,screen,...measured,
      passed:measured.scrollWidth<=measured.innerWidth&&measured.activeColor==='rgb(200, 16, 46)'&&measured.activeUnderline.includes('underline')});
    await capture(`step3-${phase}-${page.replace('.html','')}-${screen}-${width}.png`);
  };
  const boardStyles = () => {
    const selectors=['.game-board-container','.mandarin-board','.mandarin-tile','.tile-bg-mandarin','.tile-number',
      '.selection-box','.sum-floating-badge'];
    const properties=['backgroundColor','borderColor','borderRadius','boxShadow','color','filter','transform','textShadow',
      'gridTemplateColumns','gridTemplateRows','gap','padding','touchAction','animationName'];
    const read=selector=>{
      const e=document.querySelector(selector),s=getComputedStyle(e);
      return Object.fromEntries(properties.map(p=>[p,s[p]]));
    };
    const result=Object.fromEntries(selectors.map(s=>[s,read(s)]));
    const tile=document.querySelector('.mandarin-tile');
    for(const state of ['selected','selected is-ten','shake-fail','clearing-pop','cleared']) {
      tile.className='mandarin-tile '+state;
      result['.mandarin-tile.'+state]=read('.mandarin-tile');
    }
    tile.className='mandarin-tile';
    for(const selector of ['.selection-box','.sum-floating-badge']) {
      const e=document.querySelector(selector);e.classList.add('is-ten');
      result[selector+'.is-ten']=read(selector);e.classList.remove('is-ten');
    }
    result.image=document.querySelector('.tile-bg-mandarin').getAttribute('src');
    return result;
  };
  const originals = phase==='after' ? JSON.parse(await readFile(resolve(output,'step3-before-results.json'),'utf8')) : null;
  for (const {width,height} of sizes) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width===390});
    await navigate('guestbook.html');
    await until(()=>evaluate("getComputedStyle(document.querySelector('#guestbook-skeleton')).display==='none'"),'guestbook query finished');
    record({check:'guestbook-data-state',width,entries:await evaluate("document.querySelectorAll('.guestbook-card').length"),notification:await evaluate("!!document.querySelector('.toast')"),passed:true});
    await measure('guestbook.html',width,'initial');
    await evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");
    await capture(`step3-${phase}-guestbook-end-${width}.png`);
    await navigate('game.html');
    await until(()=>evaluate("document.querySelectorAll('.mandarin-tile').length===170&&getComputedStyle(document.querySelector('#leaderboard-skeleton')).display==='none'"),'game board and ranking finished');
    record({check:'ranking-data-state',width,entries:await evaluate("document.querySelectorAll('.top5-item').length"),empty:await evaluate("getComputedStyle(document.querySelector('#top5-empty')).display!=='none'"),passed:true});
    await measure('game.html',width,'start-overlay');
    const board=await evaluate(`(${boardStyles.toString()})()`);
    const baseline=originals?.rows.find(r=>r.check==='preserved-board-styles'&&r.width===width)?.styles;
    record({check:'preserved-board-styles',phase,width,styles:board,passed:phase==='before'||JSON.stringify(board)===JSON.stringify(baseline)});
    await click('#btn-overlay-start');
    await until(()=>evaluate("getComputedStyle(document.querySelector('#game-start-overlay')).display==='none'"),'game started');
    const playing=await evaluate("({tiles:document.querySelectorAll('.mandarin-tile').length,remaining:parseInt(document.querySelector('#hud-remaining').textContent),timer:parseInt(document.querySelector('#hud-timer').textContent)})");
    record({check:'game-start',width,...playing,passed:playing.tiles===170&&playing.remaining===170&&playing.timer>0});
    await evaluate("window.scrollTo({top:0,behavior:'instant'})");
    await measure('game.html',width,'playing');
    await evaluate("document.querySelector('#board-container').scrollIntoView({block:'center',behavior:'instant'})");
    await capture(`step3-${phase}-game-board-${width}.png`);
    if(phase==='after') {
      await evaluate("document.querySelector('#btn-sound-toggle').click()");
      record({check:'sound-preference',width,passed:await evaluate("localStorage.getItem('mandarin_muted')===String(document.querySelector('#sound-icon').textContent==='🔇')")});
      await evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");
      await capture(`step3-after-game-ranking-${width}.png`);
      await evaluate("document.querySelector('#btn-refresh-ranking').click()");
      await until(()=>evaluate("getComputedStyle(document.querySelector('#leaderboard-skeleton')).display==='none'&&!!document.querySelector('.game-toast.show')"),'ranking refresh feedback');
      await capture(`step3-after-game-toast-${width}.png`);
      await evaluate("document.querySelector('.home-button').click()");
      await until(()=>evaluate("location.pathname==='/index.html'&&document.querySelector('.desk-viewport')?.classList.contains('is-zoomed')"),'return to zoomed home');
      record({check:'game-home-return',width,passed:await evaluate("sessionStorage.getItem('return_to_monitor')===null")});
    }
  }
  if(phase==='after') {
    const syntax=await evaluate(String.raw`(async()=>{
      const results=[];
      for(const path of ['css/guestbook.css','css/game.css']) {
        const text=(await(await fetch(path)).text()).replace(/\/\*[\s\S]*?\*\//g,'');
        const sheet=new CSSStyleSheet();sheet.replaceSync(text);
        const count=rules=>Array.from(rules).reduce((sum,r)=>sum+1+(r.cssRules?count(r.cssRules):0),0);
        const opening=(text.match(/\{/g)||[]).length,closing=(text.match(/\}/g)||[]).length,parsed=count(sheet.cssRules);
        const unsupported=[];
        for(const block of text.matchAll(/\{([^{}]*)\}/g))for(const declaration of block[1].split(';').map(x=>x.trim()).filter(Boolean)){
          const split=declaration.indexOf(':');
          const name=declaration.slice(0,split).trim(),value=declaration.slice(split+1).replace(/\s*!important\s*$/,'').trim();
          if(!CSS.supports(name,value))unsupported.push({name,value});
        }
        results.push({check:'css-syntax',path,opening,closing,parsed,unsupported,passed:opening===closing&&opening===parsed&&unsupported.length===0});
      }
      return results;
    })()`);
    syntax.forEach(record);
    const luminance=hex=>hex.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const contrast=(luminance('faf8f4')+.05)/(luminance('c8102e')+.05);
    record({check:'small-red-text-contrast',foreground:'#c8102e',background:'#faf8f4',contrast,passed:contrast>=4.5});
  }
  record({check:'runtime-exceptions',errors,passed:errors.length===0});
  await writeFile(resolve(output,`step3-${phase}-results.json`),JSON.stringify({rows,passed:rows.every(r=>r.passed)},null,2));
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
