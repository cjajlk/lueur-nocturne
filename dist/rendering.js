/* Render geometry only. Collision radii remain in game.js. */
(function(root){
 const api={
  radius(mass,player=false){return (player?18:15)+Math.sqrt(mass)*(player?1.7:1.5);},
  creatureScale(radius,id){return radius/(id==='wisp'?.65:1.7);},
  overlaps(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;},
  place(label,occupied,width,height){
   const x=Math.max(4,Math.min(width-label.w-4,label.x-label.w/2));
   for(let i=0;i<16;i++){
    const y=label.y-i*(label.h+3),box={x,y,w:label.w,h:label.h};
    if(y>=4&&y+label.h<=height-4&&!occupied.some(b=>api.overlaps(box,b)))return box;
   }
   return null; // Crowded secondary labels yield to the nearest threats.
  }
 };
 if(typeof module==='object')module.exports=api;else root.LueurRender=api;
})(typeof window==='object'?window:globalThis);
