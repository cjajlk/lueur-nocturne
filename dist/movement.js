/* Shared world-space movement, independent of controls and creature category. */
(function(root){
 const speed=180;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function penetration(x,y,r,points){
  let inside=false,best=Infinity,nx=0,ny=0;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
   const a=points[j],b=points[i],vx=b[0]-a[0],vy=b[1]-a[1];
   if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
   const t=clamp(((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy||1),0,1),px=a[0]+t*vx,py=a[1]+t*vy,d=Math.hypot(x-px,y-py);
   if(d<best){best=d;nx=x-px;ny=y-py;if(d<1e-8){nx=vy;ny=-vx;}}
  }
  if(!inside&&best>=r-.001)return null;
  const len=Math.hypot(nx,ny)||1,sign=inside?-1:1;
  return {x:nx/len*sign,y:ny/len*sign,depth:inside?r+best:r-best};
 }
 const api={speed,penetration,
  prepare(rock){
   const c=Math.cos(rock.a),s=Math.sin(rock.a),r=rock.r;
   rock.shapes=[rock.facets,[[r*.25,r*.6],[r*.85,-r*.45],[r*.9,r*.55]]].map(points=>points.map(([x,y])=>[rock.x+x*c-y*s,rock.y+x*s+y*c]));
   rock.bound=Math.max(...rock.shapes.flat().map(([x,y])=>Math.hypot(x-rock.x,y-rock.y)));return rock;
  },
  hits(x,y,r,rocks){
   for(const rock of rocks){if(Math.hypot(x-rock.x,y-rock.y)>r+rock.bound)continue;
    for(const shape of rock.shapes){const hit=penetration(x,y,r,shape);if(hit)return hit;}
   }return null;
  },
  move(entity,dx,dy,dt,multiplier,radius,rocks=[]){
   const r=Math.min(1040,radius),lo=55+r,hi=2145-r,len=Math.hypot(dx,dy);
   if(len>1){dx/=len;dy/=len;}
   // Resolve a body enlarged by collection before moving, using its new radius.
   entity.x=clamp(entity.x,lo,hi);entity.y=clamp(entity.y,lo,hi);
   for(let i=0;i<12;i++){const hit=api.hits(entity.x,entity.y,r,rocks);if(!hit)break;entity.x=clamp(entity.x+hit.x*(hit.depth+.01),lo,hi);entity.y=clamp(entity.y+hit.y*(hit.depth+.01),lo,hi);}
   const distance=speed*Math.max(0,multiplier)*Math.max(0,dt),steps=Math.max(1,Math.ceil(distance/4)),sx=dx*distance/steps,sy=dy*distance/steps;
   for(let i=0;i<steps;i++){
    const x=clamp(entity.x+sx,lo,hi),y=clamp(entity.y+sy,lo,hi);
    if(!api.hits(x,y,r,rocks)){entity.x=x;entity.y=y;}
    else if(!api.hits(x,entity.y,r,rocks))entity.x=x;
    else if(!api.hits(entity.x,y,r,rocks))entity.y=y;
   }
  }
 };
 root.LueurMovement=api;if(typeof module==='object')module.exports=api;
})(typeof window==='object'?window:globalThis);
