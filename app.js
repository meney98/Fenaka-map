(() => {
const viewport=document.getElementById("mapViewport"), stage=document.getElementById("mapStage"), img=document.getElementById("mapImage");
const layer=document.getElementById("markerLayer"), search=document.getElementById("search"), suggestions=document.getElementById("suggestions");
let scale=1, x=0, y=0, minScale=.1, maxScale=8;
const pointers=new Map(); let lastCenter=null,lastDistance=null,moved=false;

function clamp(){
  const vw=viewport.clientWidth,vh=viewport.clientHeight,sw=img.naturalWidth*scale,sh=img.naturalHeight*scale;
  if(sw<=vw) x=(vw-sw)/2; else x=Math.min(0,Math.max(vw-sw,x));
  if(sh<=vh) y=(vh-sh)/2; else y=Math.min(0,Math.max(vh-sh,y));
}
function apply(){clamp();stage.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`}
function fit(){
  if(!img.naturalWidth)return;
  const sx=viewport.clientWidth/img.naturalWidth,sy=viewport.clientHeight/img.naturalHeight;
  scale=Math.min(sx,sy); minScale=scale*.75; maxScale=Math.max(5,scale*12);
  x=(viewport.clientWidth-img.naturalWidth*scale)/2;y=(viewport.clientHeight-img.naturalHeight*scale)/2;apply();
}
function zoomAt(factor,cx=viewport.clientWidth/2,cy=viewport.clientHeight/2){
  const old=scale, ns=Math.max(minScale,Math.min(maxScale,old*factor)); if(ns===old)return;
  const mx=(cx-x)/old,my=(cy-y)/old; scale=ns;x=cx-mx*scale;y=cy-my*scale;apply();
}
img.addEventListener("load",fit); window.addEventListener("resize",fit);
document.getElementById("zoomIn").onclick=()=>zoomAt(1.35);
document.getElementById("zoomOut").onclick=()=>zoomAt(1/1.35);
document.getElementById("reset").onclick=fit;
viewport.addEventListener("wheel",e=>{e.preventDefault();const r=viewport.getBoundingClientRect();zoomAt(e.deltaY<0?1.15:1/1.15,e.clientX-r.left,e.clientY-r.top)},{passive:false});

viewport.addEventListener("pointerdown",e=>{
  viewport.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastCenter=null;lastDistance=null;moved=false;viewport.classList.add("dragging");
});
viewport.addEventListener("pointermove",e=>{
  if(!pointers.has(e.pointerId))return;e.preventDefault();
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const pts=[...pointers.values()];
  if(pts.length===1){
    const p=pts[0]; if(lastCenter){x+=p.x-lastCenter.x;y+=p.y-lastCenter.y;moved=true;apply()} lastCenter={...p};
  } else {
    const a=pts[0],b=pts[1],center={x:(a.x+b.x)/2,y:(a.y+b.y)/2},dist=Math.hypot(a.x-b.x,a.y-b.y);
    const r=viewport.getBoundingClientRect(),cx=center.x-r.left,cy=center.y-r.top;
    if(lastDistance){zoomAt(dist/lastDistance,cx,cy);moved=true}
    if(lastCenter){x+=center.x-lastCenter.x;y+=center.y-lastCenter.y;apply()}
    lastCenter=center;lastDistance=dist;
  }
},{passive:false});
function end(e){pointers.delete(e.pointerId);lastCenter=null;lastDistance=null;if(!pointers.size)viewport.classList.remove("dragging")}
viewport.addEventListener("pointerup",end);viewport.addEventListener("pointercancel",end);

function renderMarkers(){
 layer.innerHTML="";
 (window.HOUSES||[]).forEach(h=>{if(h.x==null||h.y==null)return;const m=document.createElement("button");m.className=`houseMarker ${h.status==="on"?"on":""}`;m.title=h.name;m.style.left=h.x+"px";m.style.top=h.y+"px";m.onclick=()=>focusHouse(h);layer.appendChild(m);h.el=m})
}
function focusHouse(h){
 if(h.x==null||h.y==null){alert(h.name+" is assigned to "+h.feeder+". Exact house-block position still needs to be mapped.");return}
 scale=Math.max(scale,2.4);x=viewport.clientWidth/2-h.x*scale;y=viewport.clientHeight/2-h.y*scale;apply();
 document.querySelectorAll(".houseMarker").forEach(e=>e.classList.remove("highlight"));if(h.el)h.el.classList.add("highlight");
}
function showSuggestions(){
 const q=search.value.trim().toLowerCase();if(!q){suggestions.style.display="none";return}
 const hits=(window.HOUSES||[]).filter(h=>h.name.toLowerCase().includes(q)).slice(0,15);suggestions.innerHTML="";
 hits.forEach(h=>{const d=document.createElement("div");d.className="suggestion";d.textContent=`${h.name} — ${h.feeder}`;d.onclick=()=>{search.value=h.name;suggestions.style.display="none";focusHouse(h)};suggestions.appendChild(d)});
 suggestions.style.display=hits.length?"block":"none";
}
search.addEventListener("input",showSuggestions);search.addEventListener("keydown",e=>{if(e.key==="Enter"){const h=(window.HOUSES||[]).find(v=>v.name.toLowerCase()===search.value.trim().toLowerCase())||(window.HOUSES||[]).find(v=>v.name.toLowerCase().includes(search.value.trim().toLowerCase()));if(h){suggestions.style.display="none";focusHouse(h)}}});
document.querySelectorAll("[data-feeder]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-feeder]").forEach(x=>x.classList.remove("active"));b.classList.add("active");});
renderMarkers(); if(img.complete)fit();
})();