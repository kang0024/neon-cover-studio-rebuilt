const el = id => document.getElementById(id);
const canvas=el('cover'), board=el('board'), stage=el('stage');
const fileInput=el('photos'), roll=el('roll'), caption=el('caption');
const slots=Array.from({length:4},()=>({photo:null,x:0,y:0,zoom:1}));
const images=[{name:'Artwork',src:null}];
const cropKeys=['zoom','x','y'];
let active=1, source=0, format='wide', grade='sunset', frame=0, drag, ready=false;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const tell=text=>{el('status').textContent=text;};

function draw(){
  cancelAnimationFrame(frame);frame=0;
  paintPoster(canvas,format,slots,caption.value,grade);
}
function redraw(){if(!frame) frame=requestAnimationFrame(draw);}
function fitBoard(){
  const [w,h]=formats[format].size;
  const pad=getComputedStyle(stage);
  const width=stage.clientWidth-parseFloat(pad.paddingLeft)-parseFloat(pad.paddingRight);
  const height=stage.clientHeight-parseFloat(pad.paddingTop)-parseFloat(pad.paddingBottom);
  const ratio=Math.min(width/w,height/h);
  board.style.width=`${Math.max(1,w*ratio)}px`;
  board.style.height=`${Math.max(1,h*ratio)}px`;
}

function setPressed(id,attr,value){
  el(id).querySelectorAll(`button[data-${attr}]`).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset[attr]===String(value))));
}
function syncCrop(){
  const slot=slots[active];
  setPressed('panels','panel',active);
  el('selector').firstElementChild.setAttribute('points',formats[format].panels[active].map(([x,y])=>`${x*1000},${y*1000}`).join(' '));
  cropKeys.forEach(key=>{
    const val=key==='zoom'?slot.zoom:Math.round(slot[key]*100);
    el(key).value=val;el(key).disabled=!slot.photo;
    el(`${key}-value`).textContent=key==='zoom'?`${val.toFixed(2)}×`:`${val>0?'+':''}${val}`;
  });
  el('reset').disabled=!slot.photo;
}
function selectPanel(index,mark=true){
  active=index;board.classList.toggle('marked',mark);syncCrop();
}
function changeFormat(next){
  format=next;const [w,h]=formats[format].size;
  setPressed('format','format',format);el('size').textContent=`${w} × ${h} PX`;
  fitBoard();syncCrop();redraw();
}
function openImage(src,name){
  return new Promise((resolve,reject)=>{
    const image=new Image();image.onload=()=>resolve({src,name,image});image.onerror=reject;image.src=src;
  });
}
function buildRoll(){
  roll.replaceChildren(...images.map((photo,i)=>{
    const button=document.createElement('button');button.type='button';button.className=`chip${photo.src?'':' art'}`;
    button.dataset.source=i;button.title=photo.name;button.setAttribute('aria-label',photo.name);
    if(photo.src){const img=document.createElement('img');img.src=photo.src;img.alt='';button.append(img);}
    const name=document.createElement('span');name.textContent=photo.name;button.append(name);
    return button;
  }));
  setPressed('roll','source',source);
}
function fillPanels(all){
  const photo=images[source].image?images[source]:null;
  for(const index of (all?[0,1,2,3]:[active])) Object.assign(slots[index],{photo,x:0,y:0,zoom:1});
  board.classList.toggle('marked',!all);syncCrop();redraw();
  tell(`${photo?'Photo applied':'Artwork restored'} ${all?'across all panels':`to panel 0${active+1}`}.`);
}
async function loadLocalFiles(files){
  if(!files.length) return;
  tell('Reading photos on this device…');
  const results=await Promise.allSettled(files.map(async file=>{
    const url=URL.createObjectURL(file);
    try{return await openImage(url,file.name);}catch(error){URL.revokeObjectURL(url);throw error;}
  }));
  const good=results.filter(r=>r.status==='fulfilled').map(r=>r.value);
  if(!good.length){tell('Could not read those photos. Try JPEG, PNG or WebP.');return;}
  source=images.length;images.push(...good);buildRoll();
  good.slice(0,4).forEach((photo,i)=>Object.assign(slots[(active+i)%4],{photo,x:0,y:0,zoom:1}));
  board.classList.remove('marked');syncCrop();redraw();
  roll.querySelector('[aria-pressed=true]').scrollIntoView({block:'nearest',inline:'nearest',container:'nearest'});
  tell(`${good.length} ${good.length===1?'photo':'photos'} added${good.length===files.length?'':'; some files could not be read'}.`);
}

function pointerPosition(event){
  const bounds=canvas.getBoundingClientRect();
  return [(event.clientX-bounds.left)/bounds.width,(event.clientY-bounds.top)/bounds.height];
}
function inside(poly,x,y){
  let hit=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const [a,b]=poly[i], [c,d]=poly[j];
    if((b>y)!==(d>y) && x<(c-a)*(y-b)/(d-b)+a) hit=!hit;
  }
  return hit;
}
canvas.addEventListener('pointerdown',event=>{
  if(event.button!==0 || drag) return;
  const [x,y]=pointerPosition(event), panels=formats[format].panels;
  const index=panels.findIndex(poly=>inside(poly,x,y));
  if(index<0) return;
  selectPanel(index);
  const slot=slots[index];
  if(!slot.photo) return;
  const b=panelBounds(panels[index],canvas.width,canvas.height);
  const {dx,dy}=photoGeometry(slot.photo.image,b,slot.zoom);
  drag={id:event.pointerId,startX:x,startY:y,panX:slot.x,panY:slot.y,slot,dx,dy};
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove',event=>{
  if(!drag || drag.id!==event.pointerId) return;
  const [x,y]=pointerPosition(event);
  if(drag.dx>.1) drag.slot.x=clamp(drag.panX+(x-drag.startX)*canvas.width/drag.dx,-1,1);
  if(drag.dy>.1) drag.slot.y=clamp(drag.panY+(y-drag.startY)*canvas.height/drag.dy,-1,1);
  syncCrop();redraw();
});
for(const event of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(event,e=>{if(drag?.id===e.pointerId) drag=null;});

function onChoice(id,key,handle){
  el(id).addEventListener('click',e=>{
    const button=e.target.closest(`button[data-${key}]`);
    if(button) handle(button.dataset[key]);
  });
}
onChoice('roll','source',value=>{source=Number(value);setPressed('roll','source',source);});
onChoice('panels','panel',value=>selectPanel(Number(value)));
onChoice('format','format',changeFormat);
onChoice('grades','grade',value=>{grade=value;setPressed('grades','grade',grade);redraw();});
for(const key of cropKeys) el(key).addEventListener('input',()=>{
  slots[active][key]=Number(el(key).value)/(key==='zoom'?1:100);
  board.classList.add('marked');syncCrop();redraw();
});
caption.addEventListener('input',redraw);
el('reset').addEventListener('click',()=>{Object.assign(slots[active],{x:0,y:0,zoom:1});syncCrop();redraw();});
el('add').addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',()=>{const files=[...fileInput.files];fileInput.value='';loadLocalFiles(files);});
el('apply').addEventListener('click',()=>fillPanels(false));
el('all').addEventListener('click',()=>fillPanels(true));

el('download').addEventListener('click',()=>{
  if(!ready) return;
  draw();
  const w=canvas.width,h=canvas.height;
  canvas.toBlob(blob=>{
    if(!blob){tell('PNG export failed. Try again.');return;}
    const url=URL.createObjectURL(blob), link=document.createElement('a');
    link.href=url;link.download=`afterglow-${w}x${h}.png`;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
    tell(`Exported ${w} × ${h} PNG.`);
  },'image/png');
});

async function startStudio(){
  buildRoll();syncCrop();fitBoard();
  new ResizeObserver(fitBoard).observe(stage);
  await Promise.allSettled([document.fonts.load('40px Anton'),document.fonts.load('700 20px Barlow')]);
  // Browsers can taint canvases with neighboring file:// images. Use vector plates for a direct file launch.
  const samples=location.protocol==='file:'?[]:await Promise.allSettled([
    openImage('samples/boulevard.jpg','Boulevard'),openImage('samples/pier.jpg','Pier'),
  ]);
  samples.forEach((result,i)=>{
    if(result.status==='fulfilled'){
      images.push(result.value);slots[i+1].photo=result.value;
      if(i===0){slots[1].zoom=1.06;slots[1].y=-.12;}
    }
  });
  source=images.length>1?1:0;buildRoll();syncCrop();draw();
  ready=true;el('download').disabled=false;el('add').disabled=false;
  tell(images.length>1?'Sample cover ready · add your own photos.':'Canvas ready · add your own photos.');
}
startStudio();
