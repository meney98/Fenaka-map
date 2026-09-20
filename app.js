const map=document.querySelector('#map'),stage=document.querySelector('#stage'),markers=document.querySelector('#markers');
let s=.65,x=20,y=30,drag=false,sx=0,sy=0;
const places=[
 {name:'Fenaka Corporation Fonadhoo Branch',num:'',zone:'Red',x:61.5,y:47.5,c:'red'},
 {name:'Shurooq',num:'B-01',zone:'Green',x:31.5,y:74.5,c:'green'},
 {name:'Mammage',num:'B-02',zone:'Green',x:30.2,y:75.5,c:'green'},
 {name:'Village',num:'B-03',zone:'Green',x:32.7,y:73.2,c:'green'},
 {name:'Aavaas',num:'B-06',zone:'Green',x:34.5,y:71.5,c:'green'}
 {name:'vinares',num:'k-06',zone:'Green',x:35.6,y:76.5,c:'green'}
];
function draw(){stage.style.transform=`translate(${x}px,${y}px) scale(${s})`}
function add(p){let m=document.createElement('div');m.className='marker '+(p.c||'');m.style.left=p.x+'%';m.style.top=p.y+'%';m.dataset.label=p.name+(p.num?' · '+p.num:'');m.onclick=e=>{e.stopPropagation();show(p)};markers.appendChild(m)} places.forEach(add);
function show(p){document.querySelector('#cname').textContent=p.name;document.querySelector('#cnum').textContent=p.num||'—';document.querySelector('#czone').textContent=p.zone||'—';document.querySelector('#card').classList.remove('hidden')}
function zoom(f,cx=map.clientWidth/2,cy=map.clientHeight/2){let ns=Math.max(.25,Math.min(4,s*f)),r=ns/s;x=cx-(cx-x)*r;y=cy-(cy-y)*r;s=ns;draw()}
map.addEventListener('pointerdown',e=>{drag=true;sx=e.clientX-x;sy=e.clientY-y;map.setPointerCapture(e.pointerId)});map.addEventListener('pointermove',e=>{if(drag){x=e.clientX-sx;y=e.clientY-sy;draw()}});map.addEventListener('pointerup',()=>drag=false);map.addEventListener('wheel',e=>{e.preventDefault();let r=map.getBoundingClientRect();zoom(e.deltaY<0?1.15:.87,e.clientX-r.left,e.clientY-r.top)},{passive:false});
document.querySelector('#zin').onclick=()=>zoom(1.25);document.querySelector('#zout').onclick=()=>zoom(.8);document.querySelector('#reset').onclick=()=>{s=.65;x=20;y=30;draw()};document.querySelector('#close').onclick=()=>document.querySelector('#card').classList.add('hidden');
document.querySelector('#search').addEventListener('input',e=>{let q=e.target.value.trim().toLowerCase();if(!q)return;let p=places.find(p=>(p.name+' '+p.num).toLowerCase().includes(q));if(p){show(p);s=1.4;x=map.clientWidth/2-(1600*p.x/100)*s;y=map.clientHeight/2-(1600*0.75*p.y/100)*s;draw()}});draw();
