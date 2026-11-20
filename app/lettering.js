/* Editorial lockup: headline, offset ink, folio strip and printer's mark. */
function headlineLines(g, text, maxWidth, size, wide) {
  const font = n => `${n}px Anton, Impact, sans-serif`;
  let lines = text.trim().toLocaleUpperCase('en').split(/\n+/).map(s=>s.trim()).filter(Boolean).slice(0,3);
  g.font=font(size);
  if(!wide && lines.length===1 && g.measureText(lines[0]).width>maxWidth*.82){
    const words=lines[0].split(/\s+/);
    if(words.length>1){
      let best=Infinity;
      for(let i=1;i<words.length;i++){
        const pair=[words.slice(0,i).join(' '),words.slice(i).join(' ')];
        const widths=pair.map(s=>g.measureText(s).width);
        const score=Math.max(...widths)+Math.abs(widths[0]-widths[1])*.08;
        if(score<best){best=score;lines=pair;}
      }
    }
  }
  if(lines.length===3){size*=.73;g.font=font(size);}
  const widest=Math.max(1,...lines.map(s=>g.measureText(s).width));
  size*=Math.min(1,maxWidth/widest);
  g.font=font(size);
  return {lines,size};
}

function nightSeal(g,x,y,r,u){
  g.save();g.translate(x,y);g.rotate(.13);
  g.fillStyle='#221626e8';g.strokeStyle='#ffc0a0';g.lineWidth=1.7*u;
  g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.fill();g.stroke();
  g.beginPath();g.arc(0,0,r*.86,0,Math.PI*2);g.strokeStyle='#ffc0a079';g.stroke();
  g.strokeStyle='#ffdcb4';g.lineWidth=2.6*u;
  g.beginPath();g.arc(0,0,r*.29,Math.PI,Math.PI*2);g.stroke();
  [-.015,.1,.21].forEach((n,i)=>{
    g.beginPath();g.moveTo(-r*(.36-i*.075),r*n);g.lineTo(r*(.36-i*.075),r*n);g.stroke();
  });
  g.fillStyle='#ffdcb4';g.textAlign='center';g.font=`700 ${Math.max(10,13*u)}px Barlow, sans-serif`;
  g.fillText('AFTERGLOW',0,-r*.43);g.fillText('NIGHT SHIFT',0,r*.55);g.restore();
}

function paintLettering(g,w,h,format,caption,grade) {
  const wide=format==='wide', u=Math.min(w,h)/1080;
  const left=w*(wide?.042:.055), right=w*(wide?.958:.943), bottom=h*(wide?.932:.94);
  const maxWidth=w*(wide?.73:.86);
  g.fillStyle=inkGradient(g,h*.47,h,[[0,'#190f2400'],[.37,'#1b102117'],[.7,'#1c102168'],[1,'#1b1025ec']]);
  g.fillRect(w*.025,h*.47,w*.95,h*.51);
  g.save();g.translate(left,bottom-47*u);g.transform(1,0,-.10,1,0,0);
  g.lineJoin='round';g.textBaseline='alphabetic';
  const {lines,size}=headlineLines(g,caption,maxWidth,wide?h*.196:h*.165,wide);
  lines.forEach((line,i)=>{
    const y=(i-lines.length+1)*size*.91;
    g.lineWidth=16*u;g.strokeStyle='#201426';g.strokeText(line,5*u,y+9*u);
    g.fillStyle=grade==='neon'?'#a45aff':'#ed6684';g.fillText(line,8*u,y+8*u);
    g.strokeStyle='#291a2b';g.lineWidth=5*u;g.strokeText(line,0,y);
    g.fillStyle=inkGradient(g,y-size*.83,y+size*.09,[[0,'#fff4ca'],[.56,'#ffc084'],[1,grade==='neon'?'#fd92c9':'#ff897f']]);
    g.fillText(line,0,y);
  });
  g.restore();
  g.fillStyle='#f8be9b';g.fillRect(left,bottom-25*u,right-left,1.5*u);
  g.fillStyle='#fbd3ad';g.font=`700 ${22*u}px Barlow, sans-serif`;
  g.fillText('THE COAST DOESN’T SLEEP',left,bottom+2*u);
  g.textAlign='right';g.fillText('TROPIC NOIR  /  VOL. 01',right,bottom+2*u);g.textAlign='left';
  if(wide) nightSeal(g,right-52*u,bottom-109*u,53*u,u);
}
