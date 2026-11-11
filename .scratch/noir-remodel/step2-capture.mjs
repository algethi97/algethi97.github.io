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
  const original = JSON.parse(await readFile(resolve(output, 'step2-original.json'), 'utf8'));
  const record = row => { rows.push(row); console.log(JSON.stringify(row)); };
  const navigate = async page => {
    await cdp('Page.navigate', { url: origin + '/' + page });
    await until(() => evaluate(`location.pathname === ${JSON.stringify('/' + page)} && document.readyState === 'complete'`), page + ' ready');
    await evaluate('document.fonts.ready.then(() => true)');
    await delay(1100);
  };
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await delay(150);
    const point = await evaluate(`(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
    const hit = await evaluate(`(() => {const e=document.querySelector(${JSON.stringify(selector)}),hit=document.elementFromPoint(${point.x},${point.y});return e===hit||e.contains(hit);})()`);
    console.log(JSON.stringify({event:'click-target',selector,...point,hit}));
    if(!hit)throw new Error('Click target is obscured or outside viewport: '+selector);
    await cdp('Input.dispatchMouseEvent', { type:'mousePressed', button:'left', clickCount:1, ...point });
    await cdp('Input.dispatchMouseEvent', { type:'mouseReleased', button:'left', clickCount:1, ...point });
  };
  const capture = async file => {
    const {data} = await cdp('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
    await writeFile(resolve(output,file),Buffer.from(data,'base64'));
  };
  for (const {width,height} of sizes) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width===390});
    for (const page of ['about.html','portfolio.html']) {
      await navigate(page);
      const measured = await evaluate(`(() => {
        const css=s=>getComputedStyle(document.querySelector(s));
        const boxes=Array.from(document.querySelectorAll('main *')).filter(e=>e.getBoundingClientRect().width>0).map(e=>({tag:e.tagName,cls:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}));
        const overflow=boxes.filter(r=>r.left < -0.5 || r.right > innerWidth+0.5);
        const active=css('.tab-item.active'),home=css('.home-icon'),header=css('.page-header');
        return {scrollWidth:document.documentElement.scrollWidth,innerWidth,overflow,activeColor:active.color,activeUnderline:active.textDecorationLine,homeStroke:home.stroke,headerBorder:header.borderBottomWidth,headerColor:header.borderBottomColor};
      })()`);
      record({check:'viewport-and-common-theme',page,width,height,...measured,passed:measured.scrollWidth<=measured.innerWidth&&measured.overflow.length===0&&measured.activeColor==='rgb(200, 16, 46)'&&measured.activeUnderline.includes('underline')&&measured.homeStroke==='rgb(20, 20, 20)'&&measured.headerBorder==='3px'&&measured.headerColor==='rgb(17, 17, 17)'});
      await capture(`step2-${page.replace('.html','')}-${width}.png`);
      const content=await evaluate(`(() => {
        const before=new DOMParser().parseFromString(${JSON.stringify(original[page])},'text/html');
        const text=e=>e.textContent.replace(/\\s+/g,' ').trim();
        const links=d=>Array.from(d.querySelectorAll('a')).map(a=>({text:text(a),href:a.getAttribute('href'),target:a.getAttribute('target'),rel:a.getAttribute('rel')}));
        const projects=d=>Array.from(d.querySelectorAll('.project-body')).map(e=>({title:text(e.querySelector('h3')),description:text(e.querySelector('p')),tags:Array.from(e.querySelectorAll('.skill-tag')).map(text),links:links(e)}));
        const beforeProjects=projects(before),afterProjects=projects(document);
        return {projectCount:afterProjects.length,projectsIdentical:JSON.stringify(beforeProjects)===JSON.stringify(afterProjects),linksIdentical:JSON.stringify(links(before))===JSON.stringify(links(document)),aboutTextIdentical:${JSON.stringify(page)}!=='about.html'||text(before.body)===text(document.body),listItems:document.querySelectorAll('ol.project-list > li.project-card > article.project-body').length,thumbnails:document.querySelectorAll('.project-thumbnail').length,projectInlineStyles:document.querySelectorAll('.project-body [style]').length};
      })()`);
      record({check:'original-content-and-semantic-list',page,width,...content,passed:content.linksIdentical&&content.aboutTextIdentical&&content.projectsIdentical&&(page==='about.html'||content.projectCount===6&&content.listItems===6&&content.thumbnails===0&&content.projectInlineStyles===0)});
      const target=page==='portfolio.html'?'.project-card':'.card';
      const count=await evaluate(`document.querySelectorAll('${target}').length`);
      for(let i=0;i<count;i++) {
        await evaluate(`document.querySelectorAll('${target}')[${i}].scrollIntoView({block:'center',behavior:'instant'})`);
        await delay(850);
        const item=await evaluate(`(() => {
          const e=document.querySelectorAll('${target}')[${i}],s=getComputedStyle(e),r=e.getBoundingClientRect();
          return {visible:e.classList.contains('fade-in')&&e.classList.contains('visible')&&s.opacity==='1',itemWidth:r.width,columns:s.gridTemplateColumns,radius:s.borderRadius,shadow:s.boxShadow,borderTop:s.borderTopWidth,borderColor:s.borderTopColor,scrollWidth:document.documentElement.scrollWidth,innerWidth};
        })()`);
        const layout=page==='portfolio.html'?item.columns.startsWith(width===390?'36px ':'90px '):item.borderTop==='2px'&&item.borderColor==='rgb(17, 17, 17)';
        record({check:'scroll-reveal-and-layout',page,width,item:i+1,...item,passed:item.visible&&layout&&item.radius==='0px'&&item.shadow==='none'&&item.scrollWidth<=item.innerWidth});
      }
      if(page==='portfolio.html') {
        await evaluate("document.querySelector('.project-card').scrollIntoView({block:'center',behavior:'instant'})");
        const point=await evaluate("(() => {const r=document.querySelector('.project-body h3').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
        await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
        await delay(850);
        const hover=await evaluate("(() => {const e=document.querySelector('.project-card'),s=getComputedStyle(e);return {color:getComputedStyle(e.querySelector('h3')).color,shadow:s.boxShadow,transform:s.transform};})()");
        record({check:'project-hover',width,...hover,passed:hover.color==='rgb(242, 42, 24)'&&hover.shadow==='none'&&hover.transform==='none'});
        await evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");
        await delay(400);
        await capture(`step2-portfolio-end-${width}.png`);
      } else {
        await cdp('Browser.grantPermissions',{origin,permissions:['clipboardReadWrite','clipboardSanitizedWrite']});
        await evaluate("document.querySelector('.copy-badge').scrollIntoView({block:'center',behavior:'instant'})");
        await click('button.copy-badge');
        await until(()=>evaluate("!!document.querySelector('.toast.show')"),'copy feedback');
        const clipboard=await evaluate("navigator.clipboard.readText()");
        record({check:'email-copy',width,passed:clipboard==='algethi97@gmail.com'});
        await evaluate("document.querySelectorAll('.toast').forEach(e=>e.remove());Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('verification denied'))})");
        await click('button.copy-badge');
        await until(()=>evaluate("!!document.querySelector('.toast.show')"),'copy rejection handled');
        record({check:'clipboard-rejection-handled',width,passed:await evaluate("document.querySelectorAll('.toast.show').length===1")});
      }
      await until(()=>evaluate("!document.querySelector('.toast.show')"),'copy toast finished');
      await evaluate(width===390?"window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})":"window.scrollTo({top:0,behavior:'instant'})");
      await delay(100);
      await click(width===390?'.back-link':'.home-button');
      await until(()=>evaluate("location.pathname==='/index.html'&&document.readyState==='complete'&&document.querySelector('.desk-viewport')?.classList.contains('is-zoomed')"),'return to monitor');
      record({check:'return-to-zoomed-home',page,width,passed:await evaluate("sessionStorage.getItem('return_to_monitor')===null&&document.querySelector('.desk-viewport').classList.contains('is-zoomed')")});
    }
  }
  const fallback=await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'delete window.IntersectionObserver;'});
  await navigate('portfolio.html');
  record({check:'intersection-observer-unavailable',passed:await evaluate("document.querySelectorAll('.project-card.fade-in.visible').length===6")});
  await cdp('Page.removeScriptToEvaluateOnNewDocument',{identifier:fallback.identifier});
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await navigate('index.html');
  record({check:'reduced-motion',passed:await evaluate("getComputedStyle(document.querySelector('.desk-canvas')).transitionDuration==='0s'")});
  const syntax=await evaluate(String.raw`(async()=>{
    const results=[];
    for(const path of ['style.css','css/pages.css']) {
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
  record({check:'runtime-exceptions',errors,passed:errors.length===0});
  await writeFile(resolve(output,'step2-results.json'),JSON.stringify({rows,passed:rows.every(r=>r.passed)},null,2));
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
