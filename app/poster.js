const formats = {
  wide: { size:[1920,1080], panels:[[[.018,.024],[.319,.024],[.245,.976],[.018,.976]],[[.329,.024],[.722,.024],[.639,.976],[.255,.976]],[[.732,.024],[.982,.024],[.982,.511],[.694,.565]],[[.693,.58],[.982,.527],[.982,.976],[.649,.976]]] },
  square: { size:[1080,1080], panels:[[[.024,.024],[.419,.024],[.355,.596],[.024,.65]],[[.43,.024],[.976,.024],[.976,.505],[.366,.594]],[[.024,.662],[.517,.585],[.458,.976],[.024,.976]],[[.528,.583],[.976,.518],[.976,.976],[.47,.976]]] },
  tall: { size:[1080,1350], panels:[[[.024,.019],[.434,.019],[.364,.585],[.024,.619]],[[.446,.019],[.976,.019],[.976,.523],[.376,.583]],[[.024,.63],[.547,.577],[.485,.981],[.024,.981]],[[.559,.576],[.976,.534],[.976,.981],[.497,.981]]] },
};
const plateNames = ['SUNSET', 'BOULEVARD', 'COAST', 'NIGHTFALL'];
const treatments = {
  sunset: { filter:'saturate(1.18) contrast(1.07)', wash:['#ee668a70','#ff944b34','#3d246b73'] },
  neon: { filter:'saturate(1.42) contrast(1.12) hue-rotate(-9deg)', wash:['#e568c78a','#d456b445','#27258f9c'] },
  natural: { filter:'none', wash:null },
};

function panelBounds(poly,w,h) {
  const xx=poly.map(([x])=>x*w), yy=poly.map(([,y])=>y*h);
  const x=Math.min(...xx), y=Math.min(...yy);
  return {x,y,w:Math.max(...xx)-x,h:Math.max(...yy)-y};
}

function panelPath(g,poly,w,h) {
  g.beginPath();poly.forEach(([x,y],i)=>i?g.lineTo(x*w,y*h):g.moveTo(x*w,y*h));g.closePath();
}

function photoGeometry(img,b,zoom) {
  const scale=Math.max(b.w/img.naturalWidth,b.h/img.naturalHeight)*zoom;
  const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
  return {w,h,dx:Math.max(0,(w-b.w)/2),dy:Math.max(0,(h-b.h)/2)};
}

function stampPanel(g, x, y, label, unit) {
  g.font=`700 ${20*unit}px Barlow, sans-serif`;
  const w=g.measureText(label).width+21*unit;
  g.fillStyle='#251626de';g.fillRect(x,y,w,30*unit);
  g.fillStyle='#ffcba9';g.fillRect(x,y,2*unit,30*unit);
  g.fillStyle='#ffe4ce';g.textBaseline='middle';g.fillText(label,x+11*unit,y+15*unit);
  g.textBaseline='alphabetic';
}

function paintPlate(g,poly,slot,index,w,h,grade) {
  const b=panelBounds(poly,w,h), tone=treatments[grade], u=Math.min(w,h)/1080;
  g.save();panelPath(g,poly,w,h);g.clip();g.translate(b.x,b.y);
  if(slot.photo){
    const img=slot.photo.image, geo=photoGeometry(img,b,slot.zoom);
    g.filter=tone.filter;
    g.drawImage(img,-geo.dx+slot.x*geo.dx,-geo.dy+slot.y*geo.dy,geo.w,geo.h);
    g.filter='none';
    if(tone.wash){
      g.globalCompositeOperation='soft-light';
      g.fillStyle=inkGradient(g,0,b.h,[[0,tone.wash[0]],[.48,tone.wash[1]],[1,tone.wash[2]]]);g.fillRect(0,0,b.w,b.h);
      g.globalCompositeOperation='source-over';
    }
  } else tropicalPlate(g,b.w,b.h,index,grade);
  g.fillStyle=inkGradient(g,0,b.h,[[0,'#31183924'],[.34,'#00000000'],[.74,'#1a122020'],[1,'#160f1da0']]);g.fillRect(0,0,b.w,b.h);
  const corner=poly[0];
  const x=corner[0]*w-b.x+16*u, y=corner[1]*h-b.y+16*u;
  stampPanel(g,x,y,`0${index+1}  /  ${plateNames[index]}`,u);
  g.restore();
  panelPath(g,poly,w,h);g.lineWidth=1.45*u;g.strokeStyle='#f5a99cb0';g.stroke();
}

function posterGrain(g,w,h){
  const random=grainSeed(23555), n=Math.round(w*h/81);
  for(let i=0;i<n;i++){
    const x=random()*w,y=random()*h, d=.6+random()*1.1;
    g.fillStyle=i%3?'#ffeece1c':'#190e252d';g.fillRect(x,y,d,d);
  }
}

function paintPoster(canvas,format,slots,caption,grade) {
  const {size:[w,h],panels}=formats[format];
  if(canvas.width!==w || canvas.height!==h){canvas.width=w;canvas.height=h;}
  const g=canvas.getContext('2d',{alpha:false});
  g.fillStyle='#201525';g.fillRect(0,0,w,h);
  panels.forEach((poly,index)=>paintPlate(g,poly,slots[index],index,w,h,grade));
  posterGrain(g,w,h);
  paintLettering(g,w,h,format,caption,grade);
}
