// Exercise the actual game loop in a lightweight DOM/canvas harness.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const noop=()=>{},gradient={addColorStop:noop},ctx=new Proxy({}, {get:(_,key)=>key==='measureText'?text=>({width:text.length*8}):key==='createRadialGradient'?()=>gradient:noop,set:()=>true});
const elements=new Map();function el(id){if(!elements.has(id))elements.set(id,{hidden:false,open:false,style:{},dataset:{},events:{},captures:new Set(),classList:{add:noop,remove:noop},getContext:()=>ctx,setAttribute:noop,addEventListener(name,fn){this.events[name]=fn;},setPointerCapture(id){this.captures.add(id);},hasPointerCapture(id){return this.captures.has(id);},releasePointerCapture(id){this.captures.delete(id);},showModal(){this.open=true;},close(){this.open=false;},getBoundingClientRect:()=>({left:0,top:0,width:110,height:110})});return elements.get(id);}
const windowEvents={};const sandbox={console,Math,JSON,Number,String,Object,Array,Set,Date,performance:{now:()=>0},innerWidth:1280,innerHeight:720,devicePixelRatio:1,setTimeout:noop,clearTimeout:noop,requestAnimationFrame:noop,addEventListener:(name,fn)=>windowEvents[name]=fn,localStorage:{getItem:()=>null,setItem:noop},Image:class{complete=false;naturalWidth=0;},document:{getElementById:el,querySelectorAll:()=>[],addEventListener:noop}};sandbox.window=sandbox;
sandbox.LueurArenas=require('./dist/arenas.js');sandbox.LueurMovement=require('./dist/movement.js');sandbox.LueurAI=require('./dist/ai.js');sandbox.LueurCombat=require('./dist/combat.js');sandbox.LueurRender=require('./dist/rendering.js');vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/core.js','utf8'),sandbox);
let code=fs.readFileSync('dist/game.js','utf8').replace(/\}\)\(\);\s*$/,`window.testGame={start,update,power,pause,closeModal,finish,home,draw,get rocks(){return rocks},get run(){return run},get profile(){return profile},get state(){return state},get paused(){return paused},keys};})();`);
vm.runInContext(code,sandbox);const g=sandbox.testGame;
g.start();g.run.enemies=[];g.run.motes=[];g.draw();assert.equal(g.run.player.lives,3);const time=g.run.elapsed;g.update(1);assert.equal(g.run.elapsed,time+1);assert.equal(g.profile.activeSeconds,0,'idle must not earn CJ');g.keys.add('d');g.update(1);g.keys.clear();assert(g.profile.activeSeconds>0,'movement earns active time');
g.run.player.mass=24;g.power();assert.equal(g.run.player.mass,20);assert.equal(g.run.cooldown,7);g.power();assert.equal(g.run.player.mass,20,'cooldown prevents second power');
g.pause();assert.equal(g.paused,true);g.closeModal();assert.equal(g.paused,false);
for(const s of g.run.shrines){g.run.exploration=999;g.run.route.forEach(p=>p.visited=true);g.run.enemies=[];g.run.player.x=s.x;g.run.player.y=s.y;g.run.player.mass=sandbox.LueurCore.offeringCost(g.run.lit)+10;for(let i=0;i<41;i++)g.update(.1);assert.equal(s.lit,true);assert.equal(g.run.player.mass,10);}
assert.equal(g.run.blessings.length,3);assert.equal(g.run.route.length,0,'free survival has no exploration gate');
assert.equal(g.profile.stats.shrines,3);g.run.player.x=1100;g.run.player.y=1100;g.update(.1);assert.equal(g.state,'playing','returning to centre does not auto-finish');g.finish(g.run.lit===3);assert.equal(g.state,'result');assert.equal(g.profile.stats.wins,1);assert.equal(g.profile.stats.flawless,1);assert.equal(g.profile.stats.runs,1);g.finish(true);assert.equal(g.profile.stats.wins,1,'result must not award twice');g.closeModal();assert.equal(g.state,'home','closing result returns home');
g.start();g.run.enemies=[];g.run.motes=[];g.run.elapsed=720;g.update(.1);assert.equal(g.state,'playing');g.finish(false);assert.equal(g.profile.stats.wins,1,'voluntary retreat before three shrines is not a win');
g.start();g.run.motes=[];g.run.player.x=400;g.run.player.y=400;g.run.player.invincible=0;g.run.player.lives=1;g.run.enemies=[{x:400,y:400,mass:100,angle:0,turn:1,speed:0,stun:1}];g.update(.01);assert.equal(g.state,'result');assert.equal(g.run.player.lives,0);
g.start();g.run.motes=[];g.run.player.x=1100;g.run.player.y=1100;g.run.player.invincible=0;g.run.enemies=[{x:1100,y:1100,mass:100,angle:0,turn:1,speed:0,stun:1}];g.update(.01);assert.equal(g.run.player.lives,3,'refuge protects');
console.log('OK — mouvement, temps actif, pouvoir, pause, trois offrandes, victoire, défaite, refuge et attribution unique.');
g.start();g.run.motes=[];g.run.enemies=[];g.run.player.mass=169;g.run.lit=1;g.run.player.x=g.run.shrines[0].x;g.run.player.y=g.run.shrines[0].y;g.update(1);assert.equal(g.run.shrines[0].charge,0,'second offering requires 160 plus reserve');
g.run.exploration=999;g.run.route.forEach(p=>p.visited=true);g.run.player.mass=180;g.run.player.lives=2;const horizon=g.run.shrines[2];g.run.player.x=horizon.x;g.run.player.y=horizon.y;for(let i=0;i<41;i++)g.update(.1);assert.equal(horizon.lit,true);assert.equal(g.run.player.lives,3,'Horizon restores one life');assert.equal(g.run.enemies.length,2,'awakening adds two enemies');
g.start();g.run.motes=[];g.run.enemies=[];g.run.blessings.push('Éveil');g.power();assert(Math.abs(g.run.cooldown-5.6)<1e-9);
g.start();g.run.motes=[];g.run.player.x=400;g.run.player.y=400;g.run.player.mass=400;g.run.player.invincible=0;g.run.enemies=[{x:400,y:400,kind:'sentinel',mass:200,angle:0,turn:1,speed:0,stun:1}];g.update(.01);assert.equal(g.run.player.lives,3,'strong player absorbs guardian');assert.equal(g.run.enemies.length,0);assert.equal(g.run.respawns[0].delay,12);g.update(11);assert.equal(g.run.enemies.length,0);g.update(1.01);assert.equal(g.run.enemies[0].kind,'sentinel');assert(g.run.enemies[0].spawnShield>0);
g.start();g.run.motes=[];g.run.player.x=400;g.run.player.y=400;g.run.player.invincible=0;const hunter={x:600,y:400,kind:'hunter',mass:100,angle:0,turn:1,speed:0,stun:0,attackCooldown:0,windup:0,dash:0};g.run.enemies=[hunter];g.update(.1);assert(hunter.windup>0,'hunter telegraphs attack');for(let i=0;i<9;i++)g.update(.1);assert(hunter.dash>0,'charge follows warning');
console.log('OK V2 — coûts progressifs, bénédictions, renforts, gardiens et charge annoncée.');
// Food is shared: enemies collect, grow and steer toward food without touching progression.
g.start();g.run.motes=[{x:405,y:400,r:3,phase:0}];g.run.enemies=[{x:400,y:400,kind:'wisp',mass:20,angle:2,turn:1,speed:48,stun:0}];
const growing=g.run.enemies[0],playerCollected=g.profile.stats.collected,playerCJ=g.profile.shards,oldFood=g.run.motes[0];g.update(.01);
assert.equal(growing.mass,22);assert.notEqual(g.run.motes[0],oldFood,'consumed food is replaced');assert.equal(g.profile.stats.collected,playerCollected);assert.equal(g.profile.shards,playerCJ);assert(growing.growthFlash>0);
g.run.motes=[];g.update(1);assert.equal(growing.mass,22,'no growth without food');
growing.x=700;growing.y=400;growing.forageTimer=0;growing.angle=2;g.run.motes=[{x:800,y:400,r:3,phase:0}];g.update(.1);assert.equal(growing.angle,0,'steers toward nearby food');assert(growing.x>700);
growing.mass=400;growing.x=400;growing.y=400;g.run.motes=[{x:400,y:400,r:3,phase:0}];g.update(.01);assert(growing.mass>400,'growth continues beyond the former cap');
g.start();g.run.motes=[];g.run.enemies=[];g.run.lit=2;g.run.exploration=999;g.run.route.forEach(p=>p.visited=true);g.run.player.mass=250;const lastShrine=g.run.shrines[2];g.run.player.x=lastShrine.x;g.run.player.y=lastShrine.y;for(let i=0;i<41;i++)g.update(.1);assert(lastShrine.lit);assert.equal(g.run.player.mass,10,'240 light is payable with the reserve');
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


// Stage gates cannot be bypassed by light alone or by standing in the refuge.
g.start();g.run.enemies=[];g.run.motes=[];g.run.player.mass=300;g.run.player.x=g.run.shrines[0].x;g.run.player.y=g.run.shrines[0].y;g.update(5);assert(!g.run.shrines[0].lit);assert.equal(g.run.exploration,0);g.run.exploration=120;g.update(5);assert(!g.run.shrines[0].lit,'repères still required');g.run.route.forEach(p=>p.visited=true);g.update(4);assert(g.run.shrines[0].lit);assert.equal(g.run.exploration,0);assert.equal(g.run.route.filter(p=>p.visited).length,0);
g.start();g.run.enemies=[];g.run.motes=[];g.run.player.x=400;g.run.player.y=400;g.keys.add('d');g.update(1);g.keys.clear();assert.equal(g.run.exploration,1);g.update(1);assert.equal(g.run.exploration,1,'idle exploration excluded');
console.log('OK V4 étapes — accès, exploration active, repères, survie libre, sortie volontaire et records.');
// Actual bot pair integration, delayed reappearance and spawn safety.
g.start();g.run.motes=[];g.run.respawns=[];g.run.player.x=1100;g.run.player.y=1100;
const bot=(mass,x=400)=>({x,y:400,kind:'wisp',mass,angle:0,turn:1,speed:0,stun:1,spawnShield:0});
const predator=bot(100),prey=bot(20,410);g.run.enemies=[predator,prey];const absorbedBefore=g.profile.stats.absorbed,shardsBefore=g.profile.shards;g.update(.01);assert.equal(g.run.enemies.length,1);assert(predator.mass>100);assert.equal(g.run.respawns.length,1);assert.equal(g.profile.stats.absorbed,absorbedBefore);assert.equal(g.profile.shards,shardsBefore);g.update(2);assert.equal(g.run.enemies.length,1);g.update(2.01);assert.equal(g.run.enemies.length,2);const respawn=g.run.enemies.find(e=>e!==predator);assert(respawn.spawnShield>0);assert(Math.hypot(respawn.x-predator.x,respawn.y-predator.y)>100);
g.start();g.run.motes=[];g.run.respawns=[];const shielded=bot(10);shielded.spawnShield=3;const guardian={...bot(300,410),kind:'sentinel'};g.run.enemies=[guardian,shielded];g.update(.01);assert.equal(g.run.enemies.length,2,'guardian respects shield');assert(shielded.spawnShield>2.9);
// Keep the simulation running beyond the old limit, with normal bot AI and no player invulnerability hacks.
g.start();g.run.player.x=g.run.player.y=1100;const startingShards=g.profile.shards;let maxBots=0,minBots=99;
for(let i=0;i<9000;i++){g.update(.1);maxBots=Math.max(maxBots,g.run.enemies.length);minBots=Math.min(minBots,g.run.enemies.length);assert.equal(g.state,'playing');assert(g.run.enemies.every(e=>Number.isFinite(e.mass)&&e.mass>0));assert(g.run.enemies.filter(e=>e.kind==='sentinel').length<=2);assert(g.run.enemies.length+g.run.respawns.length===18);}
assert.equal(g.profile.shards,startingShards,'idle survival earns no currency');assert(g.run.elapsed>=899);console.log('OK endurance 15 minutes — population '+minBots+'–'+maxBots+', deux gardiens maximum, aucune monnaie inactive ni fin forcée.');
// Full expedition with a controlled food stream (1 mote/second), actual movement and collection.
// No mass assignment: this checks reachability of all offerings from the initial 24 light.
g.start();g.run.enemies=[];g.run.respawns=[];g.run.motes=[];
const growthSamples=[];
for(let stage=0;stage<3;stage++){
 for(const point of g.run.route){g.run.player.x=point.x;g.run.player.y=point.y;g.update(.1);} // Visit fixtures through the real collision logic.
 g.run.player.x=750;g.run.player.y=800;let direction='d',tick=0;
 while(!sandbox.LueurCore.stageReady(g.run)||g.run.player.mass<sandbox.LueurCore.offeringCost(stage)+10){
  if(g.run.player.x>1450)direction='a';if(g.run.player.x<750)direction='d';g.keys.clear();
  const player=g.run.player,angle=sandbox.LueurAI.navigate(player,direction==='d'?0:Math.PI,{movement:sandbox.LueurMovement,rocks:g.rocks,enemies:[player]},sandbox.LueurCore.radius(player.mass));
  if(Math.cos(angle)>.3)g.keys.add('d');if(Math.cos(angle)<-.3)g.keys.add('a');if(Math.sin(angle)>.3)g.keys.add('s');if(Math.sin(angle)<-.3)g.keys.add('w');
  g.run.motes=tick%10===0?[{x:g.run.player.x,y:g.run.player.y,r:3,phase:0}]:[];
  g.update(.1);if(tick%100===0)growthSamples.push(g.run.player.mass);tick++;assert(tick<4000,'stage must remain reachable '+JSON.stringify({stage,player:g.run.player,route:g.run.route,exploration:g.run.exploration}));
 }
 g.keys.clear();g.run.motes=[];const shrine=g.run.shrines[stage];g.run.player.x=shrine.x;g.run.player.y=shrine.y;for(let i=0;i<41;i++)g.update(.1);assert(shrine.lit);g.run.enemies=[];g.run.respawns=[];
}
assert(g.run.elapsed>=480&&g.run.elapsed<720);assert.equal(g.state,'playing');const finalLight=g.run.player.mass;g.run.player.x=g.run.player.y=1100;
for(let i=0;i<100;i++){g.run.motes=[{x:1100,y:1100,r:3,phase:0}];g.update(.1);}assert(g.run.player.mass>finalLight);assert.equal(g.state,'playing');
g.finish(true);assert.equal(g.state,'result');assert(g.profile.stats.bestLight>=Math.floor(g.run.peak));assert(growthSamples.length>30);
console.log('OK expédition complète — '+g.run.elapsed.toFixed(1)+' s, récolte réelle du début à la fin, trois étapes, croissance après le troisième sanctuaire, bilan volontaire.');
// Character identities remain distinct; powers use their original costs and durations.
for(const [id,cost,cooldown,duration] of [['nyx',4,7,.55],['mira',5,10,4],['orion',5,12,4],['umbra',7,11,3]]){
 g.profile.selected=id;g.start();g.run.enemies=[];g.run.motes=[];g.power();assert.equal(g.run.player.mass,24-cost);assert.equal(g.run.cooldown,cooldown);assert.equal(g.run.power,duration);
 if(id==='orion'||id==='umbra'){g.run.player.x=400;g.run.player.y=400;g.run.player.invincible=0;g.run.enemies=[{x:400,y:400,kind:'sentinel',mass:300,angle:0,turn:1,speed:0,stun:1}];g.update(.01);assert.equal(g.run.player.lives,3,'defensive power protects '+id);}
}
g.profile.selected='mira';g.start();g.run.motes=[];g.run.player.mass=100;g.run.player.x=400;g.run.player.y=400;g.run.player.invincible=0;g.run.enemies=[{x:400,y:400,kind:'sentinel',mass:300,angle:0,turn:1,speed:0,stun:1}];g.update(.01);assert.equal(g.run.player.mass,50,'Mira retains its capture penalty');
console.log('OK personnages — quatre coûts/durées/recharges, défenses Orion/Umbra et perte propre à Mira.');

// V0.6 integrated predation: idle outside the refuge is actually dangerous.
g.start();g.run.motes=[];g.run.respawns=[];g.run.player.x=400;g.run.player.y=400;g.run.player.invincible=0;
g.run.enemies=[{x:650,y:400,kind:'hunter',behavior:'hunter',mass:100,angle:Math.PI,speed:76,stun:0,spawnShield:0,attackCooldown:0,windup:0,dash:0}];
for(let i=0;i<80&&g.run.captures===0;i++)g.update(.1);
assert(g.run.captures>0,'hunter closes in and captures an exposed stationary player');
// Full update cost at the maximum population; no mutation of mass or speed by progression.
g.start();g.run.lit=3;g.run.route=[];g.run.player.x=g.run.player.y=1100;
for(let i=0;i<6;i++)g.run.enemies.push({...g.run.enemies[i+2],x:250+(i%3)*600,y:250+Math.floor(i/3)*1200,spawnShield:3,target:null,patrol:null});
const benchmarkStart=performance.now();for(let i=0;i<600;i++)g.update(1/60);
assert.equal(g.run.enemies.length+g.run.respawns.length,24);assert.equal(g.state,'playing');
console.log('OK V0.6 — prédation joueur et survie libre à 24 bots ; 600 mises à jour : '+Math.round(performance.now()-benchmarkStart)+' ms sur ce PC, hors rendu.');

// Actual controls and power expiration use the shared speed without a touch advantage.
for(const id of ['nyx','mira','orion','umbra']){
 g.profile.selected=id;g.start();g.run.enemies=[];g.run.respawns=[];g.run.motes=[];g.run.player.x=800;g.run.player.y=800;
 g.keys.add('d');for(let i=0;i<10;i++)g.update(.1);g.keys.clear();assert(Math.abs(g.run.player.x-980)<1e-6,id+' common keyboard speed');
 g.run.player.x=800;stick.events.pointerdown(touch(77,500,55));for(let i=0;i<10;i++)g.update(.1);stick.events.pointerup(touch(77));assert(Math.abs(g.run.player.x-980)<1e-6,id+' common full joystick speed');
}
g.profile.selected='nyx';g.start();g.run.enemies=[];g.run.respawns=[];g.run.motes=[];g.run.player.x=700;g.run.player.y=800;g.power();g.keys.add('d');g.update(.1);assert(Math.abs(g.run.player.x-755.8)<1e-6,'temporary impulse multiplier');for(let i=0;i<6;i++)g.update(.1);const afterBoost=g.run.player.x;g.update(.1);g.keys.clear();assert(Math.abs(g.run.player.x-afterBoost-18)<1e-6,'base speed restored after power expires');
console.log('OK commandes — quatre personnages, clavier et joystick identiques ; expiration réelle de l’impulsion.');

// V0.7: exact guardian threshold through the real player and bot collision paths.
for(const mass of [450,499.99,500,550]){
 g.start();g.run.motes=[];g.run.respawns=[];Object.assign(g.run.player,{x:600,y:600,mass,invincible:0});
 const sentinel={...bot(400,600),y:600,kind:'sentinel',stun:5};g.run.enemies=[sentinel];g.update(.001);
 assert.equal(!!sentinel.dead,mass>=500);assert.equal(g.run.player.lives,mass>=500?3:2);
 assert.equal(g.run.lit,0);assert(g.run.shrines.every(s=>!s.lit));
}
g.start();g.run.motes=[];g.run.respawns=[];const eater={...bot(500),kind:'hunter'},meal={...bot(400,410),kind:'sentinel'};g.run.enemies=[eater,meal];g.update(.001);assert(meal.dead);assert.equal(g.run.respawns[0].delay,12);assert.equal(eater.feedCooldown,1);
console.log('OK V0.7 — joueur sous/au-dessus/au seuil 500 contre 400, bot, sanctuaires et délai gardien.');

// V0.8: the visual theme must never change gameplay randomness or physics.
const arenas=sandbox.LueurArenas,originalRandom=Math.random;
try{Math.random=()=>{throw Error('theme consumed gameplay randomness');};assert.deepEqual(arenas.create(),arenas.create());}finally{Math.random=originalRandom;}
assert.equal(arenas.valid('unknown'),'night');
const profileBefore=JSON.stringify(g.profile),rockBefore=JSON.stringify(g.rocks);
function themeSimulation(arena){
 let seed=80421;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 el('arena-choice').value=arena;g.start();assert.equal(g.run.arena,arena);
 el('arena-choice').value=arena==='forest'?'night':'forest';assert.equal(g.run.arena,arena,'choice locked for expedition');
 g.keys.add('d');for(let i=0;i<180;i++)g.update(1/60);g.keys.clear();
 const snapshot=()=>JSON.stringify({player:g.run.player,enemies:g.run.enemies.map(e=>[e.x,e.y,e.mass,e.kind]),motes:g.run.motes,shrines:g.run.shrines,route:g.run.route});
 const before=snapshot(),saved=JSON.stringify(g.profile);g.draw();assert.equal(snapshot(),before);assert.equal(JSON.stringify(g.profile),saved,'render never changes profile');
 return before;
}
let night,forest;try{night=themeSimulation('night');forest=themeSimulation('forest');}finally{Math.random=originalRandom;}
assert.equal(night,forest,'identical seeded gameplay in both arenas');assert.equal(JSON.stringify(g.rocks),rockBefore);
for(const s of g.run.shrines){g.run.exploration=999;g.run.route.forEach(p=>p.visited=true);g.run.enemies=[];g.run.motes=[];g.run.player.x=s.x;g.run.player.y=s.y;g.run.player.mass=sandbox.LueurCore.offeringCost(g.run.lit)+10;for(let i=0;i<41;i++)g.update(.1);assert(s.lit);}
assert.equal(g.run.lit,3);assert.equal(g.state,'playing');assert(!Object.hasOwn(g.profile,'arena'));
console.log('OK V0.8 — décor déterministe, sélection par expédition, simulation identique entre arènes, rendu sans mutation, trois sanctuaires puis survie libre.');
