/* Display only: no profile, economy or game state changes. */
(()=>{'use strict';
 const root=document.documentElement,modal=document.getElementById('modal'),body=document.getElementById('modal-body');
 function viewport(){const view=window.visualViewport;if(!view||Math.abs(view.scale-1)<.01)root.style.setProperty('--view-height',`${view?view.height:innerHeight}px`);}
 addEventListener('resize',viewport);window.visualViewport?.addEventListener('resize',viewport);document.addEventListener('fullscreenchange',()=>{viewport();label();});viewport();
 function label(){const b=document.getElementById('fullscreen-toggle');if(b)b.textContent=document.fullscreenElement?'Quitter le plein écran':'Plein écran';}
 document.getElementById('options').onclick=()=>{
  body.innerHTML='<h2>Options et commandes</h2><p class="sub"><b>PC</b> · Souris ou ZQSD / WASD / flèches pour se déplacer. <b>Espace : utiliser le pouvoir</b> sans interrompre le guidage à la souris. Échap : pause.<br><b>Mobile</b> · Joystick à gauche, bouton du pouvoir à droite.</p><p class="sub">Joue en portrait ou en paysage. Le jeu s’adapte à la place disponible.</p><div class="actions"><button class="primary" id="fullscreen-toggle">Plein écran</button></div><p class="sub" id="fullscreen-status" role="status">Le plein écran dépend de ton navigateur. Tu peux le quitter avec Échap ou les commandes du téléphone.</p>';
  if(!modal.open)modal.showModal();label();body.scrollTop=0;
  document.getElementById('fullscreen-toggle').onclick=async()=>{
   const status=document.getElementById('fullscreen-status');
   try{if(document.fullscreenElement)await document.exitFullscreen();else if(root.requestFullscreen&&document.fullscreenEnabled!==false)await root.requestFullscreen();else throw new Error('unavailable');status.textContent=document.fullscreenElement?'Plein écran activé.':'Affichage adapté à la fenêtre du navigateur.';}
   catch{status.textContent='Plein écran indisponible ou refusé par le navigateur. Le jeu reste adapté à la fenêtre.';}label();viewport();
  };
 };
})();
