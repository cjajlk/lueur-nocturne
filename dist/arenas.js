/* Visual themes only. Private deterministic randomness never affects gameplay. */
(function(root){
 const TAU=Math.PI*2,names={night:'Ciel nocturne',forest:'Forêt des Lueurs',christmas:'Noël des Lueurs'};
 function create(){
  let seed=80421;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const trees=[],plants=[];
  for(let i=0;i<64;i++){
   const a=i/64*TAU,r=i%3===0?370+random()*280:850+random()*330;
   const x=1100+Math.cos(a)*r,y=1100+Math.sin(a)*r,size=55+random()*60;
   trees.push({x,y,size,lean:random()*.4-.2,hue:i%2});
  }
  for(let i=0;i<110;i++)plants.push({x:100+random()*2000,y:100+random()*2000,size:3+random()*5,phase:random()*TAU,kind:i%3});
  return {trees,plants};
 }
 const ellipse=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
 function destination(id){
  if(!Object.hasOwn(names,id))return {arena:'night',editionId:null};
  const event=root.LueurEvents?.forArena(id);
  if((id==='christmas'&&!event?.active)||(event&&!event.active))return {arena:'night',editionId:null};
  return {arena:id,editionId:event?.editionId||null};
 }
 const api={names,create,destination,valid:id=>destination(id).arena,
  christmasFloor(c,scene,view,time,objectives){
   const visible=(x,y,pad=150)=>x>view.x-pad&&x<view.x+view.w+pad&&y>view.y-pad&&y<view.y+view.h+pad;
   c.save();c.fillStyle='#102637';c.fillRect(view.x,view.y,view.w,view.h);
   for(const p of scene.plants){if(!visible(p.x,p.y,15)||objectives.some(o=>Math.hypot(o.x-p.x,o.y-p.y)<115))continue;ellipse(c,p.x,p.y,p.size*2,p.size*.7,'#b3d6e515');}
   for(const tree of scene.trees){
    if(!visible(tree.x,tree.y,220)||objectives.some(o=>Math.hypot(o.x-tree.x,o.y-tree.y)<210))continue;
    const {x,y,size:s}=tree;c.save();c.translate(x,y);ellipse(c,0,8,s*.65,s*.18,'#04101e88');
    c.fillStyle='#56717b';c.fillRect(-s*.05,-s*.25,s*.1,s*.35);
    for(let tier=0;tier<3;tier++){
     const top=-s*(1.8-tier*.38),wide=s*(.35+tier*.15),bottom=top+s*.8;
     c.fillStyle=tier%2?'#1d4957':'#245362';c.beginPath();c.moveTo(0,top);c.lineTo(-wide,bottom);c.lineTo(wide,bottom);c.closePath();c.fill();
     c.strokeStyle='#beddebb0';c.lineWidth=3;c.beginPath();c.moveTo(-wide*.75,bottom-5);c.lineTo(0,bottom-11);c.lineTo(wide*.75,bottom-5);c.stroke();
     for(let i=-1;i<=1;i++)ellipse(c,i*wide*.48,bottom-s*.17,2.2,2.2,tree.hue?'#d4b4ed':'#9ee3ec');
    }
    c.fillStyle='#e1cba5';c.beginPath();c.moveTo(0,-s*1.88);c.lineTo(4,-s*1.8);c.lineTo(0,-s*1.72);c.lineTo(-4,-s*1.8);c.closePath();c.fill();c.restore();
   }
   // Decorative snow only: no collision objects or random calls shared with gameplay.
   c.fillStyle='#d9ecf4';for(let i=0;i<28;i++){const p=scene.plants[i],x=p.x+Math.sin(time*.25+p.phase)*12,y=(p.y+time*8)%2200;if(!visible(x,y,5))continue;c.globalAlpha=.18+(i%3)*.06;c.beginPath();c.arc(x,y,1+(i%2)*.6,0,TAU);c.fill();}
   c.restore();
  },
  christmasCrystal(c,rock){
   c.save();c.translate(rock.x,rock.y);c.rotate(rock.a);c.strokeStyle='#b0e9f8b0';c.lineWidth=1.5;c.shadowColor='#78cce8';c.shadowBlur=4;
   c.beginPath();c.moveTo(...rock.facets[0]);for(const p of rock.facets.slice(1))c.lineTo(...p);c.closePath();c.stroke();c.restore();
  },
  floor(c,scene,view,time,objectives){
   const visible=(x,y,pad=100)=>x>view.x-pad&&x<view.x+view.w+pad&&y>view.y-pad&&y<view.y+view.h+pad;
   c.save();c.fillStyle='#071b20';c.fillRect(view.x,view.y,view.w,view.h);
   for(const [x,y,r,color] of [[700,750,650,'#1e555633'],[1650,750,600,'#39356333'],[1150,1700,700,'#20504433']]){
    const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#071b2000');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);
   }
   // Background silhouettes never cover characters and keep clear of objectives.
   for(const tree of scene.trees){
    if(!visible(tree.x,tree.y,220)||objectives.some(o=>Math.hypot(o.x-tree.x,o.y-tree.y)<210))continue;
    const {x,y,size:s}=tree;c.save();c.translate(x,y);c.rotate(tree.lean);c.globalAlpha=.65;
    ellipse(c,0,10,s*.7,s*.21,'#041417');
    c.fillStyle='#0b2029';c.beginPath();c.moveTo(-s*.12,0);c.bezierCurveTo(-s*.06,-s*.65,-s*.14,-s,-s*.06,-s*1.5);c.lineTo(s*.08,-s*1.5);c.bezierCurveTo(s*.03,-s,s*.06,-s*.5,s*.18,0);c.closePath();c.fill();
    c.strokeStyle='#34607366';c.lineWidth=2;c.beginPath();c.moveTo(0,-4);c.lineTo(s*.02,-s*.95);c.moveTo(0,-s*.5);c.lineTo(-s*.42,-s*.9);c.moveTo(0,-s*.8);c.lineTo(s*.4,-s*1.2);c.stroke();
    for(let j=0;j<5;j++){const a=j/5*TAU;ellipse(c,Math.cos(a)*s*.35,-s*1.3+Math.sin(a)*s*.23,s*.46,s*.36,tree.hue?'#172637':'#102e32');}
    c.strokeStyle=tree.hue?'#64588a44':'#4b859044';c.lineWidth=1;c.beginPath();c.arc(-s*.15,-s*1.42,s*.46,3.8,5.4);c.stroke();c.restore();
   }
   for(const p of scene.plants){if(!visible(p.x,p.y,12)||objectives.some(o=>Math.hypot(o.x-p.x,o.y-p.y)<115))continue;
    c.globalAlpha=.42;
    if(p.kind===0){c.strokeStyle='#3c6661';c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x,p.y-p.size*2);c.stroke();c.fillStyle='#80b9bb';c.beginPath();c.ellipse(p.x,p.y-p.size*2,p.size,p.size*.5,0,Math.PI,TAU);c.fill();}
    else {c.strokeStyle=p.kind===1?'#427a71':'#5d5981';c.lineWidth=1.5;for(let j=-1;j<=1;j++){c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x+j*8,p.y-8,p.x+j*9,p.y-p.size*3);c.stroke();}}
   }
   // Thin, low-contrast mist and cyan fireflies differ from collectible gold motes.
   c.globalAlpha=.12;for(let i=0;i<4;i++){c.save();c.translate(400+i*480,500+i*350);c.scale(1,.15);const mist=c.createRadialGradient(0,0,0,0,0,240);mist.addColorStop(0,'#547b81');mist.addColorStop(1,'#547b8100');c.fillStyle=mist;c.fillRect(-240,-240,480,480);c.restore();}
   for(let i=0;i<scene.plants.length;i+=4){const p=scene.plants[i];if(!visible(p.x,p.y,15))continue;c.globalAlpha=.25+.1*Math.sin(time*.6+p.phase);ellipse(c,p.x+Math.sin(time*.3+p.phase)*5,p.y-25,1.5,1.5,'#91cbc5');}
   c.restore();
  },
  crystal(c,rock){
   // Tint only: silhouettes and solid polygons remain identical to the original arena.
   c.save();c.translate(rock.x,rock.y);c.rotate(rock.a);
   c.strokeStyle='#74bfa766';c.lineWidth=2;c.beginPath();c.moveTo(-rock.r*.35,rock.r*.25);c.quadraticCurveTo(rock.r*.12,rock.r*.15,rock.r*.15,-rock.r*.55);c.stroke();
   for(let i=0;i<3;i++)ellipse(c,-rock.r*.22+i*rock.r*.17,rock.r*.3-i*rock.r*.18,3,1.5,'#70a99a99');c.restore();
  }
 };
 root.LueurArenas=api;if(typeof module==='object')module.exports=api;
})(typeof window==='object'?window:globalThis);
