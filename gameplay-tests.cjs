// Exercise the actual game loop in a lightweight DOM/canvas harness.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const noop=()=>{},gradient={addColorStop:noop},ctx=new Proxy({}, {get:(_,key)=>key==='measureText'?text=>({width:text.length*8}):key==='createRadialGradient'?()=>gradient:noop,set:()=>true});
const elements=new Map();function el(id){if(!elements.has(id))elements.set(id,{hidden:false,open:false,style:{},dataset:{},events:{},captures:new Set(),classList:{add:noop,remove:noop},getContext:()=>ctx,setAttribute:noop,addEventListener(name,fn){this.events[name]=fn;},setPointerCapture(id){this.captures.add(id);},hasPointerCapture(id){return this.captures.has(id);},releasePointerCapture(id){this.captures.delete(id);},showModal(){this.open=true;},close(){this.open=false;},getBoundingClientRect:()=>({left:0,top:0,width:110,height:110})});return elements.get(id);}
const windowEvents={};const sandbox={console,Math,JSON,Number,String,Object,Array,Set,Date,performance:{now:()=>0},innerWidth:1280,innerHeight:720,devicePixelRatio:1,setTimeout:noop,clearTimeout:noop,requestAnimationFrame:noop,addEventListener:(name,fn)=>windowEvents[name]=fn,localStorage:{getItem:()=>null,setItem:noop},Image:class{complete=false;naturalWidth=0;},document:{getElementById:el,querySelectorAll:()=>[],addEventListener:noop}};sandbox.window=sandbox;
sandbox.LueurRender=require('./dist/rendering.js');vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/core.js','utf8'),sandbox);
let code=fs.readFileSync('dist/game.js','utf8').replace(/\}\)\(\);\s*$/,`window.testGame={start,update,power,pause,closeModal,finish,home,draw,get run(){return run},get profile(){return profile},get state(){return state},get paused(){return paused},keys};})();`);
vm.runInContext(code,sandbox);const g=sandbox.testGame;
g.start();g.run.enemies=[];g.run.motes=[];g.draw();assert.equal(g.run.player.lives,3);const time=g.run.time;g.update(1);assert.equal(g.run.time,time-1);assert.equal(g.profile.activeSeconds,0,'idle must not earn CJ');g.keys.add('d');g.update(1);g.keys.clear();assert(g.profile.activeSeconds>0,'movement earns active time');
g.run.player.mass=24;g.power();assert.equal(g.run.player.mass,20);assert.equal(g.run.cooldown,7);g.power();assert.equal(g.run.player.mass,20,'cooldown prevents second power');
g.pause();assert.equal(g.paused,true);g.closeModal();assert.equal(g.paused,false);
for(const s of g.run.shrines){g.run.enemies=[];g.run.player.x=s.x;g.run.player.y=s.y;g.run.player.mass=sandbox.LueurCore.offeringCost(g.run.lit)+10;for(let i=0;i<41;i++)g.update(.1);assert.equal(s.lit,true);assert.equal(g.run.player.mass,10);}
assert.equal(g.run.blessings.length,3);assert(g.run.time<=60,'final eclipse is capped at 60 seconds');
assert.equal(g.profile.stats.shrines,3);g.run.player.x=1100;g.run.player.y=1100;g.update(.1);assert.equal(g.state,'result');assert.equal(g.profile.stats.wins,1);assert.equal(g.profile.stats.flawless,1);assert.equal(g.profile.stats.runs,1);g.finish(true);assert.equal(g.profile.stats.wins,1,'result must not award twice');g.closeModal();assert.equal(g.state,'home','closing result returns home');
g.start();g.run.enemies=[];g.run.motes=[];g.run.time=.01;g.update(.1);assert.equal(g.state,'result');assert.equal(g.profile.stats.wins,1,'timeout must not award win');
g.start();g.run.motes=[];g.run.player.x=400;g.run.player.y=400;g.run.player.invincible=0;g.run.player.lives=1;g.run.enemies=[{x:400,y:400,mass:100,angle:0,turn:1,speed:0,stun:1}];g.update(.01);assert.equal(g.state,'result');assert.equal(g.run.player.lives,0);
g.start();g.run.motes=[];g.run.player.x=1100;g.run.player.y=1100;g.run.player.invincible=0;g.run.enemies=[{x:1100,y:1100,mass:100,angle:0,turn:1,speed:0,stun:1}];g.update(.01);assert.equal(g.run.player.lives,3,'refuge protects');
console.log('OK — mouvement, temps actif, pouvoir, pause, trois offrandes, victoire, défaite, refuge et attribution unique.');
g.start();g.run.motes=[];g.run.enemies=[];g.run.player.mass=169;g.run.lit=1;g.run.player.x=g.run.shrines[0].x;g.run.player.y=g.run.shrines[0].y;g.update(1);assert.equal(g.run.shrines[0].charge,0,'second offering requires 160 plus reserve');
g.run.player.mass=180;g.run.player.lives=2;const horizon=g.run.shrines[2];g.run.player.x=horizon.x;g.run.player.y=horizon.y;for(let i=0;i<41;i++)g.update(.1);assert.equal(horizon.lit,true);assert.equal(g.run.player.lives,3,'Horizon restores one life');assert.equal(g.run.enemies.length,2,'awakening adds two enemies');
g.start();g.run.motes=[];g.run.enemies=[];g.run.blessings.push('Éveil');g.power();assert(Math.abs(g.run.cooldown-5.6)<1e-9);
g.start();g.run.motes=[];g.run.player.x=400;g.run.player.y=400;g.run.player.mass=400;g.run.player.invincible=0;g.run.enemies=[{x:400,y:400,kind:'sentinel',mass:200,angle:0,turn:1,speed:0,stun:1}];g.update(.01);assert.equal(g.run.player.lives,2,'sentinel remains dangerous even at maximum light');
g.start();g.run.motes=[];g.run.player.x=400;g.run.player.y=400;g.run.player.invincible=0;const hunter={x:600,y:400,kind:'hunter',mass:100,angle:0,turn:1,speed:0,stun:0,attackCooldown:0,windup:0,dash:0};g.run.enemies=[hunter];g.update(.1);assert(hunter.windup>0,'hunter telegraphs attack');for(let i=0;i<9;i++)g.update(.1);assert(hunter.dash>0,'charge follows warning');
console.log('OK V2 — coûts progressifs, bénédictions, renforts, gardiens et charge annoncée.');
// Food is shared: enemies collect, grow and steer toward food without touching progression.
g.start();g.run.motes=[{x:405,y:400,r:3,phase:0}];g.run.enemies=[{x:400,y:400,kind:'wisp',mass:20,angle:2,turn:1,speed:48,stun:0}];
const growing=g.run.enemies[0],playerCollected=g.profile.stats.collected,playerCJ=g.profile.cj,oldFood=g.run.motes[0];g.update(.01);
assert.equal(growing.mass,22);assert.notEqual(g.run.motes[0],oldFood,'consumed food is replaced');assert.equal(g.profile.stats.collected,playerCollected);assert.equal(g.profile.cj,playerCJ);assert(growing.growthFlash>0);
g.run.motes=[];g.update(1);assert.equal(growing.mass,22,'no growth without food');
growing.x=400;growing.y=400;growing.forageTimer=0;growing.angle=2;g.run.motes=[{x:500,y:400,r:3,phase:0}];g.update(.1);assert.equal(growing.angle,0,'steers toward nearby food');assert(growing.x>400);
growing.mass=399;growing.x=400;growing.y=400;g.run.motes=[{x:400,y:400,r:3,phase:0}];g.update(.01);assert.equal(growing.mass,400,'enemy growth is capped');
g.start();g.run.motes=[];g.run.enemies=[];g.run.lit=2;g.run.player.mass=250;const lastShrine=g.run.shrines[2];g.run.player.x=lastShrine.x;g.run.player.y=lastShrine.y;for(let i=0;i<41;i++)g.update(.1);assert(lastShrine.lit);assert.equal(g.run.player.mass,10,'240 light is payable with the reserve');
console.log('OK V3 — récolte et croissance ennemies, nourriture partagée, aucune progression attribuée au joueur, offrande de 240 réalisable.');
// Concurrent touches: the second finger must not steal or release the joystick.
const touch=(id,x=85,y=55)=>({pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:y,preventDefault:noop});
const stick=el('joystick'),ability=el('ability');
g.start();g.run.motes=[];g.run.enemies=[];stick.events.pointerdown(touch(11));assert(stick.captures.has(11));
stick.events.pointerdown(touch(22,20));stick.events.pointerup(touch(22));assert(!stick.captures.has(22));
let px=g.run.player.x;g.update(.1);assert(g.run.player.x>px,'first finger still drives right');
ability.events.pointerdown(touch(22));assert(g.run.cooldown>0);px=g.run.player.x;g.update(.1);assert(g.run.player.x>px,'ability does not interrupt movement');
g.pause();assert.equal(stick.captures.size,0);g.closeModal();stick.events.pointermove(touch(11));px=g.run.player.x;g.update(.1);assert.equal(g.run.player.x,px,'no stale movement after pause');
stick.events.pointerdown(touch(33));stick.events.pointercancel(touch(33));assert.equal(stick.captures.size,0);
stick.events.pointerdown(touch(44));windowEvents.orientationchange();assert.equal(stick.captures.size,0);
stick.events.pointerdown(touch(55));el('world').getBoundingClientRect=()=>({width:390,height:740});windowEvents.resize();assert.equal(stick.captures.size,0);assert.equal(el('world').width,390);assert.equal(el('world').height,740);
stick.events.pointerdown(touch(66));stick.events.lostpointercapture(touch(66));assert.equal(stick.captures.size,0);
console.log('OK mobile — multitouch, pouvoir simultané, capture relâchée, pause/reprise, annulation, rotation et redimensionnement.');
