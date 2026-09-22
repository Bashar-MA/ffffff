function hsl2hex(h,s,l){
  s/=100; l/=100;
  const k=n=>(n+h/30)%12;
  const a=s*Math.min(l,1-l);
  const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
  const toHex=x=>Math.round(255*x).toString(16).padStart(2,'0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
const PALETTE = Array.from({length:40},(_,i)=>hsl2hex(Math.round(i*9),65,50));

function physicalToPx(value, unit){
  const perInch = 96;
  const factor = unit==='cm' ? perInch/2.54 : unit==='mm' ? perInch/25.4 : unit==='in' ? perInch : 1;
  return (parseFloat(value)||0) * factor;
}

function createPalette(container, initialIdx, onChange){
  let idx = initialIdx||1;
  function draw(){
    container.innerHTML = '<div class="palette">'+PALETTE.map((c,i)=>`<div class="sw${i+1===idx?' sel':''}" style="background:${c}" data-i="${i+1}">${i+1}</div>`).join('')+
      '</div><div class="palNum"><input type="number" min="1" max="40" value="'+idx+'"><span>type 1\u201340</span></div>';
    container.querySelectorAll('.sw').forEach(el=>el.onclick=()=>{idx=parseInt(el.dataset.i);draw();onChange(PALETTE[idx-1],idx);});
    container.querySelector('input').onchange=e=>{idx=Math.max(1,Math.min(40,parseInt(e.target.value)||1));draw();onChange(PALETTE[idx-1],idx);};
  }
  draw();
  return {get:()=>({color:PALETTE[idx-1],idx}), set:(i)=>{idx=i;draw();}};
}

function parseDelimited(text){
  const lines = text.trim().split(/\r?\n/).filter(l=>l.trim().length);
  if(!lines.length) return {headers:[],cols:[]};
  const delim = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delim).map(h=>h.trim());
  const cols = headers.map(()=>[]);
  for(let i=1;i<lines.length;i++){
    const cells = lines[i].split(delim);
    cells.forEach((c,j)=>{ if(j<cols.length){ const v=parseFloat(c); if(!isNaN(v)) cols[j].push(v); } });
  }
  return {headers,cols};
}

function loadFile(file, cb){
  const name=file.name.toLowerCase();
  if(name.endsWith('.xlsx')||name.endsWith('.xls')){
    const reader=new FileReader();
    reader.onload=e=>{
      const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});
      const sheet=wb.Sheets[wb.SheetNames[0]];
      cb(XLSX.utils.sheet_to_csv(sheet));
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader=new FileReader();
    reader.onload=e=>cb(e.target.result);
    reader.readAsText(file);
  }
}

function niceTicks(min,max,count){
  if(min===max){min-=1;max+=1;}
  const raw=(max-min)/count, mag=Math.pow(10,Math.floor(Math.log10(raw))), norm=raw/mag;
  const step=(norm<1.5?1:norm<3?2:norm<7?5:10)*mag;
  const start=Math.ceil(min/step)*step;
  const ticks=[];
  for(let v=start; v<=max+1e-9; v+=step) ticks.push(Math.round(v*1000)/1000);
  return ticks;
}

function quartileStats(arr){
  const a=[...arr].sort((x,y)=>x-y); const n=a.length;
  const q=(p)=>{ const idx=p*(n-1); const lo=Math.floor(idx), hi=Math.ceil(idx); return a[lo]+(a[hi]-a[lo])*(idx-lo); };
  const q1=q(0.25), median=q(0.5), q3=q(0.75), iqr=q3-q1;
  const loW=Math.max(a[0], q1-1.5*iqr), hiW=Math.min(a[n-1], q3+1.5*iqr);
  const mean=a.reduce((s,v)=>s+v,0)/n;
  return {q1,median,q3,iqr,loW,hiW,mean,min:a[0],max:a[n-1],n};
}

function gaussianKDE(data, points, bandwidth){
  const n=data.length;
  return points.map(x=>{
    let s=0;
    for(const d of data){ const u=(x-d)/bandwidth; s+=Math.exp(-0.5*u*u); }
    return s/(n*bandwidth*Math.sqrt(2*Math.PI));
  });
}
function silvermanBW(data){
  const n=data.length, mean=data.reduce((a,b)=>a+b,0)/n;
  const sd=Math.sqrt(data.reduce((a,b)=>a+(b-mean)**2,0)/(n-1))||1;
  return 1.06*sd*Math.pow(n,-0.2) || 1;
}

function fontAttrs(family,styleMode,size){
  let style='normal',weight='normal';
  if(styleMode==='italic') style='italic';
  else if(styleMode==='bold') weight='bold';
  else if(styleMode==='bolditalic'){style='italic';weight='bold';}
  return `font-family="${family}" font-style="${style}" font-weight="${weight}" font-size="${size}"`;
}
function escXml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function downloadSVG(svgEl, filename){
  const blob=new Blob([svgEl.outerHTML],{type:'image/svg+xml'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
