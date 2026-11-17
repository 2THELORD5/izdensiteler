(() => {
 'use strict';
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),canvas=$('#film'),chapters=all('.chapter'),copies=all('.copy');
 const metrics={errors:[],paints:0,longTasks:[],cls:0,mode:'native-master-frames',ready:false};window.__nacre={metrics};const bubbleEngine=createPurchaseBubble($('#bubble-render'));
 try{new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)metrics.cls+=e.value;})).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>list.getEntries().forEach(e=>{metrics.longTasks.push(Math.round(e.duration));if(metrics.longTasks.length>100)metrics.longTasks.shift();})).observe({type:'longtask',buffered:true});}catch(_){}
 let worker=null,engine=null,positions=[],heights=[],vh=innerHeight,cur=0,target=0,raf=0,lastTime=0,lastFrame=-1,lastChapter=-1,lastW=innerWidth,resizeTimer,lastDaylight=false,footerStart=0,lastDisplayY=-1;
 const boundaries=[0,121,241,361,556,556],labels=['Kaydırarak keşfet','Nesne','Kompozisyon','Yüzeyin altında','Seninle'];
 function receive(data){if(data.type==='warmed'){openVeil();return;}if(data.type==='error'){metrics.errors.push(data.message);return;}if(data.type==='paint'){Object.assign(metrics,data);metrics.paints++;if(!metrics.ready)metrics.firstSharpFrame=performance.now();metrics.ready=true;canvas.classList.add('ready');document.body.classList.add('film-loaded');}}
 // 20-oct: el velo no se abre hasta tener 30 fotogramas repartidos por la pelicula (o 9 s). Antes se podia tocar a los 0,6 s
 // y el primer deslizamiento caia en huecos: tirones de 300 ms. Alex: 'tengo que estar unos segundos hasta que va smooth'.
 let veilOpen=false;function openVeil(){if(veilOpen)return;veilOpen=true;document.documentElement.classList.add('film-ready');}
 setTimeout(openVeil,3500);
 function post(data){if(worker)worker.postMessage(data);else if(engine){if(data.type==='frame')engine.frame(data.index);else engine.configure(data);}}
 function measure(){
  vh=innerHeight;positions=chapters.map(el=>el.offsetTop);heights=chapters.map(el=>el.offsetHeight);positions.push(positions[4]+Math.max(1,heights[4]-vh)*.65);footerStart=$('.footer').offsetTop;lastDisplayY=-1;
  const mobile=innerWidth<=900&&innerHeight>innerWidth,dpr=Math.min(devicePixelRatio||1,2),saveData=!!navigator.connection?.saveData;
  const tier=mobile?'portrait':'wide'; /* izden: no packed retina on mirror */
  const maxWidth=mobile?1080:tier==='retina'?3840:1920,maxHeight=mobile?1920:maxWidth*9/16;
  const ratio=Math.min(dpr,maxWidth/innerWidth,maxHeight/innerHeight);
  metrics.variant=tier;metrics.canvas=[Math.round(innerWidth*ratio),Math.round(innerHeight*ratio)];
  // Draw native-size textures once. The compositor handles cover; no per-frame CPU resampling.
  const config={type:worker?'resize':'configure',tier:mobile?'portrait-crisp-v32':tier==='retina'?'wide':tier,retina:false,sharpOnly:mobile,restTier:'wide',motionWidth:mobile?1080:1920,motionHeight:mobile?1920:1080,preview:mobile?'portrait-preview':'wide-preview',width:tier==='retina'?3840:mobile?1080:1920,height:tier==='retina'?2160:mobile?1920:1080,base:new URL('assets/film-v7/',document.baseURI).href,saveData:saveData||reduced.matches};
  return config;
 }
 function arrival(y){return clamp((y-(positions[4]-vh))/(vh*1.05));}
 function filmFrame(y){
  const arrivalStart=positions[4]-vh;
  // Landscape: the bubble canvas covers the arrival and paints its own recovery 556->484, so the film rests at 556.
  if(y>=arrivalStart){if(window.__nacre.bubbleOwnsArrival&&!reduced.matches)return 556;const p=arrival(y),e=p*p*(3-2*p);return 556-e*72;}
  let k=0;while(k<3&&y>=positions[k+1])k++;
  const end=k===3?arrivalStart:positions[k+1];
  return boundaries[k]+clamp((y-positions[k])/Math.max(1,end-positions[k]))*(boundaries[k+1]-boundaries[k]);
 }
 function display(y){
  // Read sticky geometry before any style/class writes, also on short screens.
  const mobile=innerWidth<=900&&innerHeight>innerWidth;
  const footerOffset=mobile?Math.min(0,chapters[4].querySelector('.scene-content').getBoundingClientRect().top):0;
  let active=0;while(active<4&&y+vh*.25>=positions[active+1])active++;
  if(active!==lastChapter){all('.chapter-nav a').forEach((a,i)=>a.setAttribute('aria-current',String(i===active)));$('#chapter-number').textContent=String(active+1).padStart(2,'0')+' / 05';$('#chapter-label').textContent=labels[active];document.body.classList.toggle('underwater',active>=3);lastChapter=active;}
  document.body.classList.toggle('in-boutique',y+vh*.5>=positions[4]);
  const p=arrival(y);window.__nacre.arrival=p;
  document.body.classList.toggle('final-product',p>=.99&&cur<=485);
  const purchase=clamp((p-.6)/.35);
  document.body.style.setProperty('--purchase-opacity',String(purchase));
  document.body.style.setProperty('--purchase-enter',reduced.matches?'0px':((1-purchase)*28)+'px');
  document.body.style.setProperty('--purchase-scale',String(reduced.matches?1:.97+purchase*.03));

  document.body.classList.toggle('at-footer',y+vh>=footerStart+100);
  $('#progress').style.transform='scaleX('+clamp(y/positions[5])+')';
  document.body.style.setProperty('--world-offset',footerOffset+'px');
  bubbleEngine.frame(p);
  copies.forEach((copy,i)=>{
   const relative=(y-positions[i])/vh;
   const entering=clamp((relative+.55)/.35),exitStart=heights[i]/vh-1,leaving=i===4?1:1-clamp((relative-exitStart)/.4);
   const opacity=i===4?String(reduced.matches?1:clamp((p-.6)/.35)):reduced.matches?'1':String(entering*leaving),transform='none',inert=i===4?p<.95:entering*leaving<.05;
   if(copy.style.opacity!==opacity)copy.style.opacity=opacity;
   if(copy.style.transform!==transform)copy.style.transform=transform;
   if(copy.inert!==inert)copy.inert=inert;
  });
 }
 function tick(now){
  const dt=lastTime?Math.min(now-lastTime,50):16.7;lastTime=now;
  const y=(window.__lenis&&typeof window.__lenis.scroll==='number')?window.__lenis.scroll:scrollY;target=filmFrame(y);if(y!==lastDisplayY){display(y);lastDisplayY=y;}
  if(reduced.matches)target=[0,180,300,445,484][Math.max(0,lastChapter)];
  cur=reduced.matches?target:cur+(target-cur)*(1-Math.exp(-dt/(matchMedia('(pointer:coarse)').matches?16:32)));
  if(Math.abs(cur-target)<.08)cur=target;
  const frame=Math.round(cur);metrics.requestedFrame=frame;
  const daylight=frame>=330&&frame<410;if(daylight!==lastDaylight){document.body.classList.toggle('daylight',daylight);lastDaylight=daylight;}
  if(frame!==lastFrame){post({type:'frame',index:frame});lastFrame=frame;}
  if(Math.abs(cur-target)>.04||document.body.classList.contains('scrolling'))raf=requestAnimationFrame(tick);else{raf=0;lastTime=0;}
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(tick);}
 async function start(){
  const config=measure();
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='native-film-v37.js?v=37';s.onload=resolve;s.onerror=reject;document.head.append(s);});
  engine=createNativeFilmEngine(canvas,receive);engine.configure(config);metrics.worker=typeof Worker!=='undefined';metrics.mode='packed-worker-v37';
  cur=target=filmFrame(scrollY);lastFrame=-1;schedule();
 }
 let glassRestTimer;
 addEventListener('scroll',()=>{document.body.classList.add('scrolling');clearTimeout(glassRestTimer);glassRestTimer=setTimeout(()=>document.body.classList.remove('scrolling'),220);schedule();},{passive:true});
 addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const widthChange=innerWidth!==lastW;lastW=innerWidth;if(widthChange||Math.abs(innerHeight-vh)>150){post(measure());lastFrame=-1;}else{vh=innerHeight;positions=chapters.map(el=>el.offsetTop);positions.push(positions[4]+Math.max(1,chapters[4].offsetHeight-vh)*.65);footerStart=$('.footer').offsetTop;}schedule();},180);},{passive:true});
 reduced.addEventListener?.('change',()=>{post(measure());schedule();});
 all('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=$(a.getAttribute('href'));if(el){e.preventDefault();const behavior=reduced.matches?'instant':'smooth';if(el.id==='boutique')scrollTo({top:el.offsetTop+innerHeight*.055,behavior});else el.scrollIntoView({behavior,block:'start'});history.replaceState(null,'',a.getAttribute('href'));}}));
 const menu=$('#mobile-menu'),menuToggle=$('#menu-toggle');
 function closeMenu(){menu.hidden=true;menuToggle.setAttribute('aria-expanded','false');}
 menuToggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuToggle.setAttribute('aria-expanded',String(!menu.hidden));});
 menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
 addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 all('[data-select-size]').forEach(a=>a.addEventListener('click',()=>$('.size[data-size="'+a.dataset.selectSize+'"]').click()));
 $('.footer-bag').addEventListener('click',()=>$('.bag-toggle').click());
 start().catch(e=>metrics.errors.push(e.message));
 // izden: Lenis smooth scroll for professional scrub feel
 if(window.Lenis && !reduced.matches){
  const lenis=new Lenis({lerp:matchMedia('(pointer:coarse)').matches?.09:.08,wheelMultiplier:1.05,touchMultiplier:1.25,syncTouch:true,syncTouchLerp:.08,touchInertiaMultiplier:1.4,smoothWheel:true,normalizeWheel:true});
  window.__lenis=lenis;
  lenis.on('scroll',()=>{document.body.classList.add('scrolling');clearTimeout(glassRestTimer);glassRestTimer=setTimeout(()=>document.body.classList.remove('scrolling'),240);schedule();});
  (function loop(t){lenis.raf(t);requestAnimationFrame(loop);})(performance.now());
  // anchor clicks via lenis
  all('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{const el=$(a.getAttribute('href'));if(!el)return;e.preventDefault();const top=el.id==='boutique'?el.offsetTop+innerHeight*.055:el.offsetTop;lenis.scrollTo(top,{duration:1.35,easing:t=>1-Math.pow(1-t,3)});history.replaceState(null,'',a.getAttribute('href'));},{capture:true});});
 }

 // v33: asa para grabar la tarjeta de ascentastudio.com sin fotogramas atrasados. El scroll se suaviza (tau 65 ms) y los
 // fotogramas llegan cuando llegan: listo() = la pelicula ya pinta el fotograma exacto a resolucion completa y la burbuja tambien.
 window.__film={listo(){return Math.abs(cur-target)<.08&&metrics.frame===Math.round(target)&&metrics.exact!==false&&(!bubbleEngine.listo||bubbleEngine.listo());}};
 // The bag is an honest concept interaction. No fake payment, claims or shipping flow.
 const bag=$('#bag'),prices={50:145,100:195};let selected=50,items={};
 try{const saved=JSON.parse(localStorage.getItem('nacre-bag-v7')||'{}');for(const size of [50,100])if(Number.isInteger(saved[size])&&saved[size]>0)items[size]=Math.min(saved[size],20);}catch(_){}
 function persist(){try{localStorage.setItem('nacre-bag-v7',JSON.stringify(items));}catch(_){}renderBag();}
 function renderBag(){
  const count=Object.values(items).reduce((sum,n)=>sum+n,0);$('.bag-count').textContent=count||'';$('.bag-toggle').setAttribute('aria-label','Open your bag'+(count?', '+count+' items':''));
  if(!count){$('#bag-content').innerHTML='<p class="bag-empty">Your next quiet moment awaits.</p>';return;}
  let total=0;$('#bag-content').innerHTML=Object.entries(items).map(([size,n])=>{total+=prices[size]*n;return '<div class="bag-item"><img src="assets/product-native-v6.webp" alt="Sedef parfüm şişesi"><div><h3 >Sedef</h3><p>Eau de parfum · '+size+' ml</p><span>€'+prices[size]+'</span><div class="quantity"><button data-change="-1" data-volume="'+size+'" aria-label="Remove one '+size+' ml bottle">−</button><span>'+n+'</span><button data-change="1" data-volume="'+size+'" aria-label="Add one '+size+' ml bottle">+</button></div></div></div>';}).join('')+'<div class="bag-total"><span>Selection total</span><span>€'+total+'</span></div>';
 }
 all('.size').forEach(button=>button.addEventListener('click',()=>{selected=Number(button.dataset.size);all('.size').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('#volume').textContent=selected;$('#price').textContent='€'+prices[selected];$('#button-price').textContent='€'+prices[selected];$('#quick-price').textContent='€'+prices[selected];$('#quick-volume').textContent=selected;$('#add').setAttribute('aria-label','Sedef ekle '+selected+' ml to bag for €'+prices[selected]);}));
 $('#quick-add').addEventListener('click',()=>addToBag($('#quick-add')));
 const purchaseObserver=new IntersectionObserver(entries=>{document.body.classList.toggle('purchase-visible',entries[0].isIntersecting);},{threshold:.2});purchaseObserver.observe($('#add'));
 let toastTimer,bagTimer,flight=null,returnFocus=null;
 function openBag(){
  clearTimeout(bagTimer);renderBag();if(bag.open)return;
  bag.showModal();document.body.style.overflow='hidden';
  if(!reduced.matches)bag.animate([{transform:'translateX(100%)',opacity:.4},{transform:'translateX(0)',opacity:1}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});
 }
 function addToBag(source){
  const previous=items[selected]||0,added=previous<20;
  items[selected]=Math.min(20,previous+1);persist();returnFocus=source;
  $('.toast').textContent=added?'Sedef · '+selected+' ml added to your bag':'Your bag already holds 20 bottles of this size';
  $('.toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),2300);
  clearTimeout(bagTimer);flight?.remove();flight=null;
  if(reduced.matches||!added){openBag();return;}
  const from=source.getBoundingClientRect(),to=$('.bag-toggle').getBoundingClientRect();
  const x=clamp(from.left+from.width/2,44,innerWidth-44),y=clamp(from.top+from.height/2,90,innerHeight-44),dx=to.left+to.width/2-x,dy=to.top+to.height/2-y;
  const dot=document.createElement('div');dot.className='bag-flight';dot.setAttribute('aria-hidden','true');
  const photo=document.createElement('img');photo.src='assets/product-native-v6.webp';photo.alt='';dot.append(photo);dot.style.left=x+'px';dot.style.top=y+'px';document.body.append(dot);flight=dot;
  const animation=dot.animate([
   {transform:'translate(-50%,-50%) scale(.5)',opacity:0},
   {transform:'translate(-50%,-90%) scale(1)',opacity:1,offset:.16},
   {transform:'translate(calc(-50% + '+dx*.35+'px),calc(-50% + '+(dy*.65-45)+'px)) scale(.8)',opacity:1,offset:.58},
   {transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(.12)',opacity:.2}
  ],{duration:700,easing:'cubic-bezier(.3,.65,.25,1)',fill:'forwards'});
  animation.onfinish=()=>{dot.remove();if(flight===dot)flight=null;};
  source.animate([{boxShadow:'0 0 0 0 #e0fff0aa'},{boxShadow:'0 0 0 16px #e0fff000'}],{duration:500,easing:'ease-out'});
  bagTimer=setTimeout(()=>{if(!reduced.matches)$('.bag-toggle').animate([{transform:'scale(1)'},{transform:'scale(1.22)'},{transform:'scale(1)'}],{duration:340});openBag();},680);
 }
 $('#add').addEventListener('click',()=>addToBag($('#add')));
 function closeBag(){clearTimeout(bagTimer);bag.close();document.body.style.overflow='';if(returnFocus){returnFocus.focus({preventScroll:true});returnFocus=null;}}
 $('.bag-toggle').addEventListener('click',()=>{returnFocus=$('.bag-toggle');openBag();});$('.close').addEventListener('click',closeBag);$('#continue').addEventListener('click',closeBag);bag.addEventListener('cancel',e=>{e.preventDefault();closeBag();});bag.addEventListener('close',()=>document.body.style.overflow='');bag.addEventListener('click',e=>{if(e.target===bag&&e.clientX<bag.getBoundingClientRect().left)closeBag();});
 $('#bag-content').addEventListener('click',e=>{const b=e.target.closest('[data-change]');if(!b)return;const size=b.dataset.volume;items[size]=clamp((items[size]||0)+Number(b.dataset.change),0,20);if(!items[size])delete items[size];persist();});renderBag();
})();
