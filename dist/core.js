(function(root){
 'use strict';
 const characters={nyx:{name:'Nyx',title:'Esprit lunaire',power:'Impulsion',icon:'↗',speed:180,cooldown:7,cost:4,description:'Un élan vif pour échapper aux ombres. Équilibré et agile.',condition:'Disponible dès le départ'},mira:{name:'Mira',title:'Aile des constellations',power:'Attraction',icon:'✧',speed:180,cooldown:10,cost:5,description:'Attire les lueurs pendant 4 secondes. Perd plus de lumière en cas de capture.',condition:'Rallumer 12 sanctuaires'},orion:{name:'Orion',title:'Gardien de cristal',power:'Bouclier',icon:'⬡',speed:180,cooldown:12,cost:5,description:'Un bouclier de 4 secondes protège des ombres. Résiste aux ombres sans ralentir.',condition:'Remporter 3 expéditions'},umbra:{name:'Umbra',title:'Enfant de l’éclipse',power:'Traversée',icon:'☽',speed:180,cooldown:11,cost:7,description:'Traverse les ombres pendant 3 secondes. Son pouvoir consomme davantage.',condition:'Gagner sans aucune capture'}};
 const mascots={niva:{cost:40,base:'nyx'},solstice:{cost:80,base:'umbra'}};
 characters.niva={...characters.nyx,base:'nyx',name:'Niva',title:'Esprit du givre',description:'L’Impulsion de Nyx : même élan, même coût et même recharge.',condition:'Noël 2026 · 40 Fragments de Noël'};
 characters.solstice={...characters.umbra,base:'umbra',name:'Solstice',title:'Esprit du solstice',description:'La Traversée d’Umbra : même protection, même coût et même recharge.',condition:'Noël 2026 · 80 Fragments de Noël'};
 const powerBase=id=>characters[id]?.base||id;

 // Cosmetics v2: per-character equipment is authoritative; skin remains a renderer mirror.
 const cosmeticSlots=['trail','aura','absorption','shield','appearance'];
 const identifiers=value=>[...new Set(Array.isArray(value)?value.filter(x=>typeof x==='string'&&x.length>0&&x.length<=160):[])];
 function normalizeCosmetics(raw,owned,skin,selected){
  const source=raw&&typeof raw==='object'?raw:{},first=!source.version;
  const items=identifiers([...(Array.isArray(source.owned)?source.owned:[]),...owned.map(id=>'trail:'+id)]),equipped={};
  for(const id of Object.keys(characters)){const previous=source.equipped?.[id]||{};equipped[id]=Object.fromEntries(cosmeticSlots.map(slot=>[slot,items.includes(previous[slot])?previous[slot]:null]));if(first)equipped[id].trail='trail:'+skin;}
  // Import the last visible legacy trail once; preserve explicit removal thereafter.
  if(source.version!==2&&equipped[selected])equipped[selected].trail='trail:'+skin;
  return {version:2,owned:items,equipped,transactionIds:identifiers(source.transactionIds)};
 }
 function normalizeRecurring(raw){
  const source=raw&&typeof raw==='object'?raw:{},periods={};
  for(const kind of ['daily','weekly','monthly']){const p=source.periods?.[kind];periods[kind]=p&&typeof p.id==='string'?{id:p.id,objectives:(Array.isArray(p.objectives)?p.objectives:[]).filter(o=>o&&typeof o.id==='string'&&typeof o.metric==='string').map(o=>({id:o.id,metric:o.metric,target:natural(o.target),progress:natural(o.progress)}))}:null;}
  return {version:1,periods,rewardIds:identifiers(source.rewardIds)};
 }
 function serializeProfile(profile){const copy={...profile,cosmetics:normalizeCosmetics(profile.cosmetics,profile.owned,profile.skin,profile.selected),recurringChallenges:normalizeRecurring(profile.recurringChallenges),cj:profile.shards};copy.skin=equippedTrail(copy)||'aurore';return JSON.stringify(copy);}
 // Future callers supply an expected storage snapshot and publish the returned
 // profile only after success. No purchase/reward is triggered by this helper.
 function commitTransaction(profile,draft,transaction,storage,expectedRaw){
  const {id,kind,delta}=transaction||{};if(typeof id!=='string'||!id||id.length>160||!['purchase','reward'].includes(kind)||!Number.isSafeInteger(delta)||(kind==='purchase'?delta>=0:delta<=0))return {ok:false,reason:'invalid'};
  const field=kind==='purchase'?'cosmetics':'recurringChallenges',ledger=kind==='purchase'?'transactionIds':'rewardIds';
  if(profile[field]?.[ledger]?.includes(id))return {ok:false,reason:'duplicate'};
  if(!Number.isSafeInteger(profile.shards)||!Number.isSafeInteger(draft.shards)||draft.shards<0||draft.shards-profile.shards!==delta)return {ok:false,reason:'balance'};
  try{if(typeof expectedRaw!=='string'&&expectedRaw!==null)return {ok:false,reason:'snapshot'};if(storage.getItem('lueur-nocturne-v1')!==expectedRaw)return {ok:false,reason:'conflict'};
   const stored=expectedRaw===null?null:JSON.parse(expectedRaw);if(stored?.[field]?.[ledger]?.includes(id))return {ok:false,reason:'duplicate'};const next=JSON.parse(serializeProfile(draft));next[field][ledger]=identifiers([...(stored?.[field]?.[ledger]||[]),...(profile[field]?.[ledger]||[]),...next[field][ledger],id]);
   storage.setItem('lueur-nocturne-v1',JSON.stringify(next));return {ok:true,profile:next};
  }catch{return {ok:false,reason:'storage'};}
 }
 const fresh=()=>({version:1,cosmetics:normalizeCosmetics(null,['aurore'],'aurore','nyx'),recurringChallenges:normalizeRecurring(null),events:{},shards:0,activeSeconds:0,selected:'nyx',skin:'aurore',owned:['aurore'],stats:{runs:0,wins:0,shrines:0,collected:0,absorbed:0,powers:0,flawless:0,fast:0,close:0,miraWins:0,bestSurvival:0,bestLight:0},sound:false});
 function normalize(raw){const p=fresh();if(!raw||typeof raw!=='object')return p;for(const k of Object.keys(p.stats)){const v=Number(raw.stats?.[k]);p.stats[k]=Number.isFinite(v)?Math.max(0,Math.floor(v)):0;}const legacyBalance=Number.isFinite(raw.shards)?raw.shards:raw.cj;p.shards=Number.isFinite(legacyBalance)?Math.max(0,Math.floor(legacyBalance)):0;p.activeSeconds=Number.isFinite(raw.activeSeconds)?Math.max(0,raw.activeSeconds)%600:0;p.owned=['aurore',...['or','rose','givre'].filter(x=>raw.owned?.includes(x))];p.skin=p.owned.includes(raw.skin)?raw.skin:'aurore';p.selected=characters[raw.selected]?raw.selected:'nyx';p.sound=raw.sound===true;p.events=normalizeEvents(raw.events);if(!unlocked(p,p.selected))p.selected='nyx';p.cosmetics=normalizeCosmetics(raw.cosmetics,p.owned,p.skin,p.selected);p.recurringChallenges=normalizeRecurring(raw.recurringChallenges);p.skin=equippedTrail(p)||'aurore';return p;}

 // A compact issue ledger: only outstanding IDs can be collected. Claimed or expired
 // IDs are removed, and the monotonic issued counter prevents reuse after reload.
 const natural=n=>Number.isSafeInteger(n)&&n>=0?n:0;
 function normalizeEvents(raw){const result={};if(!raw||typeof raw!=='object')return result;for(const [key,value] of Object.entries(raw)){if(!/^christmas[0-9]{4}$/.test(key)||!value||typeof value!=='object')continue;const issued=natural(value.issued);result[key]={fragments:natural(value.fragments),collected:natural(value.collected),issued,mascots:[...new Set(Array.isArray(value.mascots)?value.mascots:[])].filter(id=>Object.hasOwn(mascots,id)),transactions:(Array.isArray(value.transactions)?value.transactions:[]).filter(t=>t&&Object.hasOwn(mascots,t.id)&&t.cost===mascots[t.id].cost&&t.editionId===key.replace('christmas','christmas-')).filter((t,i,a)=>a.findIndex(x=>x.id===t.id)===i).map(t=>({id:t.id,cost:t.cost,editionId:t.editionId})),pendingIds:[...new Set(Array.isArray(value.pendingIds)?value.pendingIds:[])].filter(id=>Number.isSafeInteger(id)&&id>0&&id<=issued).slice(0,2)};}return result;}
 function fragmentKey(event){return event?.active&&/^christmas-[0-9]{4}$/.test(event.editionId)?event.editionId.replace('-',''):null;}
 function fragmentAccount(p,event){const key=fragmentKey(event);if(!key)return null;return p.events[key]||(p.events[key]={fragments:0,collected:0,issued:0,mascots:[],transactions:[],pendingIds:[]});}
 function issueFragment(p,event){const a=fragmentAccount(p,event);if(!a||a.pendingIds.length>=2||a.issued>=Number.MAX_SAFE_INTEGER)return null;const id=++a.issued;a.pendingIds.push(id);return {editionId:event.editionId,id};}
 function collectFragment(p,event,fragment){if(!fragment||fragment.editionId!==event?.editionId)return false;const key=fragmentKey(event),a=key&&p.events[key];if(!a||a.fragments>=Number.MAX_SAFE_INTEGER||a.collected>=Number.MAX_SAFE_INTEGER)return false;const i=a.pendingIds.indexOf(fragment.id);if(i<0)return false;a.pendingIds.splice(i,1);a.fragments++;a.collected++;return true;}
 function retireFragment(p,fragment){const a=p.events[fragment.editionId.replace('-','')];if(a)a.pendingIds=a.pendingIds.filter(id=>id!==fragment.id);}
 function unlocked(p,id){return (Object.hasOwn(mascots,id)&&p.events?.christmas2026?.mascots?.includes(id))||id==='nyx'||id==='mira'&&p.stats.shrines>=12||id==='orion'&&p.stats.wins>=3||id==='umbra'&&p.stats.flawless>=1;}
 function purchaseMascot(p,id,event){const offer=Object.hasOwn(mascots,id)&&mascots[id];if(!offer||!event?.active||event.editionId!=='christmas-2026'||unlocked(p,id))return false;const a=p.events?.christmas2026;if(!a||!Number.isSafeInteger(a.fragments)||a.fragments<offer.cost)return false;a.mascots??=[];a.transactions??=[];if(a.transactions.some(t=>t.id===id))return false;a.fragments-=offer.cost;a.mascots.push(id);a.transactions.push({id,cost:offer.cost,editionId:event.editionId});return true;}
 // Independent game currency. The legacy cj field is read only for save compatibility.
 function creditTime(p,seconds){p.activeSeconds+=Math.max(0,seconds);const n=Math.floor(p.activeSeconds/600);p.activeSeconds-=n*600;p.shards+=n;return n;}
 const challenges=[['Premier éclat','Récolter 100 lueurs','collected',100],['Passeuse de lumière','Rallumer 3 sanctuaires','shrines',3],['Un ciel nouveau','Réussir une expédition','wins',1],['Mira s’éveille','Rallumer 12 sanctuaires','shrines',12],['Le gardien répond','Réussir 3 expéditions','wins',3],['Sans une égratignure','Gagner sans capture · débloque Umbra','flawless',1],['Retour des constellations','Réussir une expédition en moins de 12 minutes','fast',1],['Dernière étincelle','Gagner avec une seule vie','close',1],['Danse des ombres','Absorber 20 petites ombres','absorbed',20],['Sous les ailes de Mira','Gagner une expédition avec Mira','miraWins',1]];
 const skins={aurore:{name:'Aurore',color:'#7de6ff',price:0,description:'Le souffle bleu des premières nuits.'},or:{name:'Poussière d’or',color:'#ffd987',price:2,description:'Une traînée de petites étoiles dorées.'},rose:{name:'Brume astrale',color:'#eda5e9',price:3,description:'Une lumière rose venue des nébuleuses.'},givre:{name:'Givre lunaire',color:'#c2fff0',price:3,description:'Des éclats givrés au sillage de ta créature.'}};
 function purchase(p,id){const item=skins[id];if(!item||p.owned.includes(id)||p.shards<item.price)return false;p.shards-=item.price;p.owned.push(id);p.cosmetics.owned.push('trail:'+id);equipCosmetic(p,'trail','trail:'+id);return true;}
 // Only existing trail items are currently supported; future slots remain preserved.
 function equippedTrail(p,id=p.selected){const item=p.cosmetics?.equipped?.[id]?.trail;const trail=typeof item==='string'&&item.startsWith('trail:')?item.slice(6):null;return trail&&Object.hasOwn(skins,trail)&&p.owned.includes(trail)&&p.cosmetics.owned.includes(item)?trail:null;}
 function equipCosmetic(p,slot,item){if(!cosmeticSlots.includes(slot)||!unlocked(p,p.selected))return false;if(item!==null&&(slot!=='trail'||typeof item!=='string'||!item.startsWith('trail:')||!Object.hasOwn(skins,item.slice(6))||!p.owned.includes(item.slice(6))||!p.cosmetics.owned.includes(item)))return false;p.cosmetics.equipped[p.selected][slot]=item;p.skin=equippedTrail(p)||'aurore';return true;}
 function resetCosmetics(p){if(!unlocked(p,p.selected))return false;for(const slot of cosmeticSlots)p.cosmetics.equipped[p.selected][slot]=null;p.skin='aurore';return true;}
 function selectCharacter(p,id){if(!Object.hasOwn(characters,id)||!unlocked(p,id))return false;p.selected=id;p.skin=equippedTrail(p)||'aurore';return true;}
 const balance={maxLight:Infinity,offeringDuration:4,explorationSeconds:[120,160,200]};
 function offeringCost(lit){return [80,160,240][Math.min(2,Math.max(0,lit))];}
 function lightGain(mass,amount){return Math.min(balance.maxLight,mass+amount/(1+Math.max(0,mass-160)/200));}
 // Shared physical/render radius: area tracks light, with no fixed base masking early growth.
 function radius(mass){return 5*Math.sqrt(Math.max(0,mass));}
 function route(stage){const paths=[[[400,420],[1790,450],[1700,1800]],[[420,1750],[1750,1800],[1700,400]],[[1800,500],[450,450],[430,1770]]];return (paths[stage]||[]).map(([x,y])=>({x,y,visited:false}));}
 function stageReady(run){return run.lit<3&&run.exploration>=balance.explorationSeconds[run.lit]&&run.route.every(p=>p.visited);}
 const api={cosmeticSlots,equippedTrail,equipCosmetic,resetCosmetics,selectCharacter,serializeProfile,commitTransaction,mascots,powerBase,purchaseMascot,fragmentKey,fragmentAccount,issueFragment,collectFragment,retireFragment,route,stageReady,radius,characters,fresh,normalize,unlocked,creditTime,challenges,skins,purchase,balance,offeringCost,lightGain};root.LueurCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
