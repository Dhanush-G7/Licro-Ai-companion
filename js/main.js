/* LICRO — scene, scroll, particles, UI, command palette, voice */

(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],cl=(x,a,b)=>Math.min(b,Math.max(a,x)),sm=(a,b,x)=>{x=cl((x-a)/(b-a),0,1);return x*x*(3-2*x)};
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches,FINE=matchMedia('(pointer:fine)').matches,IW=innerWidth;
let N=IW<700?5000:IW<1100?9000:15000;if(RM)N=4000;if((navigator.hardwareConcurrency||8)<4)N=Math.round(N*.6);
$$('.h').forEach(h=>{const t=h.textContent;h.setAttribute('aria-label',t);h.innerHTML=t.split(' ').map(w=>'<span class="w" aria-hidden="true">'+[...w].map(c=>`<span class="c" style="--x:${(Math.random()*80-40)|0};--y:${(Math.random()*70-35)|0}">${c}</span>`).join('')+'</span>').join(' ')});
const S=$$('.s'),M=S.length,wc=$('#wv'),wx=wc.getContext('2d');let C=[],vh=innerHeight,GL=null;
const meas=()=>{vh=innerHeight;C=S.map(s=>s.offsetTop+s.offsetHeight/2);wc.width=wc.clientWidth*2;wc.height=300};
let tT;const toast=(m,e)=>{const t=$('#toast');t.textContent=m;t.className='on'+(e?' err':'');clearTimeout(tT);tT=setTimeout(()=>t.className='',2800)};
const ST={idle:[0,0,0,0,0,0,1],listening:[1,0,.5,0,0,0,3],thinking:[0,0,1.2,0,0,0,2],searching:[0,1,.7,0,0,0,1.5],executing:[0,0,2,0,1,0,4],speaking:[0,0,.4,1,0,0,1],error:[0,0,.3,0,0,1,.3]};
const TC={listening:[.5,1,1],thinking:[.55,.55,1],searching:[.35,.7,1],executing:[.8,.95,1],speaking:[.85,.6,1],error:[1,.3,.5]};
const WS={personal:[.37,.9,1],career:[.3,.55,1],learning:[.62,.45,1],projects:[.3,1,.8],research:[.9,.92,1]};
const WD={personal:'Daily life, routines and preferences — always in your corner.',career:'Goals, roles and growth — planned with you.',learning:'Sessions that adapt to how you learn.',projects:'Ideas, files and progress, held in one place.',research:'Deep dives, synthesised with sources.'};
const AS=['idle','idle','listening','idle','thinking','executing','idle','idle','idle','idle','idle','thinking','idle'];
let force=null,fu=0,ws='personal',kick=0,micOn=false,sim=false,an=null,dat=null,strm=null,ac=null,lv=0;
const setF=(n,ms)=>{force=n;fu=ms?performance.now()+ms:Infinity},act=(s,m,ms=3500)=>{setF(s,ms);toast(m)};
const go=i=>scrollTo({top:C[i]-vh/2,behavior:RM?'auto':'smooth'});
function setWs(k){ws=k;kick=3;$$('[data-w]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.w==k));$('#wd').textContent=WD[k]}
setWs('personal');
const LICRO=window.LICRO=window.LICRO||{};LICRO.setF=setF;LICRO.act=act;LICRO.toast=toast;LICRO.clear=()=>{force=null};LICRO.palOpen=()=>pal.classList.contains('on');
// ---------- WebGL ----------
function initGL(){
const ren=new THREE.WebGLRenderer({canvas:$('#gl'),alpha:true,antialias:false,powerPreference:'high-performance'});
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,100),grp=new THREE.Group();scene.add(grp);
const R=new Float32Array(N*3).map(()=>Math.random()),NC=[];
for(let i=0;i<40;i++){const p=Math.acos(1-2*(i+.5)/40),t=2.39996*i;NC.push([Math.sin(p)*Math.cos(t)*2.4,Math.cos(p)*2.4,Math.sin(p)*Math.sin(t)*2.4])}
const tilt=(x,y,z,t)=>[x,y*Math.cos(t)-z*Math.sin(t),y*Math.sin(t)+z*Math.cos(t)],g=()=>(Math.random()+Math.random()+Math.random()-1.5)*.5;
function shape(k){const A=new Float32Array(N*3);
for(let i=0;i<N;i++){const a=R[i*3],b=R[i*3+1],c=R[i*3+2],p=Math.acos(1-2*b),t=6.2832*c,sx=Math.sin(p)*Math.cos(t),sy=Math.cos(p),sz=Math.sin(p)*Math.sin(t);let x,y,z;
switch(k){
case 0:x=(a-.5)*14;y=(b-.5)*9;z=(c-.5)*10;break;
case 1:case 10:{const r=[1.2,1.7,2.1][i%3]*(k==10?1.05:1);x=sx*r;y=sy*r;z=sz*r;break}
case 8:case 12:{const r=(k==8?2.1:1.5)*(.55+.45*Math.cbrt(a));x=sx*r;y=sy*r;z=sz*r;break}
case 2:{const n=NC[i%40];if(i%2){const m=NC[(i%40*7+3)%40];x=n[0]+(m[0]-n[0])*a;y=n[1]+(m[1]-n[1])*a;z=n[2]+(m[2]-n[2])*a}else{x=n[0]+g()*.5;y=n[1]+g()*.5;z=n[2]+g()*.5}break}
case 3:{if(i%5==0){x=sx*.8;y=sy*.8;z=sz*.8}else{const j=i%3,r=2+j*.6,q=a*6.2832;[x,y,z]=tilt(Math.cos(q)*r,g()*.12,Math.sin(q)*r,[.5,-.6,1.1][j])}break}
case 4:{const q=a*6.2832,r=1.5+.55*Math.cos(3*q);x=r*Math.cos(2*q)*1.3+g()*.35;y=r*Math.sin(2*q)*1.3+g()*.35;z=-Math.sin(3*q)*1.1+g()*.35;break}
case 5:{const m=i%10,q=(i%8)/8*6.2832;if(m<5){x=Math.cos(q)*3.4+g()*.5;y=Math.sin(q)*2.1+g()*.5;z=g()*.5}else if(m<8){x=Math.cos(q)*3.4*a;y=Math.sin(q)*2.1*a;z=g()*.06}else{x=sx*.9;y=sy*.9;z=sz*.9}break}
case 6:{const j=i%5,q=b*6.2832,r=1.3+j*.55+a*.12;[x,y,z]=tilt(Math.cos(q)*r,(j-2)*.75+g()*.06,Math.sin(q)*r,.9);break}
case 7:{const j=i%3;x=(a-.5)*11;y=Math.sin(x*1.4+j)*.8*Math.cos(x*.35)+(j-1)*.55+(b-.5)*.12;z=(c-.5)*1.4;break}
case 9:{if(i%6==0){x=sx*.7;y=sy*.7;z=sz*.7}else{x=(Math.floor(a*44)/44-.5)*10;y=(Math.floor(b*28)/28-.5)*6;z=(c-.5)*.05+x*.12}break}
case 11:{const r=Math.pow(a,.6)*4.6,q=r*1.1+(i%3)*2.094;[x,y,z]=tilt(Math.cos(q)*r+g()*.3,g()*.25,Math.sin(q)*r+g()*.3,1);break}
default:x=y=z=0}
A[i*3]=x;A[i*3+1]=y;A[i*3+2]=z}return A}
const SH=[];for(let k=0;k<M;k++)SH.push(shape(k));
const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(SH[0].slice(),3));geo.setAttribute('aB',new THREE.BufferAttribute(SH[1].slice(),3));geo.setAttribute('aR',new THREE.BufferAttribute(R,3));
const U={uMix:{value:0},uT:{value:0},uPx:{value:1},uL:{value:0},uS:{value:0},uE:{value:0},uA:{value:0},uX:{value:0},uEr:{value:0},uBr:{value:0},uCalm:{value:0},uM:{value:new THREE.Vector3()},uTint:{value:new THREE.Color(.37,.9,1)}};
const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
vertexShader:`attribute vec3 aB,aR;uniform float uMix,uT,uPx,uL,uS,uE,uA,uX,uEr,uCalm,uBr;uniform vec3 uM;varying float vA,vK;
void main(){vec3 p=mix(position,aB,uMix);p+=(aR-.5)*sin(uMix*3.1416)*3.;
p+=vec3(sin(uT*.5+aR.x*6.28),cos(uT*.6+aR.y*6.28),sin(uT*.4+aR.z*6.28))*(.06+uE*.12)*(1.-uCalm*.6);
p*=1.+.03*sin(uT*.8)*(1.-uCalm);float d=length(p)+1e-4;p*=1.-uL*.28*(.4+aR.y);
p+=normalize(p)*sin(d*3.-uT*4.)*uS*.28;p+=normalize(p)*uA*.35*aR.y;
p.x+=step(aR.z,.5)*(fract(aR.y+uT*.5)-.5)*uX*3.;p.x+=sin(uT*40.+aR.x*10.)*uEr*.06;
vec2 dm=p.xy-uM.xy;float dd=length(dm)+1e-4;p.xy+=dm/dd*exp(-dd*dd*.7)*.7*uM.z;
vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
gl_PointSize=(3.4+aR.z*3.6+uE*.8)*uPx*(9./-mv.z);vK=aR.x;vA=mix(step(.975,aR.y),1.,uBr)*(.75+.25*aR.z);}`,
fragmentShader:`uniform vec3 uTint;varying float vA,vK;
void main(){vec2 c=gl_PointCoord-.5;float r=length(c);if(r>.5)discard;
vec3 col=uTint;col=mix(col,vec3(.24,.46,1.),step(.55,vK));col=mix(col,vec3(.54,.42,1.),step(.8,vK));
col=mix(col,vec3(.95,.37,.7),step(.95,vK)*.7);col=mix(col,vec3(1.),step(.985,vK));
col=mix(col,vec3(1.),smoothstep(.28,0.,r)*.5);
gl_FragColor=vec4(col,smoothstep(.5,.14,r)*vA);}`});
const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;grp.add(pts);
const RG=[];[2.3,2.9,3.5].forEach((r,i)=>{const pp=[];for(let k=0;k<=128;k++){const q=k/128*6.2832;pp.push(new THREE.Vector3(Math.cos(q)*r,Math.sin(q)*r,0))}
const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pp),new THREE.LineBasicMaterial({color:i==1?0x8a6bff:0x5ee7ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));l.rotation.set(1.2+i*.45,i*.7,i*1.1);grp.add(l);RG.push(l)});
$('#gl').addEventListener('webglcontextlost',e=>{e.preventDefault();lite()});
return{ren,scene,cam,grp,U,RG,SH,geo,drawn:N}}
function lite(){GL=null;document.body.classList.add('nogl');toast('3D core unavailable — running in lite mode.',1)}
try{GL=initGL()}catch(e){GL=null;document.body.classList.add('nogl');setTimeout(()=>toast('3D core unavailable — running in lite mode.',1),1800)}
function rs(){if(GL){GL.ren.setPixelRatio(Math.min(devicePixelRatio,IW<700?1.5:1.75));GL.ren.setSize(innerWidth,innerHeight,false);GL.U.uPx.value=GL.ren.getPixelRatio()*(innerHeight/800);GL.cam.aspect=innerWidth/innerHeight;GL.cam.updateProjectionMatrix()}meas()}
addEventListener('resize',rs);rs();document.fonts&&document.fonts.ready.then(meas);
// ---------- voice ----------
async function mic(){const b=$('#mic');
if(micOn){micOn=false;sim=false;strm&&strm.getTracks().forEach(t=>t.stop());ac&&ac.close();an=null;strm=null;force=null;b.setAttribute('aria-pressed','false');return}
try{strm=await navigator.mediaDevices.getUserMedia({audio:true});ac=new(window.AudioContext||window.webkitAudioContext)();an=ac.createAnalyser();an.fftSize=128;ac.createMediaStreamSource(strm).connect(an);dat=new Uint8Array(an.frequencyBinCount)}
catch(e){sim=true;toast('Microphone unavailable — running demo signal.',1)}
micOn=true;setF('listening',0);b.setAttribute('aria-pressed','true')}
$('#mic').onclick=mic;
function wave(now){const W=wc.width,H=wc.height,n=72;wx.clearRect(0,0,W,H);const gr=wx.createLinearGradient(0,0,W,0);gr.addColorStop(0,'#5ee7ff');gr.addColorStop(1,'#8a6bff');wx.fillStyle=gr;
if(an){an.getByteFrequencyData(dat)}
for(let k=0;k<n;k++){let v=an?dat[k%dat.length]/255:micOn?.35+.3*Math.sin(now/200+k*.5)*Math.sin(now/530+k*.21):.07+.05*Math.sin(now/700+k*.4);
const e=Math.sin(Math.PI*(k+.5)/n),h=Math.max(3,v*H*.9*e),bw=W/n;wx.fillRect(k*bw+bw*.25,(H-h)/2,bw*.5,h)}}
// ---------- UI wiring ----------
const LG={AUTO:['రేపు meeting ఎప్పుడు? कल का plan भी बताओ','Mixed · detected: TE + HI + EN (+ TA · KN · ML)'],ENGLISH:["What's on my schedule tomorrow?",'Detected: EN'],TELUGU:['రేపటి షెడ్యూల్ ఏమిటి?','Detected: TE'],HINDI:['कल का शेड्यूल क्या है?','Detected: HI'],TAMIL:['நாளைக்கு என் அட்டவணை என்ன?','Detected: TA'],KANNADA:['ನಾಳೆಯ ವೇಳಾಪಟ್ಟಿ ಏನು?','Detected: KN'],MALAYALAM:['നാളത്തെ ഷെഡ്യൂൾ എന്താണ്?','Detected: ML']};
$$('[data-l]').forEach(b=>b.onclick=()=>{$$('[data-l]').forEach(x=>x.setAttribute('aria-pressed',x==b));$('#lq').textContent=LG[b.dataset.l][0];$('#ld').textContent=LG[b.dataset.l][1];setF('listening',2200)});
$('#lq').textContent=LG.AUTO[0];$('#ld').textContent=LG.AUTO[1];
$$('[data-w]').forEach(b=>b.onclick=()=>setWs(b.dataset.w));
$$('#tools .chip').forEach(b=>b.onclick=()=>act('executing',b.textContent+' connected — acting.',2600));
$$('[data-s]').forEach(b=>b.onclick=()=>{const s=b.dataset.s;if(s=='idle'){force=null}else if(s=='error'){setF('error',4000);toast('Something went wrong — recovering.',1)}else setF(s,8000)});
$$('[data-go]').forEach(b=>b.onclick=e=>{e.preventDefault();go(+b.dataset.go);$('#nl').classList.remove('open');$('#nb').setAttribute('aria-expanded','false')});
$('#nb').onclick=()=>{const o=$('#nl').classList.toggle('open');$('#nb').setAttribute('aria-expanded',o)};
const CM=[['Ask LICRO',()=>LICRO.chat.open()],['Search the web',()=>act('searching','Searching the web…')],['Open Career workspace',()=>{go(6);setWs('career')}],['Analyze this file',()=>act('thinking','Analyzing file…')],['Start learning session',()=>{go(6);setWs('learning');act('speaking','Learning session ready.')}],['Remember this',()=>{go(3);LICRO.chat.open('Remember: ')}],['Find my recent projects',()=>{go(6);setWs('projects');act('searching','Finding recent projects…')}],['Start voice mode',()=>{go(7);setTimeout(()=>{if(!micOn)mic()},900)}]];
let fl=[],sel=0,lastFocus;const pal=$('#pal'),pi=$('#pi'),pl=$('#pl');
function rl(q=''){fl=CM.filter(c=>c[0].toLowerCase().includes(q.toLowerCase()));sel=0;pl.innerHTML=fl.map((c,i)=>`<li role="option" data-i="${i}" aria-selected="${i==0}">${c[0]}</li>`).join('')||'<li>No matching command</li>'}
function hi(){[...pl.children].forEach((l,i)=>l.setAttribute('aria-selected',i==sel))}
function op(){lastFocus=document.activeElement;pal.classList.add('on');pi.value='';rl();pi.focus()}
function cp(){pal.classList.remove('on');lastFocus&&lastFocus.focus&&lastFocus.focus()}
function run(i){const c=fl[i];if(c){cp();c[1]()}}
pi.oninput=()=>rl(pi.value);pl.onclick=e=>{const l=e.target.closest('li');l&&l.dataset.i&&run(+l.dataset.i)};
pal.onclick=e=>{if(e.target==pal)cp()};
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=='k'){e.preventDefault();pal.classList.contains('on')?cp():op()}
else if(pal.classList.contains('on')){if(e.key=='Escape')cp();else if(e.key=='ArrowDown'){e.preventDefault();sel=(sel+1)%Math.max(fl.length,1);hi()}else if(e.key=='ArrowUp'){e.preventDefault();sel=(sel+fl.length-1)%Math.max(fl.length,1);hi()}else if(e.key=='Enter'){e.preventDefault();run(sel)}}});
$('#ck').onclick=op;$$('[data-pal]').forEach(b=>b.onclick=op);$$('[data-enter]').forEach(b=>b.onclick=()=>LICRO.chat.open());
// pointer / cursor / magnetic
let tmx=0,tmy=0,mx=0,my=0,mvd=0;const cu=$('#cur');
addEventListener('pointermove',e=>{tmx=e.clientX/innerWidth-.5;tmy=e.clientY/innerHeight-.5;mvd=1;
if(FINE){cu.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;const t=e.target.closest('a,button,input,li,.chip');cu.classList.toggle('hov',!!t);cu.classList.toggle('core',!t&&tmx*tmx*1.8+tmy*tmy<.03);
if(!RM)$$('.mag').forEach(b=>{const r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);b.style.transform=Math.hypot(dx,dy)<110?`translate(${dx*.22}px,${dy*.22}px)`:''})}},{passive:true});
// ---------- main loop ----------
let sy=scrollY,last=performance.now(),ema=.016,f=0,ai=-1,tint=[.37,.9,1],cur=[0,0,0,0,0,0,1],lcs='',p1=-1,p2=-1;
const RV=[0,.7,.2,.9,.7,.3,.5,0,.4,.1,.9,.6,.4],P1=$$('#p1 b'),P2=$$('#p2 b'),pr=$('#prog');
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;ema+=(dt-ema)*.05;
sy+=(scrollY-sy)*(RM?1:1-Math.exp(-dt*7));const y=sy+vh/2;let i=0;while(i<M-2&&y>C[i+1])i++;f=cl(i+(y-C[i])/(C[i+1]-C[i]),0,M-1);
S.forEach((s,k)=>{const dy=(y-C[k])/vh,a=Math.abs(dy),o=1-sm(.28,.62,a),n=s.firstElementChild;n.style.opacity=o.toFixed(3);n.style.filter=RM||a<.3?'none':`blur(${((a-.28)*16).toFixed(1)}px)`;n.style.transform=RM?'none':`translateY(${(-dy*30).toFixed(0)}px) scale(${(1-a*.06).toFixed(3)})`;n.style.pointerEvents=o<.4?'none':'auto';s.style.setProperty('--d',cl((a-.22)*2.2,0,1).toFixed(3))});
pr.style.height=(sy/Math.max(1,document.documentElement.scrollHeight-vh)*100).toFixed(1)+'%';
const cs=force&&now<fu?force:AS[Math.round(f)];if(force&&now>=fu)force=null;
if(cs!=lcs){lcs=cs;$('#hs').textContent=cs.toUpperCase();$$('[data-s]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s==cs))}
const P=ST[cs],k2=1-Math.exp(-dt*4),T=cs=='idle'?WS[ws]:TC[cs];
for(let j=0;j<7;j++)cur[j]+=(P[j]-cur[j])*k2;for(let j=0;j<3;j++)tint[j]+=(T[j]-tint[j])*k2;
let tA=P[3]?(.45+.55*Math.abs(Math.sin(now/1000*5.3)*Math.sin(now/1000*2.1))):0;
if(an){an.getByteFrequencyData(dat);let s=0;for(let j=0;j<dat.length;j++)s+=dat[j];lv=Math.min(1,s/dat.length/255*3)}else lv=micOn?.4+.3*Math.sin(now/180):0;
if(micOn)tA=Math.max(tA,lv);cur[3]+=(tA-cur[3])*.2;kick*=Math.exp(-dt*2);
if(Math.abs(f-7)<1.3)wave(now);
const s1=cl(Math.floor(((y-C[4]+vh*.35)/(vh*.7))*4),0,3);if(s1!=p1){p1=s1;P1.forEach((b,j)=>b.classList.toggle('on',j<=s1))}
const s2=micOn?Math.floor(now/700)%4:-1;if(s2!=p2){p2=s2;P2.forEach((b,j)=>b.classList.toggle('on',j==s2))}
if(!GL)return;
const{ren,scene,cam,grp,U,RG,SH,geo}=GL,a=Math.min(Math.floor(f),M-2),fr=f-a;
if(a!==ai){ai=a;geo.attributes.position.array.set(SH[a]);geo.attributes.aB.array.set(SH[a+1]);geo.attributes.position.needsUpdate=geo.attributes.aB.needsUpdate=true}
const calm=Math.max(sm(11.3,12,f),.6*(1-sm(0,.8,Math.abs(f-8))));
U.uMix.value=sm(.2,.8,fr);U.uT.value=now/1000;U.uL.value=cur[0];U.uS.value=cur[1];U.uE.value=cur[2];U.uA.value=cur[3];U.uX.value=cur[4];U.uEr.value=cur[5];U.uBr.value=sm(0,.9,f);U.uCalm.value=calm;U.uTint.value.setRGB(tint[0],tint[1],tint[2]);
mx+=(tmx-mx)*.06;my+=(tmy-my)*.06;
const asp=innerWidth/innerHeight,pad=asp<.75?4.5:asp<1.1?2:0,zb=f<1?8.8-2.6*sm(0,1,f):6.2-.6*Math.sin(f*.7)+pad*(f<1?0:1);
cam.position.set(RM?0:Math.sin(f*.6)*1.3,RM?0:Math.cos(f*.5)*.4,zb+(f<1?pad:0));cam.lookAt(0,0,0);
const flat=Math.max(0,1-Math.abs(f-7)*1.6,1-Math.abs(f-9)*1.6),wide=Math.max(0,1-Math.abs(f-7)*1.2,1-Math.abs(f-11)*1.2,1-Math.abs(f-5)*1.2,1-Math.abs(f-9)*1.2);
grp.scale.setScalar(1-(asp<1?.5:0)*wide);
grp.rotation.y=RM?0:Math.sin(now/1000*.15)*.9*(1-flat)+mx*.5;grp.rotation.x=RM?0:my*.3;
const hh=Math.tan(.4363)*zb;U.uM.value.set(mx*2*hh*asp,-my*2*hh,mvd&&!RM?(FINE?1:.7):0);
const rv=RV[a]+(RV[a+1]-RV[a])*sm(.2,.8,fr);
RG.forEach((l,j)=>{l.material.opacity=rv*.4*(1-calm*.5);if(!RM)l.rotation.z+=dt*(j+1)*.15*(cur[6]+kick)});
if(ema>.03&&GL.drawn>N*.4&&!RM){GL.drawn=Math.floor(GL.drawn*.85);geo.setDrawRange(0,GL.drawn);ema=.016}
ren.render(scene,cam)}
requestAnimationFrame(frame);
setTimeout(()=>{const l=$('#load');l.style.opacity=0;setTimeout(()=>l.remove(),950)},1500);
})();
