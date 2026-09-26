
const v=document.getElementById('viewport'), stage=document.getElementById('stage');
const search=document.getElementById('search'), results=document.getElementById('results');
const hits=document.getElementById('hits'), card=document.getElementById('card'), houseName=document.getElementById('houseName');
let s=0.08,x=0,y=0,pointers=new Map(),lastDist=0,lastMid=null,dragStart=null,selected=null,selectedBlock=null;
let blockElements={};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function fit(){
  const sw=14400,sh=11883, vw=v.clientWidth,vh=v.clientHeight;
  s=Math.min(vw/sw,vh/sh)*0.96; x=(vw-sw*s)/2; y=(vh-sh*s)/2; draw();
}
function draw(){stage.style.transform=`translate(${x}px,${y}px) scale(${s})`}
function zoomAt(cx,cy,newS){
  newS=clamp(newS,0.035,2.2);
  const mx=(cx-x)/s,my=(cy-y)/s;
  x=cx-mx*newS;y=cy-my*newS;s=newS;draw();
}
function focusLabel(d){
  // Zoom much closer to the selected house label/block.
  const target=1.45;
  s=target;
  x=v.clientWidth/2-d.x*s;
  y=v.clientHeight/2-d.y*s;
  draw();
  selectLabel(d);
}
function clearBlockSelection(){ if(selectedBlock){ selectedBlock.style.filter=''; selectedBlock.style.stroke=''; selectedBlock.style.strokeWidth=''; selectedBlock=null; } }
function selectLabel(d){
  clearBlockSelection();
  if(selected) selected.classList.remove('selected');
  selected=document.querySelector(`[data-i="${d.i}"]`);
  if(selected) selected.classList.add('selected');
  houseName.textContent=d.name;
  const info=(window.HOUSE_INFO||{})[d.name]||{};
  const vals=[
    info.houseNumber||"—",
    info.area||"—",
    info.feederNumber||"—",
    info.distributionBox||"—",
    info.breakerNumber||"—",
    info.meterNumber||"—"
  ];
  document.getElementById("blockId").textContent="—";
  const spans=[...card.querySelectorAll(".row .muted")].slice(1);
  spans.forEach((el,i)=>el.textContent=vals[i]||"—");
  card.style.display='block';
}
const labels=(window.HOUSE_LABELS||[]).map((d,i)=>({...d,i}));
for(const d of labels){
  const b=document.createElement('button'); b.type='button'; b.className='hit'; b.dataset.i=d.i; b.title=d.name;
  const padX=Math.max(35,(d.x1-d.x0)*.55), padY=32;
  b.style.left=(d.x0-padX)+'px'; b.style.top=(d.y0-padY)+'px';
  b.style.width=(d.x1-d.x0+padX*2)+'px'; b.style.height=(d.y1-d.y0+padY*2)+'px';
  b.addEventListener('click',e=>{e.stopPropagation();selectLabel(d)});
  hits.appendChild(b);
}
function blockSearchItems(){
  const infoMap=window.BLOCK_INFO||{};
  return Object.entries(blockElements).map(([id,el])=>{
    const info=infoMap[id]||{};
    const name=(info.houseName||'').trim();
    if(!name) return null;
    let bb; try{bb=el.getBBox();}catch(e){return null;}
    return {type:'block',id,name,el,info,x:bb.x+bb.width/2,y:bb.y+bb.height/2};
  }).filter(Boolean);
}
function focusBlock(d){
  if(selected) selected.classList.remove('selected'); selected=null;
  clearBlockSelection(); selectedBlock=d.el;
  selectedBlock.style.stroke='#e00000'; selectedBlock.style.strokeWidth='7'; selectedBlock.style.filter='drop-shadow(0 0 10px rgba(255,0,0,.9))';
  s=1.45; x=v.clientWidth/2-d.x*s; y=v.clientHeight/2-d.y*s; draw();
  const info=d.info||{};
  document.getElementById('blockId').textContent=d.id; houseName.textContent=d.name;
  const vals=[info.houseNumber||'—',info.area||'—',info.feederNumber||'—',info.distributionBox||'—',info.breakerNumber||'—',info.meterNumber||'—'];
  const spans=[...card.querySelectorAll('.row .muted')].slice(1); spans.forEach((node,i)=>node.textContent=vals[i]||'—'); card.style.display='block';
}
function allSearchItems(){ return [...labels.map(d=>({type:'label',name:d.name,data:d})),...blockSearchItems()]; }
function chooseSearchItem(item){ search.value=item.name; results.style.display='none'; item.type==='block'?focusBlock(item):focusLabel(item.data); }
search.addEventListener('input',()=>{
  const q=search.value.trim().toLowerCase(); results.innerHTML='';
  if(!q){results.style.display='none';return}
  const found=allSearchItems().filter(d=>d.name.toLowerCase().includes(q)).slice(0,30);
  for(const item of found){const b=document.createElement('button');b.type='button';b.className='result';b.textContent=item.name;
    b.addEventListener('click',()=>chooseSearchItem(item));results.appendChild(b)}
  results.style.display=found.length?'block':'none';
});
search.addEventListener('keydown',e=>{
  if(e.key==='Enter'){const q=search.value.trim().toLowerCase();const items=allSearchItems();const item=items.find(z=>z.name.toLowerCase()===q)||items.find(z=>z.name.toLowerCase().includes(q));if(item)chooseSearchItem(item)}
});
document.getElementById('reset').addEventListener('click',()=>{card.style.display='none';search.value='';results.style.display='none';if(selected)selected.classList.remove('selected');selected=null;clearBlockSelection();fit()});
document.getElementById('close').addEventListener('click',()=>{card.style.display='none';if(selected)selected.classList.remove('selected');selected=null;clearBlockSelection()});
v.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,s*(e.deltaY<0?1.18:.84))},{passive:false});
v.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});v.setPointerCapture(e.pointerId);dragStart={x:e.clientX,y:e.clientY,ox:x,oy:y};});
v.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const ps=[...pointers.values()];
  if(ps.length===1 && dragStart){x=dragStart.ox+(ps[0].x-dragStart.x);y=dragStart.oy+(ps[0].y-dragStart.y);draw()}
  if(ps.length===2){
    const dx=ps[0].x-ps[1].x,dy=ps[0].y-ps[1].y,dist=Math.hypot(dx,dy),mid={x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2};
    if(lastDist>0){zoomAt(mid.x,mid.y,s*(dist/lastDist)); if(lastMid){x+=mid.x-lastMid.x;y+=mid.y-lastMid.y;draw()}}
    lastDist=dist;lastMid=mid;dragStart=null;
  }
});
function end(e){pointers.delete(e.pointerId);if(pointers.size<2){lastDist=0;lastMid=null}if(pointers.size===1){const p=[...pointers.values()][0];dragStart={x:p.x,y:p.y,ox:x,oy:y}}else if(!pointers.size)dragStart=null}
v.addEventListener('pointerup',end);v.addEventListener('pointercancel',end);
window.addEventListener('resize',fit);fit();


// Load the original PDF-derived vector map inline, then make house-sized vector blocks clickable.
const svgHost=document.getElementById('svgHost');
fetch('map.svg',{cache:'no-store'}).then(r=>r.text()).then(txt=>{
  svgHost.innerHTML=txt;
  const svg=svgHost.querySelector('svg');
  if(!svg) return;
  svg.removeAttribute('width'); svg.removeAttribute('height');
  svg.setAttribute('width','14400'); svg.setAttribute('height','11883');

  let blockNo=0;
  blockElements={};
  const labelLayer=document.createElementNS('http://www.w3.org/2000/svg','g');
  labelLayer.setAttribute('id','editable-block-labels');
  labelLayer.style.pointerEvents='none';

  function refreshEditableBlockLabels(){
    labelLayer.replaceChildren();
    const infoMap=window.BLOCK_INFO||{};
    for(const [id,el] of Object.entries(blockElements)){
      const name=(infoMap[id]?.houseName||'').trim();
      if(!name) continue;
      let bb; try{bb=el.getBBox();}catch(e){continue;}
      const text=document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x',bb.x+bb.width/2);
      text.setAttribute('y',bb.y+bb.height/2);
      text.setAttribute('text-anchor','middle');
      text.setAttribute('dominant-baseline','middle');
      text.setAttribute('font-family','Arial, sans-serif');
      text.setAttribute('font-size',Math.max(5,Math.min(10,Math.min(bb.width,bb.height)*0.16)));
      text.setAttribute('fill','#111');
      text.setAttribute('data-block-label',id);
      text.textContent=name;
      labelLayer.appendChild(text);
    }
  }
  window.refreshEditableBlockLabels=refreshEditableBlockLabels;
  window.addEventListener('block-info-loaded',refreshEditableBlockLabels);
  for(const el of svg.querySelectorAll('path')){
    let bb;
    try{ bb=el.getBBox(); }catch(e){ continue; }
    // House/lot-sized closed or filled vector shapes; excludes tiny text glyphs and huge roads/zones.
    const fill=getComputedStyle(el).fill;
    const painted=fill && fill!=='none' && fill!=='rgba(0, 0, 0, 0)';
    if(!painted || bb.width<20 || bb.height<20 || bb.width>300 || bb.height>300 || bb.width*bb.height<700) continue;
    blockNo++;
    const id='BLOCK-'+String(blockNo).padStart(4,'0');
    el.classList.add('editable-block');
    el.dataset.blockId=id;
    blockElements[id]=el;
    el.style.pointerEvents='visiblePainted';
    el.addEventListener('click',ev=>{
      ev.stopPropagation();
      const info=(window.BLOCK_INFO||{})[id]||{};
      if(selected) selected.classList.remove('selected'); selected=null; clearBlockSelection(); selectedBlock=el;
      el.style.stroke='#e00000'; el.style.strokeWidth='7'; el.style.filter='drop-shadow(0 0 10px rgba(255,0,0,.9))';
      document.getElementById('blockId').textContent=id;
      houseName.textContent=info.houseName||'Empty / unnamed block';
      const vals=[info.houseNumber||'—',info.area||'—',info.feederNumber||'—',info.distributionBox||'—',info.breakerNumber||'—',info.meterNumber||'—'];
      const spans=[...card.querySelectorAll('.row .muted')].slice(1);
      spans.forEach((node,i)=>node.textContent=vals[i]||'—');
      card.style.display='block';
    });
  }
  svg.appendChild(labelLayer);
  refreshEditableBlockLabels();
  window.detectedBlockCount=blockNo;
}).catch(()=>{});
