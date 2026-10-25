const assert=require('node:assert/strict'),M=require('./dist/movement.js');
const rock=(x,y,r=40,a=0)=>M.prepare({x,y,r,a,facets:[[-r,-r],[r,-r],[r,r],[-r,r]]});
const decor={...rock(700,700,25),solid:false},e={x:600,y:700};M.move(e,1,0,1,1,25,[decor]);assert.equal(e.x,780);
const wall=rock(900,700,80,.4),slider={x:650,y:680};let tangent=false;
for(let i=0;i<180;i++){M.move(slider,1,0,1/60,1,25,[wall]);assert(!M.hits(slider.x,slider.y,25,[wall]));if(Math.abs(slider.y-680)>10)tangent=true;}assert(tangent);
const layout=M.layout([rock(80,700),rock(160,700),rock(2100,1700),rock(700,80),rock(700,2100),rock(600,600,25)]),solids=layout.filter(r=>r.solid);
assert(solids.length>0);for(const r of solids){assert(r.x-r.bound>=471&&r.x+r.bound<=1729);assert(r.y-r.bound>=471&&r.y+r.bound<=1729);for(const q of solids)if(q!==r)assert(Math.hypot(r.x-q.x,r.y-q.y)>=r.bound+q.bound+416);}
for(const radius of [25,80,200])for(const start of [{x:55+radius,y:55+radius},{x:2145-radius,y:2145-radius}]){for(let i=0;i<600;i++){M.move(start,-1,.5,1/60,1,radius,layout);assert(!M.hits(start.x,start.y,radius,layout));assert(start.x>=55+radius&&start.y<=2145-radius);}}
console.log('OK V0.7 collisions — décor traversable, tangente oblique, espacement, grandes créatures et bordures.');
