const assert=require('node:assert/strict'),R=require('./dist/rendering.js');
const values=[10,24,40,80,160,240,300,400];
for(const player of [false,true]){
 let last=0;
 for(const mass of values){const radius=R.radius(mass,player);assert(radius>last);last=radius;
  assert.equal(radius,5*Math.sqrt(mass));
  const wispDiameter=R.creatureScale(radius,'wisp')*1.3,spriteDiameter=R.creatureScale(radius,'umbra')*3.4;
  assert(Math.abs(wispDiameter-spriteDiameter)<1e-10,'same light and radius must have same render footprint');
 }
}
// Camera zoom-out must still leave a clear visible player growth from 24 to 400.
assert(R.radius(400,true)*.72>R.radius(24,true)*1.4);
for(const [width,height] of [[360,800],[800,360],[390,844],[1920,1080]]){
 const occupied=[{x:width/2-30,y:height/2-30,w:60,h:60}];
 for(let i=0;i<4;i++){const box=R.place({x:width/2,y:height/2-60,w:110,h:28},occupied,width,height);if(!box)continue;assert(box.x>=0&&box.x+box.w<=width&&box.y>=0&&box.y+box.h<=height);assert(!occupied.some(b=>R.overlaps(box,b)));occupied.push(box);}
}
console.table(values.map(mass=>({lumiere:mass,diametreEnnemi:+(R.radius(mass)*2).toFixed(1),diametreJoueur:+(R.radius(mass,true)*2).toFixed(1)})));
console.log('OK rendu — croissance monotone, proportions communes, zoom, placement sans recouvrement aux quatre résolutions.');

// Off-screen navigation must leave the center clear in portrait and landscape.
for(const [w,h] of [[360,800],[390,844],[412,915],[770,810],[800,360],[1920,1080]]){
 for(const [dx,dy] of [[-1000,-600],[1000,-600],[0,-1000],[0,1000],[1000,0],[-1000,0]]){
  const p=R.edgePoint(dx,dy,w,h);
  assert(p.x>=24&&p.x<=w-24&&p.y>=140&&p.y<=h-140);
  assert(Math.hypot(p.x-w/2,p.y-h/2)>100,'navigation stays away from player');
  assert.equal(p.angle,Math.atan2(dy,dx),'arrow keeps true target bearing');assert(p.x===24||p.x===w-24,'arrow stays on a lateral edge, never inside the arena');
 }
}
console.log('OK navigation — bords, direction et centre dégagé sur cinq formats.');
// V0.8.3: close threats precede guardians, peers, prey and distant creatures.
for(const mobile of [true,false]){
 const cases=[[40,true,false,false],[40,false,true,false],[40,false,false,true],[40,false,false,false],[400,true,false,false]].map(v=>R.enemyLabel(...v,mobile));
 for(let i=1;i<cases.length;i++)assert(cases[i].priority>cases[i-1].priority);
 assert.equal(cases[0].alpha,1);assert(cases[3].alpha<cases[0].alpha);
 assert(R.enemyLabel(250,true,false,false,mobile).alpha<R.enemyLabel(150,true,false,false,mobile).alpha);
 assert.equal(R.enemyLabel(1000,true,false,false,mobile).alpha,0);
}
for(const [w,h] of [[360,800],[800,360],[1920,1080]]){
 const player={x:w/2-90,y:h/2-90,w:180,h:180},occupied=[player];let placed=0;
 for(let i=0;i<24;i++){
  const box=R.place({x:w/2+(i%3-1)*30,y:h/2-100,w:78,h:28},occupied,w,h);
  if(!box)continue;assert(!occupied.some(other=>R.overlaps(box,other)));occupied.push(box);placed++;
 }
 assert(placed<24,'crowded labels are omitted, never overlap the player or each other');
}
console.log('OK V0.8.3 — priorité danger/gardien/proche, atténuation progressive et foule sans chevauchement aux trois formats.');
