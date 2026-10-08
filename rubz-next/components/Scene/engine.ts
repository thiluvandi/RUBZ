// @ts-nocheck
/* Ported from the single-file prototype (Appendix A of RUBZ_HANDOFF.md). Plain Three.js r128 pinned in package.json. */
import * as THREE from 'three';
import { TILES, ACTS } from '@/lib/data';

export function startRubz(): () => void {
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var isMobile=Math.min(innerWidth,innerHeight)<700||/Android|iPhone|iPad/i.test(navigator.userAgent);
var clamp=function(x,a,b){return Math.max(a,Math.min(b,x))};
var lerp=function(a,b,t){return a+(b-a)*t};
var smooth=function(x){x=clamp(x,0,1);return x*x*(3-2*x)};
var nowSec=function(){return performance.now()/1000};
var BPM=128;
var dead=false,io=null,ro=null,renderer=null,offs=[];
function on(t,ev,fn,o){t.addEventListener(ev,fn,o);offs.push(function(){t.removeEventListener(ev,fn,o)})}
var S={fs:0,lastFs:0,mx:0,my:0,pulse:0,beat:0,drop:0,scratch:0,soundOn:false,slab:-1,focus:-1};


/* ---------------- audio (off by default) ---------------- */
var ac=null,master=null,noiseBuf=null,scratchG=null,sched=null,nextBeat=0;
function ensureAC(){
  try{
    if(!ac){
      ac=new (window.AudioContext||window.webkitAudioContext)();
      master=ac.createGain();master.gain.value=.4;master.connect(ac.destination);
      noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);
      var d=noiseBuf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      var ns=ac.createBufferSource();ns.buffer=noiseBuf;ns.loop=true;
      var bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=900;bp.Q.value=1.5;
      scratchG=ac.createGain();scratchG.gain.value=0;
      ns.connect(bp);bp.connect(scratchG);scratchG.connect(master);ns.start();
    }
    if(ac.state==='suspended')ac.resume();
    return true;
  }catch(e){return false}
}
function noiseHit(t,freq,type,vol,len){
  var s=ac.createBufferSource();s.buffer=noiseBuf;
  var f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;
  var g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+len);
  s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random());s.stop(t+len+.02);
}
function kick(t){
  var o=ac.createOscillator(),g=ac.createGain();
  o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);
  g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.24);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+.26);
}
function startBeat(){
  if(!ac)return;
  stopBeat();
  var beatNow=nowSec()*BPM/60;
  nextBeat=ac.currentTime+(Math.ceil(beatNow)-beatNow)*60/BPM;
  var idx=0;
  sched=setInterval(function(){
    while(nextBeat<ac.currentTime+.12){
      var s=idx%8;
      if(s%2===0)kick(nextBeat);else noiseHit(nextBeat,7000,'highpass',.1,.05);
      if(s===2||s===6)noiseHit(nextBeat,1500,'bandpass',.22,.12);
      nextBeat+=60/BPM/2;idx++;
    }
  },30);
}
function stopBeat(){if(sched){clearInterval(sched);sched=null}}
function boom(){
  if(!S.soundOn||!ac)return;
  var t=ac.currentTime;
  noiseHit(t,400,'lowpass',.8,.9);
  var o=ac.createOscillator(),g=ac.createGain();
  o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(30,t+.6);
  g.gain.setValueAtTime(1,t);g.gain.exponentialRampToValueAtTime(.001,t+.7);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+.75);
}

/* ---------------- plain page UI ---------------- */
function initUI(){
  $$('[data-go]').forEach(function(b){
    on(b,'click',function(){
      var el=document.getElementById(b.getAttribute('data-go'));
      if(el)el.scrollIntoView({behavior:reduce?'auto':'smooth',block:b.getAttribute('data-go')==='s0'?'start':'center'});
    });
  });
  on($('#soundBtn'),'click',function(){
    S.soundOn=!S.soundOn;
    this.textContent=S.soundOn?'Sound on':'Sound off';
    this.setAttribute('aria-pressed',S.soundOn?'true':'false');
    if(S.soundOn){if(ensureAC())startBeat()}else stopBeat();
  });
  on($('#dropBtn'),'click',function(){S.drop=1;boom()});

  // list of acts
  var acts=$('#acts');
  ACTS.forEach(function(a,i){
    var li=document.createElement('li');li.dataset.i=i;
    li.innerHTML=a.n+'<span>'+('0'+(i+1))+'</span>';
    on(li,'pointerenter',function(){S.slab=i;syncActs()});
    on(li,'pointerleave',function(){S.slab=-1;syncActs()});
    acts.appendChild(li);
  });
  // tile chips
  var chips=$('#tileChips');
  TILES.forEach(function(t,i){
    var li=document.createElement('li');
    var b=document.createElement('button');
    b.type='button';b.className='chip';b.textContent=t.n;b.dataset.i=i;
    on(b,'click',function(){focusTile(i)});
    li.appendChild(b);chips.appendChild(li);
  });
  // reveal
  if('IntersectionObserver' in window){
    io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('seen');io.unobserve(e.target)}});
    },{threshold:.15});
    $$('.card').forEach(function(c){io.observe(c)});
  }
  // count-up
  var c=$('[data-count="1000"]');
  if(c&&!reduce){
    var t0=performance.now();
    (function tickc(){
      var p=clamp((performance.now()-t0)/1600,0,1),v=Math.round(1000*(1-Math.pow(1-p,3)));
      c.textContent=v.toLocaleString('en-US')+'+';
      if(p<1)requestAnimationFrame(tickc);
    })();
  }
}
function syncActs(){
  $$('#acts li').forEach(function(li,i){li.classList.toggle('on',i===S.slab)});
}
var focusTile=function(){};  // replaced when 3D is ready

/* ---------------- 3D ---------------- */
function init3D(){
  var canvas=$('#gl');
  renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:!isMobile,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isMobile?1.5:2));
  var scene=new THREE.Scene();
  scene.background=new THREE.Color(0x0a0712);
  scene.fog=new THREE.FogExp2(0x0a0712,.034);
  var camera=new THREE.PerspectiveCamera(52,1,.1,300);

  function ctex(w,h,draw){
    var c=document.createElement('canvas');c.width=w;c.height=h;
    var g=c.getContext('2d');draw(g,w,h);
    var t=new THREE.CanvasTexture(c);
    t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;
    return t;
  }
  function rr(g,x,y,w,h,r){
    g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
  }
  var FONT='Unbounded, Arial Black, sans-serif';
  function fit(g,text,maxW,maxSize){
    var words=text.toUpperCase().split(' '),size=maxSize;
    for(;size>16;size-=4){
      g.font='800 '+size+'px '+FONT;
      var ok=true;
      for(var i=0;i<words.length;i++){if(g.measureText(words[i]).width>maxW){ok=false;break}}
      if(ok)break;
    }
    return {words:words,size:size};
  }
  function hsl(h,s,l,a){return 'hsla('+h+','+s+'%,'+l+'%,'+(a==null?1:a)+')'}

  /* shared pieces */
  function glowDisc(cx,cz,r,hex){
    var tex=ctex(256,256,function(g,w,h){
      var gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
      gr.addColorStop(0,hex);gr.addColorStop(.55,'rgba(10,7,18,.55)');gr.addColorStop(1,'rgba(10,7,18,0)');
      g.fillStyle=gr;g.fillRect(0,0,w,h);
    });
    var m=new THREE.Mesh(new THREE.CircleGeometry(r,48),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
    m.rotation.x=-Math.PI/2;m.position.set(cx,.02,cz);scene.add(m);return m;
  }
  function dust(cx,cy,cz,sx,sy,sz,count,color){
    var pos=new Float32Array(count*3);
    for(var i=0;i<count;i++){pos[i*3]=cx+(Math.random()-.5)*sx;pos[i*3+1]=cy+(Math.random()-.5)*sy;pos[i*3+2]=cz+(Math.random()-.5)*sz}
    var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    var p=new THREE.Points(geo,new THREE.PointsMaterial({size:.07,color:color,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));
    scene.add(p);return p;
  }
  function beamMat(color){
    return new THREE.ShaderMaterial({
      uniforms:{uColor:{value:new THREE.Color(color)},uInt:{value:.3}},
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'varying vec2 vUv;uniform vec3 uColor;uniform float uInt;void main(){float a=pow(vUv.y,1.6)*uInt;gl_FragColor=vec4(uColor,a);}',
      transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide
    });
  }
  function beamGeo(r,h){var g=new THREE.ConeGeometry(r,h,24,1,true);g.translate(0,-h/2,0);return g}

  /* ============ REGION A: stage ============ */
  var A=new THREE.Group();scene.add(A);
  scene.add(new THREE.AmbientLight(0x2a2040,.9));
  var lRed=new THREE.PointLight(0xff3b5c,1.5,26);lRed.position.set(-5,4,5);A.add(lRed);
  var lVio=new THREE.PointLight(0x7b4dff,1.7,26);lVio.position.set(5,4,5);A.add(lVio);
  var lGold=new THREE.PointLight(0xffc247,1.1,14);lGold.position.set(0,3.6,1.8);A.add(lGold);

  var floor=new THREE.Mesh(new THREE.PlaneGeometry(160,120),new THREE.MeshStandardMaterial({color:0x0d0a16,roughness:.35,metalness:.6}));
  floor.rotation.x=-Math.PI/2;A.add(floor);
  var grid=new THREE.GridHelper(80,80,0x2d2150,0x1a1330);grid.position.y=.02;
  grid.material.transparent=true;grid.material.opacity=.55;A.add(grid);

  // LED wall
  var ledU={uTime:{value:0},uPulse:{value:0},uDrop:{value:0}};
  var ledMat=new THREE.ShaderMaterial({uniforms:ledU,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:[
      'varying vec2 vUv;uniform float uTime,uPulse,uDrop;',
      'void main(){',
      ' vec2 p=(vUv-vec2(.5,.32))*vec2(2.333,1.0);',
      ' float a=atan(p.y,p.x);float r=length(p);',
      ' float rays=smoothstep(.25,.75,abs(sin(a*9.0+uTime*.6)));',
      ' vec3 c1=vec3(1.0,.23,.36),c2=vec3(.48,.30,1.0),c3=vec3(1.0,.76,.28);',
      ' vec3 col=mix(c2,c1,smoothstep(0.0,1.0,vUv.x+.25*sin(uTime*.4)));',
      ' col*=.16+.62*rays*(1.0-smoothstep(.15,1.5,r));',
      ' col+=c3*.4*smoothstep(.42,.0,r)*(.55+.9*uPulse);',
      ' float cell=vUv.x*48.0;float bi=floor(cell);',
      ' float h=.10+.17*abs(sin(bi*1.7+uTime*3.0))*(.45+uPulse);',
      ' float eq=step(vUv.y,h)*step(.18,fract(cell))*step(fract(cell),.82);',
      ' col=mix(col,c3,eq*.85);',
      ' vec2 g=fract(vUv*vec2(150.0,64.0));float dots=smoothstep(.55,.2,length(g-.5));',
      ' col*=.5+.5*dots;',
      ' col+=vec3(1.0)*uDrop*.85*(.5+.5*sin(uTime*45.0));',
      ' gl_FragColor=vec4(col,1.0);',
      '}'].join('\n')});
  var led=new THREE.Mesh(new THREE.PlaneGeometry(14,6),ledMat);led.position.set(0,3.4,-3.7);A.add(led);
  var ledFrame=new THREE.Mesh(new THREE.BoxGeometry(14.4,6.4,.2),new THREE.MeshStandardMaterial({color:0x0c0914,roughness:.6,metalness:.5}));
  ledFrame.position.set(0,3.4,-3.85);A.add(ledFrame);
  var wallTxt=new THREE.Mesh(new THREE.PlaneGeometry(9,2.3),new THREE.MeshBasicMaterial({
    map:ctex(1024,256,function(g,w,h){g.clearRect(0,0,w,h);g.fillStyle='#fff';g.font='800 200px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText('RUBZ',w/2,h/2+6)}),
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.9}));
  wallTxt.position.set(0,3.9,-3.58);A.add(wallTxt);

  // truss + lights
  var trussMat=new THREE.MeshStandardMaterial({color:0x191325,roughness:.5,metalness:.7});
  [-2.1,-1.3].forEach(function(z){var b=new THREE.Mesh(new THREE.BoxGeometry(14.4,.12,.12),trussMat);b.position.set(0,6.1,z);A.add(b)});
  [-7.2,7.2].forEach(function(x){var b=new THREE.Mesh(new THREE.BoxGeometry(.14,6.2,.14),trussMat);b.position.set(x,3.05,-1.7);A.add(b)});
  var beamCols=[0xff3b5c,0x7b4dff,0xffc247];
  var beams=[];
  for(var bi=0;bi<7;bi++){
    var fx=-6+bi*2;
    var fg=new THREE.Group();fg.position.set(fx,5.85,-1.7);A.add(fg);
    var body=new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,.4,10),new THREE.MeshBasicMaterial({color:beamCols[bi%3]}));
    body.position.y=.18;fg.add(body);
    var bm=beamMat(beamCols[bi%3]);
    fg.add(new THREE.Mesh(beamGeo(1.2,15),bm));
    beams.push({g:fg,m:bm});
  }

  // table
  var booth=new THREE.Group();A.add(booth);
  var table=new THREE.Mesh(new THREE.BoxGeometry(7,1.2,1.9),new THREE.MeshStandardMaterial({color:0x14101f,roughness:.5,metalness:.4}));
  table.position.y=.6;booth.add(table);
  var trim=new THREE.Mesh(new THREE.BoxGeometry(7.1,.06,1.95),new THREE.MeshBasicMaterial({color:0xffc247}));
  trim.position.y=1.22;booth.add(trim);
  var frontMat=new THREE.MeshBasicMaterial({map:ctex(1024,160,function(g,w,h){g.clearRect(0,0,w,h);g.fillStyle='#fff';g.font='800 100px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText('RUBZ',w/2,h/2+4)}),transparent:true,color:0xff3b5c});
  var front=new THREE.Mesh(new THREE.PlaneGeometry(6.6,1.03),frontMat);front.position.set(0,.6,.96);booth.add(front);

  // decks
  function vinylTex(hue){
    return ctex(512,512,function(g,w,h){
      g.fillStyle='#09090c';g.fillRect(0,0,w,h);
      for(var r=96;r<250;r+=2.4){g.strokeStyle='rgba(255,255,255,'+(.03+Math.random()*.05)+')';g.lineWidth=1;g.beginPath();g.arc(w/2,h/2,r,0,Math.PI*2);g.stroke()}
      var gr=g.createLinearGradient(w*.3,h*.3,w*.7,h*.7);gr.addColorStop(0,hsl(hue,80,56));gr.addColorStop(1,hsl(hue+40,80,30));
      g.fillStyle=gr;g.beginPath();g.arc(w/2,h/2,92,0,Math.PI*2);g.fill();
      g.fillStyle='#fff';g.font='800 26px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText('RUBZ',w/2,h/2-6);
      g.font='500 11px DM Mono, monospace';g.fillText('SUNBURN CAMPUS DJ',w/2,h/2+22);
      g.fillStyle='#bbb';g.beginPath();g.arc(w/2,h/2,7,0,Math.PI*2);g.fill();
      // off-centre marker so the spin is visible
      g.fillStyle='rgba(255,255,255,.5)';g.fillRect(w/2+110,h/2-2,130,4);
    });
  }
  var decks=[],vinMeshes=[];
  [-1.9,1.9].forEach(function(x,k){
    var g=new THREE.Group();g.position.set(x,1.25,.08);booth.add(g);
    var base=new THREE.Mesh(new THREE.BoxGeometry(2.0,.14,1.75),new THREE.MeshStandardMaterial({color:0x1c1629,roughness:.4,metalness:.6}));
    base.position.y=-.02;g.add(base);
    var plat=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.05,48),new THREE.MeshStandardMaterial({color:0x9b94ad,roughness:.3,metalness:.9}));
    plat.position.y=.08;g.add(plat);
    var side=new THREE.MeshStandardMaterial({color:0x050507,roughness:.5});
    var top=new THREE.MeshStandardMaterial({map:vinylTex(k?262:350),roughness:.35,metalness:.25});
    var vin=new THREE.Mesh(new THREE.CylinderGeometry(.76,.76,.03,64),[side,top,side]);
    vin.position.y=.12;g.add(vin);vinMeshes.push(vin);vin.userData.deck=k;
    var arm=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,1.1),new THREE.MeshStandardMaterial({color:0xcfc9dd,metalness:.9,roughness:.2}));
    arm.position.set(k?-.62:.62,.2,-.05);arm.rotation.y=k?-.35:.35;g.add(arm);
    decks.push({g:g,vin:vin,angle:0,speed:-3.49,grab:false});
  });
  // mixer
  var mixer=new THREE.Mesh(new THREE.BoxGeometry(1.5,.12,1.5),new THREE.MeshStandardMaterial({color:0x100c1a,roughness:.5,metalness:.5}));
  mixer.position.set(0,1.28,.08);booth.add(mixer);
  var knobs=[];
  for(var kn=0;kn<8;kn++){
    var kb=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.06,10),new THREE.MeshBasicMaterial({color:beamCols[kn%3]}));
    kb.position.set(-.5+(kn%4)*.33,1.37,.5-(Math.floor(kn/4))*.22);booth.add(kb);knobs.push(kb);
  }
  var lvMats=[new THREE.MeshBasicMaterial({color:0x37e07a}),new THREE.MeshBasicMaterial({color:0xffc247}),new THREE.MeshBasicMaterial({color:0xff3b5c})];
  var lvls=[];
  for(var col=0;col<2;col++)for(var seg=0;seg<8;seg++){
    var lm=new THREE.Mesh(new THREE.BoxGeometry(.1,.04,.06),lvMats[seg<5?0:(seg<7?1:2)]);
    lm.position.set(col?.22:-.22,1.36,-.15-seg*.075);booth.add(lm);lvls.push({m:lm,seg:seg});
  }
  // DJ silhouette
  var dj=new THREE.Group();dj.position.set(0,0,-.85);booth.add(dj);
  var djMat=new THREE.MeshStandardMaterial({color:0x07050c,roughness:.8,emissive:0x1d1132,emissiveIntensity:.6});
  var torso=new THREE.Mesh(new THREE.CylinderGeometry(.44,.56,1.15,10),djMat);torso.position.y=1.95;dj.add(torso);
  var shoulders=new THREE.Mesh(new THREE.BoxGeometry(1.25,.26,.42),djMat);shoulders.position.y=2.45;dj.add(shoulders);
  var headG=new THREE.Group();headG.position.y=2.9;dj.add(headG);
  headG.add(new THREE.Mesh(new THREE.SphereGeometry(.27,16,12),djMat));
  var band=new THREE.Mesh(new THREE.TorusGeometry(.3,.035,8,24,Math.PI),new THREE.MeshBasicMaterial({color:0xffc247}));headG.add(band);
  [-.3,.3].forEach(function(x){var c=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),new THREE.MeshBasicMaterial({color:0xffc247}));c.position.set(x,0,0);c.scale.set(.6,1,1);headG.add(c)});
  var visor=new THREE.Mesh(new THREE.BoxGeometry(.4,.07,.1),new THREE.MeshBasicMaterial({color:0x000000}));visor.position.set(0,.04,.25);headG.add(visor);
  function limb(a,b,r){
    var d=new THREE.Vector3().subVectors(b,a),len=d.length();
    var m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,8),djMat);
    m.position.copy(a).addScaledVector(d,.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());
    return m;
  }
  dj.add(limb(new THREE.Vector3(-.62,2.4,0),new THREE.Vector3(-1.65,1.55,.95),.1));
  dj.add(limb(new THREE.Vector3(.62,2.4,0),new THREE.Vector3(1.65,1.55,.95),.1));

  // crowd
  var cols=isMobile?18:30,rows=isMobile?5:8,NP=cols*rows;
  var crowdMat=new THREE.MeshBasicMaterial({color:0x07050d});
  var heads=new THREE.InstancedMesh(new THREE.SphereGeometry(.2,8,6),crowdMat,NP);
  var bodies=new THREE.InstancedMesh(new THREE.CylinderGeometry(.26,.34,.95,8),crowdMat,NP);
  var arms=new THREE.InstancedMesh(new THREE.BoxGeometry(.07,.8,.07),crowdMat,NP*2);
  A.add(heads);A.add(bodies);A.add(arms);
  var people=[];
  for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
    people.push({x:(c-(cols-1)/2)*(isMobile?.8:.58)+(Math.random()-.5)*.3,z:5.4+r*.8+(Math.random()-.5)*.3,h:.85+Math.random()*.25,ph:Math.random()*6.28,hands:Math.random()<.4});
  }
  var dummy=new THREE.Object3D();
  var dustA=dust(0,4,3,26,9,16,isMobile?160:380,0xb89bff);

  /* ============ REGION B: campus ring ============ */
  var BX=30;
  var ringG=new THREE.Group();ringG.position.set(BX,3.2,0);scene.add(ringG);
  glowDisc(BX,0,13,'rgba(255,59,92,.55)');
  var RR=8,tiles=[],tileMeshes=[];
  function tileTex(d){
    return ctex(512,680,function(g,w,h){
      var gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,hsl(d.h[0],68,32));gr.addColorStop(1,hsl(d.h[1],72,12));
      g.fillStyle=gr;g.fillRect(0,0,w,h);
      g.save();g.translate(w*.78,h*.46);
      for(var i=0;i<24;i++){g.rotate(Math.PI/12);g.fillStyle='rgba(255,255,255,.07)';g.beginPath();g.moveTo(0,0);g.lineTo(700,-30);g.lineTo(700,30);g.closePath();g.fill()}
      g.restore();
      g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=2;
      for(var q=60;q<260;q+=7){g.beginPath();g.arc(w*.82,h*.7,q,0,Math.PI*2);g.stroke()}
      g.fillStyle=hsl(d.h[0],90,62);g.beginPath();g.arc(w*.82,h*.7,40,0,Math.PI*2);g.fill();
      g.fillStyle='#fff';g.textBaseline='top';g.textAlign='left';
      g.font='500 20px DM Mono, monospace';g.fillText(d.tag.toUpperCase(),36,40);
      var f=fit(g,d.n,w-72,104);g.font='800 '+f.size+'px '+FONT;
      for(var k=0;k<f.words.length;k++)g.fillText(f.words[k],36,100+k*f.size*.98);
      g.font='500 16px DM Mono, monospace';g.globalAlpha=.8;g.fillText('RUBZ  ·  SUNBURN CAMPUS DJ',36,h-52);
    });
  }
  TILES.forEach(function(d,i){
    var a=i/TILES.length*Math.PI*2;
    var mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.4,4.5),new THREE.MeshBasicMaterial({map:tileTex(d),side:THREE.DoubleSide}));
    mesh.userData.idx=i;
    var glow=new THREE.Mesh(new THREE.PlaneGeometry(3.9,5.0),new THREE.MeshBasicMaterial({color:new THREE.Color('hsl('+d.h[0]+',90%,60%)'),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
    glow.position.z=-.05;
    var pivot=new THREE.Group();
    pivot.position.set(Math.sin(a)*RR,0,-Math.cos(a)*RR);pivot.rotation.y=-a;
    pivot.add(mesh);pivot.add(glow);ringG.add(pivot);
    tiles.push({pivot:pivot,mesh:mesh,glow:glow,a:a,s:1,o:0});tileMeshes.push(mesh);
  });
  [-3.7,3.7].forEach(function(y){
    var t=new THREE.Mesh(new THREE.TorusGeometry(RR+.9,.02,6,120),new THREE.MeshBasicMaterial({color:0xffc247,transparent:true,opacity:.7}));
    t.rotation.x=Math.PI/2;t.position.y=y;ringG.add(t);
  });
  var dustB=dust(BX,3,0,30,10,30,isMobile?140:320,0xff8aa0);
  var ringRot=0;

  /* ============ REGION C: supporting-act slabs ============ */
  var CX=60;
  glowDisc(CX,0,16,'rgba(123,77,255,.55)');
  var slabs=[],slabMeshes=[];
  function slabTex(d){
    return ctex(512,1024,function(g,w,h){
      var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,hsl(d.h[0],60,22));gr.addColorStop(1,hsl(d.h[1],70,9));
      g.fillStyle=gr;g.fillRect(0,0,w,h);
      g.strokeStyle=hsl(d.h[0],90,62,.9);g.lineWidth=6;g.strokeRect(14,14,w-28,h-28);
      for(var y=70;y<h;y+=22){g.fillStyle='rgba(255,255,255,.035)';g.fillRect(24,y,w-48,2)}
      g.fillStyle='#fff';g.textAlign='left';g.textBaseline='top';
      g.font='500 22px DM Mono, monospace';g.fillText('SUPPORTING ACT',44,52);
      var f=fit(g,d.n,w-88,96);g.font='800 '+f.size+'px '+FONT;
      for(var k=0;k<f.words.length;k++)g.fillText(f.words[k],44,130+k*f.size*1.02);
      g.font='500 20px DM Mono, monospace';g.globalAlpha=.75;g.fillText('RUBZ',44,h-70);
    });
  }
  var slabX=[-6.3,-2.1,2.1,6.3],slabZ=[-1.4,-.3,-.3,-1.4];
  ACTS.forEach(function(d,i){
    var dark=new THREE.MeshStandardMaterial({color:0x120d1d,roughness:.5,metalness:.5});
    var frontM=new THREE.MeshBasicMaterial({map:slabTex(d)});
    var mesh=new THREE.Mesh(new THREE.BoxGeometry(3.2,6.4,.4),[dark,dark,dark,dark,frontM,dark]);
    mesh.userData.idx=i;
    var g=new THREE.Group();g.position.set(CX+slabX[i],3.2,slabZ[i]);g.add(mesh);scene.add(g);
    var bm=beamMat(new THREE.Color('hsl('+d.h[0]+',90%,60%)').getHex());
    var bg=new THREE.Group();bg.rotation.x=Math.PI;bg.position.y=3.2;g.add(bg);
    bg.add(new THREE.Mesh(beamGeo(1.5,18),bm));
    var halo=new THREE.Mesh(new THREE.PlaneGeometry(3.8,6.9),new THREE.MeshBasicMaterial({color:new THREE.Color('hsl('+d.h[0]+',90%,60%)'),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
    halo.position.z=-.25;g.add(halo);
    slabs.push({g:g,mesh:mesh,bm:bm,halo:halo,y0:3.2,lift:0});slabMeshes.push(mesh);
  });
  var dustC=dust(CX,5,0,24,12,20,isMobile?120:260,0xb89bff);

  /* ============ REGION D: globe ============ */
  var DX=90,GR=3.5;
  glowDisc(DX,0,15,'rgba(255,194,71,.4)');
  var globe=new THREE.Group();globe.position.set(DX,3.6,0);scene.add(globe);
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(GR,48,32),new THREE.ShaderMaterial({
    vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.0-max(dot(normalize(vN),normalize(vV)),0.0),2.4);gl_FragColor=vec4(mix(vec3(.035,.02,.09),vec3(.48,.30,1.0),f),1.0);}'
  })));
  function ll(lat,lon,r){
    var p=lat*Math.PI/180,l=lon*Math.PI/180;
    return new THREE.Vector3(r*Math.cos(p)*Math.sin(l),r*Math.sin(p),r*Math.cos(p)*Math.cos(l));
  }
  var gv=[];
  for(var la=-60;la<=60;la+=30){for(var lo=0;lo<360;lo+=6){gv.push(ll(la,lo,GR*1.002),ll(la,lo+6,GR*1.002))}}
  for(var lo2=0;lo2<360;lo2+=30){for(var la2=-84;la2<84;la2+=6){gv.push(ll(la2,lo2,GR*1.002),ll(la2+6,lo2,GR*1.002))}}
  var gGeo=new THREE.BufferGeometry().setFromPoints(gv);
  globe.add(new THREE.LineSegments(gGeo,new THREE.LineBasicMaterial({color:0x4a3a8a,transparent:true,opacity:.55})));
  var dp=[],GN=isMobile?900:1600;
  for(var di=0;di<GN;di++){
    var yy=1-(di/(GN-1))*2,rad=Math.sqrt(1-yy*yy),th=di*2.399963;
    dp.push(new THREE.Vector3(Math.cos(th)*rad*GR*1.006,yy*GR*1.006,Math.sin(th)*rad*GR*1.006));
  }
  globe.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(dp),new THREE.PointsMaterial({size:.035,color:0x9a7bff,transparent:true,opacity:.65,depthWrite:false})));
  var PINS=[
    {n:'INDIA',lat:20.6,lon:78.9,c:0xffc247,css:'#ffc247'},
    {n:'MALAYSIA',lat:3.14,lon:101.69,c:0xff3b5c,css:'#ff3b5c'},
    {n:'THAILAND',lat:13.75,lon:100.5,c:0xff8a3d,css:'#ff8a3d'},
    {n:'INDONESIA',lat:-6.2,lon:106.8,c:0x9a7bff,css:'#9a7bff'}
  ];
  function labelSprite(text,color){
    var t=ctex(512,128,function(g,w,h){
      g.fillStyle='rgba(10,7,18,.78)';rr(g,8,24,w-16,80,40);g.fill();
      g.strokeStyle=color;g.lineWidth=3;g.stroke();
      g.fillStyle='#fff';g.font='500 42px DM Mono, monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+2);
    });
    var s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));
    s.scale.set(1.9,.475,1);s.renderOrder=10;return s;
  }
  var pinObjs=[],arcs=[];
  PINS.forEach(function(p,i){
    var pos=ll(p.lat,p.lon,GR*1.01),nrm=pos.clone().normalize();
    var dot=new THREE.Mesh(new THREE.SphereGeometry(i?.07:.09,12,10),new THREE.MeshBasicMaterial({color:p.c}));dot.position.copy(pos);globe.add(dot);
    var ring=new THREE.Mesh(new THREE.RingGeometry(.11,.15,28),new THREE.MeshBasicMaterial({color:p.c,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));
    ring.position.copy(pos);ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),nrm);globe.add(ring);
    var sp=labelSprite(p.n,p.css);sp.position.copy(nrm.clone().multiplyScalar(GR*1.2));globe.add(sp);
    pinObjs.push({ring:ring,sp:sp,nrm:nrm});
    if(i>0){
      var p0=pinObjs[0].nrm.clone().multiplyScalar(GR*1.01),p1=pos.clone();
      var mid=p0.clone().add(p1).multiplyScalar(.5).normalize().multiplyScalar(GR*1.38);
      var curve=new THREE.QuadraticBezierCurve3(p0,mid,p1);
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),new THREE.LineBasicMaterial({color:p.c,transparent:true,opacity:.85})));
      var bead=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));globe.add(bead);
      arcs.push({curve:curve,bead:bead,off:i*.31});
    }
  });
  var dustD=dust(DX,4,0,22,12,18,isMobile?100:240,0xffd27a);
  var globeDrag=0;

  /* ============ camera path ============ */
  var STOPS=[
    {p:[.5,3.1,12.5],l:[0,2.1,0],sx:.24},
    {p:[.3,2.35,4.2],l:[0,1.45,.2],sx:.34},
    {p:[BX,3.2,0],l:[BX,3.2,-8],sx:-.3},
    {p:[CX,3,19],l:[CX,3.2,0],sx:.3},
    {p:[DX,3.6,12.5],l:[DX,3.6,0],sx:-.3},
    {p:[DX,4.3,14.5],l:[DX,3.6,0],sx:-.36}
  ];
  var secs=$$('.stop'),centers=[];
  function measure(){
    centers=secs.map(function(s){var r=s.getBoundingClientRect();return r.top+(window.scrollY||0)+r.height/2});
  }
  function calcF(){
    var y=(window.scrollY||0)+innerHeight*.5,n=centers.length;
    if(!n)return 0;
    if(y<=centers[0])return 0;
    for(var i=0;i<n-1;i++){
      if(y<=centers[i+1]){var span=centers[i+1]-centers[i];return span>1?i+(y-centers[i])/span:i}
    }
    return n-1;
  }
  var tmpPos=new THREE.Vector3(),tmpLook=new THREE.Vector3(),tmpR=new THREE.Vector3(),tmpU=new THREE.Vector3();
  function applyCamera(T){
    var n=STOPS.length-1,f=clamp(S.fs,0,n),i=Math.min(n-1,Math.floor(f)),t=smooth(((f-i)-.28)/.44);
    var a=STOPS[i],b=STOPS[i+1];
    tmpPos.set(lerp(a.p[0],b.p[0],t),lerp(a.p[1],b.p[1],t)+Math.sin(Math.PI*t)*3.5,lerp(a.p[2],b.p[2],t));
    tmpLook.set(lerp(a.l[0],b.l[0],t),lerp(a.l[1],b.l[1],t),lerp(a.l[2],b.l[2],t));
    var dr=reduce?0:1;
    tmpPos.x+=Math.sin(T*.23)*.25*dr+S.mx*.55;
    tmpPos.y+=Math.cos(T*.19)*.15*dr+S.my*.3;
    if(S.drop>0){tmpPos.x+=(Math.random()-.5)*.12*S.drop;tmpPos.y+=(Math.random()-.5)*.12*S.drop}
    camera.position.copy(tmpPos);
    camera.lookAt(tmpLook);
    camera.updateMatrixWorld();
    var e=camera.matrixWorld.elements;
    tmpR.set(e[0],e[1],e[2]);tmpU.set(e[4],e[5],e[6]);
    var dist=tmpPos.distanceTo(tmpLook),th=Math.tan(camera.fov*Math.PI/360)*dist;
    if(camera.aspect>1.15){
      tmpLook.addScaledVector(tmpR,-lerp(a.sx,b.sx,t)*th*camera.aspect);
    }else{
      tmpLook.addScaledVector(tmpU,-(S.fs>1.5&&S.fs<2.5?.12:.3)*th);
    }
    camera.lookAt(tmpLook);
    var fov=52+S.drop*7;
    if(Math.abs(fov-camera.fov)>.01){camera.fov=fov;camera.updateProjectionMatrix()}
  }

  /* ============ interaction ============ */
  var ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),tip=$('#tip');
  var hover={type:'',idx:-1},grab=null,gdrag=null;
  function pick(list){ray.setFromCamera(ndc,camera);var h=ray.intersectObjects(list,false);return h.length?h[0].object:null}
  function setNdc(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1)}
  function hoverTest(e){
    var fs=S.fs,o=null,type='';
    if(fs<1.5){o=pick(vinMeshes);type='deck'}
    else if(fs>1.55&&fs<2.6){o=pick(tileMeshes);type='tile'}
    else if(fs>2.6&&fs<3.5){o=pick(slabMeshes);type='slab'}
    hover.type=o?type:'';
    hover.idx=o?(type==='deck'?o.userData.deck:o.userData.idx):-1;
    canvas.style.cursor=o?(type==='deck'?'grab':'pointer'):(fs>3.4?'grab':'');
    if(o&&type==='tile'){tip.hidden=false;tip.textContent=TILES[hover.idx].n;tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px'}
    else if(o&&type==='slab'){tip.hidden=false;tip.textContent=ACTS[hover.idx].n;tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px'}
    else tip.hidden=true;
    var ns=(o&&type==='slab')?hover.idx:-1;
    if(ns!==S.slab){S.slab=ns;syncActs()}
  }
  on(window,'pointermove',function(e){S.mx=(e.clientX/innerWidth-.5)*2;S.my=-(e.clientY/innerHeight-.5)*2});
  on(canvas,'pointermove',function(e){
    setNdc(e);
    if(grab){
      var a=Math.atan2(e.clientY-grab.cy,e.clientX-grab.cx),da=a-grab.a;
      if(da>Math.PI)da-=Math.PI*2;if(da<-Math.PI)da+=Math.PI*2;
      grab.a=a;
      var now=performance.now(),v=Math.abs(da)/Math.max(8,now-grab.tm)*1000;grab.tm=now;
      grab.d.angle-=da;S.scratch=Math.min(1,v/12);
      if(S.soundOn&&scratchG)scratchG.gain.value=Math.min(.35,v/30);
      return;
    }
    if(gdrag){globeDrag=clamp(globeDrag+(e.clientX-gdrag.x)*.008,-1.3,1.3);gdrag.x=e.clientX;return}
    hoverTest(e);
  });
  on(canvas,'pointerdown',function(e){
    setNdc(e);hoverTest(e);
    if(hover.type==='deck'){
      var d=decks[hover.idx],v=new THREE.Vector3();
      d.vin.getWorldPosition(v);v.project(camera);
      var cx=(v.x*.5+.5)*innerWidth,cy=(-v.y*.5+.5)*innerHeight;
      grab={d:d,cx:cx,cy:cy,a:Math.atan2(e.clientY-cy,e.clientX-cx),tm:performance.now()};
      d.grab=true;canvas.style.cursor='grabbing';
      if(canvas.setPointerCapture)try{canvas.setPointerCapture(e.pointerId)}catch(x){}
    }else if(hover.type==='tile'){
      focusTile(S.focus===hover.idx?-1:hover.idx);
    }else if(S.fs>3.4){
      gdrag={x:e.clientX};canvas.style.cursor='grabbing';
      if(canvas.setPointerCapture)try{canvas.setPointerCapture(e.pointerId)}catch(x){}
    }
  });
  function release(){
    if(grab){grab.d.grab=false;grab=null;S.scratch=0;if(scratchG)scratchG.gain.value=0}
    gdrag=null;
  }
  on(canvas,'pointerup',release);
  on(canvas,'pointercancel',release);
  on(canvas,'pointerleave',function(){tip.hidden=true;if(S.slab>=0&&!grab){S.slab=-1;syncActs()}});

  focusTile=function(i){
    S.focus=i;
    $$('#tileChips .chip').forEach(function(c){c.classList.toggle('on',+c.dataset.i===i)});
    var p=$('#pick');
    if(i<0){p.innerHTML='<b>Pick a show</b><span>Cards are placeholders until dates and photos are added</span>';return}
    p.innerHTML='<b>'+TILES[i].n+'</b><span>'+TILES[i].tag+' &middot; from Rubz\'s Instagram highlights</span>';
  };

  /* ============ loop ============ */
  function resize(){
    var w=innerWidth,h=innerHeight;
    renderer.setSize(w,h,false);
    camera.aspect=w/h;camera.updateProjectionMatrix();
    measure();
  }
  on(window,'resize',resize);
  if(window.ResizeObserver){ro=new ResizeObserver(measure);ro.observe($('#main'))}
  resize();

  var last=nowSec(),T0=nowSec();
  function frame(){
    if(dead)return;
    requestAnimationFrame(frame);
    var tn=nowSec(),dt=Math.min(.05,tn-last);last=tn;var T=tn-T0;
    var rawF=calcF();
    S.lastFs=S.fs;S.fs+=(rawF-S.fs)*Math.min(1,dt*6);
    S.beat=tn*BPM/60;S.pulse=Math.exp(-(S.beat%1)*5);
    S.drop=Math.max(0,S.drop-dt*1.1);
    S.scratch*=.9;
    if(ac&&scratchG&&!grab)scratchG.gain.value=0;

    // region visibility
    A.visible=S.fs<2.2;ringG.visible=S.fs>.9&&S.fs<3.4;
    for(var si=0;si<slabs.length;si++)slabs[si].g.visible=S.fs>1.8&&S.fs<4.2;
    globe.visible=S.fs>2.8;

    applyCamera(T);

    if(A.visible){
      ledU.uTime.value=T;ledU.uPulse.value=S.pulse;ledU.uDrop.value=Math.min(1,S.drop+S.scratch*.25);
      frontMat.color.setHSL((.97+Math.sin(T*.3)*.03)%1,1,.3+.25*S.pulse+.3*S.drop);
      for(var b=0;b<beams.length;b++){
        var bm=beams[b],amp=(reduce?.12:.55)*(1+S.drop*1.8);
        bm.g.rotation.x=-.55+Math.sin(T*.7+b*.9)*amp*.6-S.drop*.2;
        bm.g.rotation.z=Math.sin(T*.5+b*1.7)*amp;
        bm.m.uniforms.uInt.value=.2+.34*S.pulse+.5*S.drop;
      }
      lRed.intensity=1.3+S.pulse*1.4+S.drop*3;lVio.intensity=1.5+S.pulse*1.2+S.drop*3;
      for(var d=0;d<decks.length;d++){
        var dk=decks[d];
        if(!dk.grab&&!reduce)dk.angle+=dk.speed*dt;
        dk.vin.rotation.y=dk.angle;
      }
      for(var k=0;k<knobs.length;k++)knobs[k].rotation.y=T*(.4+k*.1);
      for(var l=0;l<lvls.length;l++){
        var lv=lvls[l],lev=(.25+.75*S.pulse)*(.55+.45*Math.abs(Math.sin(T*3+l*.7)))+S.drop*.4;
        lv.m.visible=lv.seg/8<lev;
      }
      var bob=Math.abs(Math.sin(S.beat*Math.PI))*.05;
      dj.position.y=bob;headG.rotation.x=Math.sin(S.beat*Math.PI*2)*.12;
      // crowd
      for(var pI=0;pI<NP;pI++){
        var P=people[pI],bb=Math.abs(Math.sin(S.beat*Math.PI+P.ph))*(.09+.05*S.drop)*(reduce?.2:1);
        dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);
        dummy.position.set(P.x,P.h*.5+bb,P.z);dummy.updateMatrix();bodies.setMatrixAt(pI,dummy.matrix);
        dummy.position.set(P.x,P.h+.28+bb,P.z);dummy.updateMatrix();heads.setMatrixAt(pI,dummy.matrix);
        for(var s2=0;s2<2;s2++){
          var sg=s2?1:-1;
          if(P.hands||S.drop>.3){
            var sw=Math.sin(S.beat*Math.PI*2+P.ph)*.18;
            dummy.rotation.set(0,0,sg*(.28+sw));dummy.position.set(P.x+sg*.34,P.h+.55+bb,P.z);dummy.scale.set(1,1,1);
          }else{
            dummy.rotation.set(0,0,sg*.08);dummy.position.set(P.x+sg*.33,P.h*.55+bb,P.z);dummy.scale.set(1,.7,1);
          }
          dummy.updateMatrix();arms.setMatrixAt(pI*2+s2,dummy.matrix);
        }
      }
      heads.instanceMatrix.needsUpdate=true;bodies.instanceMatrix.needsUpdate=true;arms.instanceMatrix.needsUpdate=true;
      dustA.rotation.y=T*.01;
    }

    if(ringG.visible){
      if(S.focus>=0){
        var tgt=tiles[S.focus].a,dd=Math.atan2(Math.sin(tgt-ringRot),Math.cos(tgt-ringRot));
        ringRot+=dd*Math.min(1,dt*3);
      }else{
        ringRot+=(reduce?0:dt*.12)+(S.fs-S.lastFs)*1.4;
      }
      ringG.rotation.y=ringRot;
      for(var ti=0;ti<tiles.length;ti++){
        var tl=tiles[ti],isH=(hover.type==='tile'&&hover.idx===ti)||S.focus===ti;
        tl.s+=((isH?1.1:1)-tl.s)*Math.min(1,dt*8);
        tl.o+=((isH?(S.focus===ti?.55:.35):0)-tl.o)*Math.min(1,dt*8);
        tl.pivot.scale.set(tl.s,tl.s,tl.s);
        tl.glow.material.opacity=tl.o+.1*S.pulse*(S.focus===ti?1:0);
        tl.pivot.position.y=reduce?0:Math.sin(T*.8+ti)*.15;
      }
      dustB.rotation.y=T*.02;
    }

    if(slabs[0].g.visible){
      for(var sI=0;sI<slabs.length;sI++){
        var sb=slabs[sI],on=S.slab===sI;
        sb.lift+=((on?1:0)-sb.lift)*Math.min(1,dt*6);
        sb.g.position.y=sb.y0+sb.lift*.5+(reduce?0:Math.sin(T*.7+sI)*.08);
        sb.halo.material.opacity=sb.lift*.35;
        sb.bm.uniforms.uInt.value=.12+.5*sb.lift+.12*S.pulse+.4*S.drop;
      }
      dustC.rotation.y=T*.015;
    }

    if(globe.visible){
      globeDrag+=(0-globeDrag)*Math.min(1,dt*.15);
      globe.rotation.y=-95*Math.PI/180+(reduce?0:Math.sin(T*.25)*.22)+globeDrag;
      for(var pi2=0;pi2<pinObjs.length;pi2++){
        var po=pinObjs[pi2],sc=1+S.pulse*.35+.15*Math.sin(T*2+pi2);
        po.ring.scale.set(sc,sc,sc);
        var wp=po.nrm.clone().transformDirection(globe.matrixWorld),vd=camera.position.clone().sub(globe.position).normalize();
        po.sp.material.opacity=clamp((wp.dot(vd)-.05)*4,0,1);
      }
      for(var ai=0;ai<arcs.length;ai++){
        var ar=arcs[ai];ar.bead.position.copy(ar.curve.getPoint((T*.22+ar.off)%1));
      }
      dustD.rotation.y=T*.02;
    }

    renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
}

/* ---------------- boot ---------------- */
initUI();
var started=false;
function go(){
  if(started||dead)return;started=true;
  try{init3D()}catch(e){document.documentElement.classList.add('no-gl');if(window.console)console.error(e)}
}
var wait=Promise.resolve();
try{if(document.fonts&&document.fonts.load){wait=Promise.all([document.fonts.load('800 80px Unbounded'),document.fonts.load('500 20px "DM Mono"')])}}catch(e){}
wait.then(go,go);
var bootT=setTimeout(go,2500);
return function dispose(){
  dead=true;clearTimeout(bootT);stopBeat();
  offs.forEach(function(f){f()});offs.length=0;
  if(io)io.disconnect();
  if(ro)ro.disconnect();
  if(renderer){renderer.dispose();renderer=null}
  if(ac){try{ac.close()}catch(e){}ac=null}
};

}
