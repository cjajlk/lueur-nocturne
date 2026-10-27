/* Annual calendar only. Europe/Paris civil dates; no storage, gameplay time or rewards. */
(function(root){
 'use strict';
 const registry=Object.freeze([Object.freeze({
  id:'christmas',name:'Noël des Lueurs',recurrence:'annual',timeZone:'Europe/Paris',
  start:Object.freeze({month:12,day:1}),endInclusive:Object.freeze({month:12,day:31}),arena:'christmas',
  futureRewards:Object.freeze({enabled:false,fragmentId:'christmas-fragment',mascotId:'christmas-mascot'})
 })]);
 function createManager({now=()=>Date.now(),schedule=(fn,delay)=>setTimeout(fn,delay),cancel=id=>clearTimeout(id)}={}){
  const format=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'});
  const listeners=new Set();let timer=null,started=false,signature='';
  function snapshot(){
   const instant=Number(now());if(!Number.isFinite(instant))return registry.map(event=>({...event,active:false,editionId:null}));
   const parts=Object.fromEntries(format.formatToParts(new Date(instant)).map(p=>[p.type,p.value]));
   const year=Number(parts.year),day=Number(parts.month)*100+Number(parts.day);
   return registry.map(event=>{const first=event.start.month*100+event.start.day,last=event.endInclusive.month*100+event.endInclusive.day;
    const active=first<=last?day>=first&&day<=last:day>=first||day<=last;
    const editionYear=first>last&&day<=last?year-1:year;
    return {...event,active,editionId:`${event.id}-${editionYear}`};
   });
  }
  function refresh(){const state=snapshot(),next=state.map(e=>`${e.editionId}:${e.active}`).join('|');if(next!==signature){signature=next;for(const listener of listeners)listener(state);}return state;}
  // Paris midnight is also a UTC minute boundary, including DST. Background-throttled
  // timers are backed by fresh date checks on resume and every destination resolution.
  function arm(){if(timer!==null)cancel(timer);if(!started)return;const stamp=Number(now());const delay=Number.isFinite(stamp)?60000-((stamp%60000+60000)%60000):60000;timer=schedule(()=>{timer=null;refresh();arm();},delay);}
  const api={registry,snapshot,refresh,forArena:id=>snapshot().find(event=>event.arena===id)||null,
   subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
   start(){if(started)return;started=true;refresh();arm();},stop(){started=false;if(timer!==null)cancel(timer);timer=null;},
   resume(){refresh();arm();}
  };return Object.freeze(api);
 }
 const api={registry,createManager};
 if(typeof module==='object')module.exports=api;
 if(typeof window==='object'){
  root.LueurEvents=createManager();
  for(const name of ['focus','pageshow'])root.addEventListener(name,()=>root.LueurEvents.resume());
  root.document.addEventListener('visibilitychange',()=>{if(!root.document.hidden)root.LueurEvents.resume();});
 }
})(typeof window==='object'?window:globalThis);
