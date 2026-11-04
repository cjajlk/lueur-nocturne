const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('playwright');
const root=__dirname,hub=path.resolve(root,'../cjajlkGames-V2-test');
const source=fs.readFileSync(root+'/dist/game.js','utf8');
const instrumented=source.replace(/\}\)\(\);\s*$/,`window.activityTest={start,pause,save,frame,draw,get run(){return run},get profile(){return profile},move(on){keys.clear();pointer.active=false;joy.x=joy.y=0;if(on)keys.add('d')},prepare(){run.enemies=[];run.motes=[];run.player.x=1100;run.player.y=1100},noDraw(){draw=()=>{}},resume(){paused=false;closeModal()}};})();`);
const server=http.createServer((req,res)=>{let pathname=new URL(req.url,'http://local').pathname;let base=root;if(pathname.startsWith('/hub/')){base=hub;pathname=pathname.slice(4);}let file=path.join(base,decodeURIComponent(pathname));try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(file===path.join(root,'dist/game.js')?instrumented:fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
let browser;
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,channel:'msedge'});
for(const size of [{width:1920,height:1080},{width:360,height:800},{width:800,height:360}]){
const c=await browser.newContext({viewport:size,isMobile:size.width!==1920,hasTouch:size.width!==1920});
await c.route('https://cjajlk.github.io/cjajlkGames-V2-test/core/*',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(hub,'core',new URL(route.request().url()).pathname.split('/').pop()))}));
const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{let seed=42;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};window.testNow=0;performance.now=()=>testNow;requestAnimationFrame=()=>0;window.testVisible=true;window.testFocused=true;Object.defineProperty(document,'visibilityState',{get:()=>testVisible?'visible':'hidden'});Object.defineProperty(document,'hidden',{get:()=>!testVisible});document.hasFocus=()=>testFocused;});
async function load(){await p.goto(base+'/dist/index.html');await p.waitForFunction(()=>window.activityTest&&CJajlkAccount.isIdentityReady());}
async function step(ms){await p.evaluate(ms=>{for(let left=ms;left>0;){const d=Math.min(40,left);testNow+=d;activityTest.prepare();activityTest.frame(testNow);left-=d;}},ms);}
async function active(){await p.evaluate(()=>activityTest.move(true));await step(40);await p.waitForFunction(()=>CJEngine.isTracking(),null,{timeout:3000}).catch(async e=>{console.log(await p.evaluate(()=>({game:getGameState(),p:activityTest.run.player,ready:CJajlkAccount.isIdentityReady(),locks:navigator.locks.query()})));throw e});await step(40);}
const read=()=>p.evaluate(()=>CJajlkAccount.getPlayer());
await load();await p.evaluate(()=>activityTest.frame(testNow+=40));assert.equal((await read()).stats.playTime.totalSeconds,0,'refuge excluded');
await p.locator('#play').click();await p.evaluate(()=>activityTest.noDraw());await step(4000);assert.equal((await read()).stats.playTime.totalSeconds,0,'idle excluded');
await active();await step(100000);assert.equal((await read()).stats.playTime.byGame.lueur,100);
await p.evaluate(()=>activityTest.pause());await step(10000);assert.equal((await read()).stats.playTime.byGame.lueur,100,'pause');
await p.evaluate(()=>activityTest.resume());await active();await step(1000);assert.equal((await read()).stats.playTime.byGame.lueur,101);
for(const flag of ['testVisible','testFocused']){await p.evaluate(flag=>{window[flag]=false;window.dispatchEvent(new Event('blur'));},flag);await step(10000);assert.equal((await read()).stats.playTime.byGame.lueur,101);await p.evaluate(flag=>{window[flag]=true;activityTest.resume();},flag);}
await active();await p.evaluate(()=>{testNow+=300000;activityTest.frame(testNow)});assert.equal((await read()).stats.playTime.byGame.lueur,101,'long return delta rejected');
await step(498000);assert.equal((await read()).stats.playTime.byGame.lueur,599);assert.equal((await read()).stats.totalCJ,0);
await p.evaluate(()=>activityTest.save());const local=await p.evaluate(()=>JSON.parse(localStorage.getItem('lueur-nocturne-v1')));await load();assert.equal((await read()).stats.playTime.byGame.lueur,599);assert.equal((await read()).stats.totalCJ,0);
await p.locator('#play').click();await p.evaluate(()=>activityTest.noDraw());await active();await step(1000);assert.equal((await read()).stats.totalCJ,1);assert.equal((await read()).stats.byGame.lueur,1);assert.equal((await read()).stats.playTime.byGame.lueur,600);
const before=await read();await p.evaluate(()=>{window.savedSave=CJajlkAccount.savePlayer;CJajlkAccount.savePlayer=()=>{}});await step(1000);assert.deepEqual(await read(),before,'failed write');await p.evaluate(()=>CJajlkAccount.savePlayer=savedSave);
await p.evaluate(()=>activityTest.move(false));await step(10000);assert.deepEqual(await read(),before,'stationary after activity');
const q=await c.newPage();await q.goto(base+'/dist/index.html');await q.getByText('Lueur Nocturne est déjà ouvert',{exact:false}).waitFor();assert.equal(await q.evaluate(()=>typeof getGameState),'undefined');await q.close();
// A competing Hub-compatible engine cannot own the shared lock concurrently.
await active();const rival=await c.newPage();await rival.goto(base+'/hub/v2/#profil');await rival.evaluate(()=>{document.hasFocus=()=>true;window.getGameState=()=>({running:true})});await rival.addScriptTag({url:base+'/hub/core/cjEngine.js'});await rival.waitForTimeout(150);assert.equal(await rival.evaluate(()=>CJEngine.isTracking()),false);
await p.evaluate(()=>activityTest.pause());await step(40);await rival.waitForFunction(()=>CJEngine.isTracking());await rival.close();
await p.goto(base+'/hub/v2/#profil');await p.waitForFunction(()=>window.CJDashboardProfile?.read().state==='ready');const card=await p.locator('#game-stats [data-game=lueur]').textContent();assert.match(card,/Lueur Nocturne/);assert.match(card,/1 CJ/);assert.equal(await p.evaluate(()=>CJDashboardProfile.read().games.find(g=>g.id==='lueur').seconds),600);assert.equal(await p.evaluate(()=>CJDashboardProfile.read().balance),1);
assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('lueur-nocturne-v1')).cosmetics),local.cosmetics);assert.deepEqual(errors,[]);console.log(size.width+'x'+size.height+': idle/pause/focus/visibility, 599s+reload+1s = 600s/1CJ, storage failure, two locks, Hub card OK');await c.close();
}
// Unmodified game, real animation frames and real mouse/touch events.
for(const mobile of [false,true]){
 const c=await browser.newContext({viewport:mobile?{width:360,height:800}:{width:1920,height:1080},isMobile:mobile,hasTouch:mobile});
 await c.route('https://cjajlk.github.io/cjajlkGames-V2-test/core/*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(hub,'core',new URL(r.request().url()).pathname.split('/').pop()))}));
 await c.route('**/dist/game.js*',r=>r.fulfill({contentType:'text/javascript',body:source}));
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/dist/index.html');await p.bringToFront();await p.waitForFunction(()=>window.getGameState&&CJajlkAccount.isIdentityReady());await p.locator('#play').click();
 if(mobile){const box=await p.locator('#joystick').boundingBox(),cdp=await c.newCDPSession(p);const x=box.x+box.width*.8,y=box.y+box.height*.5;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await p.waitForTimeout(1700);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else {await p.mouse.move(1500,540);await p.waitForTimeout(1700);}
 assert((await p.evaluate(()=>CJajlkAccount.getPlayer().stats.playTime.byGame.lueur))>=1,'real input time');await p.locator('#pause').click();await p.waitForTimeout(200);const before=await p.evaluate(()=>localStorage.getItem('cjPlayerData'));await p.waitForTimeout(1100);assert.equal(await p.evaluate(()=>localStorage.getItem('cjPlayerData')),before);assert.deepEqual(errors,[]);console.log((mobile?'Android touch':'PC mouse')+': real frames, movement and pause OK');await c.close();
}
console.log('PASS Hub integration');})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
