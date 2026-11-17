/* Compressed originals arrive in batches. Decode and drawing stay in a worker;
   decoded memory has an explicit pixel budget, including the global anchors. */
function createPackedFilm(canvas, report) {
 const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
 const blobs=new Map(),cache=new Map(),anchors=new Map(),jobs=new Set(),fetching=new Set(),loaded=new Set(),attempts=new Map(),decodeFailures=new Set();
 let config={},generation=0,target=0,direction=1,drawn='',closed=false,settled=false,timer,base='',portrait=false,pixelBudget=0,ready=false,original=false;
 const anchorIndices=[...new Set([...Array.from({length:35},(_,i)=>i*16),556])];
 const bytesOf=b=>b.width*b.height*4;
 const memory=()=>[...cache.values(),...anchors.values()].reduce((s,b)=>s+bytesOf(b),0);
 function prune(){
  // Keep the visible bitmap and nearest frames, rather than throwing away a
  // frame as soon as it leaves a narrow moving window (decode starvation).
  const sorted=[...cache.keys()].sort((a,b)=>Math.abs(Number(a)-target)-Math.abs(Number(b)-target));
  let used=[...anchors.values()].reduce((s,b)=>s+bytesOf(b),0);
  for(const i of sorted){const b=cache.get(i);used+=bytesOf(b);if(used>pixelBudget&&drawn!=='h'+i){b.close?.();cache.delete(i);}}
 }
 function paint(){
  if(settled&&drawn==='r'+target)return;
  let frame=target,b=cache.get(frame),tier='native';
  if(!b){let distance=Infinity;
   for(const [i,item] of cache){const d=Math.abs(i-target);if(d<distance){distance=d;frame=i;b=item;tier='native';}}
   for(const [i,item] of anchors){const d=Math.abs(i-target);if(d<distance){distance=d;frame=i;b=item;tier='anchor';}}
  }
  if(!b)return;
  const key=(tier==='native'?'h':'a')+frame;if(key===drawn)return;
  if(canvas.width!==config.motionWidth||canvas.height!==config.motionHeight){canvas.width=config.motionWidth;canvas.height=config.motionHeight;}
  const scale=Math.max(canvas.width/b.width,canvas.height/b.height);
  ctx.drawImage(b,(canvas.width-b.width*scale)/2,(canvas.height-b.height*scale)/2,b.width*scale,b.height*scale);
  drawn=key;
  report({type:'paint',frame,target,exact:frame===target&&tier==='native',tier,format:original?'jpeg':'avif',canvas:[canvas.width,canvas.height],cached:cache.size+anchors.size,decodedBytes:memory(),warm:blobs.size});
 }
 function wanted(){
  const out=[target];for(let n=1;n<=6;n++){const i=target+n*direction;if(i>=0&&i<=556)out.push(i);}
  for(let n=1;n<=2;n++){const i=target-n*direction;if(i>=0&&i<=556)out.push(i);}return out;
 }
 function decode(i,anchor=false){
  const key=(anchor?'a':'h')+i;if(jobs.has(key)||decodeFailures.has(key)||!blobs.has(i)||(anchor?anchors:cache).has(i))return;
  const token=generation;jobs.add(key);
  const opts=anchor?{resizeWidth:portrait?360:640,resizeQuality:'low'}:{};
  createImageBitmap(blobs.get(i),opts).then(b=>{
   if(closed||token!==generation){b.close?.();return;}
   if(!anchor&&Math.abs(i-target)>20&&i!==0){b.close?.();return;}
   (anchor?anchors:cache).set(i,b);prune();paint();
   if(!ready&&anchors.size===anchorIndices.length&&cache.has(target)){ready=true;report({type:'warmed'});}
  }).catch(e=>{if(token===generation){decodeFailures.add(key);if(!original){original=true;reset();base=config.base+'packed-v37-original-'+(portrait?'portrait':'wide')+'/';pump();}else report({type:'error',message:'Decode '+i+': '+e.message});}})
   .finally(()=>{if(token===generation){jobs.delete(key);pump();}});
 }
 async function fetchPack(name){
  if(closed||fetching.has(name)||loaded.has(name)||(attempts.get(name)||0)>=3)return;
  const token=generation;fetching.add(name);attempts.set(name,(attempts.get(name)||0)+1);
  try{
   const r=await fetch(base+name,{priority:name==='anchors.bin'?'high':'low',signal:AbortSignal.timeout(15000)});
   if(!r.ok)throw Error('HTTP '+r.status);
   const data=await r.arrayBuffer();if(closed||token!==generation)return;
   const view=new DataView(data);let offset=0;
   while(offset<data.byteLength){if(offset+8>data.byteLength)throw Error('Truncated pack');const i=view.getUint32(offset,true),n=view.getUint32(offset+4,true);offset+=8;
    if(i>556||!n||offset+n>data.byteLength)throw Error('Invalid frame record');
    blobs.set(i,new Blob([data.slice(offset,offset+n)],{type:original?'image/jpeg':'image/avif'}));offset+=n;
   }
   loaded.add(name);
  }catch(e){if(token===generation)report({type:'error',message:'Pack '+name+': '+e.message});}
  finally{if(token===generation){fetching.delete(name);pump();}}
 }
 function pump(){
  if(closed)return;
  // An exact frame gets one decoder; anchors cannot be starved by scroll.
  if(jobs.size<3)decode(target);
  for(const i of anchorIndices){if(jobs.size>=3)break;decode(i,true);}
  if(anchors.size===anchorIndices.length)for(const i of wanted()){if(jobs.size>=3)break;decode(i);}
  if(!loaded.has('anchors.bin')){fetchPack('anchors.bin');return;}
  const near=Math.floor(target/24),order=[near];
  for(let n=1;n<24;n++){for(const i of [near+n*direction,near-n*direction])if(i>=0&&i<24)order.push(i);}
  for(const i of order){if(fetching.size>=2)break;fetchPack(String(i).padStart(2,'0')+'.bin');}
 }
 function sharpRest(){
  settled=true;if(!config.retina||portrait)return;
  const i=target,token=generation;
  fetch(config.base+'retina/'+String(i).padStart(3,'0')+'.jpg',{priority:'low'}).then(r=>{if(!r.ok)throw Error(r.status);return r.blob();}).then(b=>createImageBitmap(b)).then(b=>{
   if(closed||token!==generation||!settled||i!==target){b.close?.();return;}
   canvas.width=config.width;canvas.height=config.height;
   const scale=Math.max(canvas.width/b.width,canvas.height/b.height);ctx.drawImage(b,(canvas.width-b.width*scale)/2,(canvas.height-b.height*scale)/2,b.width*scale,b.height*scale);b.close?.();drawn='r'+i;
  }).catch(()=>{});
 }
 function reset(){generation++;for(const b of [...cache.values(),...anchors.values()])b.close?.();cache.clear();anchors.clear();blobs.clear();jobs.clear();fetching.clear();loaded.clear();attempts.clear();decodeFailures.clear();ready=false;drawn='';}
 return {
  configure(data){
   const next=!!data.sharpOnly;
   if(base&&next!==portrait)reset();
   config=data;portrait=next;closed=false;base=data.base+'packed-v37-'+(original?'original-':'')+(portrait?'portrait':'wide')+'/';pixelBudget=(portrait?112:192)*1048576;
   canvas.width=data.motionWidth;canvas.height=data.motionHeight;drawn='';paint();pump();
  },
  frame(i){i=Math.round(Math.max(0,Math.min(556,i)));direction=Math.sign(i-target)||direction;target=i;settled=false;paint();prune();pump();clearTimeout(timer);timer=setTimeout(sharpRest,350);},
  close(){closed=true;generation++;clearTimeout(timer);for(const b of [...cache.values(),...anchors.values()])b.close?.();cache.clear();anchors.clear();blobs.clear();}
 };
}
if(typeof document==='undefined'){
 let engine,ticket=0;
 onmessage=({data})=>{try{if(data.type==='decode-bubble'){createImageBitmap(data.blob).then(bitmap=>postMessage({type:'bubble-bitmap',id:data.id,bitmap},[bitmap])).catch(e=>postMessage({type:'bubble-bitmap',id:data.id,error:e.message}));return;}if(data.type==='init'){
  // Safari versions without OffscreenCanvas still decode in this worker.
  // Transfer a clone of the chosen bitmap; the cached original stays reusable.
  const surface=data.canvas||{width:1,height:1,getContext(){return {drawImage(bitmap,x,y,w,h){const mine=++ticket;createImageBitmap(bitmap).then(copy=>{if(mine!==ticket){copy.close();return;}postMessage({type:'surface',bitmap:copy,x,y,w,h,width:surface.width,height:surface.height},[copy]);});}};}};
  engine=createPackedFilm(surface,m=>postMessage(m));engine.configure(data.config);
 }else if(data.type==='configure')engine.configure(data.config);else if(data.type==='frame')engine.frame(data.index);else if(data.type==='close')engine.close();}catch(e){postMessage({type:'error',message:e.message});}};
}else{
 window.createNativeFilmEngine=(canvas,report)=>{
  let worker=null,engine=null,started=false,surface=null,paintRAF=0,bitmapContext=null,paintContext=null;
  if(typeof Worker!=='undefined')worker=new Worker(new URL('native-film-v37.js',document.baseURI));
  if(worker){worker.onmessage=({data})=>{if(data.type!=='surface'){report(data);return;}surface?.bitmap.close();surface=data;if(!paintRAF)paintRAF=requestAnimationFrame(()=>{
   paintRAF=0;const s=surface;surface=null;
   if(!bitmapContext&&!paintContext){bitmapContext=canvas.getContext('bitmaprenderer');if(!bitmapContext)paintContext=canvas.getContext('2d',{alpha:false});}
   if(bitmapContext){if(canvas.width!==s.bitmap.width)canvas.width=s.bitmap.width;if(canvas.height!==s.bitmap.height)canvas.height=s.bitmap.height;bitmapContext.transferFromImageBitmap(s.bitmap);}
   else{if(canvas.width!==s.width)canvas.width=s.width;if(canvas.height!==s.height)canvas.height=s.height;paintContext.drawImage(s.bitmap,s.x,s.y,s.w,s.h);s.bitmap.close();}
  });};worker.onerror=e=>report({type:'error',message:e.message});}
  else engine=createPackedFilm(canvas,report);
  return {configure(config){if(worker){if(!started){const offscreen=canvas.transferControlToOffscreen?.();worker.postMessage({type:'init',canvas:offscreen,config},offscreen?[offscreen]:[]);started=true;}else worker.postMessage({type:'configure',config});}else engine.configure(config);},frame(index){if(worker)worker.postMessage({type:'frame',index});else engine.frame(index);},close(){cancelAnimationFrame(paintRAF);surface?.bitmap.close();if(worker){worker.postMessage({type:'close'});worker.terminate();}else engine.close();}};
 };
}
