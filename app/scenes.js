/* Original vector plates. All coordinates are in each panel's local space. */
function inkGradient(g, y0, y1, stops) {
  const ramp = g.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([at, color]) => ramp.addColorStop(at, color));
  return ramp;
}

function grainSeed(seed) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
}

function palm(g, x, y, size, lean, color) {
  g.save(); g.translate(x, y); g.scale(size, size);
  g.fillStyle = color;
  g.beginPath(); g.moveTo(-.042, 0);
  g.quadraticCurveTo(lean * .16, -.65, lean, -.98);
  g.lineTo(lean + .022, -.98);
  g.quadraticCurveTo(lean * .25 + .012, -.54, .046, 0);
  g.closePath(); g.fill();
  g.translate(lean, -.98);
  const fronds = [[-.93,-.22,.68],[-.75,-.66,.61],[-.36,-.99,.51],[.16,-1,.53],[.63,-.77,.65],[.99,-.27,.69],[.89,.35,.62],[-.88,.35,.65],[-.41,.62,.53]];
  fronds.forEach(([dx,dy,len],j) => {
    g.save(); g.rotate(Math.atan2(dy, dx));
    g.beginPath(); g.moveTo(0,0);
    g.bezierCurveTo(len*.28,-.19,len*.76,-.15,len,.045);
    for(let i=10;i>0;i--) {
      const t=i/10;
      g.lineTo(len*t, .047+Math.sin(t*3.14)*.063);
      g.lineTo(len*(t-.12), -.018+(t>.65?.036:0));
    }
    g.closePath(); g.fill(); g.restore();
    if(j%2===0){g.beginPath();g.ellipse(.075*dx,.065*dy,.055,.038,0,0,Math.PI*2);g.fill();}
  });
  g.restore();
}

function skyline(g, w, h, horizon, tint, seed) {
  const rand = grainSeed(seed);
  for(let x=-w*.02;x<w;) {
    const bw=(.027+rand()*.061)*w, bh=(.035+rand()**1.65*.17)*h;
    const y=horizon-bh;
    g.fillStyle=tint;
    g.fillRect(x,y,bw,horizon-y+3);
    if(rand()>.67) { g.fillRect(x+bw*.18,y-bh*.16,bw*.6,bh*.17); g.fillRect(x+bw*.56,y-bh*.32,Math.max(1,w*.003),bh*.2); }
    const spacing=Math.max(6,w*.013);
    for(let cy=y+spacing;cy<horizon-5;cy+=spacing*.84) for(let cx=x+spacing*.45;cx<x+bw-3;cx+=spacing){
      if(rand()>.56){g.fillStyle=rand()>.42?'#ffb66d80':'#f277aa78';g.fillRect(cx,cy,spacing*.31,spacing*.29);}
    }
    x+=bw+w*.008;
  }
}

function tropicalPlate(g, w, h, variant, grade) {
  const night=variant===3 || variant===1;
  const neon=grade==='neon';
  const water=h*(night?.68:.66), d=Math.min(w,h);
  const sky=night?['#211934','#703373','#f48297']:neon?['#462466','#ad3b88','#ff8b83']:['#8b396a','#e46c78','#ffc081'];
  g.fillStyle=inkGradient(g,0,water,[[0,sky[0]],[.57,sky[1]],[1,sky[2]]]);g.fillRect(0,0,w,h);
  const sunX=w*(night?.69:.48), sunY=h*(night?.37:.34), radius=d*(night?.28:.32);
  g.save();g.beginPath();g.arc(sunX,sunY,radius,0,Math.PI*2);g.clip();
  g.fillStyle=inkGradient(g,sunY-radius,sunY+radius,[[0,'#fff4bb'],[.45,'#ffc987'],[1,neon?'#ff6eb3':'#fa7887']]);
  g.fillRect(sunX-radius,sunY-radius,radius*2,radius*2);
  for(let row=0;row<7;row++){
    const y=sunY+radius*(row*.156-.12);
    g.fillStyle=inkGradient(g,0,water,[[0,sky[0]],[.57,sky[1]],[1,sky[2]]]);
    g.fillRect(sunX-radius,y,radius*2,radius*(.018+row*.011));
  }
  g.restore();
  const rnd=grainSeed(92+variant);
  for(let i=0;i<15;i++){
    const y=h*(.17+rnd()*.47), x=rnd()*w, len=(.04+rnd()*.23)*w;
    g.fillStyle=i%2?'#ffd0b933':'#57324d33';g.fillRect(x,y,len,Math.max(1,d*.0025));
  }
  skyline(g,w,h,water,night?'#21182d':'#42213c',403+variant);
  g.fillStyle=inkGradient(g,water,h,[[0,night?'#723b69':'#9e4764'],[.78,'#2a2039'],[1,'#231728']]);g.fillRect(0,water,w,h-water);
  g.fillStyle='#ffcea087';g.fillRect(0,water,w,Math.max(1,d*.002));
  for(let i=0;i<53;i++) {
    const far=rnd()**1.9, y=water+far*(h-water), x=(rnd()*.93+.034)*w;
    const len=(.014+rnd()*.13)*w*(.5+far*.9);
    g.fillStyle=i%4===0?'#ffe1b86c':i%4===1?'#f288a479':'#38244781';
    g.fillRect(x,y,len,Math.max(1,d*.002*(1+far)));
  }
  g.fillStyle='#211628';g.beginPath();g.moveTo(0,h*.885);g.bezierCurveTo(w*.19,h*.87,w*.29,h*.92,w*.52,h);g.lineTo(0,h);g.fill();
  if(night){palm(g,w*.17,h*.99,h*.63,.17,'#1d1428');palm(g,w*.88,h*1.03,h*.49,-.26,'#24182d');}
  else {palm(g,w*.16,h*.96,h*.59,.19,'#28182e');palm(g,w*.79,h*.94,h*.44,-.25,'#301b36');}
}
