const assert=require('node:assert/strict'),A=require('./dist/ai.js'),C=require('./dist/core.js'),B=require('./dist/combat.js');
const bot=(kind='sentinel',x=400,y=400)=>({kind,x,y,mass:kind==='sentinel'?250:100,angle:0,speed:38,spawnShield:0});
let seed=913;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const player={x:2000,y:2000,mass:24,invincible:0};
function world(enemies){return {player:{...player},enemies,rocks:[],lit:0};}
function step(e,w,dt=.1){e.angle=A.heading(e,w,dt,null,C,B);const r=C.radius(e.mass);e.x=Math.max(55+r,Math.min(2145-r,e.x+Math.cos(e.angle)*e.speed*dt));e.y=Math.max(55+r,Math.min(2145-r,e.y+Math.sin(e.angle)*e.speed*dt));}
for(const [x,y] of [[135,135],[2065,135],[135,2065],[2065,2065]]){
 const e=bot('sentinel',x,y),w=world([e]);w.player.invincible=1;for(let i=0;i<100;i++)step(e,w);
 assert(Math.hypot(e.x-x,e.y-y)>100,'guardian leaves each arena corner');
}
let e=bot(),w=world([e]);w.rocks=[{x:440,y:400,r:35}];e.patrol={x:800,y:400};e.patrolTime=30;
for(let i=0;i<150;i++)step(e,w);assert(e.x>500||Math.abs(e.y-400)>100,'guardian escapes crystal blockage');
const a=bot(),b=bot();w=world([a,b]);for(let i=0;i<100;i++){step(a,w);step(b,w);}assert(Math.hypot(a.x-b.x,a.y-b.y)>120,'coincident guardians separate');
e=bot();w=world([e]);w.player.x=750;w.player.y=400;A.heading(e,w,.1,null,C,B);assert.equal(e.target,w.player,'guardian perceives at 350');
w.player.x=1200;A.heading(e,w,.1,null,C,B);assert.equal(e.target,null,'out-of-range target forgotten');
e=bot();w=world([e]);w.player.x=650;w.player.y=400;for(let i=0;i<81;i++)A.heading(e,w,.1,null,C,B);assert(!e.target&&e.rest>0,'bounded pursuit');
e=bot('wisp');e.behavior='prudent';w=world([e,{...bot('wisp',470,400),mass:10}]);A.heading(e,w,.1,0,C,B);assert.equal(e.mode,'forage');
w.enemies.push(bot('sentinel',450,400));A.heading(e,w,.1,0,C,B);assert.equal(e.mode,'flee');
e=bot('hunter');w=world([e]);w.player={x:800,y:400,mass:24,invincible:0};A.heading(e,w,.1,null,C,B);assert(!e.target);w.lit=2;A.heading(e,w,.1,null,C,B);assert.equal(e.target,w.player,'progression expands hunter search without inflating stats');
B.protect(e);A.heading(e,w,.1,0,C,B);assert(!e.target);assert.equal(e.spawnShield,3,'AI preserves respawn shield');
// Non-rendering steering benchmark; not an Android frame-rate claim.
w=world(Array.from({length:24},(_,i)=>bot(i<2?'sentinel':'hunter',200+(i%6)*300,200+Math.floor(i/6)*400)));
const start=performance.now();for(let i=0;i<600;i++)for(const e of w.enemies)step(e,w,1/60);
assert(w.enemies.every(e=>Number.isFinite(e.x)&&Number.isFinite(e.y)));
console.log('OK IA — coins, cristaux, séparation, perception, abandon, profils, difficulté, bouclier.');
console.log('24 bots / 600 pas : '+Math.round(performance.now()-start)+' ms de calcul IA sur ce PC.');

