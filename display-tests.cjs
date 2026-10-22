const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const elements=new Map(),events={},props={};
const el=id=>{if(!elements.has(id))elements.set(id,{style:{},textContent:'',innerHTML:'',open:false,showModal(){this.open=true}});return elements.get(id)};
const root={style:{setProperty:(k,v)=>props[k]=v}},document={documentElement:root,getElementById:el,addEventListener:(k,f)=>events[k]=f};
const viewport={height:800,scale:1,addEventListener:(k,f)=>events['visual:'+k]=f};
const sandbox={document,innerHeight:800,addEventListener:(k,f)=>events[k]=f,window:{visualViewport:viewport}};
vm.runInNewContext(fs.readFileSync('dist/display.js','utf8'),sandbox);
(async()=>{
 assert.equal(props['--view-height'],'800px');viewport.height=680;events['visual:resize']();assert.equal(props['--view-height'],'680px');
 viewport.scale=2;viewport.height=340;events['visual:resize']();assert.equal(props['--view-height'],'680px');viewport.scale=1;
 el('options').onclick();assert(el('modal').open);assert.equal(el('fullscreen-toggle').textContent,'Plein écran');
 await el('fullscreen-toggle').onclick();assert.match(el('fullscreen-status').textContent,/indisponible/);
 root.requestFullscreen=async()=>{document.fullscreenElement=root};await el('fullscreen-toggle').onclick();assert.equal(el('fullscreen-toggle').textContent,'Quitter le plein écran');
 document.exitFullscreen=async()=>{document.fullscreenElement=null};await el('fullscreen-toggle').onclick();assert.equal(el('fullscreen-toggle').textContent,'Plein écran');
 root.requestFullscreen=async()=>{throw new Error('denied')};await el('fullscreen-toggle').onclick();assert.match(el('fullscreen-status').textContent,/refusé/);
 console.log('OK affichage — hauteur dynamique, zoom conservé, options, entrée/sortie plein écran, absence API et refus navigateur.');
})().catch(e=>{console.error(e);process.exitCode=1});
