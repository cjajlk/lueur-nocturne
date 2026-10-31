/* Hold one browser lock for the whole page lifetime, including pauses. */
(()=>{'use strict';const key='lueur-nocturne-v1';
function blocked(message){document.body.replaceChildren();const box=document.createElement('main');box.style.cssText='padding:32px;max-width:600px;margin:auto;color:#f4edcd;font:18px system-ui';const text=document.createElement('p');text.textContent=message;const button=document.createElement('button');button.textContent='Réessayer';button.onclick=()=>location.reload();box.append(text,button);document.body.append(box);}
if(!navigator.locks){blocked('Ce navigateur ne permet pas de protéger la sauvegarde. Ouvre le jeu dans un navigateur récent en HTTPS.');return;}
navigator.locks.request('lueur-nocturne-save-writer',{ifAvailable:true},async lock=>{if(!lock){blocked('Lueur Nocturne est déjà ouvert dans un autre onglet. Ferme cet onglet avant de reprendre ici.');return;}
let snapshot,revoked=false;try{snapshot=localStorage.getItem(key);}catch{blocked('La sauvegarde est inaccessible. Autorise le stockage puis réessaie.');return;}
window.LueurSession={write(raw){if(revoked||localStorage.getItem(key)!==snapshot){revoked=true;location.reload();throw Error('Save conflict');}localStorage.setItem(key,raw);snapshot=raw;},snapshot:()=>snapshot};
const script=document.createElement('script');script.src='game.js?v=1.0-rare';script.onload=()=>{const display=document.createElement('script');display.src='display.js?v=key-mobile-v2';document.body.append(display);};document.body.append(script);
await new Promise(()=>{});
}).catch(()=>blocked('Impossible de protéger cette session. Recharge le jeu.'));
})();
