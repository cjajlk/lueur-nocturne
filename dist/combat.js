/* Pure local combat rules, reusable without DOM or storage. */
(function(root){
 const api={
  shieldSeconds:3,
  shielded(entity){return (entity.spawnShield||0)>0;},
  protect(entity){entity.spawnShield=3;return entity;},
  tick(entity,dt){entity.spawnShield=Math.max(0,(entity.spawnShield||0)-dt);entity.feedCooldown=Math.max(0,(entity.feedCooldown||0)-dt);},
  attack(entity){const was=api.shielded(entity);entity.spawnShield=0;return !was;},
  // Existing player rule: prey <= 90% of predator light. Guardians remain inedible.
  weaker(predator,prey){return prey.kind!=='sentinel'&&prey.mass<=predator.mass*.9;},
  canAbsorb(predator,prey){return !predator.dead&&!prey.dead&&!api.shielded(predator)&&!api.shielded(prey)&&!(predator.feedCooldown>0)&&api.weaker(predator,prey);},
  gain(prey){return Math.min(12,prey.mass*.22);},
  contact(a,b,radius){return Math.hypot(a.x-b.x,a.y-b.y)<(radius(a.mass)+radius(b.mass))*.7;},
  target(bot,bots,range=320){let threat=null,prey=null,td=range,pd=range;
   for(const other of bots){if(other===bot||other.dead)continue;const d=Math.hypot(bot.x-other.x,bot.y-other.y);
    if(!api.shielded(other)&&(other.kind==='sentinel'||api.weaker(other,bot))&&d<td){threat=other;td=d;}
    else if(api.canAbsorb(bot,other)&&d<pd){prey=other;pd=d;}
   }return {threat,prey};
  }
 };
 root.LueurCombat=api;if(typeof module==='object')module.exports=api;
})(typeof window==='object'?window:globalThis);
