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
