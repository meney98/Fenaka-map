const places=[
 {name:'Fenaka Cooporation Fonadhoo Branch',type:'Fenaka facility',x:51.6,y:63.3},
 {name:'SS 01',type:'SS site',x:51.35,y:63.05},
 {name:'SS 02',type:'SS site',x:51.55,y:62.95},
 {name:'SS 03',type:'SS site',x:51.75,y:63.05},
 {name:'SS 04',type:'SS site',x:51.85,y:63.25}
];
const viewport=document.querySelector('#viewport'),stage=document.querySelector('#stage'),pins=document.querySelector('#pins'),map=document.querySelector('#map');
let scale=.06,tx=0,ty=0,drag=false,lastX=0,lastY=0,startDist=0,startScale=scale;
function apply(){stage.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`}
function fit(){const vw=viewport.clientWidth,vh=viewport.clientHeight;scale=Math.min(vw/14400,vh/11883)*.92;tx=(vw-14400*scale)/2;ty=(vh-11883*scale)/2;apply()}
function showPlace(p){document.querySelector('#pname').textContent=p.name;document.querySelector('#ptype').textContent=p.type;document.querySelector('#popup').classList.remove('hidden');const targetScale=Math.max(scale,.13);tx=viewport.clientWidth/2-(p.x/100*14400)*targetScale;ty=viewport.clientHeight/2-(p.y/100*11883)*targetScale;scale=targetScale;apply()}
places.forEach(p=>{const el=document.createElement('button');el.className='pin';el.style.left=p.x+'%';el.style.top=p.y+'%';el.title=p.name;el.innerHTML=`<span class="pin-label">${p.name}</span>`;el.onclick=e=>{e.stopPropagation();showPlace(p)};pins.appendChild(el)});
viewport.addEventListener('wheel',e=>{e.preventDefault();const r=viewport.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,old=scale;scale=Math.min(.8,Math.max(.025,scale*(e.deltaY<0?1.18:.85)));tx=mx-(mx-tx)*(scale/old);ty=my-(my-ty)*(scale/old);apply()},{passive:false});
viewport.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;viewport.setPointerCapture(e.pointerId)});viewport.addEventListener('pointermove',e=>{if(!drag)return;tx+=e.clientX-lastX;ty+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;apply()});viewport.addEventListener('pointerup',()=>drag=false);viewport.addEventListener('pointercancel',()=>drag=false);
let touches=[];viewport.addEventListener('touchstart',e=>{if(e.touches.length===2){startDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);startScale=scale}},{passive:true});viewport.addEventListener('touchmove',e=>{if(e.touches.length===2&&startDist){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);scale=Math.min(.8,Math.max(.025,startScale*d/startDist));apply()}},{passive:true});
document.querySelector('#reset').onclick=fit;document.querySelector('#close').onclick=()=>document.querySelector('#popup').classList.add('hidden');
const search=document.querySelector('#search'),results=document.querySelector('#results');search.oninput=()=>{const q=search.value.trim().toLowerCase();results.innerHTML='';if(!q)return;places.filter(p=>p.name.toLowerCase().includes(q)).forEach(p=>{const d=document.createElement('div');d.className='result';d.textContent=p.name;d.onclick=()=>{search.value=p.name;results.innerHTML='';showPlace(p)};results.appendChild(d)})};
window.addEventListener('resize',fit);map.onload=fit;fit();
