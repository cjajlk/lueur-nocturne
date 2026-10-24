const assert=require('node:assert/strict'),A=require('./dist/ai.js'),M=require('./dist/movement.js'),C=require('./dist/core.js'),B=require('./dist/combat.js');
const crystal=(x,y,r=40)=>M.prepare({x,y,r,a:0,facets:[[-r,-r],[r,-r],[r,r],[-r,r]]});
for(const kind of ['wisp','hunter','sentinel'])for(const mass of [25,250,600]){
 const e={x:500,y:700,kind,mass,angle:0,patrol:{x:1300,y:700},patrolTime:100,behavior:kind==='wisp'?'prudent':kind==='hunter'?'hunter':'guardian'};
 const goal={x:1300,y:700},rocks=[crystal(900,700)],world={movement:M,enemies:[e],player:{x:1100,y:1100,mass:10,invincible:1},rocks,lit:0};
 let closest=Infinity;
 for(let i=0;i<900;i++){
  const heading=A.heading(e,world,1/60,Math.atan2(goal.y-e.y,goal.x-e.x),C,B);e.angle=heading;M.move(e,Math.cos(heading),Math.sin(heading),1/60,1,C.radius(mass),rocks);
  assert(!M.hits(e.x,e.y,C.radius(mass),rocks),'solid obstacle remains solid');closest=Math.min(closest,Math.hypot(e.x-goal.x,e.y-goal.y));
 }
 assert(closest<100,`${kind}/${mass} must get around a crystal, closest ${closest}`);
}
// Concave cluster with an opening to the right: escape must choose a free direction.
const e={x:700,y:700,kind:'sentinel',mass:250,angle:Math.PI,patrol:{x:400,y:700},patrolTime:100};
const rocks=[crystal(540,700,45),crystal(700,540,45),crystal(700,860,45)];
const w={movement:M,enemies:[e],player:{x:1100,y:1100,mass:10,invincible:1},rocks,lit:0};
let escaped=false;
for(let i=0;i<1200;i++){const a=A.heading(e,w,1/60,null,C,B);e.angle=a;M.move(e,Math.cos(a),Math.sin(a),1/60,1,C.radius(e.mass),rocks);assert(!M.hits(e.x,e.y,C.radius(e.mass),rocks));if(Math.hypot(e.x-700,e.y-700)>300)escaped=true;}
assert(escaped,'guardian leaves the three-crystal pocket');
console.log('OK déblocage — trois profils, trois tailles, contournement complet et sortie d’un groupe concave de cristaux.');
