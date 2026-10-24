/* Bounded perception and steering. No growth, damage, storage or currency here. */
(function(root){
 const api={
  heading(e,world,dt,food,C,B){
   const p=world.player,guardian=e.kind==='sentinel',profile=e.behavior||(e.kind==='hunter'?'hunter':'balanced');
   const radius=C.radius(e.mass),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
   const range=guardian?420:profile==='hunter'?360+world.lit*35:profile==='prudent'?210:280;
   e.rest=Math.max(0,(e.rest||0)-dt);
   const safePlayer=p.invincible>0||distance(p,{x:1100,y:1100})<180;
   let threat=null,prey=null,best=range;
   for(const other of world.enemies){
    if(other===e||other.dead||B.shielded(other))continue;
    const d=distance(e,other);
    if(!guardian&&(other.kind==='sentinel'||B.weaker(other,e))&&d<250&&(!threat||d<distance(e,threat)))threat=other;
    if(profile!=='prudent'&&B.canAbsorb(e,other)&&d<best){prey=other;best=d;}
   }
   if(!safePlayer&&distance(e,p)<range){
    if(!guardian&&B.weaker(p,e)&&distance(e,p)<230)threat=p;
    else if((guardian||B.weaker(e,p))&&profile!=='prudent'&&distance(e,p)<best)prey=p;
   }
   // Lose a target outside perception; never track an unseen player's new position.
   if(e.target&&(e.target.dead||distance(e,e.target)>range||e.target===p&&safePlayer||B.shielded(e.target)||(!guardian&&!B.weaker(e,e.target)))){e.target=null;e.rest=2;}
   if(threat||B.shielded(e)){e.target=null;}
   else if(!e.target&&e.rest===0&&prey){e.target=prey;e.chase=0;}
   if(e.target){e.chase+=dt;if(e.chase>(guardian?8:profile==='hunter'?7:4)){e.target=null;e.rest=3;}}
   let angle=e.angle,mode='patrol';
   if(distance(e,{x:1100,y:1100})<180){angle=Math.atan2(e.y-1100,e.x-1100);mode='return';}
   else if(threat){angle=Math.atan2(e.y-threat.y,e.x-threat.x);mode='flee';}
   else if(e.target){angle=Math.atan2(e.target.y-e.y,e.target.x-e.x);mode='chase';}
   else if(!guardian&&food!==null){angle=food;mode='forage';}
   else{
    e.patrolTime=(e.patrolTime||0)-dt;
    if(!e.patrol||distance(e,e.patrol)<65||e.patrolTime<=0){
     // Existing arena, broad patrol routes; no knowledge of distant player position.
     e.patrol={x:350+Math.random()*1500,y:350+Math.random()*1500};e.patrolTime=14;
    }
    angle=Math.atan2(e.patrol.y-e.y,e.patrol.x-e.x);
   }
   e.mode=mode;
   let vx=Math.cos(angle),vy=Math.sin(angle);
   const repel=(x,y,clearance,strength,side=1)=>{let dx=e.x-x,dy=e.y-y,d=Math.hypot(dx,dy);if(d<clearance){if(d<.01){dx=side;dy=0;d=1;}const f=(1-d/clearance)*strength;vx+=dx/d*f;vy+=dy/d*f;}};
   if(guardian){
    for(const other of world.enemies)if(other!==e&&!other.dead&&other.kind==='sentinel')repel(other.x,other.y,radius+C.radius(other.mass)+35,4,world.enemies.indexOf(e)<world.enemies.indexOf(other)?-1:1);
   }
   for(const rock of world.rocks||[])repel(rock.x,rock.y,radius+(rock.bound||rock.r)+35,3);
   const lo=55+Math.min(1040,radius),hi=2145-Math.min(1040,radius),margin=75;
   if(e.x<lo+margin)vx+=3*(1-(e.x-lo)/margin);
   if(e.x>hi-margin)vx-=3*(1-(hi-e.x)/margin);
   if(e.y<lo+margin)vy+=3*(1-(e.y-lo)/margin);
   if(e.y>hi-margin)vy-=3*(1-(hi-e.y)/margin);
   e.checkTime=(e.checkTime||0)+dt;
   if(e.checkTime>=1.5){
    if(e.checkPos&&distance(e,e.checkPos)<8&&!e.stun&&!e.windup){e.escape=1.5;e.escapeAngle=Math.atan2(1100-e.y,1100-e.x)+.6;e.target=null;e.patrol=null;e.rest=2;}
    e.checkPos={x:e.x,y:e.y};e.checkTime=0;
   }
   if(e.escape>0){e.escape-=dt;return e.escapeAngle;}
   return Math.atan2(vy,vx);
  }
 };
 root.LueurAI=api;if(typeof module==='object')module.exports=api;
})(typeof window==='object'?window:globalThis);
