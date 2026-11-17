/* v25: landscape shows a composited film (master frame + glass bubble + purchase painted inside it) on a canvas.
   Same clock as the film (eased toward the scroll, tau 65 ms), compressed frames fetched ahead coarse-to-fine, a small
   window decoded off the main thread. Measured on v24 (tools/bench_bubble.py): 12 image changes in the whole arrival,
   ~5 frames per jump, a 161 ms freeze on the first pass. The real buttons sit invisible over the painted ones.
   v29 adds a dedicated portrait composition, a seek-safe contact meniscus and accessible hit targets. */
function createPurchaseBubble(image){
 // v27: the 96 instants are spread by how much the picture changes (animation/burbuja-3d/instantes.json): more where the
 // bubble rises fast, so each step changes about as much as one film frame (v26 measured steps of 12 vs the film's 3.3).
 const ADAPT=[0,0.02612,0.05216,0.06626,0.07678,0.08781,0.10218,0.11175,0.12135,0.13104,0.14059,0.15003,0.15934,0.16861,0.17598,0.18315,0.19064,0.19839,0.20572,0.21225,0.21878,0.2252,0.23158,0.23808,0.24555,0.25301,0.25978,0.26641,0.27303,0.2796,0.28617,0.292,0.29751,0.30302,0.30869,0.31446,0.32024,0.32578,0.33123,0.33667,0.34182,0.34674,0.35167,0.35658,0.36138,0.36618,0.37099,0.37566,0.38025,0.38485,0.38944,0.39499,0.40063,0.40627,0.41138,0.41644,0.4215,0.42693,0.43267,0.4384,0.44379,0.44895,0.45411,0.45954,0.46551,0.47149,0.47747,0.48344,0.48941,0.49506,0.50054,0.50601,0.51279,0.52063,0.52803,0.53473,0.54143,0.54985,0.55856,0.56798,0.57757,0.58781,0.60168,0.62047,0.6412,0.66468,0.69175,0.724,0.76155,0.79963,0.83104,0.86016,0.89008,0.92266,0.9601,1];
 const P=ADAPT;window.__nacre.bubbleTable=P;
 const N=P.length,TAU=matchMedia('(pointer:coarse)').matches?12:28;
 // scroll progress -> fractional frame index on that table
 function idxOf(p){if(p<=0)return 0;if(p>=1)return N-1;let lo=0,hi=N-1;while(hi-lo>1){const m=(lo+hi)>>1;if(P[m]<=p)lo=m;else hi=m;}return lo+(p-P[lo])/(P[hi]-P[lo]);}
 // Painted boxes in the 1920x1080 canvas (animation/burbuja-3d/layout.json).
 const HITS={50:{x:1320,y:614,w:81,h:42},100:{x:1410,y:614,w:87,h:42},add:{x:1320,y:674,w:360,h:52}};
 const portrait=matchMedia('(max-width:900px) and (orientation:portrait)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let mode=portrait.matches?'mobile':'wide',W=portrait.matches?1080:1920,H=portrait.matches?1920:1080;
 const MOBILE_HITS={50:{x:166,y:1350,w:203.1875,h:124},100:{x:393.1875,y:1350,w:220.734375,h:124},add:{x:166,y:1500,w:748,h:134}};
 const canvas=document.createElement('canvas');canvas.id='bubble-canvas';canvas.setAttribute('aria-hidden','true');image.after(canvas);
 const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
 const nativeHost=document.createElement('div');nativeHost.id='bubble-native';canvas.after(nativeHost);let viewportWidth=innerWidth;
 const state=window.__nacre;state.bubbleOwnsArrival=true;
 let size=50,closed=false,hits=null,targetP=0,shownP=0,lastTime=0,raf=0,pan=.5,drawn='',direction=1,started=false,sized=false;
 const blobs=new Map(),fetching=new Map(),bitmaps=new Map(),decoding=new Map(),queued=new Set();
 const decodeJobs=new Map();let decodeId=0;
 const decodeWorker=typeof Worker!=='undefined'?new Worker(new URL('native-film-v37.js',document.baseURI)):null;
 if(decodeWorker)decodeWorker.onmessage=({data})=>{const job=decodeJobs.get(data.id);if(!job){data.bitmap?.close();return;}decodeJobs.delete(data.id);if(data.error)job.reject(Error(data.error));else job.resolve(data.bitmap);};
 const pad=i=>String(i).padStart(2,'0');
 const key=(s,i)=>mode+':'+s+':'+i,finalKey=s=>key(s,'final');
 const big=()=>Math.max(innerWidth,innerHeight*16/9)*(devicePixelRatio||1)>2300;
 // v28: motion frames are JPEG (8 ms to decode in Chromium vs 19 ms for WebP, measured); the rest frame is its own
 // render: 4K WebP on dense screens, 1920 JPEG q95 4:4:4 elsewhere.
 const url=k=>{const [m,s,i]=k.split(':');const base=m==='mobile'?'assets/purchase-bubble-mobile-v30/':'assets/purchase-bubble-v30/';return base+(i==='final'?(m==='wide'&&big()?'final-'+s+'-3840.webp':'final-'+s+'-1920.jpg'):s+'/'+pad(i)+'.jpg')+'?v=40';};
 // Coarse to fine: a fast scroll always finds a near frame instead of waiting for the next one in line.
 const order=(()=>{const o=[0,N-1];for(const st of [8,4,2,1])for(let i=0;i<N;i+=st)if(!o.includes(i))o.push(i);return o;})();
 let active=0;
 async function fetchFrame(k){
  for(let attempt=0;attempt<3;attempt++){
   try{const r=await fetch(url(k),{priority:targetP>0?'high':'low'});if(!r.ok)throw new Error(r.status+' '+url(k));return await r.blob();}
   catch(e){if(attempt===2)throw e;await new Promise(resolve=>setTimeout(resolve,150*(attempt+1)));}
  }
 }
 function pumpFetch(){
  while(active<4&&queued.size){const k=queued.values().next().value;queued.delete(k);if(blobs.has(k)||fetching.has(k))continue;active++;
   const job=fetchFrame(k)
    .then(b=>{blobs.set(k,b);need();}).catch(e=>state.metrics.errors.push('Bubble: '+e.message))
    .finally(()=>{fetching.delete(k);active--;pumpFetch();});
   fetching.set(k,job);}
 }
 function prefetch(s){for(const i of order)queued.add(key(s,i));pumpFetch();}
 function start(){if(started===mode||closed)return;started=mode;resize();prefetch(size);
  // the other size after, quietly, so switching never waits
  const other=size===50?100:50;queued.add(finalKey(other));pumpFetch();}
 // Decoded window: ahead in the scroll direction, a few behind, plus the 4K rest frame when it is close.
 // Decoded window, in priority order: the next frames the eased index will pass, then where the scroll is heading,
 // then further ahead, then a few behind. Measured on v27: a fast fling moves ~11 frames per wheel notch in the rise,
 // more than the old 9-frame window, so it froze 366 ms on frame 21 and then jumped to 85.
 function wanted(){
  const i=Math.round(idxOf(shownP)),t=Math.round(idxOf(targetP)),d=direction,w=new Set();
  const add=j=>{if(j>=0&&j<N)w.add(key(size,j));};
  for(let n=0;n<=4;n++)add(i+n*d);
  for(let n=-2;n<=2;n++)add(t+n);
  const far=portrait.matches?6:10;for(let n=5;n<=far;n++)add(i+n*d);
  for(let n=1;n<=3;n++)add(i-n*d);
  if(targetP>.8)w.add(finalKey(size));
  return w;
 }
 function decode(blob,k){
  if(decodeWorker)return new Promise((resolve,reject)=>{const id=++decodeId;decodeJobs.set(id,{resolve,reject});decodeWorker.postMessage({type:'decode-bubble',blob,id});});
  return createImageBitmap(blob);
 }
 function need(){
  if(closed)return;const w=wanted();
  if(w.has(finalKey(size))&&!blobs.has(finalKey(size))&&!fetching.has(finalKey(size))){queued.add(finalKey(size));pumpFetch();}
  for(const [k,b] of bitmaps)if(!w.has(k)&&k!==drawn&&b.parentNode!==nativeHost){b.close?.();bitmaps.delete(k);}
  let running=decoding.size;
  for(const k of w){
   if(running>=4)break;if(bitmaps.has(k)||decoding.has(k))continue;
   const blob=blobs.get(k);if(!blob){if(!fetching.has(k)){queued.add(k);pumpFetch();}continue;}
   running++;
   decoding.set(k,decode(blob,k).then(b=>{if(closed||!wanted().has(k)){b.close?.();return;}bitmaps.set(k,b);schedule();})
    .catch(e=>state.metrics.errors.push('Bubble decode: '+e.message)).finally(()=>{decoding.delete(k);need();}));
  }
 }
 function pick(){
  const exact=idxOf(shownP),i=Math.round(exact);
  if(shownP>=.999&&targetP>=.999&&bitmaps.has(finalKey(size)))return finalKey(size);
  if(bitmaps.has(key(size,i)))return key(size,i);
  let best=null,dist=1e9;for(const k of bitmaps.keys()){const [m,s,j]=k.split(':');if(m!==mode||s!==String(size)||j==='final')continue;const d=Math.abs(Number(j)-exact);if(d<dist){dist=d;best=k;}}
  if(dist<=3.5)return best;
  // Never freeze waiting for the exact frame: step to whatever decoded frame is nearer than the one on screen.
  const now=drawn&&drawn.startsWith(mode+':'+size+':')&&!drawn.endsWith(':final')?Math.abs(Number(drawn.split(':')[2])-exact):1e9;
  return best&&dist<now?best:null;
 }
 // Motion paints into a backing no larger than the 1920 frames (the compositor scales it, like the film's motion tier);
 // only the rest frame gets the full device resolution for the 4K still.
 let full=false;
 function resize(){
  const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return false;viewportWidth=r.width;
  const dpr=devicePixelRatio||1,ratio=full?Math.min(dpr,2,(portrait.matches?1080:3840)/r.width):Math.min(dpr,W/r.width);
  const w=Math.round(r.width*ratio),h=Math.round(r.height*ratio);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;drawn='';}
  sized=true;return true;
 }
 function panAt(p){const t=Math.min(1,Math.max(0,p/.6)),e=t*t*(3-2*t);return .5+(pan-.5)*e;}
 // Portrait eases from the film's exact cover crop to a complete, readable vertical bubble.
 function placement(p,w,h){
  const cover=Math.max(w/W,h/H);
  if(!portrait.matches)return {k:cover,x:(w-W*cover)*panAt(p),y:(h-H*cover)/2};
  return {k:cover,x:(w-W*cover)/2,y:0};
 }
 function ready(){
  const ok=targetP>=.985&&shownP>=.985&&drawn.startsWith(mode+':'+size+':')&&(drawn.endsWith(':final')||drawn.endsWith(':'+ (N-1)));
  document.body.classList.toggle('bubble-ready',ok);if(hits)hits.inert=!ok;
 }
 function draw(force){
  const k=pick();if(!k||(!force&&k===drawn))return;
  const b=bitmaps.get(k),j=k.split(':')[2],p=j==='final'?1:P[Number(j)],box=placement(p,canvas.width,canvas.height);
  {
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='low';ctx.drawImage(b,box.x,box.y,W*box.k,H*box.k);
  }
  state.bubbleContact=p>.12&&p<.7?1:0;
  document.body.style.setProperty('--bubble-opacity',String(Math.min(1,shownP/.045)));
  drawn=k;state.bubbleFrame=j==='final'?N-1:Number(j);state.bubbleKey=size+':'+j;state.bubbleMode=mode;state.bubbleLast=N-1;state.bubblePan=panAt(shownP);ready();
 }
 function tick(now){
  raf=0;if(closed)return;
  const dt=lastTime?Math.min(now-lastTime,50):16.7;lastTime=now;
  if(targetP>0&&shownP===0&&!reduced.matches&&(state.metrics.frame??0)<554){raf=requestAnimationFrame(tick);return;}
  const before=shownP;
  shownP=reduced.matches?targetP:shownP+(targetP-shownP)*(1-Math.exp(-dt/TAU));
  if(Math.abs(targetP-shownP)<.0008)shownP=targetP;
  if(shownP!==before)direction=shownP>before?1:-1;
  const rest=shownP>=.999&&targetP>=.999;if(rest!==full){full=rest;sized=false;}
  if(!sized)resize();
  need();draw(false);
  document.body.classList.toggle('bubble-covers-film',!!drawn&&shownP>=.045&&targetP>=.045);
  if(drawn&&targetP>0)document.body.style.setProperty('--bubble-opacity',String(Math.min(1,shownP/.045)));
  // A frame that lands later (decode/fetch) schedules its own tick, so the loop only runs while easing.
  if(shownP!==targetP)raf=requestAnimationFrame(tick);else lastTime=0;
 }
 function schedule(){if(!raf&&!closed)raf=requestAnimationFrame(tick);}
 function placeControls(){
  state.bubbleOwnsArrival=true;
  const sizes=document.querySelector('.shop .sizes'),add=document.getElementById('add'),box=document.querySelector('.shop .product-box');
  if(!sizes||!add||!box)return;
  if(!hits){hits=document.createElement('div');hits.className='bubble-hits';document.querySelector('.shop .scene-content').appendChild(hits);}
  if(sizes.parentNode!==hits)hits.append(sizes,add);hits.inert=true;layout();
 }
 // Screens narrower than 16:9 crop the sides: the camera slides right while the bubble rises, so the whole bubble fits.
 function panTarget(){
  const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return .5;
  const k=Math.max(r.width/W,r.height/H),vis=r.width/k;if(vis>=W-1)return .5;
  return Math.max((W-vis)/2,Math.min(W-vis,1862-vis))/(W-vis);
 }
 function layout(){
  if(!hits)return;
  const r=canvas.getBoundingClientRect(),scene=hits.parentNode.getBoundingClientRect();
  if(!r.width||!r.height)return;
  pan=panTarget();
  const box=placement(1,r.width,r.height),k=box.k,ox=r.left+box.x-scene.left,oy=r.top+box.y-scene.top,boxes=portrait.matches?MOBILE_HITS:HITS;
  const put=(el,b)=>{if(!el)return;const h=portrait.matches?Math.max(44,b.h*k):b.h*k;el.style.left=(ox+b.x*k)+'px';el.style.top=(oy+b.y*k-(h-b.h*k)/2)+'px';el.style.width=(b.w*k)+'px';el.style.height=h+'px';};
  put(document.querySelector('.bubble-hits .size[data-size="50"]'),boxes[50]);
  put(document.querySelector('.bubble-hits .size[data-size="100"]'),boxes[100]);
  put(document.getElementById('add'),boxes.add);
 }
 document.addEventListener('click',e=>{const b=e.target.closest('.size');if(!b)return;const s=Number(b.dataset.size);
  if(s!==size&&(s===50||s===100)){size=s;prefetch(size);for(const [k,bm] of bitmaps)if(!k.startsWith(mode+':'+s+':')&&k!==drawn){bm.close?.();bitmaps.delete(k);}ready();need();schedule();}});
 portrait.addEventListener('change',()=>{mode=portrait.matches?'mobile':'wide';W=portrait.matches?1080:1920;H=portrait.matches?1920:1080;drawn='';sized=false;placeControls();start();resize();need();schedule();});
 addEventListener('resize',()=>{sized=false;resize();layout();draw(true);schedule();});
 // Start fetching once the page itself is up; the film's first frames go first.
 const kick=()=>{queued.add(key(size,0));pumpFetch();};
 if(document.readyState==='complete')kick();else addEventListener('load',kick,{once:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',placeControls);else placeControls();
 return {frame(p){
  if(p>0||document.body.classList.contains('underwater'))start();
  if(p>=.985)layout();
  if(p===0){document.body.style.setProperty('--bubble-opacity','0');document.body.classList.remove('bubble-covers-film');}
  if(p!==targetP){targetP=p;need();schedule();}
  ready();
 },
 // v33: el grabador de la tarjeta de ascentastudio.com (build_studio_card.py) espera a esto antes de cada foto:
 // true cuando lo pintado es EXACTAMENTE el instante que pide el scroll (o el reposo final), no uno cercano.
 listo(){if(closed||targetP<=0)return true;if(shownP!==targetP)return false;const want=shownP>=.999&&targetP>=.999?finalKey(size):key(size,Math.round(idxOf(shownP)));return drawn===want;},
 close(){closed=true;decodeWorker?.terminate();for(const job of decodeJobs.values())job.reject(Error('Closed'));decodeJobs.clear();for(const b of bitmaps.values())b.close?.();bitmaps.clear();blobs.clear();}};
}
