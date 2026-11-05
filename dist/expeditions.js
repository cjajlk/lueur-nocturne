/* Expedition-only state. No storage, currencies, calendar or shared simulation RNG. */
(function(root){'use strict';
 const config=Object.freeze({delay:60,speed:1.12,patrol:1.6,rainWaves:6,rainPerWave:20,rainInterval:7.5});
 const catalog=Object.freeze([
  Object.freeze({id:'classic',name:'Expédition classique',description:'La nuit suit son cours.',duration:0,weight:1,color:'#b8ccdb',icon:'☾'}),
  Object.freeze({id:'rain',name:'Pluie de lueurs',description:'Des lueurs dorées parsèment les chemins.',duration:45,weight:1,color:'#f4d889',icon:'✦'}),
  Object.freeze({id:'mist',name:'Brume mystérieuse',description:'Un voile mauve glisse sur le décor.',duration:45,weight:1,color:'#d3bdf7',icon:'≋'}),
  Object.freeze({id:'guardians',name:'Éveil des gardiens',description:'Les gardiens renouvellent leurs patrouilles.',duration:45,weight:1,color:'#ffc691',icon:'⬡'}),
  Object.freeze({id:'current',name:'Courant astral',description:'Tous les déplacements accélèrent de 12 %.',duration:30,weight:1,color:'#9ae8ff',icon:'↗'})
 ]);
 function random(seed){let value=seed>>>0;return()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};}
 function select(value){let n=Math.max(0,Math.min(.999999999,value))*catalog.reduce((sum,e)=>sum+e.weight,0);return catalog.find(e=>(n-=e.weight)<0)||catalog[0];}
 function create(seed){if(seed===undefined){const values=new Uint32Array(1);if(root.crypto?.getRandomValues)root.crypto.getRandomValues(values);else values[0]=Date.now();seed=values[0];}const rng=random(seed);return{id:select(rng()).id,seed,clock:0,elapsed:0,phase:'waiting',waves:0};}
 const item=event=>catalog.find(e=>e.id===event?.id)||catalog[0];
 const active=(event,id)=>event?.phase==='active'&&event.id===id;
 function advance(event,dt){if(!event||!Number.isFinite(dt)||dt<=0||event.id==='classic'||event.phase==='done')return null;
  event.clock+=dt;const duration=item(event).duration;event.elapsed=Math.max(0,event.clock-config.delay);
  if(event.phase==='waiting'&&event.clock>=config.delay){event.phase='active';return 'start';}
  if(event.phase==='active'&&event.elapsed+1e-8>=duration){event.elapsed=duration;event.phase='done';return 'end';}return null;
 }
 function rain(event,clear){const result=[];if(!active(event,'rain'))return result;const due=Math.min(config.rainWaves,1+Math.floor(event.elapsed/config.rainInterval));
  while(event.waves<due){const wave=event.waves++,rng=random(event.seed+wave*977+71);
   for(let i=0;i<config.rainPerWave;i++){const zone=i%4,cx=zone%2?1600:600,cy=zone<2?600:1600;
    for(let attempt=0;attempt<12;attempt++){const x=cx+(rng()-.5)*620,y=cy+(rng()-.5)*620;if(!clear(x,y))continue;result.push({x,y,r:3.4,phase:rng()*Math.PI*2,expeditionMote:true});break;}
   }
  }return result;
 }
 const strength=event=>event?.phase==='active'?Math.max(0,Math.min(1,event.elapsed/4,(item(event).duration-event.elapsed)/4)):0;
 root.LueurExpeditions={config,catalog,random,select,create,item,active,advance,rain,strength,speed:event=>active(event,'current')?config.speed:1};
 if(typeof module==='object')module.exports=root.LueurExpeditions;
})(typeof window==='object'?window:globalThis);
