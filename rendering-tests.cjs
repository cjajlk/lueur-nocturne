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
for(const [w,h] of [[360,800],[390,844],[412,915],[800,360],[1920,1080]]){
 for(const [dx,dy] of [[-1000,-600],[1000,-600],[0,-1000],[0,1000],[1000,0],[-1000,0]]){
  const p=R.edgePoint(dx,dy,w,h);
  assert(p.x>=24&&p.x<=w-24&&p.y>=140&&p.y<=h-140);
  assert(Math.hypot(p.x-w/2,p.y-h/2)>100,'navigation stays away from player');
  assert.equal(p.angle,Math.atan2(dy,dx),'arrow keeps true target bearing');
 }
}
console.log('OK navigation — bords, direction et centre dégagé sur cinq formats.');
