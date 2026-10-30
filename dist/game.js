/* Lueur Nocturne — standalone canvas game, no framework or account dependency. */
(()=>{'use strict';
const C=LueurCore,$=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),map=$('map').getContext('2d');
const atlas=new Image();atlas.src='assets/creatures.png';atlas.onload=()=>{if(currentPanel==='appearances')drawAppearancePreview();};
const mascotImages={};for(const id of ['niva','solstice']){const img=new Image();img.src='assets/christmas/'+id+'.webp';img.onerror=()=>{img.onerror=null;img.src='assets/christmas/'+(id==='niva'?'Niva':'Solstice')+'_Noel.png';};img.onload=()=>{if(currentPanel==='characters')showCharacters();if(currentPanel==='appearances')drawAppearancePreview();};mascotImages[id]=img;}
let profile;try{profile=C.normalize(JSON.parse(localStorage.getItem('lueur-nocturne-v1')));}catch{profile=C.fresh();}
function writeProfile(p){const raw=C.serializeProfile(p);if(window.LueurSession)window.LueurSession.write(raw);else localStorage.setItem('lueur-nocturne-v1',raw);}
const recurring=window.LueurRecurring;
function settleChallenges(){if(!recurring)return true;for(const award of recurring.pending(profile)){const next=JSON.parse(C.serializeProfile(profile));next.shards+=award.reward;const expected=window.LueurSession?window.LueurSession.snapshot():localStorage.getItem('lueur-nocturne-v1');const storage={getItem:key=>localStorage.getItem(key),setItem:(key,raw)=>{if(window.LueurSession)window.LueurSession.write(raw);else localStorage.setItem(key,raw);}};const result=C.commitTransaction(profile,next,{id:award.id,kind:'reward',delta:award.reward},storage,expected);if(!result.ok)return false;profile=result.profile;toast('Série terminée : +'+award.reward+' Éclat'+(award.reward>1?'s':'')+' nocturne'+(award.reward>1?'s':'')+' !');refreshHome();}return true;}
function checkChallenges(){if(!recurring)return true;if(!settleChallenges())return false;if(recurring.rollover(profile,Date.now()))save();return settleChallenges();}
function challengeAction(metric){if(!recurring)return;if(!checkChallenges())return;recurring.action(profile,metric,Date.now());settleChallenges();}
let storageWarned=false;function save(){try{writeProfile(profile);profile.cosmetics=C.normalize(profile).cosmetics;}catch{if(!storageWarned){toast('Sauvegarde indisponible : progression conservée pour cette session.');storageWarned=true;}}}
let W=innerWidth,H=innerHeight,dpr=1,t=0,last=performance.now(),state='home',run=null,paused=false,currentPanel='',toastTimer,saveClock=0;
const keys=new Set(),pointer={x:0,y:0,active:false},joy={x:0,y:0,id:null},worldSize=2200,TAU=Math.PI*2;
const rand=(a,b)=>a+Math.random()*(b-a),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const R=LueurRender,B=LueurCombat,M=LueurMovement;
const forestScene=LueurArenas.create();
// Refuge presentation only; start() snapshots the existing select value.
document.querySelectorAll('input[name="arena"]').forEach(input=>{
 input.checked=input.value===$('arena-choice').value;
 input.addEventListener('change',()=>{if(input.checked)$('arena-choice').value=input.value;});
});
for(const id of ['night','forest','christmas']){
 const preview=$('preview-'+id),p=preview.getContext('2d');p.save();p.scale(.4,.4);
 if(id==='forest')LueurArenas.floor(p,forestScene,{x:0,y:0,w:600,h:160},0,[]);
 else{p.fillStyle='#071625';p.fillRect(0,0,600,160);}
 if(id==='forest'){p.translate(-650,-1450);LueurArenas.floor(p,forestScene,{x:650,y:1450,w:600,h:160},0,[]);p.translate(650,1450);}
 if(id==='christmas'){p.translate(-650,-1450);LueurArenas.christmasFloor(p,forestScene,{x:650,y:1450,w:600,h:160},0,[]);p.translate(650,1450);}
 // Existing gold mote motif; no random calls or new image assets.
 for(let i=0;i<16;i++){p.fillStyle=i%3?'#a5c9e966':'#e8dd92';p.beginPath();p.arc((i*137+29)%600,(i*43+17)%160,i%3?1.5:3,0,Math.PI*2);p.fill();}p.restore();
}
let christmasEvent=null;
function refreshSeasonalDestinations(){
 christmasEvent=LueurEvents.forArena('christmas');refreshFragments();if(run&&!christmasEvent.active)run.fragments=[];
 const active=christmasEvent.active,select=$('arena-choice'),option=select.querySelector('[value="christmas"]'),card=document.querySelector('[data-event="christmas"]');
 card.hidden=!active;option.hidden=!active;option.disabled=!active;
 if(!active&&select.value==='christmas'){select.value='night';document.querySelectorAll('input[name="arena"]').forEach(input=>{input.checked=input.value==='night';});}
}
LueurEvents.subscribe(refreshSeasonalDestinations);LueurEvents.start();refreshSeasonalDestinations();
const camera={x:1100,y:1100,zoom:1};
function resetJoystick(){const id=joy.id;joy.id=null;joy.x=joy.y=0;const control=$('joystick');if(id!==null&&control.hasPointerCapture?.(id))control.releasePointerCapture(id);$('stick').style.transform='';}
function resize(){const oldW=W,oldH=H;const box=canvas.getBoundingClientRect();W=Math.max(1,Math.round(box.width));H=Math.max(1,Math.round(box.height));dpr=Math.min(devicePixelRatio||1,2);const pixelWidth=Math.round(W*dpr),pixelHeight=Math.round(H*dpr);if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;ctx.setTransform(dpr,0,0,dpr,0,0);}camera.zoom=Math.min(1.15,Math.max(.68,Math.min(W,H)/640));pointer.active=false;if(W!==oldW||H!==oldH)resetJoystick();}
addEventListener('resize',resize);addEventListener('orientationchange',resetJoystick);window.visualViewport?.addEventListener('resize',resize);if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(canvas);resize();
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3800);}
let audio=null,master=null;function initAudio(){if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=new AC();master=audio.createGain();master.gain.value=.045;master.connect(audio.destination);}if(audio.state==='suspended')audio.resume();}
function tone(freq=440,duration=.2){if(!profile.sound||!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.001,audio.currentTime);g.gain.exponentialRampToValueAtTime(.5,audio.currentTime+.02);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(master);o.start();o.stop(audio.currentTime+duration);}
function refreshHome(){refreshFragments();document.querySelectorAll('[data-wallet]').forEach(e=>e.textContent=profile.shards);$('selected-label').textContent=`${C.characters[profile.selected].name.toUpperCase()} · ${C.characters[profile.selected].title.toUpperCase()}`;$('creature-count').textContent=`${Object.keys(C.characters).filter(id=>C.unlocked(profile,id)).length} / ${Object.keys(C.characters).length} éveillées`;$('challenge-count').textContent=`${C.challenges.filter(c=>profile.stats[c[2]]>=c[3]).length} / 10 défis accomplis`;$('sound-label').textContent=profile.sound?'Activée':'Désactivée';$('sound').setAttribute('aria-pressed',String(profile.sound));}
function openModal(html,panel=''){currentPanel=panel;$('modal-body').innerHTML=html;if(!$('modal').open)$('modal').showModal();$('modal-body').scrollTop=0;$('modal').scrollTop=0;}
function closeModal(){if(currentPanel==='result'){home();return;}if(currentPanel==='pause'){checkChallenges();paused=false;pointer.active=false;}currentPanel='';$('modal').close();}
$('close-modal').onclick=closeModal;$('modal').addEventListener('cancel',e=>{e.preventDefault();closeModal();});
function showGuide(){openModal(`<h2>Réveille la nuit.</h2><p class="sub">Une petite lueur peut changer tout un ciel.</p><div class="guide-grid"><p><b>01 · Récolte et grandis</b><br>Les points dorés te donnent de la lumière. Les ombres récoltent les lueurs et s’absorbent entre elles. Un bouclier cyan les protège trois secondes après leur apparition. Absorbe les plus petites avant qu’elles deviennent dangereuses. Les chasseurs annoncent leur charge par un trait rose ; les gardiens deviennent absorbables avec au moins 25 % de lumière de plus.</p><p><b>02 · Fais une offrande</b><br>Les offrandes coûtent 80, puis 160, puis 240 lumières. Garde 10 lumières en réserve et reste 4 secondes dans le cercle. Chaque sanctuaire te donne une bénédiction.</p><p><b>03 · Explore et choisis ton retour</b><br>Chaque étape demande trois repères et 2 min, 2 min 40 puis 3 min 20 de déplacement hors refuge. Les pauses et l’immobilité ne comptent pas. Après les trois sanctuaires, continue librement ou termine via Pause pour voir ton bilan.</p><p><b>04 · Garde tes étincelles</b><br>Trois captures et l’expédition s’arrête. Après une capture, tu reviens au refuge avec quelques secondes de protection.</p></div><p class="sub">PC : souris ou ZQSD / WASD / flèches · Espace : pouvoir · Échap : pause.<br>Mobile et tablette : joystick à gauche, pouvoir à droite. Portrait et paysage.</p><p class="note">Les Éclats nocturnes se gagnent toutes les 10 minutes de déplacement actif. Pause et immobilité ne comptent pas. Sauvegarde locale sur ce navigateur ; aucun lien ni conversion avec la monnaie du Hub.</p><div class="actions"><button class="primary" data-action="start">C’est parti ↗</button></div>`,'guide');}
function showCharacters(){openModal(`<h2>Les esprits de la nuit</h2><p class="sub">Les esprits éveillés t’accompagnent toute l’année.</p><div class="cards">${Object.entries(C.characters).map(([id,c])=>`<article class="card ${profile.selected===id?'selected':''}"><canvas data-portrait="${id}" width="300" height="120"></canvas><h3>${c.name} <small>· ${c.title}</small></h3><p>${c.description}</p><div class="lock-note">${C.unlocked(profile,id)?'✦ Éveillé':c.condition}</div><button data-select="${id}" ${!C.unlocked(profile,id)?'disabled':''}>${profile.selected===id?'Compagnon sélectionné':C.unlocked(profile,id)?'Choisir '+c.name:'Encore endormi'}</button></article>`).join('')}</div>`,'characters');document.querySelectorAll('[data-portrait]').forEach(e=>{const x=e.getContext('2d');drawCreature(x,150,60,C.mascots[e.dataset.portrait]?30:38,e.dataset.portrait,0,0,C.equippedTrail(profile,e.dataset.portrait)||'aurore');});}
function showPermanentChallenges(){openModal(`<h2>Les traces de ton voyage</h2><p class="sub">Des objectifs permanents, à ton rythme. Les défis de maîtrise débloquent les créatures ; les autres gardent la trace de tes exploits.</p>${C.challenges.map(c=>{const n=Math.min(profile.stats[c[2]],c[3]);return `<div class="challenge ${n>=c[3]?'done':''}"><span>${n>=c[3]?'✦':'◇'}</span><div><b>${c[0]}</b><p>${c[1]} · ${n} / ${c[3]}</p></div></div>`;}).join('')}`,'challenges');}
let challengeTab='daily';
function showChallenges(){if(!recurring){showPermanentChallenges();return;}checkChallenges();const tabs=Object.entries(recurring.definitions).map(([id,d])=>[id,d.name]).concat([['permanent','Permanents']]);let content;
if(challengeTab==='permanent')content=C.challenges.map(c=>{const n=Math.min(profile.stats[c[2]],c[3]);return `<div class="challenge ${n>=c[3]?'done':''}"><span>${n>=c[3]?'✦':'◇'}</span><div><b>${c[0]}</b><p>${c[1]} · ${n} / ${c[3]}</p></div></div>`;}).join('');
else{const def=recurring.definitions[challengeTab],period=profile.recurringChallenges.periods[challengeTab],done=profile.recurringChallenges.rewardIds.includes(challengeTab+':'+period.id),minutes=recurring.remaining(challengeTab,Date.now());content=`<p class="sub">Série complète : ${def.reward} Éclat${def.reward>1?'s':''} nocturne${def.reward>1?'s':''}.<br>Renouvellement dans ${Math.floor(minutes/1440)} j ${Math.floor(minutes%1440/60)} h ${minutes%60} min · heure de Paris</p><p role="status">${done?'✦ Série terminée · récompense reçue':'Trois objectifs · récompense automatique'}</p>`+period.objectives.map((o,i)=>`<div class="challenge ${o.progress>=o.target?'done':''}"><span>${o.progress>=o.target?'✦':'◇'}</span><div><b>${recurring.labels[i]}</b><p>${o.progress} / ${o.target}</p><progress value="${o.progress}" max="${o.target}" aria-label="${recurring.labels[i]}"></progress></div></div>`).join('');}
openModal(`<h2>Les traces de ton voyage</h2><nav class="challenge-tabs" aria-label="Catégories de défis">${tabs.map(([id,name])=>`<button data-challenge-tab="${id}" aria-pressed="${id===challengeTab}">${name}</button>`).join('')}</nav>${content}`,'challenges');document.querySelectorAll('[data-challenge-tab]').forEach(b=>b.onclick=()=>{challengeTab=b.dataset.challengeTab;showChallenges();});}
const appearanceCategories={trail:'Traînées lumineuses',aura:'Auras',absorption:'Effets d’absorption',shield:'Boucliers',appearance:'Apparences rares'};let appearanceTab='trail';
function applyAppearance(change){const next=C.normalize(JSON.parse(C.serializeProfile(profile)));if(!change(next))return false;try{writeProfile(next);}catch{toast('Modification non enregistrée. Ton équipement précédent est conservé.');return false;}profile=next;refreshHome();return true;}
function drawAppearancePreview(){const canvas=$('appearance-preview');if(!canvas)return;const g=canvas.getContext('2d'),trail=C.equippedTrail(profile);g.clearRect(0,0,480,220);if(trail){g.fillStyle=C.skins[trail].color;for(let i=0;i<18;i++){g.globalAlpha=.15+i/22;g.beginPath();g.arc(45+i*8,118+Math.sin(i*.55)*7,1.5+i/12,0,TAU);g.fill();}g.globalAlpha=1;}drawCreature(g,290,110,56,profile.selected,0,0,profile.skin);}
function showAppearances(){const trail=C.equippedTrail(profile),equipped=profile.cosmetics.equipped[profile.selected][appearanceTab];const objects=appearanceTab==='trail'?Object.entries(C.skins).filter(([id])=>profile.owned.includes(id)&&profile.cosmetics.owned.includes('trail:'+id)):[];
openModal(`<h2>Apparences</h2><p class="sub">${C.characters[profile.selected].name} · personnalisation gratuite, sans avantage en partie.</p><canvas id="appearance-preview" width="480" height="220" aria-label="Aperçu de ${C.characters[profile.selected].name}"></canvas><p class="note">Traînée : ${trail?C.skins[trail].name:'aucune'} · Choisis ton esprit dans Créatures.</p><nav class="appearance-tabs" aria-label="Catégories d’apparences">${Object.entries(appearanceCategories).map(([id,name])=>`<button data-appearance-tab="${id}" aria-pressed="${appearanceTab===id}">${name}</button>`).join('')}</nav>${objects.length?`<div class="cards">${objects.map(([id,item])=>`<article class="card ${equipped==='trail:'+id?'selected':''}"><div class="swatch" style="--swatch:${item.color}"></div><h3>${item.name}</h3><p>Possédée · Compatible avec ${C.characters[profile.selected].name}</p><button data-equip="trail:${id}" ${equipped==='trail:'+id?'disabled':''}>${equipped==='trail:'+id?'Équipée':'Équiper'}</button></article>`).join('')}</div>`:'<p class="sub appearance-empty">Aucun objet disponible dans cette catégorie pour le moment.</p>'}<div class="actions"><button class="secondary" data-appearance-remove ${!equipped?'disabled':''}>Retirer cet équipement</button><button class="secondary" data-appearance-reset>Réinitialiser ce personnage</button></div><p class="note">Les équipements des autres esprits sont conservés. Retirer la traînée laisse les effets naturels du personnage.</p>`,'appearances');drawAppearancePreview();}
$('modal-body').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.appearanceTab){appearanceTab=b.dataset.appearanceTab;showAppearances();}else if(b.dataset.equip){if(applyAppearance(p=>C.equipCosmetic(p,appearanceTab,b.dataset.equip)))showAppearances();}else if(b.hasAttribute('data-appearance-remove')){if(applyAppearance(p=>C.equipCosmetic(p,appearanceTab,null)))showAppearances();}else if(b.hasAttribute('data-appearance-reset')){if(applyAppearance(C.resetCosmetics))showAppearances();}});
function showShop(){openModal(`<h2>Une lumière à ton image</h2><p class="sub">${profile.shards} Éclats nocturnes · ${Math.floor(profile.activeSeconds/60)} / 10 minutes vers le prochain Éclat nocturne.<br>Des traînées purement visuelles, sans avantage en partie.</p><div class="cards">${Object.entries(C.skins).map(([id,s])=>`<article class="card ${C.equippedTrail(profile)===id?'selected':''}"><div class="swatch" style="--swatch:${s.color}"></div><h3>${s.name}</h3><p>${s.description}</p><button data-buy="${id}" ${!profile.owned.includes(id)&&profile.shards<s.price?'disabled':''}>${C.equippedTrail(profile)===id?'Équipée':profile.owned.includes(id)?'Équiper':`${s.price} Éclats · Débloquer`}</button></article>`).join('')}</div><p class="note">Aucun paiement réel. Ces Éclats nocturnes restent sur cet appareil et sont indépendants du solde CJajlkGames.</p>`,'shop');}
$('modal-body').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.select&&C.unlocked(profile,b.dataset.select)){if(applyAppearance(p=>C.selectCharacter(p,b.dataset.select)))showCharacters();}if(b.dataset.buy){const id=b.dataset.buy;if(applyAppearance(p=>p.owned.includes(id)?C.equipCosmetic(p,'trail','trail:'+id):C.purchase(p,id)))showShop();}if(b.dataset.action==='start')start();if(b.dataset.action==='resume')closeModal();if(b.dataset.action==='home')home();if(b.dataset.action==='leave')finish(run.lit===3);});
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>({characters:showCharacters,challenges:showChallenges,shop:showShop,appearances:showAppearances}[b.dataset.panel]()));$('guide').onclick=showGuide;$('play').onclick=start;
$('sound').onclick=()=>{profile.sound=!profile.sound;initAudio();tone(523,.6);save();refreshHome();};
const stars=Array.from({length:220},()=>({x:rand(0,worldSize),y:rand(0,worldSize),r:rand(.4,1.7),p:rand(0,TAU)}));
const rocks=M.layout(Array.from({length:48},(_,i)=>{const a=i/48*TAU,r=rand(930,1080),size=rand(20,46),stretch=rand(1.15,1.9);return{x:1100+Math.cos(a)*r,y:1100+Math.sin(a)*r,r:size,a:rand(-.7,.7),facets:[[-.12,-stretch],[.42,-.72],[.52,.46],[.08,.78],[-.48,.4],[-.4,-.65]].map(([x,y])=>[x*size,y*size])};}).map(rock=>M.prepare(rock))).filter(rock=>[...C.route(0),...C.route(1),...C.route(2),{x:560,y:640},{x:1690,y:700},{x:1180,y:1710}].every(point=>dist(rock,point)>rock.bound+160));
function newMote(){return{x:rand(130,2070),y:rand(130,2070),r:rand(2,3.5),phase:rand(0,TAU)};}
function makeEnemy(i,kindOverride,behaviorOverride){
 const kind=kindOverride||(i%9===0?'sentinel':i%3===0?'hunter':'wisp');
 const enemy={x:0,y:0,kind,behavior:behaviorOverride||(kind==='sentinel'?'guardian':kind==='hunter'?'hunter':i%2?'prudent':'balanced'),mass:kind==='sentinel'?rand(235,265):kind==='hunter'?rand(65,110):rand(10,25),angle:rand(0,TAU),turn:rand(1,4),speed:M.speed,stun:0,windup:0,dash:0,attackCooldown:rand(2,5),feedCooldown:0};
 for(let attempt=0;attempt<80;attempt++){
  enemy.x=rand(160,2040);enemy.y=rand(160,2040);
  if(Math.hypot(enemy.x-1100,enemy.y-1100)<320)continue;
  if(M.hits(enemy.x,enemy.y,C.radius(enemy.mass),rocks))continue;
  if(run&&dist(enemy,run.player)<C.radius(enemy.mass)+C.radius(run.player.mass)+180)continue;
  if(run&&run.enemies.some(e=>!e.dead&&dist(enemy,e)<C.radius(enemy.mass)+C.radius(e.mass)+100))continue;
  return B.protect(enemy);
 }return null; // Retry later instead of forcing an unsafe spawn.
}
function removeEnemy(enemy){if(enemy.dead)return;enemy.dead=true;run.respawns.push({kind:enemy.kind,behavior:enemy.behavior,delay:enemy.kind==='sentinel'?12:4});}
function updatePopulation(dt){
 run.enemies=run.enemies.filter(e=>!e.dead);
 for(const pending of run.respawns){pending.delay-=dt;if(pending.delay>0)continue;const enemy=makeEnemy(1,pending.kind,pending.behavior);if(enemy){run.enemies.push(enemy);pending.done=true;}else pending.delay=1;}
 run.respawns=run.respawns.filter(p=>!p.done);
}


function refreshMascots(){const section=$('christmas-mascots'),active=christmasEvent?.active&&christmasEvent.editionId==='christmas-2026';section.hidden=!active;if(!active)return;const balance=profile.events.christmas2026?.fragments||0;for(const id of ['niva','solstice']){const owned=C.unlocked(profile,id),b=$('unlock-'+id);b.disabled=owned||balance<C.mascots[id].cost;b.textContent=owned?'Acquise':'Débloquer · '+C.mascots[id].cost+' ❄';}}
$('christmas-mascots').addEventListener('click',e=>{const b=e.target.closest('[data-mascot]');if(!b||state!=='home')return;const next=JSON.parse(JSON.stringify(profile));if(!C.purchaseMascot(next,b.dataset.mascot,LueurEvents.forArena('christmas'))){refreshMascots();return;}
 // Commit ownership and debit together. A failed write leaves the live profile intact.
 try{writeProfile(next);}catch{toast('Achat non effectué : sauvegarde indisponible. Aucun fragment dépensé.');return;}
 profile=C.normalize(next);refreshHome();toast(C.characters[b.dataset.mascot].name+' acquise · Choisis-la dans Créatures.');});
function refreshFragments(){refreshMascots();const badge=$('christmas-wallet'),key=C.fragmentKey(christmasEvent);badge.hidden=!key;if(key)$('fragment-balance').textContent=profile.events[key]?.fragments||0;}
// No shared random calls: collectible placement must not change bots or mote spawns.
function updateFragments(dt){
 if(!christmasEvent?.active)return;
 const event=christmasEvent;if(!event.active){run.fragments=[];return;}
 if(run.fragmentEdition!==event.editionId){run.fragments=[];run.fragmentClock=0;run.fragmentEdition=event.editionId;const a=profile.events[C.fragmentKey(event)];if(a)a.pendingIds=[];}
 const p=run.player;
 for(let i=run.fragments.length-1;i>=0;i--){const f=run.fragments[i];f.life-=dt;
  if(f.life<=0){C.retireFragment(profile,f);run.fragments.splice(i,1);save();continue;}
  if(dist(p,f)<C.radius(p.mass)+10){if(C.collectFragment(profile,LueurEvents.forArena('christmas'),f)){save();refreshFragments();toast('+1 Fragment de Noël ❄');}run.fragments.splice(i,1);}
 }
 run.fragmentClock+=dt;if(run.fragmentClock<45)return;run.fragmentClock=0;
 if(run.fragments.length>=2||Math.hypot(p.x-1100,p.y-1100)<230)return;
 for(let i=0;i<12;i++){const angle=p.angle+(i%2?1:-1)*Math.ceil(i/2)*.52,reach=C.radius(p.mass)+85,x=p.x+Math.cos(angle)*reach,y=p.y+Math.sin(angle)*reach;
  if(x<90||x>2110||y<90||y>2110||Math.hypot(x-1100,y-1100)<230||M.hits(x,y,20,rocks)||run.enemies.some(e=>Math.hypot(x-e.x,y-e.y)<C.radius(e.mass)+50)||run.shrines.some(s=>Math.hypot(x-s.x,y-s.y)<125))continue;
  const f=C.issueFragment(profile,LueurEvents.forArena('christmas'));if(f){run.fragments.push({...f,x,y,life:60});save();}break;
 }
}
function drawFragments(){for(const f of run.fragments){const size=12/camera.zoom;ctx.save();ctx.translate(f.x,f.y);ctx.fillStyle='#bcefff';ctx.strokeStyle='#f0faff';ctx.lineWidth=1.5/camera.zoom;ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.65,0);ctx.lineTo(0,size);ctx.lineTo(-size*.65,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#366f99';ctx.beginPath();ctx.moveTo(0,-size*.55);ctx.lineTo(0,size*.55);ctx.moveTo(-size*.3,0);ctx.lineTo(size*.3,0);ctx.stroke();ctx.restore();}}

function start(){LueurEvents.refresh();const destination=LueurArenas.destination($('arena-choice').value);for(const f of absorbFX){f.owner=null;f.end=0;}initAudio();if($('modal').open)$('modal').close();currentPanel='';keys.clear();pointer.active=false;resetJoystick();document.body?.classList.add('in-expedition');paused=false;state='playing';run=null;run={fragments:[],fragmentClock:0,fragmentEdition:null,arena:destination.arena,eventEdition:destination.editionId,player:{x:1100,y:1100,mass:24,lives:3,invincible:4,angle:0},shrines:[{x:560,y:640,name:'Aube',lit:false,charge:0},{x:1690,y:700,name:'Éveil',lit:false,charge:0},{x:1180,y:1710,name:'Horizon',lit:false,charge:0}],motes:Array.from({length:400},newMote),enemies:[],respawns:[],absorbed:0,peak:24,exploration:0,route:C.route(0),particles:[],elapsed:0,cooldown:0,power:0,collected:0,captures:0,lit:0,awarded:false,ambient:0,blessings:[],rings:[],shake:0};for(let i=0;i<18;i++){const e=makeEnemy(i);if(e)run.enemies.push(e);else run.respawns.push({kind:i%9===0?'sentinel':i%3===0?'hunter':'wisp',delay:1});}camera.x=1100;camera.y=1100;$('home').hidden=true;$('shade').hidden=true;$('hud').hidden=false;$('ability-name').textContent=C.characters[profile.selected].power;$('ability-icon').textContent=C.characters[profile.selected].icon;toast('Visite les repères et explore hors du refuge. Pause : bilan.');tone(330,.5);}
function home(){LueurEvents.refresh();save();state='home';paused=false;run=null;keys.clear();resetJoystick();document.body?.classList.remove('in-expedition');if($('modal').open)$('modal').close();currentPanel='';$('home').hidden=false;$('hud').hidden=true;$('shade').hidden=false;refreshHome();}
function pause(){if(state!=='playing'||paused)return;paused=true;keys.clear();resetJoystick();pointer.active=false;openModal(`<h2>Un souffle dans la nuit</h2><p class="sub">L’expédition est en pause. Le temps et les Éclats nocturnes sont arrêtés.</p><div class="actions"><button class="primary" data-action="resume">Reprendre ↗</button><button class="secondary" data-action="leave">Terminer et voir le bilan</button></div><p class="note">Quitter termine cette expédition. Ta progression permanente déjà acquise reste sauvegardée.</p>`,'pause');}
$('pause').onclick=pause;document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();save();}else checkChallenges();});addEventListener('blur',()=>{keys.clear();if(state==='playing')pause();});
function finish(win){if(!run||run.awarded)return;const previousSurvival=profile.stats.bestSurvival,previousLight=profile.stats.bestLight,newSurvival=Math.floor(run.elapsed)>previousSurvival,newLight=Math.floor(run.peak)>previousLight;run.awarded=true;resetJoystick();document.body?.classList.remove('in-expedition');state='result';profile.stats.runs++;profile.stats.bestSurvival=Math.max(profile.stats.bestSurvival,Math.floor(run.elapsed));profile.stats.bestLight=Math.max(profile.stats.bestLight,Math.floor(run.peak));if(win){profile.stats.wins++;if(!run.captures)profile.stats.flawless++;if(run.elapsed<720)profile.stats.fast++;if(run.player.lives===1)profile.stats.close++;if(profile.selected==='mira')profile.stats.miraWins++;}save();refreshHome();$('hud').hidden=true;const unlocks=Object.entries(C.characters).filter(([id])=>id!=='nyx'&&C.unlocked(profile,id)).map(([,v])=>v.name);openModal(`<section class="expedition-result"><div class="result-symbol">${win?'✦':'☾'}</div><h2>${win?'La nuit se souvient.':'Ta lumière reviendra.'}</h2><p class="sub">${win?'Les constellations brillent à nouveau. Ton passage a laissé une trace dans le ciel.':run.player.lives<=0?'Les ombres ont dispersé tes dernières étincelles. Chaque voyage te rapproche du prochain.':'Tu as choisi de rentrer au refuge. Ton voyage reste enregistré.'}</p><div class="result-overview"><div><small>DURÉE DE L’EXPÉDITION</small><strong>${formatTime(Math.floor(run.elapsed))}</strong></div><div><small>SANCTUAIRES COMPLÉTÉS</small><strong>${run.lit}<span> / 3</span></strong></div></div><div class="result-metrics"><div><b>${run.collected}</b><span>Lueurs récoltées</span></div><div><b>${run.absorbed}</b><span>Créatures absorbées</span></div><div><b>${Math.floor(run.peak)}</b><span>Pic de lumière</span></div></div><h3 class="result-record-title">Records personnels</h3><div class="result-records"><div class="${newSurvival?'record-new':''}"><span>Survie</span><b>${formatTime(profile.stats.bestSurvival)}</b>${newSurvival?'<small>Nouveau record !</small><em>Ancien : '+formatTime(previousSurvival)+'</em>':'<em>Record conservé</em>'}</div><div class="${newLight?'record-new':''}"><span>Lumière</span><b>${profile.stats.bestLight} ✦</b>${newLight?'<small>Nouveau record !</small><em>Ancien : '+previousLight+' ✦</em>':'<em>Record conservé</em>'}</div></div><p class="sub">${profile.shards} Éclats nocturnes · ${Math.floor(profile.activeSeconds/60)} / 10 minutes vers le prochain Éclat nocturne.${unlocks.length?'<br>Esprits éveillés : '+unlocks.join(', ')+'.':''}</p><div class="actions result-actions"><button class="primary" data-action="start">Rejouer ↗</button><button class="secondary" data-action="home">Retour au refuge</button></div></section>`,'result');tone(win?659:196,.9);}
function power(){if(state!=='playing'||paused)return;const c=C.characters[profile.selected],p=run.player;if(run.cooldown>0)return;if(p.mass<c.cost+10){toast(`Il te faut ${c.cost+10} lumières pour ce pouvoir.`);return;}p.mass-=c.cost;run.cooldown=c.cooldown*(run.blessings.includes('Éveil')?.8:1);run.power=C.powerBase(profile.selected)==='nyx'?.55:C.powerBase(profile.selected)==='umbra'?3:4;profile.stats.powers++;burst(p.x,p.y,C.skins[profile.skin].color,18);tone(620,.2);}
$('ability').addEventListener('pointerdown',e=>{e.preventDefault();if(e.button===0)power();});
addEventListener('keydown',e=>{
 const target=e.target;if(target?.isContentEditable||target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'))return;
 if(e.key==='Escape'){if(state==='playing'&&!paused&&!e.repeat){e.preventDefault();pause();}return;}
 if(state!=='playing'||paused||$('modal').open)return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)||e.code==='Space')e.preventDefault();
 const key=e.key.toLowerCase(),held=keys.has(key);keys.add(key);
 if(e.code==='Space'&&!e.repeat&&!held)power();
});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){pointer.x=e.clientX;pointer.y=e.clientY;pointer.active=true;}});canvas.addEventListener('pointerleave',()=>pointer.active=false);canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){pointer.x=e.clientX;pointer.y=e.clientY;pointer.active=true;}});
const joystick=$('joystick');function joyMove(e){const r=joystick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.hypot(dx,dy),max=r.width*.32;joy.x=dx/Math.max(max,len);joy.y=dy/Math.max(max,len);$('stick').style.transform=`translate(${joy.x*max}px,${joy.y*max}px)`;}
joystick.addEventListener('pointerdown',e=>{e.preventDefault();if(state!=='playing'||paused||joy.id!==null||e.button!==0)return;joy.id=e.pointerId;pointer.active=false;joystick.setPointerCapture(e.pointerId);joyMove(e);});joystick.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)joyMove(e);});function joyEnd(e){if(e.pointerId===joy.id)resetJoystick();}joystick.addEventListener('pointerup',joyEnd);joystick.addEventListener('pointercancel',joyEnd);joystick.addEventListener('lostpointercapture',joyEnd);
// Fixed visual pool: 8 absorption pulses (5 sparks each), 24 collection trails.
// Its clock follows expedition time, so pause freezes effects without touching physics.
const absorbFX=Array.from({length:32},()=>({owner:null,end:0}));
function collectFX(owner,source,absorption,legacyCount){
 // Preserve the old burst's random consumption: food/spawns keep their existing sequence.
 for(let i=0;i<legacyCount*3;i++)Math.random();
 const now=run.elapsed,from=absorption?0:8,to=absorption?8:32;
 for(let i=from;i<to;i++)if(absorbFX[i].owner===owner&&absorbFX[i].end>now)return;
 for(let i=from;i<to;i++){const f=absorbFX[i];if(f.end>now)continue;
 f.owner=owner;f.x=source.x;f.y=source.y;f.start=now;f.end=now+(absorption?.42:.16);f.absorption=absorption;
 f.color=owner===run.player?(profile.skin==='aurore'?({nyx:'#8deaff',mira:'#ddbcff',orion:'#a2e8d0',umbra:'#bf9aff',niva:'#a5eaff',solstice:'#f4c66a'}[profile.selected]):C.skins[profile.skin].color):owner.kind==='wisp'?'#cfadff':'#b998f5';return;}
}
function visualGrowth(owner){for(let i=0;i<8;i++){const f=absorbFX[i];if(f.owner===owner&&f.end>run.elapsed)return 1+.045*Math.sin((run.elapsed-f.start)/.42*Math.PI);}return 1;}
function drawAbsorbFX(){ctx.save();for(const f of absorbFX){if(f.end<=run.elapsed||f.owner.dead)continue;
 const u=(run.elapsed-f.start)/(f.end-f.start),o=f.owner,r=C.radius(o.mass);ctx.strokeStyle=ctx.fillStyle=f.absorption?f.color:'#efdb9e';ctx.globalAlpha=(1-u)*(f.absorption?.65:.45);ctx.lineWidth=f.absorption?1.8:1;
 if(f.absorption){ctx.beginPath();ctx.arc(o.x,o.y,r+4+u*14,0,TAU);ctx.stroke();}
 const count=f.absorption?5:1;for(let j=0;j<count;j++){const a=j*TAU/5,spread=f.absorption?12:0,sx=f.x+Math.cos(a)*spread,sy=f.y+Math.sin(a)*spread;
 const x=sx+(o.x-sx)*u,y=sy+(o.y-sy)*u,tail=Math.max(0,u-.16);ctx.beginPath();ctx.moveTo(sx+(o.x-sx)*tail,sy+(o.y-sy)*tail);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.arc(x,y,f.absorption?2:1.5,0,TAU);ctx.fill();}
 }ctx.restore();}
function burst(x,y,color,count=12){for(let i=0;i<count;i++){const a=rand(0,TAU),v=rand(15,90);run.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.3,1),color});}if(run.particles.length>250)run.particles.splice(0,run.particles.length-250);}
// Enemies share the same food pool as the player; no passive growth or player currency rewards.
function forage(e,dt){
 e.growthFlash=Math.max(0,(e.growthFlash||0)-dt);
 e.forageTimer=(e.forageTimer||0)-dt;
 if(e.forageTimer<=0){e.forageTimer=.6;let best=280,bestIndex=-1;
  for(let i=0;i<run.motes.length;i++){const d=dist(e,run.motes[i]);if(d<best){best=d;bestIndex=i;}}
  e.foodIndex=bestIndex;
 }
 const radius=C.radius(e.mass);
 if(e.mass<C.balance.maxLight){for(let i=0;i<run.motes.length;i++){const m=run.motes[i];if(dist(e,m)<radius*.72){
  e.mass=C.lightGain(e.mass,2);e.growthFlash=.55;collectFX(e,m,false,2);run.motes[i]=newMote();if(i===e.foodIndex)e.forageTimer=0;if(e.mass>=C.balance.maxLight)break;
 }}}
 const food=run.motes[e.foodIndex];return e.mass<C.balance.maxLight&&food&&dist(e,food)<300?Math.atan2(food.y-e.y,food.x-e.x):null;
}
function update(dt){const p=run.player,c=C.characters[profile.selected];run.elapsed+=dt;p.invincible=Math.max(0,p.invincible-dt);run.cooldown=Math.max(0,run.cooldown-dt);run.power=Math.max(0,run.power-dt);let dx=0,dy=0;if(keys.has('arrowleft')||keys.has('q')||keys.has('a'))dx--;if(keys.has('arrowright')||keys.has('d'))dx++;if(keys.has('arrowup')||keys.has('z')||keys.has('w'))dy--;if(keys.has('arrowdown')||keys.has('s'))dy++;if(joy.x||joy.y){dx=joy.x;dy=joy.y;}else if(!dx&&!dy&&pointer.active){const sx=(p.x-camera.x)*camera.zoom+W/2,sy=(p.y-camera.y)*camera.zoom+H/2;dx=(pointer.x-sx)/75;dy=(pointer.y-sy)/75;if(Math.hypot(dx,dy)<.12)dx=dy=0;}const len=Math.hypot(dx,dy);if(len>1){dx/=len;dy/=len;}const oldX=p.x,oldY=p.y;M.move(p,dx,dy,dt,run.power>0&&C.powerBase(profile.selected)==='nyx'?3.1:1,C.radius(p.mass),rocks);if(dx||dy)p.angle=Math.atan2(dy,dx);if(len>0&&Math.hypot(p.x-oldX,p.y-oldY)>.2){if(run.lit<3&&Math.hypot(p.x-1100,p.y-1100)>180)run.exploration+=dt;if(C.creditTime(profile,dt))toast('+1 Éclat nocturne · Une lumière à personnaliser.');if(Math.random()<.5){const particle={x:p.x-Math.cos(p.angle)*20,y:p.y-Math.sin(p.angle)*20,vx:rand(-8,8),vy:rand(-8,8),life:.5,color:C.skins[profile.skin].color};if(C.equippedTrail(profile))run.particles.push(particle);}}
updateFragments(dt);const pr=C.radius(p.mass);for(let i=0;i<run.motes.length;i++){const m=run.motes[i],d=dist(p,m),range=run.power>0&&profile.selected==='mira'?220:pr+18+(run.blessings.includes('Aube')?30:0);if(d<range){const v=Math.min(1,dt*(run.power>0?12:8));m.x+=(p.x-m.x)*v;m.y+=(p.y-m.y)*v;}if(d<pr){p.mass=C.lightGain(p.mass,1.5);run.collected++;profile.stats.collected++;challengeAction('collected');collectFX(p,m,false,2);run.motes[i]=newMote();if(run.collected%12===0)tone(440+run.collected%5*70,.12);}}
M.move(p,0,0,0,1,C.radius(p.mass),rocks);run.peak=Math.max(run.peak,p.mass);for(const point of run.route){if(dist(p,point)<75)point.visited=true;}
let depositing=null;const cost=C.offeringCost(run.lit);
for(const shrine of run.shrines){if(shrine.lit)continue;const near=dist(p,shrine)<90;
 if(near&&C.stageReady(run)&&p.mass>=cost+10){depositing=shrine;shrine.charge=Math.min(C.balance.offeringDuration,shrine.charge+dt);
 if(shrine.charge>=C.balance.offeringDuration){shrine.lit=true;run.lit++;p.mass-=cost;profile.stats.shrines++;challengeAction('shrines');p.invincible=Math.max(p.invincible,4);run.blessings.push(shrine.name);if(shrine.name==='Horizon')p.lives=Math.min(3,p.lives+1);run.rings.push({x:shrine.x,y:shrine.y,life:2});burst(shrine.x,shrine.y,'#f2d597',45);tone(784,.8);
 for(let k=0;k<2;k++){const e=makeEnemy(1,k===0?'wisp':'hunter');if(e)run.enemies.push(e);else run.respawns.push({kind:k===0?'wisp':'hunter',delay:1});}
 run.exploration=0;run.route=C.route(run.lit);if(run.lit===3){toast('Ciel rallumé ! Continue librement, ou termine depuis Pause.');}else toast(shrine.name+' éveillé · '+blessingLabel(shrine.name)+' · nouvelle exploration');save();}}
 else shrine.charge=Math.max(0,shrine.charge-dt*2);
}
$('deposit').hidden=!depositing||depositing.lit;if(depositing){$('deposit-bar').style.width=(depositing.charge/C.balance.offeringDuration*100)+'%';$('deposit-label').textContent=depositing.name+' · '+Math.ceil((C.balance.offeringDuration-depositing.charge)*10)/10+' s';}
run.rings=run.rings.filter(q=>(q.life-=dt)>0);
updatePopulation(dt);for(const e of run.enemies){B.tick(e,dt);}for(const e of run.enemies){if(e.dead)continue;e.stun=Math.max(0,e.stun-dt);const foodAngle=forage(e,dt);const d=dist(p,e),danger=!B.weaker(p,e),refuge=Math.hypot(e.x-1100,e.y-1100)<155;let target=LueurAI.heading(e,{player:p,enemies:run.enemies,rocks,movement:M,lit:run.lit},dt,foodAngle,C,B);e.attackCooldown=Math.max(0,(e.attackCooldown||0)-dt);
if(e.kind==='hunter'&&danger&&d<270&&d>60&&e.mode==='chase'&&!refuge&&e.attackCooldown<=0&&p.invincible<=0&&!B.shielded(e)){B.attack(e);e.windup=.8;e.attackCooldown=5;e.lockAngle=target;}
let moveFactor=1;if(e.windup>0){e.windup-=dt;moveFactor=.12;target=e.lockAngle;if(e.windup<=0)e.dash=.65;}else if(e.dash>0){e.dash-=dt;target=e.lockAngle;moveFactor=2.5;}
e.angle=target;if(!e.stun)M.move(e,Math.cos(e.angle),Math.sin(e.angle),dt,moveFactor,C.radius(e.mass),rocks);const er=C.radius(e.mass);if(B.contact(p,e,C.radius)&&!B.shielded(e)){if(!danger){p.mass=C.lightGain(p.mass,B.gain(e));M.move(p,0,0,0,1,C.radius(p.mass),rocks);run.peak=Math.max(run.peak,p.mass);profile.stats.absorbed++;challengeAction('absorbed');run.absorbed++;collectFX(p,e,true,e.kind==='sentinel'?28:14);removeEnemy(e);tone(290,.15);}else if(p.invincible<=0&&!(run.power>0&&['orion','umbra'].includes(C.powerBase(profile.selected)))&&Math.hypot(p.x-1100,p.y-1100)>140){p.lives--;run.captures++;run.shake=.3;p.mass=Math.max(15,Math.floor(p.mass*(profile.selected==='mira'?.5:.65)));burst(p.x,p.y,'#df97bc',24);p.x=p.y=1100;p.invincible=5;pointer.active=false;e.stun=3;tone(150,.5);toast('Une étincelle perdue. Le refuge te protège un instant.');if(p.lives<=0){finish(false);return;}}}}
// Pair resolution uses current positions, a delayed respawn and one meal per cooldown.
for(let i=0;i<run.enemies.length;i++)for(let j=i+1;j<run.enemies.length;j++){
 const a=run.enemies[i],b=run.enemies[j];if(a.dead||b.dead||!B.contact(a,b,C.radius))continue;
 const eater=B.canAbsorb(a,b)?a:B.canAbsorb(b,a)?b:null;if(!eater)continue;
 const prey=eater===a?b:a;eater.mass=C.lightGain(eater.mass,B.gain(prey));M.move(eater,0,0,0,1,C.radius(eater.mass),rocks);eater.growthFlash=.55;eater.feedCooldown=1;removeEnemy(prey);collectFX(eater,prey,true,prey.kind==='sentinel'?28:8);
}
run.enemies=run.enemies.filter(e=>!e.dead);
run.particles=run.particles.filter(q=>(q.life-=dt)>0);for(const q of run.particles){q.x+=q.vx*dt;q.y+=q.vy*dt;}
camera.zoom+=(Math.min(1.1,Math.max(.58,Math.min(W,H)/680))-camera.zoom)*Math.min(1,dt*2);run.shake=Math.max(0,run.shake-dt);camera.x+=(p.x-camera.x)*Math.min(1,dt*6);camera.y+=(p.y-camera.y)*Math.min(1,dt*6);$('mass').textContent=Math.floor(p.mass);$('lives').textContent='✦ '.repeat(p.lives)+'◇ '.repeat(3-p.lives);$('time').textContent=formatTime(run.elapsed);$('time').style.color='';run.peak=Math.max(run.peak,p.mass);$('shrines-status').textContent=run.shrines.map(s=>s.lit?'◆':'◇').join(' ');$('objective').textContent=run.lit===3?'Survie libre · 3 / 3':run.lit+' / 3 constellations';
const nearest=run.shrines.filter(s=>!s.lit).sort((a,b)=>dist(a,p)-dist(b,p))[0];
$('hint').textContent=run.lit===3?'Continue ou termine via Pause':!C.stageReady(run)?'Exploration '+formatTime(Math.min(run.exploration,C.balance.explorationSeconds[run.lit]))+' / '+formatTime(C.balance.explorationSeconds[run.lit])+' • Repères '+run.route.filter(p=>p.visited).length+'/3':nearest?nearest.name+' · '+Math.round(dist(nearest,p))+' m · '+(p.mass<C.offeringCost(run.lit)+10?'encore '+Math.ceil(C.offeringCost(run.lit)+10-p.mass)+' ✦':'offrande '+C.offeringCost(run.lit)+' ✦'):'';
$('blessings').textContent=run.blessings.map(n=>({Aube:'✧ Attraction',Éveil:'↗ Recharge',Horizon:'♡ Vitalité'}[n])).join('   ');
$('mass').title='Lumière · '+Math.floor(p.mass);
$('ability-status').textContent=run.cooldown>0?`${Math.ceil(run.cooldown)} s`:`−${c.cost} ✦`;$('ability').style.opacity=run.cooldown>0?'.5':'1';$('ability').setAttribute('aria-label',run.cooldown>0?`${c.power} disponible dans ${Math.ceil(run.cooldown)} secondes`:`Utiliser ${c.power}`);
run.ambient+=dt;if(run.ambient>7){run.ambient=0;tone([220,277,330,415][Math.floor(rand(0,4))],2.5);}saveClock+=dt;if(saveClock>10){saveClock=0;save();}
}
function formatTime(seconds){return Math.floor(seconds/60)+':'+String(Math.floor(seconds%60)).padStart(2,'0');}
function blessingLabel(name){return {Aube:'attraction renforcée',Éveil:'pouvoir rechargé plus vite',Horizon:'une vie restaurée'}[name]||'';}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}
function drawCreature(g,x,y,r,id,angle=0,time=0,skin='aurore'){
if(mascotImages[id]){const img=mascotImages[id];if(img.complete&&img.naturalWidth){g.save();g.translate(x,y+Math.sin(time*3)*r*.045);g.scale(Math.cos(angle)<0?-1:1,1);g.rotate(Math.sin(time*2)*.025);g.drawImage(img,-r*1.7,-r*1.7,r*3.4,r*3.4);g.restore();return;}id=C.powerBase(id);}
if(id==='wisp'){g.save();g.translate(x,y);g.fillStyle='#8c78ce';g.shadowColor='#a193e1';g.shadowBlur=12;g.beginPath();g.ellipse(0,0,r*.65,r*.52,Math.sin(time)*.15,0,TAU);g.fill();g.shadowBlur=0;g.fillStyle='#ffe2a0';for(const xx of [-r*.18,r*.18]){g.beginPath();g.ellipse(xx,-r*.04,r*.07,r*.13,0,0,TAU);g.fill();}g.strokeStyle='#bcb3eb66';g.beginPath();g.arc(0,0,r*.85,time,time+Math.PI);g.stroke();g.restore();return;}
if(atlas.complete&&atlas.naturalWidth){const index=['nyx','mira','orion','umbra'].indexOf(id),cellW=atlas.naturalWidth/2,cellH=atlas.naturalHeight/2;g.save();g.translate(x,y+Math.sin(time*3)*r*.045);g.scale(Math.cos(angle)<0?-1:1,1);g.rotate(Math.sin(time*2)*.025);g.drawImage(atlas,index%2*cellW+cellW*.025,Math.floor(index/2)*cellH+cellH*.025,cellW*.95,cellH*.95,-r*1.7,-r*1.7,r*3.4,r*3.4);g.restore();return;}
g.save();g.translate(x,y);const flip=Math.cos(angle)<0?-1:1;g.scale(flip,1);g.translate(0,Math.sin(time*3)*r*.035);const cyan=C.skins[skin]?.color||'#79ddff';
g.fillStyle='#01061555';g.beginPath();g.ellipse(0,r*.7,r*.95,r*.23,0,0,TAU);g.fill();
function shape(points,fill,stroke){g.beginPath();for(const [i,p]of points.entries()){if(!i)g.moveTo(...p);else g.lineTo(...p);}g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=r*.035;g.stroke();}}
function oval(cx,cy,rx,ry,color,rot=0){g.beginPath();g.ellipse(cx,cy,rx,ry,rot,0,TAU);g.fillStyle=color;g.fill();}
if(id==='mira'){
 for(const s of [-1,1]){g.save();g.scale(1,s);g.beginPath();g.moveTo(r*.3,0);g.bezierCurveTo(-r*.1,-r*.7,-r*1.25,-r*1.4,-r*1.8,-r*.95);g.bezierCurveTo(-r*.9,-r*.8,-r*1.1,-r*.3,-r*.4,0);g.fillStyle='#9584d5';g.fill();g.strokeStyle='#cfbbff';g.lineWidth=r*.035;g.stroke();g.beginPath();g.moveTo(-r*.2,-r*.2);g.lineTo(-r*.75,-r*.62);g.lineTo(-r*1.2,-r*.8);g.strokeStyle='#efd49a99';g.lineWidth=1;g.stroke();for(const a of [[-.2,-.2],[-.75,-.62],[-1.2,-.8]])oval(a[0]*r,a[1]*r,r*.05,r*.05,'#ffe3a8');g.restore();}oval(0,0,r*.7,r*.48,'#ada0e4');oval(r*.35,r*.06,r*.48,r*.43,'#eee0f5');
}else if(id==='orion'){
oval(-r*.6,r*.55,r*.5,r*.19,'#487aab',-.4);oval(r*.25,r*.65,r*.45,r*.2,'#578bb7',.3);oval(-r*.8,-r*.3,r*.4,r*.2,'#5e93b7',.4);oval(-r*.2,0,r*.95,r*.73,'#304f85');for(const [cx,cy,sz]of [[-.75,-.25,.5],[-.22,-.52,.66],[.3,-.25,.44],[-.15,.14,.6]]){shape([[cx*r,(cy-sz)*r],[(cx+sz*.6)*r,cy*r],[cx*r,(cy+sz*.6)*r],[(cx-sz*.55)*r,cy*r]],'#809ce5','#d1d5ff');shape([[cx*r,(cy-sz)*r],[cx*r,(cy+sz*.6)*r],[(cx-sz*.55)*r,cy*r]],'#5c70be');}oval(r*.65,r*.18,r*.5,r*.48,'#81a7d3');
}else if(id==='umbra'){
for(let i=0;i<5;i++){const yy=(i-2)*r*.3;g.beginPath();g.moveTo(0,yy);g.bezierCurveTo(-r,yy-r*.7,-r*1.1,yy+r*.4,-r*(1.6+Math.sin(time*3+i)*.2),yy-r*.3);g.bezierCurveTo(-r*1.2,yy+r*.6,-r*.6,yy+r*.4,0,yy+r*.2);g.fillStyle=i%2?'#3a245d':'#251d45';g.fill();}oval(0,0,r*.88,r*.73,'#292142');shape([[-r*.5,-r*.4],[-r*.65,-r*1.15],[0,-r*.65]],'#433067','#8a68bb');shape([[r*.2,-r*.5],[r*.55,-r*1.2],[r*.65,-r*.25]],'#e6c285');
}else{
g.beginPath();g.moveTo(-r*.35,r*.2);g.bezierCurveTo(-r*1.8,r*.4,-r*.7,-r*1.3,-r*1.9,-r*.8);g.bezierCurveTo(-r*1.15,-r*1.5,-r*.9,-r*.2,-r*.4,-r*.35);g.fillStyle=cyan;g.shadowColor=cyan;g.shadowBlur=10;g.fill();g.shadowBlur=0;oval(-r*.18,r*.08,r*.85,r*.67,'#233c68');shape([[-r*.42,-r*.35],[-r*.92,-r*1.2],[r*.05,-r*.68]],'#233c68','#6aa6d0');shape([[r*.08,-r*.5],[r*.32,-r*1.25],[r*.72,-r*.32]],'#2d4778','#6aa6d0');shape([[-r*.4,-r*.48],[-r*.7,-r*.97],[-r*.02,-r*.6]],'#6273a0');oval(r*.27,0,r*.68,r*.65,'#294676');oval(r*.47,r*.3,r*.36,r*.23,'#8095ba');}
const fx=id==='orion'?r*.65:id==='mira'?r*.38:r*.3,fy=id==='orion'?r*.15:r*.03;
for(const ex of [fx-r*.22,fx+r*.23]){oval(ex,fy,r*.16,r*.22,'#10182a');oval(ex+r*.025,fy+r*.015,r*.115,r*.16,id==='mira'?'#f7c486':'#f4ce77');oval(ex+r*.055,fy,r*.045,r*.105,'#17223c');oval(ex+r*.04,fy-r*.07,r*.04,r*.05,'#fff5d3');}
g.strokeStyle='#f5d99e';g.lineWidth=r*.09;g.beginPath();g.arc(fx-r*.04,fy-r*.39,r*.16,.1,Math.PI*1.4);g.stroke();g.restore();
}
function drawHome(){const gx=W*.75,gy=H*.47,r=Math.max(W,H)*.5,glow=ctx.createRadialGradient(gx,gy,0,gx,gy,r);glow.addColorStop(0,'#293a6466');glow.addColorStop(.5,'#192d4660');glow.addColorStop(1,'#07162500');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);for(const s of stars){const x=s.x/worldSize*W,y=s.y/worldSize*H;ctx.globalAlpha=.25+Math.sin(t*.5+s.p)*.2;ellipse(x,y,s.r,s.r,'#d8d6bc');}ctx.globalAlpha=1;ctx.save();ctx.translate(gx,gy);ctx.rotate(t*.015);ctx.strokeStyle='#d1b97922';ctx.lineWidth=1;for(const rr of [H*.29,H*.34]){ctx.beginPath();ctx.arc(0,0,rr,0,TAU);ctx.stroke();}for(let i=0;i<8;i++){const a=i/8*TAU;ellipse(Math.cos(a)*H*.34,Math.sin(a)*H*.34,3,3,'#e9d5a299');}ctx.restore();const scale=W<700?.75:1;drawCreature(ctx,gx,gy,Math.min(W*.16,H*.25)*scale,profile.selected,0,t,profile.skin);if(W>700){drawCreature(ctx,W*.89,H*.21,H*.065,'mira',Math.PI,t);drawCreature(ctx,W*.56,H*.7,H*.07,'orion',0,t);}ctx.fillStyle='#e6cf8e';for(let i=0;i<12;i++){const a=i*.8+t*.08,x=gx+Math.cos(a)*H*.32,y=gy+Math.sin(a*1.1)*H*.28;ellipse(x,y,1.5,1.5,'#d6c08d88');}}
function drawArenaCreature(x,y,r,id,angle,skin){drawCreature(ctx,x,y,R.creatureScale(r,id),id,angle,t,skin);}
const waypointStyles=[{name:'Sélène',number:'I',color:'#c8b8ff'},{name:'Véga',number:'II',color:'#92e4ed'},{name:'Halo',number:'III',color:'#efb9d0'}];
function waypointGlyph(x,y,index,size=16){
 const style=waypointStyles[index];ctx.save();ctx.translate(x,y);ctx.strokeStyle=style.color;ctx.fillStyle=style.color;ctx.lineWidth=1.5;
 if(index===0){ctx.beginPath();ctx.arc(0,0,size*.65,.35,TAU-.35);ctx.bezierCurveTo(-size*.18,-size*.45,-size*.18,size*.45,size*.61,size*.22);ctx.closePath();ctx.fill();}
 else if(index===1){ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,r=i%2?size*.22:size*.75;const px=Math.cos(a)*r,py=Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();}
 else {ctx.rotate(-.45);ctx.beginPath();ctx.ellipse(0,0,size*.8,size*.35,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,0,size*.46,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(size*.7,0,2.4,0,TAU);ctx.fill();}ctx.restore();
}
function drawWaypoint(x,y,index,boxes){
 const style=waypointStyles[index],box={x:x-44,y:y-23,w:88,h:65};ctx.save();
 const glow=ctx.createRadialGradient(x,y,0,x,y,27);glow.addColorStop(0,style.color+'32');glow.addColorStop(1,style.color+'00');ctx.fillStyle=glow;ctx.fillRect(x-27,y-27,54,54);
 ctx.fillStyle='#091827e6';ctx.strokeStyle=style.color+'88';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,19,0,TAU);ctx.fill();ctx.stroke();waypointGlyph(x,y,index);
 if(!boxes.some(other=>R.overlaps(box,other))){ctx.fillStyle='#0a1829ed';ctx.strokeStyle=style.color+'44';ctx.beginPath();ctx.roundRect(x-44,y+23,88,23,11);ctx.fill();ctx.stroke();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=style.color;ctx.font='600 13px Manrope,sans-serif';ctx.fillText(style.name,x+6,y+34.5);ctx.font='9px Manrope,sans-serif';ctx.globalAlpha=.75;ctx.fillText(style.number,x-29,y+34.5);boxes.push({...box,h:70});}else boxes.push({x:x-20,y:y-20,w:40,h:40});ctx.restore();
}
function drawArenaLabels(markerBoxes=[]){
 const mobile=W<=900||H<=480||window.matchMedia?.('(pointer:coarse)').matches;
 const font=mobile?16:14,labels=[],occupied=mobile?[{x:0,y:0,w:W,h:H<=480?115:175},{x:0,y:H-140,w:140,h:140},{x:W-130,y:H-140,w:130,h:140}]:[{x:W/2-155,y:0,w:310,h:165},{x:0,y:0,w:155,h:100},{x:W-80,y:0,w:80,h:100}];
 if($('toast').classList.contains?.('show')){const box=$('toast').getBoundingClientRect();occupied.push({x:box.left,y:box.top,w:box.width,h:box.height});}
 occupied.push({x:W/2-65,y:H/2-65,w:130,h:130},...markerBoxes);
 const point=(x,y)=>({x:(x-camera.x)*camera.zoom+W/2,y:(y-camera.y)*camera.zoom+H/2});
 const entities=[...run.enemies,{...run.player,player:true}];
 for(const e of entities){const p=point(e.x,e.y),r=R.radius(e.mass,e.player)*camera.zoom;
  if(p.x+r<0||p.x-r>W||p.y+r<0||p.y-r>H)continue;
  occupied.push({x:p.x-r-5,y:p.y-r-5,w:r*2+10,h:r*2+10});
  if(!e.player){const danger=!B.weaker(run.player,e),guardian=e.kind==='sentinel',gap=Math.max(0,(dist(e,run.player)-C.radius(e.mass)-C.radius(run.player.mass))*camera.zoom),style=R.enemyLabel(gap,danger,guardian,e.mass>=run.player.mass*.65,mobile);if(style.alpha>.12)labels.push({x:p.x,y:p.y-r-font-17,text:(guardian?'⬡ ':danger?'⚠ ':'✧ ')+Math.floor(e.mass)+' ✦',color:guardian?'#ffcf9c':danger?'#ffb9cd':'#bdffdc',...style});}
 }
 for(const s of run.shrines){const p=point(s.x,s.y);if(p.x<0||p.x>W||p.y<0||p.y>H)continue;
  labels.push({x:p.x,y:p.y-90*camera.zoom-font-12,shrine:true,text:s.name+(s.lit?' · ✓':C.stageReady(run)?' · '+C.offeringCost(run.lit)+' ✦':''),color:({Aube:'#f1d39b',Éveil:'#b9c9ff',Horizon:'#96dedc'})[s.name],priority:10000});
 }
 ctx.save();ctx.font='700 '+font+'px Manrope,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 labels.sort((a,b)=>a.priority-b.priority);let enemyLabels=0;
 for(const label of labels){if(!label.shrine&&enemyLabels>=(mobile?4:8))continue;ctx.globalAlpha=label.alpha??1;ctx.font=(label.shrine?'600 ':'700 ')+(label.shrine?font-1:font)+'px Manrope,sans-serif';const w=ctx.measureText(label.text).width+16,h=font+12;if(w>W-8)continue;
  const box=R.place({...label,w,h},occupied,W,H);if(!box)continue;occupied.push(box);if(!label.shrine)enemyLabels++;
  if(label.shrine&&Math.abs(box.y-label.y)>2){ctx.strokeStyle=label.color+'66';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(label.x,label.y+font+12);ctx.lineTo(box.x+box.w/2,box.y+box.h);ctx.stroke();}ctx.fillStyle='#061322f2';ctx.beginPath();ctx.roundRect(box.x,box.y,box.w,box.h,label.shrine?box.h/2:5);ctx.fill();if(!label.shrine){ctx.strokeStyle=label.color+'88';ctx.lineWidth=1;ctx.stroke();}ctx.fillStyle=label.color;ctx.fillText(label.text,box.x+box.w/2,box.y+box.h/2);
 }ctx.restore();
}
function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#071625';ctx.fillRect(0,0,W,H);if(!run){drawHome();return;}ctx.save();ctx.translate(W/2+(run.shake>0?Math.sin(t*80)*3:0),H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);const left=camera.x-W/(2*camera.zoom),top=camera.y-H/(2*camera.zoom);
const forest=run.arena==='forest';
if(run.arena==='christmas')LueurArenas.christmasFloor(ctx,forestScene,{x:left,y:top,w:W/camera.zoom,h:H/camera.zoom},t,[...run.shrines,...run.route,{x:1100,y:1100}]);
else if(forest)LueurArenas.floor(ctx,forestScene,{x:left,y:top,w:W/camera.zoom,h:H/camera.zoom},t,[...run.shrines,...run.route,{x:1100,y:1100}]);
else{
// Broad pools of colour keep the playfield readable behind the small sprites.
for(const [x,y,r,c]of [[600,650,550,'#24416435'],[1700,700,500,'#43276835'],[1180,1700,600,'#125b6330']]){const gr=ctx.createRadialGradient(x,y,10,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,'#07162500');ctx.fillStyle=gr;ctx.fillRect(x-r,y-r,r*2,r*2);}
ctx.strokeStyle='#426a8606';ctx.lineWidth=1;for(let x=Math.floor(left/100)*100;x<left+W/camera.zoom;x+=100){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,2200);ctx.stroke();}for(let y=Math.floor(top/100)*100;y<top+H/camera.zoom;y+=100){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(2200,y);ctx.stroke();}
for(const s of stars){ctx.globalAlpha=.25+Math.sin(t+s.p)*.12;ellipse(s.x,s.y,s.r,s.r,'#a5c9e9');}ctx.globalAlpha=1;
ctx.strokeStyle='#b4d3ef15';ctx.setLineDash([2,14]);ctx.beginPath();for(const [i,s]of run.shrines.entries()){if(!i)ctx.moveTo(s.x,s.y);else ctx.lineTo(s.x,s.y);}ctx.closePath();ctx.stroke();ctx.setLineDash([]);
}
// Solid crystals: the same precomputed facets drive rendering and collision.
for(const rock of rocks){if(rock.x<left-90||rock.x>left+W/camera.zoom+90||rock.y<top-90||rock.y>top+H/camera.zoom+90)continue;
 ctx.save();ctx.translate(rock.x,rock.y);ctx.rotate(rock.a);const points=rock.facets,tip=[-rock.r*.18,-rock.r*.26],palette=['#5270a0','#526095','#303e70','#172b48','#263953','#7591b0'];
 ctx.fillStyle='#020b1480';ctx.beginPath();ctx.ellipse(8,rock.r*.5,rock.r,rock.r*.35,0,0,TAU);ctx.fill();
 for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];ctx.beginPath();ctx.moveTo(...tip);ctx.lineTo(...p);ctx.lineTo(...q);ctx.closePath();ctx.fillStyle=palette[i];ctx.fill();}
 ctx.strokeStyle='#9cbded66';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.stroke();
 ctx.fillStyle='#3d4b75';ctx.beginPath();ctx.moveTo(rock.r*.25,rock.r*.6);ctx.lineTo(rock.r*.85,-rock.r*.45);ctx.lineTo(rock.r*.9,rock.r*.55);ctx.closePath();ctx.fill();ctx.strokeStyle='#99bfe399';ctx.beginPath();ctx.moveTo(...points[1]);ctx.lineTo(...tip);ctx.lineTo(...points[3]);ctx.stroke();ctx.restore();if(forest)LueurArenas.crystal(ctx,rock);if(run.arena==='christmas')LueurArenas.christmasCrystal(ctx,rock);}
ctx.strokeStyle='#6b899144';ctx.lineWidth=3;ctx.strokeRect(55,55,2090,2090);
// The refuge doubles as the final portal.
const portal=run.lit===3;const rg=ctx.createRadialGradient(1100,1100,0,1100,1100,145);rg.addColorStop(0,portal?'#69e5ec35':'#6d9fba18');rg.addColorStop(1,'#7de6ff00');ctx.fillStyle=rg;ctx.fillRect(950,950,300,300);ctx.strokeStyle=portal?'#9af2e1':'#76b7cd38';ctx.lineWidth=2;ctx.beginPath();ctx.arc(1100,1100,portal?75:140,0,TAU);ctx.stroke();ctx.fillStyle=portal?'#baf8e9':'#729aaa';ctx.font='11px Manrope, sans-serif';ctx.textAlign='center';ctx.fillText(portal?'✦ CIEL RALLUMÉ':'☽ REFUGE',1100,1200);if(portal){ctx.save();ctx.translate(1100,1100);ctx.rotate(t*.25);ctx.strokeStyle='#a8ffe4';ctx.strokeRect(-38,-38,76,76);ctx.rotate(Math.PI/4);ctx.strokeRect(-38,-38,76,76);ctx.restore();}
for(const s of run.shrines){const identity={Aube:{color:'#f1d39b',sides:3},Éveil:{color:'#b9c9ff',sides:4},Horizon:{color:'#96dedc',sides:6}}[s.name],color=s.lit?'#a4e9df':identity.color;ctx.save();ctx.translate(s.x,s.y);const glow=ctx.createRadialGradient(0,0,5,0,0,125);glow.addColorStop(0,s.lit?'#74e9df33':'#e9bf6c19');glow.addColorStop(1,'#efd49a00');ctx.fillStyle=glow;ctx.fillRect(-130,-130,260,260);ctx.strokeStyle=color+'99';ctx.lineWidth=2;for(const radius of [60,90]){ctx.beginPath();ctx.arc(0,0,radius,0,TAU);ctx.stroke();}ctx.save();ctx.rotate(t*.08);ctx.strokeStyle=color+'77';ctx.beginPath();for(let i=0;i<=identity.sides;i++){const a=i/identity.sides*TAU-Math.PI/2;const x=Math.cos(a)*47,y=Math.sin(a)*47;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();ctx.restore();ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=15;ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(14,0);ctx.lineTo(0,27);ctx.lineTo(-14,0);ctx.closePath();ctx.fill();ctx.shadowBlur=0;for(let j=0;j<6;j++){const a=j/6*TAU+t*.12,rr=73;ctx.save();ctx.translate(Math.cos(a)*rr,Math.sin(a)*rr);ctx.rotate(a+t*.1);ctx.fillStyle=s.lit?'#b4eee0':'#736aab';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(6,0);ctx.lineTo(0,12);ctx.lineTo(-6,0);ctx.closePath();ctx.fill();ctx.restore();}
if(s.lit){ctx.strokeStyle='#a3e5d638';ctx.beginPath();ctx.arc(0,0,100+Math.sin(t*1.5)*5,0,TAU);ctx.stroke();}
if(s.charge>0&&!s.lit){ctx.strokeStyle='#ffe1a1';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,95,-Math.PI/2,-Math.PI/2+s.charge/C.balance.offeringDuration*TAU);ctx.stroke();}ctx.restore();}
for(const [i,point] of run.route.entries()){if(point.visited)continue;ctx.strokeStyle=waypointStyles[i].color+'66';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(point.x,point.y,42,0,TAU);ctx.stroke();ctx.strokeStyle=waypointStyles[i].color+'22';ctx.beginPath();ctx.arc(point.x,point.y,53,0,TAU);ctx.stroke();}
drawFragments();
for(const m of run.motes){if(m.x<left-10||m.x>left+W/camera.zoom+10||m.y<top-10||m.y>top+H/camera.zoom+10)continue;const a=.7+Math.sin(t*2+m.phase)*.25;ctx.globalAlpha=a;ellipse(m.x,m.y,m.r*3,m.r*3,'#eeca7d12');ellipse(m.x,m.y,m.r,m.r,'#f6d78f');}ctx.globalAlpha=1;
for(const e of run.enemies){if(Math.abs(e.x-camera.x)>W/camera.zoom/2+100||Math.abs(e.y-camera.y)>H/camera.zoom/2+100)continue;const r=C.radius(e.mass);ctx.strokeStyle=B.shielded(e)?'#8ff5ff88':e.kind==='sentinel'?'#ffbf7a99':B.weaker(run.player,e)?'#9cf0c455':'#ffa8c088';ctx.lineWidth=1.5/camera.zoom;ctx.beginPath();ctx.arc(e.x,e.y,r,0,TAU);ctx.stroke();ctx.save();ctx.globalAlpha=e.kind==='wisp'?.8:1;drawArenaCreature(e.x,e.y,r*visualGrowth(e),e.kind==='wisp'?'wisp':'umbra',e.angle);ctx.restore();
if(B.shielded(e)){ctx.fillStyle='#6ceaff22';ctx.strokeStyle='#8ff5ffbb';ctx.lineWidth=2/camera.zoom;ctx.beginPath();ctx.arc(e.x,e.y,r+6,0,TAU);ctx.fill();ctx.stroke();}
if(e.kind==='sentinel'){ctx.strokeStyle='#ffbf7a';ctx.lineWidth=2/camera.zoom;ctx.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6-Math.PI/2;const x=e.x+Math.cos(a)*r*1.15,y=e.y+Math.sin(a)*r*1.15;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();}
if(e.windup>0){ctx.strokeStyle='#f8a5b5';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.lockAngle)*145,e.y+Math.sin(e.lockAngle)*145);ctx.stroke();}}
for(const ring of run.rings){ctx.globalAlpha=ring.life/2;ctx.strokeStyle='#e8d7a8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ring.x,ring.y,90+(2-ring.life)*160,0,TAU);ctx.stroke();}ctx.globalAlpha=1;for(const q of run.particles){ctx.globalAlpha=Math.min(1,q.life*2);ellipse(q.x,q.y,2,2,q.color);}ctx.globalAlpha=1;
const p=run.player,pr=C.radius(p.mass);if(p.invincible>0||run.power>0){ctx.strokeStyle=p.invincible>0?'#a9e9ed88':'#eddaaa99';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,pr*1.45,0,TAU);ctx.stroke();}drawArenaCreature(p.x,p.y,pr*visualGrowth(p),profile.selected,p.angle,profile.skin);drawAbsorbFX();ctx.restore();
// Navigate only to pending exploration goals, then the nearest unlit shrine.
const markerBoxes=[];
const pending=run.route.map((point,i)=>({...point,waypoint:i})).filter(point=>!point.visited);
const targets=run.lit===3?[]:!C.stageReady(run)&&pending.length?pending:run.shrines.filter(s=>!s.lit).sort((a,b)=>dist(a,run.player)-dist(b,run.player)).slice(0,1);
for(const target of targets){
 const x=(target.x-camera.x)*camera.zoom+W/2,y=(target.y-camera.y)*camera.zoom+H/2;
 const visible=x>24&&x<W-24&&y>24&&y<H-24;
 if(visible){if(target.waypoint!==undefined&&y>175&&y<H-155&&Math.hypot(x-W/2,y-H/2)>85)drawWaypoint(x,y,target.waypoint,markerBoxes);continue;}
 const edge=R.edgePoint(x-W/2,y-H/2,W,H),style=target.waypoint!==undefined?waypointStyles[target.waypoint]:{color:'#efd49a',number:'◇'};
 const box={x:edge.x-22,y:edge.y-22,w:44,h:44};
 if(markerBoxes.some(b=>R.overlaps(box,b)))continue;
 ctx.save();ctx.translate(edge.x,edge.y);ctx.fillStyle='#071827ee';ctx.strokeStyle=style.color+'88';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-13,-13,26,26,8);ctx.fill();
 ctx.rotate(edge.angle);ctx.fillStyle=style.color;ctx.beginPath();ctx.moveTo(21,0);ctx.lineTo(11,-6);ctx.lineTo(14,0);ctx.lineTo(11,6);ctx.closePath();ctx.fill();ctx.rotate(-edge.angle);
 ctx.font='700 11px Manrope,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(style.number,0,0);ctx.restore();markerBoxes.push(box);
}
drawArenaLabels(markerBoxes);drawMap();}
function drawMap(){map.clearRect(0,0,120,120);map.fillStyle='#7593b4';map.beginPath();map.arc(60,60,3,0,TAU);map.fill();for(const s of run.shrines){map.fillStyle=s.lit?'#9aeadc':'#efd49a';map.fillRect(s.x/worldSize*120-3,s.y/worldSize*120-3,6,6);}for(const p of run.route){if(!p.visited){map.fillStyle='#b4edff';map.fillRect(p.x/worldSize*120-2,p.y/worldSize*120-2,4,4);}}map.fillStyle='#a5e9ff';map.beginPath();map.arc(run.player.x/worldSize*120,run.player.y/worldSize*120,3,0,TAU);map.fill();}
function frame(now){const dt=Math.min((now-last)/1000,.045);last=now;t+=dt;if(state==='playing'&&!paused)update(dt);draw();requestAnimationFrame(frame);}refreshHome();checkChallenges();addEventListener('pagehide',save);if(recurring)setInterval(()=>{checkChallenges();if(currentPanel==='challenges')showChallenges();},30000);requestAnimationFrame(frame);
})();
