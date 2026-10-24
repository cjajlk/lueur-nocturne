const assert=require('node:assert/strict'),M=require('./dist/movement.js'),C=require('./dist/core.js'),A=require('./dist/ai.js'),B=require('./dist/combat.js');
const near=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
for(const c of Object.values(C.characters))assert.equal(c.speed,M.speed);
for(const mass of [10,24,100,250,400,1600]){
 for(const kind of ['player','wisp','hunter','sentinel']){
  const e={x:700,y:700,kind,mass};for(let i=0;i<60;i++)M.move(e,1,0,1/60,1,C.radius(mass));near(e.x,880);
 }
}
for(const [x,y] of [[1,0],[1,1],[100,50]]){const e={x:700,y:700};M.move(e,x,y,1,1,25);near(Math.hypot(e.x-700,e.y-700),180);}
const slow={x:700,y:700};M.move(slow,.5,0,1,1,25);near(slow.x,790);
// Equal-speed chase and flight preserve separation on an open straight line.
const prey={x:800,y:700,mass:24},predator={x:600,y:700,mass:200};
for(let i=0;i<60;i++){M.move(prey,1,0,1/60,1,C.radius(prey.mass));M.move(predator,1,0,1/60,1,C.radius(predator.mass));}near(prey.x-predator.x,200);
const boosted={x:500,y:700};M.move(boosted,1,0,.5,3.1,25);near(boosted.x,779);M.move(boosted,1,0,.5,1,25);near(boosted.x,869);
const rock=M.prepare({x:1100,y:700,r:40,a:.25,facets:[[-30,-65],[30,-40],[40,40],[-40,40]]});
for(const mass of [24,250,400,1600])for(const multiplier of [1,2.5,3.1]){
 const e={x:600,y:700,mass};for(let i=0;i<120;i++){M.move(e,1,0,1/60,multiplier,C.radius(mass),[rock]);assert(!M.hits(e.x,e.y,C.radius(mass),[rock]),'no crystal penetration, including boosted large bodies');}
 assert(e.x<1100,'cannot tunnel across crystal');
}
const grown={x:1030,y:700};M.move(grown,0,0,0,1,100,[rock]);assert(!M.hits(grown.x,grown.y,100,[rock]),'resolve overlap after growth');
// Same AI, now with the real solid obstacle solver and common speed.
const guardian={x:800,y:700,mass:250,kind:'sentinel',angle:0,patrol:{x:1400,y:700},patrolTime:20};
const world={player:{x:1100,y:1100,mass:24,invincible:1},enemies:[guardian],rocks:[rock],lit:0};
for(let i=0;i<600;i++){const a=A.heading(guardian,world,1/60,null,C,B);M.move(guardian,Math.cos(a),Math.sin(a),1/60,1,C.radius(guardian.mass),[rock]);assert(!M.hits(guardian.x,guardian.y,C.radius(guardian.mass),[rock]));}
assert(Math.hypot(guardian.x-800,guardian.y-700)>100,'guardian stays autonomous around solid crystals');
console.log('OK vitesse — 180 unités/s toutes masses et catégories, diagonales/tactile plafonnés, poursuite/fuite égales, bonus puis retour normal, collisions et gardiens.');
