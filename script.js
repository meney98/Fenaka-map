const W=4000,H=3301;
const map=L.map('map',{crs:L.CRS.Simple,minZoom:-3,maxZoom:2,zoomSnap:.25,zoomControl:true});
const bounds=[[0,0],[H,W]];
L.imageOverlay('fenaka-map.png',bounds).addTo(map);
map.fitBounds(bounds);

const COLORS={red:'#e63946',green:'#48a868',blue:'#2878c8'};
const ZONE_NAMES={red:'Fenaka / SS Zone',green:'Residential Zone',blue:'Public / Service Zone'};
const layers=[];
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function value(v){return v && String(v).trim() ? esc(v) : '<span class="not-entered">Not entered</span>';}

function building({name,number='',x,y,w,h,zone,distributionBox='',breaker='',owner='',mobile='',info=''}){
  const zoneName=ZONE_NAMES[zone]||zone;
  const r=L.rectangle([[H-(y+h),x],[H-y,x+w]],{color:COLORS[zone]||'#666',weight:2,fillColor:COLORS[zone]||'#999',fillOpacity:.40}).addTo(map);
  r.bindTooltip(number?`${name} · ${number}`:name,{direction:'top',sticky:true});
  r.bindPopup(`<div class="zone-box ${esc(zone)}">${esc(zoneName)}</div>
    <h3>${esc(name)}</h3>
    <div class="details">
      <div><b>House / No.</b><span>${value(number)}</span></div>
      <div><b>Distribution Box No.</b><span>${value(distributionBox)}</span></div>
      <div><b>Breaker No.</b><span>${value(breaker)}</span></div>
      <div><b>Owner Name</b><span>${value(owner)}</span></div>
      <div><b>Mobile Number</b><span>${value(mobile)}</span></div>
      <div><b>Information</b><span>${value(info)}</span></div>
    </div>`,{maxWidth:340});
  layers.push({name,number,zoneName,distributionBox,breaker,owner,mobile,r});
  return r;
}

// Add actual distribution-box, breaker, owner and mobile data in these records when available.
building({name:'Fenaka Corporation Fonadhoo Branch',x:2490,y:1125,w:145,h:95,zone:'red',info:'Fenaka Corporation Fonadhoo Branch'});
building({name:'SS 01',number:'SS 01',x:2645,y:1125,w:70,h:70,zone:'red',info:'SS zone property'});
building({name:'SS 02',number:'SS 02',x:2722,y:1125,w:70,h:70,zone:'red',info:'SS zone property'});
building({name:'SS 03',number:'SS 03',x:2799,y:1125,w:70,h:70,zone:'red',info:'SS zone property'});
building({name:'SS 04',number:'SS 04',x:2876,y:1125,w:70,h:70,zone:'red',info:'SS zone property'});
building({name:'Health Centre',x:2270,y:1360,w:135,h:90,zone:'blue',info:'Public service'});
building({name:'Fonadhoo Court',x:2550,y:1280,w:120,h:80,zone:'blue',info:'Public service'});
building({name:'BML Fonadhoo Branch',x:1730,y:2060,w:120,h:75,zone:'blue',info:'Bank'});
building({name:'Wamco Office',x:1170,y:2390,w:120,h:75,zone:'blue',info:'Waste management office'});
building({name:'Green Garden',number:'K-85/33',x:3030,y:820,w:70,h:55,zone:'green',info:'Residential property'});
building({name:'Dream House',x:2945,y:870,w:70,h:55,zone:'green',info:'Residential property'});

function search(){
 const q=document.getElementById('search').value.trim().toLowerCase(); if(!q)return;
 const m=layers.find(o=>[o.name,o.number,o.zoneName,o.distributionBox,o.breaker,o.owner,o.mobile].some(v=>(v||'').toLowerCase().includes(q)));
 if(m){map.fitBounds(m.r.getBounds(),{maxZoom:1});m.r.openPopup();} else alert('No matching clickable building or record yet.');
}
document.getElementById('go').onclick=search;
document.getElementById('search').addEventListener('keydown',e=>{if(e.key==='Enter')search();});
