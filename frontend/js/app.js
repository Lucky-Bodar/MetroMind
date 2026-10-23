/**
 * ====================================================================
 * MetroMind — AI-Driven Traffic Optimisation for Bengaluru
 * Frontend Core Application (v3 with Leaflet & Real-Time IST Engine)
 * ====================================================================
 * Design Project – I (E1CSA313) · Alliance University · Sem 5
 * 
 * Team:
 *   1. Akshat Kishore        - 2411021060556
 *   2. Arya Utkarsh          - 2411021060543
 *   3. Bodar Lucky Kumar     - 2411021060517
 *   4. D. Sai Shikhar Achari - 2411021060542
 * Mentor: Dr. C. Viji
 * ====================================================================
 */


const $=id=>document.getElementById(id);
const RAW=`MG Road|12.9756|77.6070|1.1
Majestic (KSR Station)|12.9779|77.5726|1.1
Shivajinagar|12.9857|77.6057|1
Vidhana Soudha|12.9797|77.5907|.95
Richmond Circle|12.9657|77.5990|.95
Lalbagh|12.9507|77.5848|.9
Town Hall|12.9645|77.5800|.95
Malleshwaram|13.0035|77.5710|.9
Rajajinagar|12.9910|77.5520|.95
Vijayanagar|12.9719|77.5300|.9
Basavanagudi|12.9422|77.5738|.9
Jayanagar|12.9250|77.5938|.95
JP Nagar|12.9063|77.5857|.95
BTM Layout|12.9166|77.6101|1.05
Koramangala|12.9352|77.6245|1.1
Indiranagar|12.9784|77.6408|1.05
Domlur|12.9609|77.6387|1
HAL Airport Road|12.9585|77.6480|.95
Ulsoor|12.9830|77.6200|.9
Frazer Town|12.9980|77.6130|.85
Shanthinagar|12.9570|77.6000|.9
Vasanth Nagar|12.9890|77.5900|.9
Sadashivanagar|13.0070|77.5800|.85
Hebbal|13.0358|77.5970|1.25
Yelahanka|13.1007|77.5963|.95
Kempegowda Airport (BLR)|13.1986|77.7066|.85
Sahakara Nagar|13.0624|77.5870|.85
Jakkur|13.0770|77.6070|.8
Thanisandra|13.0560|77.6340|.85
Nagawara (Manyata Tech Park)|13.0450|77.6200|1.1
Hennur|13.0360|77.6400|1
Kalyan Nagar|13.0250|77.6410|.9
Banaswadi|13.0140|77.6510|.9
RT Nagar|13.0210|77.5950|.85
Mathikere|13.0300|77.5600|.85
Yeshwanthpur|13.0285|77.5400|1.05
Jalahalli|13.0400|77.5200|.9
Peenya|13.0285|77.5200|.95
Dasarahalli|13.0450|77.5120|.85
Nagasandra|13.0480|77.4980|.8
Vidyaranyapura|13.0780|77.5550|.8
Goraguntepalya|13.0330|77.5290|1
Nagarbhavi|12.9610|77.5110|.85
Nayandahalli|12.9420|77.5200|1
Rajarajeshwari Nagar|12.9270|77.5190|.85
Kengeri|12.9140|77.4830|.85
Banashankari|12.9255|77.5468|1
Uttarahalli|12.9020|77.5430|.85
Konanakunte|12.8830|77.5700|.85
Magadi Road (Sumanahalli)|12.9810|77.5400|.9
Jnanabharathi|12.9500|77.5040|.8
Silk Board|12.9177|77.6233|1.35
Madiwala|12.9226|77.6174|1.15
HSR Layout|12.9116|77.6389|1
Bommanahalli|12.9060|77.6230|.95
Arekere|12.8880|77.5970|.85
Hulimavu|12.8760|77.6000|.8
Begur|12.8780|77.6240|.8
Singasandra|12.8780|77.6490|.9
Electronic City|12.8452|77.6602|1.05
Bommasandra|12.8150|77.6830|.85
Agara|12.9250|77.6490|1
Bellandur|12.9260|77.6762|1.2
Kadubeesanahalli|12.9370|77.6930|1.15
Kasavanahalli|12.9100|77.6800|.95
Carmelaram|12.9050|77.7100|.85
Sarjapur|12.8600|77.7830|.8
Marathahalli|12.9569|77.7011|1.2
Brookefield|12.9660|77.7160|.95
Varthur|12.9390|77.7410|.9
Whitefield|12.9698|77.7500|1.05
ITPL (Whitefield)|12.9856|77.7370|1
Hoodi|12.9920|77.7160|1
Mahadevapura|12.9910|77.6870|1.05
KR Puram|13.0075|77.6960|1.25
Ramamurthy Nagar|13.0170|77.6760|.95
CV Raman Nagar|12.9850|77.6640|.9
Tin Factory|12.9960|77.6650|1.2
Baiyappanahalli|12.9900|77.6420|.95
Jeevan Bima Nagar|12.9650|77.6500|.85`;
const CORR=[["Outer Ring Road (East)",["Hebbal","Nagawara (Manyata Tech Park)","Hennur","Banaswadi","Ramamurthy Nagar","KR Puram","Mahadevapura","Marathahalli","Kadubeesanahalli","Bellandur","Agara","Silk Board"]],
["Outer Ring Road (West)",["Hebbal","Mathikere","Yeshwanthpur","Goraguntepalya","Peenya","Nagarbhavi","Nayandahalli","Banashankari","JP Nagar","BTM Layout","Silk Board"]],
["Bellary Road",["Shivajinagar","Sadashivanagar","Hebbal","Sahakara Nagar","Yelahanka","Kempegowda Airport (BLR)"]],
["Old Madras Road",["MG Road","Indiranagar","Baiyappanahalli","Tin Factory","KR Puram"]],
["Whitefield Road",["KR Puram","Mahadevapura","Hoodi","ITPL (Whitefield)","Whitefield"]],
["Old Airport Road",["MG Road","Domlur","HAL Airport Road","Marathahalli","Brookefield","Whitefield"]],
["Hosur Road",["Shanthinagar","Madiwala","Silk Board","Bommanahalli","Singasandra","Electronic City","Bommasandra"]],
["Bannerghatta Road",["Jayanagar","BTM Layout","Arekere","Hulimavu"]],
["Kanakapura Road",["Basavanagudi","JP Nagar","Konanakunte"]],
["Mysore Road",["Majestic (KSR Station)","Vijayanagar","Nayandahalli","Rajarajeshwari Nagar","Kengeri"]],
["Tumkur Road",["Majestic (KSR Station)","Rajajinagar","Yeshwanthpur","Jalahalli","Dasarahalli","Nagasandra"]],
["Central Business District",["Majestic (KSR Station)","Vidhana Soudha","MG Road","Ulsoor","Indiranagar"]],
["Sarjapur Road",["Koramangala","Agara","Kasavanahalli","Carmelaram","Sarjapur"]],
["Koramangala Link",["Domlur","Koramangala","Madiwala","HSR Layout","Agara"]],
["Old City Roads",["Majestic (KSR Station)","Town Hall","Richmond Circle","Shanthinagar","Lalbagh"]],
["Magadi Road",["Majestic (KSR Station)","Magadi Road (Sumanahalli)","Goraguntepalya"]],
["Varthur Road",["Marathahalli","Varthur","Whitefield"]]];
let N=RAW.split("\n").map(l=>{const[a,b,c,d]=l.split("|");return{n:a,lat:+b,lng:+c,w:+d}});
const BASE=N.length,MODE={car:"Car",bike:"Two-wheeler",bus:"Bus"};
const g=(h,m,s)=>Math.exp(-((h-m)**2)/(2*s*s)),H=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0)%1000/1000};
const cong=t=>Math.min(100,Math.round(100*(1-1/t)*1.7)),col=c=>c<30?"#22b573":c<55?"#f2c024":c<75?"#f08a2b":"#e0443a",lab=c=>c<30?"Free flow":c<55?"Moderate":c<75?"Heavy":"Severe";
const fmt=h=>{h=((h%24)+24)%24;const m=Math.round(h*60);return String(Math.floor(m/60)%24).padStart(2,"0")+":"+String(m%60).padStart(2,"0")};
const adj=(x,m)=>m==="bike"?x*.85:m==="bus"?x*1.1+7:x;
const hav=(a,b)=>{const R=6371,r=Math.PI/180,dl=(b.lat-a.lat)*r,dg=(b.lng-a.lng)*r,x=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
let AD=[],SEL={},C={},LAST=null,TRIPS=[],RES=null;
function build(){AD=N.map(()=>new Map());const add=(a,b,art,corr)=>{const len=hav(N[a],N[b])*1.3,key=[N[a].n,N[b].n].sort().join("|");[[a,b],[b,a]].forEach(([x,y])=>{const o=AD[x].get(y);if(!o||(art&&!o.art))AD[x].set(y,{a:x,to:y,len,art,corr,key,fs:art?42:28})})};
 N.forEach((p,i)=>N.map((q,j)=>[j,hav(p,q)]).filter(x=>x[0]!==i).sort((x,y)=>x[1]-y[1]).slice(0,4).forEach(([j])=>add(i,j,false,"")));
 const ix=n=>N.findIndex(q=>q.n===n);CORR.forEach(([nm,l])=>{for(let k=0;k<l.length-1;k++)add(ix(l[k]),ix(l[k+1]),true,nm)})}
build();
function ttiE(e,h,c,live){const A=N[e.a],B=N[e.to],w=(A.w+B.w)/2*(e.art?1:.72),wk=c.we?.55:1,k1=.8+.4*H(e.key+"a"),k2=.8+.4*H(e.key+"b");
 let t=1+w*(.95*(g(h,8.8,1.25)*k1+g(h,18.3,1.5)*k2)+.15*g(h,13,2.5))*wk;const W={clear:[0,0],rain:[.25,.05],heavy:[.5,.12]}[c.wx];t=1+(t-1)*(1+W[0])+W[1];
 if(c.inc===e.key)t+=.6;t*=live?1+.65*(H(e.key+Math.floor(h*12))-.5)*.2:1.03;return Math.max(1,t)}
const eMin=(e,h,c,l)=>e.len/(e.fs/ttiE(e,h,c,l))*60;
function path(s,d,st,c,live,pen){const n=N.length,D=Array(n).fill(1e9),P=Array(n).fill(null),F=Array(n).fill(false);D[s]=0;
 for(;;){let u=-1,b=1e9;for(let i=0;i<n;i++)if(!F[i]&&D[i]<b){b=D[i];u=i}if(u<0||u===d)break;F[u]=true;
  for(const e of AD[u].values()){const m=eMin(e,st+D[u]/60,c,live)*(pen&&pen.has(e.key)?1.7:1);if(D[u]+m<D[e.to]){D[e.to]=D[u]+m;P[e.to]=e}}}
 if(!P[d])return null;const es=[];for(let v=d;v!==s;){const e=P[v];es.unshift(e);v=e.a}return es}
function evalP(es,st,mode,c,live,prim){let clk=st,tot=0,fr=0,dist=0,ok=true,rows=[];const ex=prim?prim.rows.reduce((a,r)=>a+r.t-1,0)/prim.rows.length:0;
 for(const e of es){const t=ttiE(e,clk,c,live),mins=e.len/(e.fs/t)*60,fm=e.len/e.fs*60;let sp=0;if(prim&&!prim.keys.has(e.key)){sp=cong(t+.08*ex*2.5);if(sp>75)ok=false}
  rows.push({e,from:N[e.a].n,to:N[e.to].n,len:e.len,mins,fm,t,cg:cong(t),clk,sp,veh:Math.round(115*t+H(e.key+clk)*10)});clk+=mins/60;tot+=mins;fr+=fm;dist+=e.len}
 return{tot:adj(tot,mode),free:adj(fr,mode),dist,rows,ok,st,mode,keys:new Set(es.map(e=>e.key))}}
const nodeIx=o=>N.indexOf(o);
/* ---------- v3: map (Leaflet) ---------- */
const MW=620,MH=790,px=n=>[0,0];
let MAP,BL={},OV,CB="normal",VR=0,tWarn=false,VEL=0;
const BCOL={normal:"#e6ecf2",night:"#0b1a30",sat:"#1b2a1f"};
function initMap(){
 MAP=L.map("mapw",{zoomControl:false,minZoom:9,maxZoom:18,center:[12.97,77.62],zoom:11,zoomSnap:.25,maxBounds:[[12.55,77.15],[13.5,78.05]],maxBoundsViscosity:.8});
 L.control.zoom({position:"bottomright"}).addTo(MAP);
 const G=L.GridLayer.extend({createTile(){const t=document.createElement("canvas");t.width=t.height=256;const x=t.getContext("2d");x.fillStyle=BCOL[CB];x.fillRect(0,0,256,256);x.strokeStyle=CB==="normal"?"rgba(15,27,45,.07)":"rgba(255,255,255,.06)";x.strokeRect(.5,.5,255,255);return t}});
 BL.grid=new G({zIndex:1});
 const tl=(u,o)=>L.tileLayer(u,Object.assign({maxZoom:19,zIndex:2},o));
 BL.normal=tl("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",{attribution:"Esri, HERE, Garmin"});
 BL.night=L.layerGroup([tl("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",{attribution:"Esri, HERE, Garmin"}),tl("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",{zIndex:3})]);
 BL.sat=L.layerGroup([tl("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Imagery © Esri"}),tl("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{zIndex:3})]);
 const te=()=>{if(!tWarn){tWarn=true;toast("Map tiles need an internet connection. Routes still work on the offline grid.")}};
 [BL.normal].forEach(l=>l.on("tileerror",te));[BL.night,BL.sat].forEach(g=>g.eachLayer(l=>l.on("tileerror",te)));
 BL.grid.addTo(MAP);BL.normal.addTo(MAP);OV=L.layerGroup().addTo(MAP)}
function bPill(){const b=document.querySelector("#bsw button.on"),p=$("bpill");p.style.left=b.offsetLeft+"px";p.style.width=b.offsetWidth+"px"}
function setBase(k){if(k===CB)return;[BL.normal,BL.night,BL.sat].forEach(l=>MAP.hasLayer(l)&&MAP.removeLayer(l));CB=k;BL[k].addTo(MAP);BL.grid.redraw();$("mapc").dataset.b=k;document.querySelectorAll("#bsw button").forEach(b=>b.classList.toggle("on",b.dataset.b===k));bPill();drawMap(RES,true);toast({normal:"Normal map",night:"Night mode",sat:"Satellite view"}[k])}
function nClick(n){if(!SEL.src||(SEL.src&&SEL.dst))pick("src",n),SEL.dst=null,$("dst").value="",$("dst").classList.remove("ok");else pick("dst",n);toast((SEL.dst?"Destination":"Source")+" set: "+n.n)}
function fitBox(es){if(!es.length)return[];return L.latLngBounds(es.flatMap(e=>[[N[e.a].lat,N[e.a].lng],[N[e.to].lat,N[e.to].lng]]))}
function zoomTo(t){if(!MAP)return;MAP.invalidateSize();Array.isArray(t)?MAP.flyTo([12.97,77.62],11,{duration:1.2}):MAP.flyToBounds(t,{padding:[90,90],maxZoom:14,duration:1.2})}
function drawMap(r,q){if(!MAP)return;cancelAnimationFrame(VR);OV.clearLayers();const dk=CB!=="normal",ll=n=>[n.lat,n.lng],sn=n=>n.n.split(" (")[0];
 const seen=new Set();AD.forEach(m=>m.forEach(e=>{if(e.art&&!seen.has(e.key)){seen.add(e.key);L.polyline([ll(N[e.a]),ll(N[e.to])],{color:dk?"#9db8de":"#5b7aa6",weight:3,opacity:.55,interactive:false}).addTo(OV)}}));
 const onR=new Set(r?r.es.flatMap(e=>[N[e.a].n,N[e.to].n]):[]);
 N.forEach(n=>{const on=onR.has(n.n);if(SEL.src===n||SEL.dst===n)return;const m=L.circleMarker(ll(n),{radius:on?5.5:3.8,color:dk?"#fff":"#0b1730",weight:1.5,fillColor:on?"#fff":(dk?"#9fb8d9":"#1d4f91"),fillOpacity:1}).addTo(OV);m.bindTooltip(sn(n),{className:"lt",direction:"top",offset:[0,-4],permanent:!!(on&&r&&onR.size<=9)});m.on("click",()=>nClick(n))});
 if(r){if(r.alt){L.polyline(r.alt.es.map(e=>ll(N[e.a])).concat([ll(N[r.alt.es[r.alt.es.length-1].to])]),{color:"#a78bfa",weight:4,dashArray:"9 9",opacity:.95,className:q?"":"alt"}).addTo(OV).bindTooltip("Alternate route",{className:"lt",sticky:true})}
  r.es.forEach((e,i)=>{const pts=[ll(N[e.a]),ll(N[e.to])],w=r.cur.rows[i],cg=w.cg;L.polyline(pts,{color:"#000",weight:11,opacity:dk?.45:.22,interactive:false}).addTo(OV);const p=L.polyline(pts,{color:col(cg),weight:7,opacity:1,lineCap:"round",className:q?"rs":"rt"}).addTo(OV),el=p.getElement();if(el&&!q){el.setAttribute("pathLength","1");el.style.animationDelay=i*.12+"s"}p.bindTooltip(sn({n:w.from})+" → "+sn({n:w.to})+": "+cg+"% "+lab(cg),{className:"lt",sticky:true})});
  const b=r.bn;if(b&&b.cg>=30){const A=N[b.e.a],B=N[b.e.to];L.marker([(A.lat+B.lat)/2,(A.lng+B.lng)/2],{icon:L.divIcon({className:"",html:'<div class="bnm"></div>',iconSize:[22,22]}),zIndexOffset:500,interactive:false}).addTo(OV).bindTooltip("Bottleneck: "+sn(A)+" → "+sn(B),{className:"lt",permanent:true,direction:"right",offset:[14,0]})}
  const P=[ll(N[r.es[0].a])].concat(r.es.map(e=>ll(N[e.to]))),cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const T=cum[cum.length-1],PH=[0,.33,.66];
  const vs=PH.map(()=>L.marker(P[0],{icon:L.divIcon({className:"",html:'<div class="veh"></div>',iconSize:[14,14]}),interactive:false,zIndexOffset:900}).addTo(OV)),D=Math.max(7000,r.es.length*1100),t0=performance.now()+1500;
  const fr=now=>{vs.forEach((m,j)=>{const k=(((now-t0)/D+PH[j])%1+1)%1,d=k*T;let i=1;while(i<cum.length-1&&cum[i]<d)i++;const f=(d-cum[i-1])/((cum[i]-cum[i-1])||1);m.setLatLng([P[i-1][0]+(P[i][0]-P[i-1][0])*f,P[i-1][1]+(P[i][1]-P[i-1][1])*f])});VR=requestAnimationFrame(fr)};VR=requestAnimationFrame(fr)}
 [["src","A"],["dst","B"]].forEach(([k,t])=>{const n=SEL[k];if(!n)return;L.marker(ll(n),{icon:L.divIcon({className:"",html:`<div class="mpin ${t}">${t}</div>`,iconSize:[26,26]}),zIndexOffset:1000}).addTo(OV).bindTooltip(sn(n),{className:"lt",permanent:true,direction:"top",offset:[0,-14]})})}
function msumFill(R){const c=R.cur,b=R.bn,s=n=>n.split(" (")[0];$("msum").innerHTML=`<div><b>${s(SEL.src.n)} → ${s(SEL.dst.n)}</b><small>${MODE[R.mode]} · leave ${fmt(R.st)}</small></div><div><b>${Math.round(c.tot)} min</b><small>travel time</small></div><div><b>${c.dist.toFixed(1)} km</b><small>distance</small></div><div><b>${fmt(R.st+c.tot/60)}</b><small>arrival</small></div><div><b style="color:${col(b.cg)}">${s(b.from)} → ${s(b.to)}</b><small>bottleneck · ${b.cg}% ${lab(b.cg)}</small></div><button class="btn" id="dn">Details ↓</button>`;$("msum").classList.add("on");$("mh").style.display="none";$("dn").onclick=()=>$("via").scrollIntoView({behavior:"smooth"})}
/* ---------- v3: live clock, feed, pipeline bar ---------- */
function ist(){const o={};new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit",weekday:"short"}).formatToParts(new Date()).forEach(x=>o[x.type]=x.value);const hh=String(+o.hour%24).padStart(2,"0");return{h:(+o.hour%24)+(+o.minute)/60+(+o.second)/3600,t:hh+":"+o.minute+":"+o.second,hm:hh+":"+o.minute,we:/Sat|Sun/.test(o.weekday)}}
let LASTSYNC=Date.now();
function tick(){const d=ist();$("clk").textContent=d.t;$("dt").textContent=new Date().toLocaleDateString("en-IN",{timeZone:"Asia/Kolkata",weekday:"short",day:"2-digit",month:"short"})+" · IST";const s=Math.round((Date.now()-LASTSYNC)/1000);$("sync").textContent="synced "+(s<1?"just now":s+"s ago")}
function cityIdx(){const d=ist(),cc={we:d.we,wx:"clear",inc:""};let s=0,n=0;AD.forEach(m=>m.forEach(e=>{if(e.art&&e.a<e.to){s+=cong(ttiE(e,d.h,cc,true));n++}}));return Math.round(s/n)}
function sync(){const d=ist(),ci=cityIdx();LASTSYNC=Date.now();$("ci").textContent=ci+"% "+lab(ci);$("ci").style.color=col(ci);$("slot").textContent=String(Math.floor(d.h*12)).padStart(3,"0")+" / 288";$("rd").textContent=(Math.floor(d.h*720)*17).toLocaleString("en-IN");["lv","d3c"].forEach(i=>{$(i).classList.add("fl");setTimeout(()=>$(i).classList.remove("fl"),700)});tick()}
function pbSet(k){document.querySelectorAll(".pb").forEach((b,i)=>{b.classList.toggle("on",i===k);b.classList.toggle("done",i<k||k===5)})}
/* ---------- v3: scroll-driven road scene ---------- */
const RD=(()=>{const cv=$("road"),cx=cv.getContext("2d"),hero=$("top"),CC=["#ff5a5f","#ffb020","#4cc9f0","#c7f464","#f1f5f9","#a78bfa","#14b8a6","#ff8fab"],LS=[95,135,-110],LY=[.2,.5,.8];let W=0,Hh=0,off=0,last=0,st=[],ly=[],cars=[],dist=[0,0,0];
 function size(){const d=Math.min(2,devicePixelRatio||1);W=hero.clientWidth;Hh=hero.clientHeight;cv.width=W*d;cv.height=Hh*d;cx.setTransform(d,0,0,d,0,0);seed()}
 function seed(){st=[...Array(90)].map(()=>({x:Math.random()*W,y:Math.random()*Hh*.5,r:Math.random()*1.2+.3,p:Math.random()*6}));
  ly=[0,1,2].map(l=>{const a=[];let x=0;while(x<W+300){const w=34+Math.random()*(46+l*12),h=(50+Math.random()*(80+l*35))*(1+l*.25);a.push({x,w,h,s:Math.random()});x+=w+Math.random()*8}a.T=x;return a});
  cars=[];for(let l=0;l<3;l++)for(let k=0;k<5;k++)cars.push({l,k,c:CC[(l*5+k)%8],w:56+Math.random()*24})}
 function car(c,x,y,sc){cx.save();cx.translate(x,y);cx.scale(LS[c.l]<0?-sc:sc,sc);const w=c.w,h=22;
  const g=cx.createLinearGradient(w/2,0,w/2+80,0);g.addColorStop(0,"rgba(255,244,180,.45)");g.addColorStop(1,"rgba(255,244,180,0)");cx.fillStyle=g;cx.beginPath();cx.moveTo(w/2-4,-4);cx.lineTo(w/2+80,-16);cx.lineTo(w/2+80,16);cx.lineTo(w/2-4,4);cx.fill();
  cx.fillStyle="rgba(0,0,0,.4)";cx.fillRect(-w/2+3,h/2-2,w-6,5);cx.fillStyle=c.c;cx.beginPath();cx.roundRect(-w/2,-h/2,w,h,7);cx.fill();cx.fillStyle="rgba(10,25,50,.78)";cx.beginPath();cx.roundRect(-w/4,-h/2+3,w/2,h-9,4);cx.fill();
  cx.fillStyle="#fff7c2";cx.fillRect(w/2-4,-h/2+3,4,5);cx.fillRect(w/2-4,h/2-9,4,5);cx.fillStyle="#ff3b3b";cx.fillRect(-w/2,-h/2+3,3,5);cx.fillRect(-w/2,h/2-9,3,5);cx.fillStyle="#0a0a0a";cx.fillRect(-w/2+8,h/2-3,11,5);cx.fillRect(w/2-19,h/2-3,11,5);cx.restore()}
 function draw(t){const sy=scrollY,rt=Hh-190,cam=off+sy*1.2;
  let g=cx.createLinearGradient(0,0,0,Hh);g.addColorStop(0,"#050d1f");g.addColorStop(.6,"#0f2a52");g.addColorStop(1,"#1a4a6e");cx.fillStyle=g;cx.fillRect(0,0,W,Hh);
  st.forEach(s=>{cx.globalAlpha=.4+.5*Math.sin(t*1.5+s.p);cx.fillStyle="#fff";cx.beginPath();cx.arc(s.x,s.y-sy*.03,s.r,0,6.3);cx.fill()});cx.globalAlpha=1;
  const mg=cx.createRadialGradient(W*.82,Hh*.16-sy*.05,4,W*.82,Hh*.16-sy*.05,90);mg.addColorStop(0,"rgba(255,244,200,.95)");mg.addColorStop(.18,"rgba(255,244,200,.9)");mg.addColorStop(.19,"rgba(255,244,200,.14)");mg.addColorStop(1,"rgba(255,244,200,0)");cx.fillStyle=mg;cx.fillRect(W*.82-100,Hh*.16-sy*.05-100,200,200);
  const F=[.12,.28,.5],C=["#0d2146","#122f5c","#1a4573"];
  ly.forEach((a,l)=>{const sh=((cam*F[l])%a.T+a.T)%a.T;a.forEach(b=>{let x=b.x-sh;if(x<-b.w)x+=a.T;if(x>W)return;cx.fillStyle=C[l];cx.fillRect(x,rt-b.h,b.w,b.h+8);if(l>0){for(let wy=rt-b.h+8;wy<rt-8;wy+=11)for(let wx=x+5;wx<x+b.w-6;wx+=9){const v=Math.sin(wx*12.9+wy*7.7+b.s*50+Math.floor(t/3+b.s*9))*.5+.5;if(v>.62){cx.fillStyle=v>.9?"rgba(255,226,140,.95)":"rgba(255,210,120,.55)";cx.fillRect(wx,wy,4,5)}}}})});
  cx.fillStyle="#1d2d4a";cx.fillRect(0,rt-14,W,14);
  for(let x=-((cam*1)%320);x<W+320;x+=320){cx.fillStyle="#2c3f63";cx.fillRect(x,rt-62,3,50);cx.fillRect(x,rt-62,16,3);const lg=cx.createRadialGradient(x+14,rt-58,1,x+14,rt-58,60);lg.addColorStop(0,"rgba(255,220,140,.55)");lg.addColorStop(1,"rgba(255,220,140,0)");cx.fillStyle=lg;cx.fillRect(x-50,rt-120,130,130)}
  const rg=cx.createLinearGradient(0,rt,0,rt+150);rg.addColorStop(0,"#17233a");rg.addColorStop(1,"#0a111f");cx.fillStyle=rg;cx.fillRect(0,rt,W,150);cx.fillStyle="#2b3c5c";cx.fillRect(0,rt+150,W,40);
  cx.strokeStyle="rgba(255,255,255,.55)";cx.lineWidth=3;cx.setLineDash([34,26]);cx.lineDashOffset=(cam*1)%60;[rt+50,rt+100].forEach(y=>{cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke()});cx.setLineDash([]);
  const span=W+300;cars.forEach(c=>{const x=(((c.k*span/5+dist[c.l])%span)+span)%span-150,sc=[.88,1,1.14][c.l];car(c,x,rt+LY[c.l]*150,sc)})}
 function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;VEL*=.94;if(scrollY<Hh+60&&!document.hidden){const sp=1+Math.min(Math.abs(VEL),3000)/320;off+=dt*60*sp;LS.forEach((v,i)=>dist[i]+=v*sp*dt);draw(now/1000)}requestAnimationFrame(frame)}
 return{start(){size();addEventListener("resize",size);requestAnimationFrame(frame)}}})();
/* ---------- v3: wiring ---------- */
function v3init(){tick();sync();setInterval(tick,1000);setInterval(sync,5000);RD.start();
 let ly=scrollY,lt=performance.now();const hl=$("hl"),pg=$("pgi"),pc=$("pgc");
 const onS=()=>{const y=scrollY,t=performance.now();VEL=(y-ly)/Math.max(8,t-lt)*1000;ly=y;lt=t;const mx=Math.max(1,document.documentElement.scrollHeight-innerHeight),p=Math.min(1,y/mx);pg.style.width=p*100+"%";pc.style.left="calc("+p*100+"% - "+p*24+"px)";hl.style.transform="translateY("+Math.min(y,700)*.16+"px)";hl.style.opacity=Math.max(0,1-y/650);
  if($("plan").classList.contains("on")){const r=$("mapsec").getBoundingClientRect(),m=r.top<innerHeight*.45,bs=[...document.querySelectorAll("#nav button")],b=m?bs[1]:bs[0];if(!b.classList.contains("on")){bs.forEach(x=>x.classList.toggle("on",x===b));pillTo(b)}}};
 addEventListener("scroll",onS,{passive:true});onS();
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll(".sr").forEach(el=>io.observe(el));
 $("bsw").onclick=e=>{const b=e.target.closest("button");if(b)setBase(b.dataset.b)};bPill();
 const PBT=["src","mapsec","kpis","bn","sg"];$("pbar").onclick=e=>{const b=e.target.closest(".pb");if(!b)return;const k=+b.dataset.k;if(k>=2&&!RES){toast("Run “Analyse trip” first to see this stage’s output");return}if(!$("plan").classList.contains("on"))document.querySelector("#nav button").click();setTimeout(()=>$(PBT[k]).scrollIntoView({behavior:"smooth",block:"center"}),60)};
 $("cue").onclick=()=>$("mapsec").scrollIntoView({behavior:"smooth"});
 $("now").onclick=()=>{const d=ist(),m=Math.round(d.h*12)*5,hh=Math.floor(m/60)%24;$("tm").value=String(hh).padStart(2,"0")+":"+String(m%60).padStart(2,"0");$("day").value=d.we?"we":"wd";toast("Departure set to live IST time "+$("tm").value+(d.we?" (weekend)":" (weekday)"));if(SEL.src&&SEL.dst)run(true)};
 addEventListener("resize",()=>{bPill();pillTo(document.querySelector("#nav .on"))})}
/* ---------- autocomplete ---------- */
const toast=m=>{const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("on"),3400)};
function pick(role,n){SEL[role]=n;$(role).value=n.n;$(role).classList.add("ok");$(role+"L").classList.remove("on");drawMap(null);if(SEL.src&&SEL.dst&&role){const a=px(SEL.src),b=px(SEL.dst);zoomTo(fitBox([{a:nodeIx(SEL.src),to:nodeIx(SEL.dst)}]),700)}else zoomTo([0,0,MW,MH],700)}
async function online(role,q){toast("Searching OpenStreetMap for “"+q+"”…");try{const r=await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&viewbox=77.40,13.25,77.85,12.75&bounded=1&q="+encodeURIComponent(q+", Bengaluru"));const j=await r.json();if(!j.length){toast("No match found inside Bengaluru. Try a nearby locality.");return}
 const lat=+j[0].lat,lng=+j[0].lon;if(lat<12.78||lat>13.23||lng<77.45||lng>77.82){toast("That place is outside the Bengaluru area covered.");return}addCustom(role,q.replace(/\b\w/g,c=>c.toUpperCase()),lat,lng)}catch(e){toast("Online search needs an internet connection. Pick a place from the suggestions.")}}
function addCustom(role,name,lat,lng){const old=N.find(n=>n.cu===role);const keep=old&&(SEL.src===old||SEL.dst===old);N=N.filter(n=>n.cu!==role);N.push({n:name,lat,lng,w:.8,cu:role});build();const nn=N[N.length-1];["src","dst"].forEach(k=>{if(SEL[k]&&!N.includes(SEL[k]))SEL[k]=null});pick(role,nn)}
function ac(role){const inp=$(role),box=$(role+"L");let act=-1,items=[];
 const show=()=>{const q=inp.value.trim().toLowerCase();SEL[role]=SEL[role]&&SEL[role].n.toLowerCase()===q?SEL[role]:null;inp.classList.toggle("ok",!!SEL[role]);
  items=(q?N.filter(n=>n.n.toLowerCase().includes(q)).sort((a,b)=>a.n.toLowerCase().indexOf(q)-b.n.toLowerCase().indexOf(q)):N.filter(n=>n.w>=1.1)).slice(0,8);act=-1;
  box.innerHTML=items.map((n,i)=>`<div data-i="${i}"><span>${n.n}</span><small>${n.cu?"online result":(AREA(n))}</small></div>`).join("")+(q&&!items.some(n=>n.n.toLowerCase()===q)?`<div data-i="o"><span>🔎 Search “${inp.value.trim()}” online</span><small>OpenStreetMap</small></div>`:"");box.classList.add("on")};
 inp.oninput=show;inp.onfocus=show;inp.onblur=()=>setTimeout(()=>box.classList.remove("on"),180);
 box.onmousedown=e=>{const d=e.target.closest("[data-i]");if(!d)return;d.dataset.i==="o"?online(role,inp.value.trim()):pick(role,items[+d.dataset.i])};
 inp.onkeydown=e=>{const ds=[...box.children];if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();act=(act+(e.key==="ArrowDown"?1:-1)+ds.length)%ds.length;ds.forEach((d,i)=>d.classList.toggle("act",i===act))}
  else if(e.key==="Enter"){e.preventDefault();const d=ds[act>=0?act:0];if(d)d.dataset.i==="o"?online(role,inp.value.trim()):pick(role,items[+d.dataset.i]);if(SEL.src&&SEL.dst)setTimeout(()=>run(true),50)}}}
const AREA=n=>n.lat>13.04?"North":n.lat<12.93&&n.lng<77.6?"South-West":n.lat<12.93?"South":n.lng>77.66?"East":n.lng<77.56?"West":"Central";
/* ---------- run ---------- */
const STEPS=[["1 Collect","D2 form · D3 slot · D4 graph"],["2 Preprocess","Snap places · align slots"],["3 Estimate","D1 baseline × weather × D3"],["4 Diagnose","Rank sections by delay"],["5 Guide","What-if + nearby-road check"]];
async function run(anim){const msg=$("msg");
 if(!SEL.src||!SEL.dst){const q=!SEL.src?"src":"dst";msg.innerHTML=`<div class="card err rv"><b>Please pick both places from the suggestions</b> (or press Enter to search a new place online).</div>`;reveal(msg);$(q).focus();return}
 if(SEL.src===SEL.dst){msg.innerHTML=`<div class="card err rv"><b>Source and destination are the same place.</b> Please choose a different destination.</div>`;reveal(msg);$("out").style.display="none";return}
 if(!$("tm").value){msg.innerHTML=`<div class="card err rv"><b>Please enter a departure time.</b></div>`;reveal(msg);return}
 msg.innerHTML="";const out=$("out");
 if(anim){out.style.display="none";const p=$("pipe");p.classList.add("on");$("pst").innerHTML=STEPS.map(s=>`<div class="ps"><b>${s[0]}</b><small>${s[1]}</small></div>`).join("");$("mapsec").scrollIntoView({behavior:"smooth",block:"start"});
  let _i=0;for(const el of $("pst").children){pbSet(_i++);el.classList.add("on");await new Promise(r=>setTimeout(r,330));el.classList.remove("on");el.classList.add("done")}p.classList.remove("on");pbSet(5)}
 compute(anim)}
function compute(anim){const [hh,mm]=$("tm").value.split(":").map(Number),st=hh+mm/60,mode=$("mode").value,live=$("live").checked,s=nodeIx(SEL.src),d=nodeIx(SEL.dst);
 C={we:$("day").value==="we",wx:$("wx").value,inc:""};let es=path(s,d,st,C,live,null);
 if(!es){$("msg").innerHTML=`<div class="card err"><b>No route found</b> between these places.</div>`;return}
 let incTxt="";if($("inc").checked){const m=es[Math.floor(es.length/2)];C.inc=m.key;incTxt=N[m.a].n+" → "+N[m.to].n;es=path(s,d,st,C,live,null)}
 const cur=evalP(es,st,mode,C,live),prim={rows:cur.rows,keys:cur.keys};
 const pen=new Set(cur.keys);let ae=path(s,d,st,C,live,pen),alt=null;if(ae&&ae.some(e=>!cur.keys.has(e.key))){const r=evalP(ae,st,mode,C,live,prim);alt={es:ae,r}}
 const cands=[];for(const off of[-90,-60,-45,-30,-15,15,30,45,60,90]){const s2=st+off/60;if(s2<5||s2>22)continue;cands.push({off:Math.abs(off),type:"Departure time",tm:s2,label:`Leave ${off<0?-off+" min earlier":off+" min later"} (${fmt(s2)})`,r:evalP(es,s2,mode,C,false)})}
 if(alt)cands.push({type:"Route",label:"Use alternate route (dashed on map)",r:alt.r});
 Object.keys(MODE).forEach(m=>{if(m!==mode)cands.push({type:"Mode",rec:m==="bus",label:"Switch to "+MODE[m].toLowerCase(),r:evalP(es,st,m,C,live)})});
 const valid=cands.filter(x=>x.r.ok&&x.rec!==false),top=valid.reduce((a,b)=>!a||b.r.tot<a.r.tot?b:a,null),tS=top?cur.tot-top.r.tot:0,best=tS>0?valid.filter(x=>cur.tot-x.r.tot>=.7*tS).sort((a,b)=>(a.off||0)-(b.off||0)||a.r.tot-b.r.tot)[0]:null;
 const bn=cur.rows.reduce((a,b)=>b.mins-b.fm>a.mins-a.fm?b:a);
 RES={es,cur,alt,cands,best,save:best?cur.tot-best.r.tot:0,bn,st,mode,live,incTxt,s,d};LAST=RES;render(anim)}
const cnt=(el,to,dec=0,suf="")=>{const t0=performance.now();const f=n=>{const k=Math.min(1,(n-t0)/1100),v=to*(1-Math.pow(1-k,3));el.textContent=v.toFixed(dec)+suf;if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)};
function reveal(root){root.querySelectorAll(".rv").forEach((el,i)=>{el.style.setProperty("--i",i);el.classList.remove("rv-go");void el.offsetWidth;el.classList.add("rv-go")})}
function render(anim){const R=RES,cur=R.cur,mode=R.mode,bn=R.bn;$("out").style.display="block";
 const delay=Math.max(0,cur.tot-cur.free),avg=Math.round(cur.rows.reduce((a,r)=>a+r.cg*r.len,0)/cur.dist),sp=cur.dist/(cur.tot/60);
 const vc={};R.es.forEach(e=>{if(e.art)vc[e.corr]=(vc[e.corr]||0)+e.len});const via=Object.entries(vc).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
 $("via").innerHTML=`<span style="font-size:22px">🧭</span><div><b>${SEL.src.n.split(" (")[0]} → ${SEL.dst.n.split(" (")[0]}</b><div class="muted">${via.length?"via "+via.join(", "):"via local roads"} · ${R.es.length} road sections${R.incTxt?" · incident reported on "+R.incTxt:""}</div></div>`;
 const K=[[cur.tot,0," min","Estimated travel time ("+MODE[mode]+")"],[cur.dist,1," km","Route distance"],[sp,0," km/h","Average speed"],[delay,0," min","Delay vs free flow","+"],[avg,0,"%","Congestion · "+lab(avg),"",col(avg)],[null,0,"","Estimated arrival",fmt(R.st+cur.tot/60)]];
 $("kpis").innerHTML=K.map(k=>`<div class="kpi rv"><b ${k[5]?`style="color:${k[5]}"`:""}>${k[4]&&k[4]!=="+"?k[4]:(k[4]==="+"?"+":"")}<em style="font-style:normal" data-v="${k[0]}" data-d="${k[1]}" data-s="${k[2]}">${k[0]===null?"":"0"}</em></b><span>${k[3]}</span></div>`).join("");
 $("kpis").querySelectorAll("em[data-v]").forEach(e=>{if(e.dataset.v!=="null")cnt(e,+e.dataset.v,+e.dataset.d,e.dataset.s)});
 const reason=R.incTxt&&bn.e.key===C.inc?"an incident has been reported here (D2 reports, D3 speed drop)":C.wx!=="clear"&&bn.cg>=30?(C.wx==="heavy"?"heavy rain":"rain")+" slows traffic on top of normal demand (D4 weather)":bn.cg>=55?"peak-hour demand: about "+bn.veh+" vehicles per 5 min on a "+bn.e.fs+" km/h road (D1 pattern, D3 count)":"traffic is flowing without a major delay";
 $("bn").innerHTML=`<h2><span class="ic">🚧</span>Bottleneck</h2><p style="margin:0 0 8px"><b>${bn.from.split(" (")[0]} → ${bn.to.split(" (")[0]}</b> ${bn.e.corr?`<span class="muted">· ${bn.e.corr}</span>`:""} <span class="pill" style="background:${col(bn.cg)}">${bn.cg}% ${lab(bn.cg)}</span></p><p style="margin:0">Estimated speed ${(bn.len/(bn.mins/60)).toFixed(0)} km/h, delay +${(bn.mins-bn.fm).toFixed(1)} min. Reason: ${reason}. About ${Math.max(1,Math.round(bn.cg/12))} volunteer trips this hour reported a delay here (D2).</p>`;
 let s;const b=R.best;if(b&&R.save>=3)s=`<h2><span class="ic">💡</span>Suggestion</h2><p style="margin:0 0 8px;font-size:17px"><b>${b.label}</b></p><p style="margin:0">Expected travel time ${Math.round(b.r.tot)} min instead of ${Math.round(cur.tot)} min, saving about <b>${Math.round(R.save)} min</b>. ${b.type==="Route"?"Nearby-road check passed: no section on the alternate route goes above 75% congestion.":b.type==="Mode"?"Check the bus timetable before relying on this.":"Based on the predicted congestion pattern."}</p>${b.type==="Departure time"?`<p style="margin:12px 0 0"><button class="btn" id="apply">Apply this time</button></p>`:""}`;
 else s=`<h2><span class="ic">💡</span>Suggestion</h2><p style="margin:0;font-size:17px"><b>Keep your current plan.</b></p><p style="margin:6px 0 0">No alternative saves more than 3 minutes.</p>`;
 const rj=R.cands.find(x=>x.type==="Route"&&!x.r.ok&&x.r.tot<cur.tot-3);if(rj)s+=`<p class="muted" style="margin:10px 0 0">Spill-over check: the alternate route would be faster, but it would push nearby roads to ${Math.max(...rj.r.rows.map(r=>r.sp))}% congestion, so it is not suggested.</p>`;$("sg").innerHTML=s;if($("apply"))$("apply").onclick=()=>{$("tm").value=fmt(b.tm);run(false)};
 $("secs").innerHTML="<table><thead><tr><th>#</th><th>Section</th><th>Passes at</th><th>Length</th><th>Speed</th><th>Time</th><th>Delay</th><th>Congestion</th></tr></thead><tbody>"+cur.rows.map((r,i)=>`<tr style="--i:${i}"><td>${i+1}</td><td class="wr"><b>${r.from.split(" (")[0]} → ${r.to.split(" (")[0]}</b>${r.e.corr?`<div class="muted">${r.e.corr}</div>`:""}${r===bn&&bn.cg>=30?' <span class="pill" style="background:var(--ink)">bottleneck</span>':""}</td><td>${fmt(r.clk)}</td><td>${r.len.toFixed(1)} km</td><td>${(r.len/(r.mins/60)).toFixed(0)} km/h</td><td>${r.mins.toFixed(1)} min</td><td>+${(r.mins-r.fm).toFixed(1)} min</td><td><div style="display:flex;gap:8px;align-items:center"><div class="bar" style="flex:1"><i style="width:${r.cg}%;background:${col(r.cg)}"></i></div><b>${r.cg}%</b></div></td></tr>`).join("")+"</tbody></table>";
 chart();const rw=(l,r,t,ok,c)=>`<tr class="${c?"clk":""}" ${c?`data-tm="${c}"`:""}><td class="wr">${l}<div class="muted">${t}</div></td><td>${Math.round(r.tot)} min</td><td style="color:${r.tot-cur.tot>0.5?"var(--r)":r.tot-cur.tot<-0.5?"var(--g)":"inherit"}">${Math.round(r.tot-cur.tot)>0?"+":""}${Math.round(r.tot-cur.tot)} min</td><td>${fmt(r.st+r.tot/60)}</td><td>${ok?'<span class="pill" style="background:var(--g)">OK</span>':'<span class="pill" style="background:var(--r)">Rejected</span>'}</td></tr>`;
 $("cmp").innerHTML="<table><thead><tr><th>Option</th><th>Time</th><th>Change</th><th>Arrival</th><th>Spill-over</th></tr></thead><tbody>"+rw("<b>Current plan</b>",cur,MODE[mode]+" · leave "+fmt(R.st),true)+R.cands.map((x,i)=>rw(x.label,x.r,x.type,x.r.ok,x.tm||"")).join("")+"</tbody></table>";
 $("cmp").querySelectorAll("[data-tm]").forEach(tr=>{if(tr.dataset.tm)tr.onclick=()=>{$("tm").value=fmt(+tr.dataset.tm);run(false)}});
 const ne=R.es.length;$("trace").innerHTML=`<div class="tc rv"><b>D1 Historical data</b><br>Baseline index for ${ne} road sections at ${fmt(R.st)} (hour and weekday pattern).</div><div class="tc rv ${R.live?"":"fb"}"><b>D3 Live feed</b><br>${R.live?"Current 5-minute slot blended in (65% live, 35% baseline). Other departure times use D1 only.":"Not available. Fallback: D1 patterns corrected by D2 trip times (×1.03)."}</div><div class="tc rv"><b>D4 Road network &amp; weather</b><br>City graph of ${N.length} places, route length ${cur.dist.toFixed(1)} km, weather: ${$("wx").selectedOptions[0].text.toLowerCase()}.</div><div class="tc rv"><b>D2 Commuter trips</b><br>${R.incTxt?"Incident report applied on "+R.incTxt+". ":""}Delay reports explain the bottleneck; your trip joins D2 when saved.</div><div class="tc rv"><b>D5 Corridor summary</b><br>Updated when trips are saved (see Corridor Dashboard).</div>`;
 $("saved").textContent="";reveal($("out"));drawMap(R);zoomTo(fitBox(R.es.concat(R.alt?R.alt.es:[])),1100);
 msumFill(R);pbSet(5)}
function chart(){const R=RES,pts=[];for(let h=5;h<=22;h+=.25)pts.push([h,evalP(R.es,h,R.mode,C,false).tot]);const mx=Math.max(...pts.map(p=>p[1]))*1.1,mn=Math.min(...pts.map(p=>p[1]))*.88,W=640,Hh=220,P=38,X=h=>P+(h-5)/17*(W-P-12),Y=v=>Hh-28-(v-mn)/(mx-mn)*(Hh-50);
 let o=`<svg id="csv" viewBox="0 0 ${W} ${Hh}" width="100%"><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14b8a6" stop-opacity=".35"/><stop offset="1" stop-color="#14b8a6" stop-opacity="0"/></linearGradient></defs>`;
 for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4;o+=`<line x1="${P}" x2="${W-12}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e8eef3"/><text x="${P-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="#5b6b7e">${Math.round(v)}</text>`}
 for(let h=5;h<=22;h+=3)o+=`<text x="${X(h)}" y="${Hh-8}" text-anchor="middle" font-size="11" fill="#5b6b7e">${fmt(h)}</text>`;
 const pl=pts.map(p=>X(p[0])+","+Y(p[1])).join(" ");o+=`<polygon points="${X(5)},${Hh-28} ${pl} ${X(22)},${Hh-28}" fill="url(#ar)" style="animation:fadeIn 1.4s"/><polyline pathLength="1" class="rt" style="animation-duration:1.8s" points="${pl}" fill="none" stroke="#14b8a6" stroke-width="3.2" stroke-linejoin="round"/><g id="mk" style="transition:transform .5s cubic-bezier(.3,.8,.3,1)" transform="translate(${X(R.st)},0)"><line y1="10" y2="${Hh-28}" stroke="#e0443a" stroke-dasharray="4 4"/><circle cy="${Y(R.cur.tot)}" r="6" fill="#e0443a" stroke="#fff" stroke-width="2"/><text y="20" x="6" font-size="11" fill="#e0443a">your departure</text></g><text x="12" y="${Hh/2}" font-size="11" fill="#5b6b7e" transform="rotate(-90 12 ${Hh/2})" text-anchor="middle">minutes</text><text id="ct" font-size="12" font-weight="700" fill="#0f1b2d" x="0" y="-20"></text><rect id="hit" x="${P}" y="0" width="${W-P}" height="${Hh-28}" fill="transparent" style="cursor:crosshair"/></svg>`;
 $("chart").innerHTML=o;$("sl").value=R.st;$("slt").textContent="Drag the slider to change the departure time: "+fmt(R.st);
 const sv=$("csv"),hit=$("hit");const hh=ev=>{const r=sv.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*W;return Math.max(5,Math.min(22,5+(x-P)/(W-P-12)*17))};
 hit.onmousemove=ev=>{const h=Math.round(hh(ev)*4)/4,p=pts.find(q=>Math.abs(q[0]-h)<.01);if(p){const t=$("ct");t.textContent=fmt(h)+" → "+Math.round(p[1])+" min";t.setAttribute("x",Math.min(X(h)+8,W-130));t.setAttribute("y",Y(p[1])-10)}};hit.onmouseleave=()=>$("ct").textContent="";hit.onclick=ev=>{$("tm").value=fmt(Math.round(hh(ev)*4)/4);run(false)}}
$("sl").oninput=function(){$("slt").textContent="Departure time: "+fmt(+this.value);const mk=$("mk");if(mk)mk.setAttribute("transform","translate("+(38+(+this.value-5)/17*(640-38-12))+",0)");clearTimeout(this._t);this._t=setTimeout(()=>{$("tm").value=fmt(+this.value);run(false)},350)};
/* ---------- dashboard ---------- */
const POPC=c=>.6+H(c)*.6;
function dash(){const cnt={};TRIPS.forEach(t=>t.corr.forEach(c=>{const k=c+"-"+Math.floor(t.st);cnt[k]=(cnt[k]||0)+1}));const cc={we:false,wx:"clear",inc:""};let tot=0,shown=0,worst={d:0};
 let h=`<div class="heat" style="grid-template-columns:190px repeat(16,1fr)"><div class="h"></div>`+[...Array(16)].map((_,i)=>`<div class="h">${String(i+6).padStart(2,"0")}</div>`).join("");let idx=0;
 CORR.forEach(([nm])=>{const es=[];AD.forEach(m=>m.forEach(e=>{if(e.corr===nm&&e.a<e.to)es.push(e)}));if(!es.length)return;h+=`<div class="rl">${nm}</div>`;
  for(let t=6;t<22;t++){const n=Math.round((2+13*(g(t,8.8,1.2)+g(t,18.3,1.5)))*POPC(nm))+(cnt[nm+"-"+t]||0);tot+=n;const dl=es.reduce((a,e)=>a+e.len/e.fs*60*(ttiE(e,t+.5,cc,false)-1),0)/es.length,tt=1+dl/(es.reduce((a,e)=>a+e.len/e.fs*60,0)/es.length);
   if(n>=5){shown++;if(dl>worst.d)worst={d:dl,nm,t};h+=`<div style="background:${col(cong(tt))};animation-delay:${(idx++%40)*18}ms" title="${n} trips">${dl.toFixed(1)}</div>`}else h+=`<div class="na" title="Hidden: fewer than 5 trips">—</div>`}});
 $("heat").innerHTML=h+"</div>";const tc=CORR.length*16;
 $("dk").innerHTML=[[tot,"Trips in the weekday summary (sample + saved)"],[shown,"Section-hours shown (group size ≥ 5, of "+tc+")"],[null,"Highest average delay: "+(worst.nm?worst.nm+" at "+String(worst.t).padStart(2,"0")+":00 ("+worst.d.toFixed(1)+" min)":"–"),worst.nm?worst.nm.split(" (")[0]:"–"],[TRIPS.length,"Trips saved in this session"]].map(k=>`<div class="kpi rv"><b style="${k[0]===null?"font-size:18px":""}"><em style="font-style:normal" data-v="${k[0]}">${k[0]===null?k[2]:0}</em></b><span>${k[1]}</span></div>`).join("");
 $("dk").querySelectorAll("em[data-v]").forEach(e=>{if(e.dataset.v!=="null")cnt2(e,+e.dataset.v)});
 if(TRIPS.length)$("trips").innerHTML="<table><thead><tr><th>Trip ID</th><th>User ID</th><th>Route</th><th>Start</th><th>Mode</th><th>Est. time</th><th>Consent</th></tr></thead><tbody>"+TRIPS.map((t,i)=>`<tr style="--i:${i}"><td>${t.id}</td><td>${t.u}</td><td class="wr">${t.r}</td><td>${fmt(t.st)}</td><td>${MODE[t.m]}</td><td>${Math.round(t.tt)} min</td><td>Yes</td></tr>`).join("")+"</tbody></table><p class=\"muted\">Only random IDs and section-level locations are stored. No name, phone number or home address.</p>"}
const cnt2=(el,to)=>cnt(el,to);
/* ---------- setup ---------- */
function pillTo(b){const p=$("pill");p.style.left=b.offsetLeft+"px";p.style.width=b.offsetWidth+"px"}
function setup(){ac("src");ac("dst");const bs=[...document.querySelectorAll("#nav button")];pillTo(bs[0]);
 bs.forEach(b=>b.onclick=()=>{bs.forEach(x=>x.classList.toggle("on",x===b));pillTo(b);document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on",t.id===b.dataset.t));const t=$(b.dataset.t);if(b.dataset.t==="dash")dash();if(b.dataset.t==="data"){const S=[[N.length,"Places in the road graph"],[CORR.length,"Mapped corridors"],[4,"Input datasets (D1–D4)"],[8,"Preprocessing steps"]];$("st").innerHTML=S.map(s=>`<div class="kpi rv"><b><em style="font-style:normal">0</em></b><span>${s[1]}</span></div>`).join("");$("st").querySelectorAll("em").forEach((e,i)=>cnt(e,S[i][0]))}reveal(t);setTimeout(()=>MAP&&MAP.invalidateSize(),60);b.dataset.s&&b.dataset.s!=="top"?$(b.dataset.s).scrollIntoView({behavior:"smooth"}):window.scrollTo({top:0,behavior:"smooth"})});
 const EX=[["Whitefield","Electronic City"],["Yelahanka","Jayanagar"],["Kengeri","Indiranagar"],["Kempegowda Airport (BLR)","MG Road"],["Hebbal","Silk Board"]];
 $("ex").innerHTML='<span style="color:#9fb2cc;font-size:12.5px;align-self:center">Try:</span>'+EX.map((e,i)=>`<span class="chip" data-i="${i}">${e[0].split(" (")[0]} → ${e[1].split(" (")[0]}</span>`).join("");
 $("ex").onclick=e=>{const c=e.target.closest(".chip");if(!c)return;const x=EX[+c.dataset.i];SEL.src=N.find(n=>n.n===x[0]);SEL.dst=N.find(n=>n.n===x[1]);$("src").value=x[0];$("dst").value=x[1];$("src").classList.add("ok");$("dst").classList.add("ok");$("tm").value="08:30";run(true)};
 $("go").onclick=()=>run(true);["mode","day","wx","live","inc"].forEach(i=>$(i).onchange=()=>{if(SEL.src&&SEL.dst&&RES)run(false)});$("tm").onchange=()=>{if(SEL.src&&SEL.dst&&RES)run(false)};
 $("swap").onclick=()=>{const a=SEL.src,b=SEL.dst;SEL.src=b;SEL.dst=a;$("src").value=b?b.n:"";$("dst").value=a?a.n:"";$("src").classList.toggle("ok",!!b);$("dst").classList.toggle("ok",!!a);drawMap(RES&&0);if(a&&b&&RES)run(false);else drawMap(null)};
 $("loc").onclick=()=>{if(!navigator.geolocation){toast("Location is not available in this browser.");return}navigator.geolocation.getCurrentPosition(p=>{const{latitude:la,longitude:lo}=p.coords;if(la<12.78||la>13.23||lo<77.45||lo>77.82){toast("Your location is outside the Bengaluru area covered.");return}addCustom("src","My location",la,lo)},()=>toast("Location permission was denied."))};
 $("fit").onclick=()=>RES?zoomTo(fitBox(RES.es.concat(RES.alt?RES.alt.es:[]))):toast("Analyse a trip first");$("city").onclick=()=>zoomTo([0,0,MW,MH]);
 $("cons").onchange=()=>$("save").disabled=!$("cons").checked;
 $("save").onclick=async()=>{if(!LAST||!$("cons").checked)return;
  const cs=[...new Set(LAST.es.filter(e=>e.art).map(e=>e.corr))];
  const payload={source:SEL.src.n.split(" (")[0],destination:SEL.dst.n.split(" (")[0],startTime:LAST.st,mode:LAST.mode,estimatedTime:LAST.cur.tot,corridors:cs,consent:true};
  let tId="T-"+String(400+(TRIPS.length+1)*7).padStart(4,"0"),uId="U-"+String(10+(TRIPS.length+1)).padStart(3,"0");
  try{const res=await fetch("/api/trips",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await res.json();if(data.success&&data.trip){tId=data.trip.trip_id;uId=data.trip.user_id}}catch(e){console.warn("Using local session save:",e.message)}
  TRIPS.push({id:tId,u:uId,r:payload.source+" → "+payload.destination,st:LAST.st,m:LAST.mode,tt:LAST.cur.tot,corr:cs});
  $("saved").textContent="✔ Saved to database. See the Corridor Dashboard tab.";$("cons").checked=false;$("save").disabled=true;toast("Trip saved anonymously ("+tId+")")};
 document.addEventListener("click",e=>{const b=e.target.closest(".btn,.swap");if(!b)return;const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height),sp=document.createElement("span");sp.className="rip";sp.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;b.appendChild(sp);setTimeout(()=>sp.remove(),600)});
 drawMap(null);reveal($("plan"));addEventListener("resize",()=>pillTo(document.querySelector("#nav .on")))}
function boot(){
  try{v3init()}catch(e){console.error("v3init error:",e)}
  try{setup()}catch(e){console.error("setup error:",e)}
  try{
    if(typeof L!=="undefined"){
      initMap();
    }else{
      console.warn("Leaflet (L) pending, retrying...");
      setTimeout(()=>{try{if(typeof L!=="undefined")initMap()}catch(err){console.error("Map init error:",err)}},150);
    }
  }catch(e){console.error("initMap error:",e)}
}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",boot)}else{boot()}

