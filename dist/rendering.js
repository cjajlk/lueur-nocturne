/* Render geometry only. Collision radii remain in game.js. */
(function(root){
 const api={
  radius(mass){return 5*Math.sqrt(Math.max(0,mass));},
  creatureScale(radius,id){return radius/(id==='wisp'?.65:1.7);},
  overlaps(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;},
  edgePoint(dx,dy,width,height){
   const angle=Math.atan2(dy,dx);
   if(height<480)return {x:dx<0?24:width-24,y:Math.max(160,Math.min(height-140,height/2+dy/Math.max(1,Math.abs(dx))*(width/2-24))),angle};
   const f=Math.min((width/2-24)/Math.max(.001,Math.abs(dx)),(height/2-24)/Math.max(.001,Math.abs(dy)));
   return {x:Math.max(24,Math.min(width-24,width/2+dx*f)),y:Math.max(200,Math.min(height-155,height/2+dy*f)),angle};
  },
  place(label,occupied,width,height){
   const x=Math.max(4,Math.min(width-label.w-4,label.x-label.w/2));
   for(let i=0;i<4;i++){
    const y=label.y-i*(label.h+3),box={x,y,w:label.w,h:label.h};
    if(y>=4&&y+label.h<=height-4&&!occupied.some(b=>api.overlaps(box,b)))return box;
   }
   return null; // Crowded secondary labels yield to the nearest threats.
  }
 };
 if(typeof module==='object')module.exports=api;else root.LueurRender=api;
})(typeof window==='object'?window:globalThis);
