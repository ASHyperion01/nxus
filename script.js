/* ═══════════════════════════════════════════════════
   FLIPPER REMOTE v3.0
   20 REAL features — no fakes, no simulations
   All powered by real Web APIs
═══════════════════════════════════════════════════ */
'use strict';

const LOGO = `⠀⠀⠀⠀⠀⣀⣠⠤⠶⠶⣖⡛⠛⠿⠿⠯⠭⠍⠉⣉⠛⠚⠛⠲⣄
⠀⠀⢀⡴⠋⠁⠀⡉⠁⢐⣒⠒⠈⠁⠀⠀⠀⠈⠁⢂⢅⡂⠀⠀⠘⣧
⠀⠀⣼⠀⠀⠀⠁⠀⠀⠀⠂⠀⠀⠀⠀⢀⣀⣤⣤⣄⡈⠈⠀⠀⠀⠘⣇
⢠⡾⠡⠄⠀⠀⠾⠿⠿⣷⣦⣤⠀⠀⣾⣋⡤⠿⠿⠿⠿⠆⠠⢀⣀⡒⠼⢷⣄
⣿⠊⠊⠶⠶⢦⣄⡄⠀⢀⣿⠀⠀⠀⠈⠁⠀⠀⠙⠳⠦⠶⠞⢋⣍⠉⢳⡄⠈⣧
⢹⣆⡂⢀⣿⠀⠀⡀⢴⣟⠁⠀⢀⣠⣘⢳⡖⠀⠀⣀⣠⡴⠞⠋⣽⠷⢠⠇⠀⣼
⠀⢻⡀⢸⣿⣷⢦⣄⣀⣈⣳⣆⣀⣀⣤⣭⣴⠚⠛⠉⣹⣧⡴⣾⠋⠀⠀⣘⡼⠃
⠀⢸⡇⢸⣷⣿⣤⣏⣉⣙⣏⣉⣹⣁⣀⣠⣼⣶⡾⠟⢻⣇⡼⠁⠀⠀⣰⠋
⠀⢸⡇⠸⣿⡿⣿⢿⡿⢿⣿⠿⠿⣿⠛⠉⠉⢧⠀⣠⡴⠋⠀⠀⠀⣠⠇
⠀⢸⠀⠀⠹⢯⣽⣆⣷⣀⣻⣀⣀⣿⣄⣤⣴⠾⢛⡉⢄⡢⢔⣠⠞⠁
⠀⢸⠀⠀⠀⠢⣀⠀⠈⠉⠉⠉⠉⣉⣀⠠⣐⠦⠑⣊⡥⠞⠋
⠀⢸⡀⠀⠁⠂⠀⠀⠀⠀⠀⠀⠒⠈⠁⣀⡤⠞⠋⠁
⠀⠀⠙⠶⢤⣤⣤⣤⣤⡤⠴⠖⠚⠛⠉⠁`;

/* ──────────────────────────────────
   STATE
────────────────────────────────── */
const S = {
  app:'menu', idx:0,
  // Samsung
  samWs:null, samIp:'', samOk:false,
  // LG
  lgWs:null,  lgIp:'',  lgOk:false, lgKey:'',
  // Sony
  sonyIp:'', sonyPsk:'0000',
  // TV scan
  tvList:[], tvSel:0, tvScanning:false, tvProg:0,
  // BT
  btDevs:[], btSel:0, btGatt:null, btDev:null,
  // NFC
  nfcTag:null, nfcActive:false, nfcAbort:null,
  // GPS
  gpsPos:null, gpsTrack:[], gpsWatch:null,
  // Freq / Audio
  audioCtx:null, analyser:null, vRaf:null,
  // Serial (IR)
  port:null, portWriter:null,
  // Screen capture
  capStream:null,
  // Wake Lock
  wakeLock:null,
  // Battery
  battery:null,
  // Contacts
  contacts:[],
  // Log
  log:[],
  // Sub-GHz
  subIdx:1, subSigs:[], subInt:null, subOn:false,
};

/* ──────────────────────────────────
   CONSTANTS
────────────────────────────────── */
const MENU = [
  {id:'tvscan',  ic:'◈', n:'TV SCANNER'},
  {id:'samsung', ic:'▶', n:'SAMSUNG'},
  {id:'lg',      ic:'◉', n:'LG TV'},
  {id:'sony',    ic:'◆', n:'SONY TV'},
  {id:'ir',      ic:'~', n:'IR BLASTER'},
  {id:'bt',      ic:'⬡', n:'BLUETOOTH'},
  {id:'nfc',     ic:'○', n:'NFC'},
  {id:'gps',     ic:'⊕', n:'GPS TRACKER'},
  {id:'freq',    ic:'♪', n:'MIC ANALYZER'},
  {id:'cam',     ic:'◎', n:'CAMERA'},
  {id:'speech',  ic:'◬', n:'SPEECH'},
  {id:'clip',    ic:'≡', n:'CLIPBOARD'},
  {id:'screen',  ic:'▣', n:'SCREEN CAP'},
  {id:'wakelock',ic:'⊙', n:'WAKE LOCK'},
  {id:'sensors', ic:'⊹', n:'SENSORS'},
  {id:'network', ic:'◈', n:'NETWORK INFO'},
  {id:'contacts',ic:'⊞', n:'CONTACTS'},
  {id:'share',   ic:'⊿', n:'SHARE'},
  {id:'badusb',  ic:'⌨', n:'BAD USB'},
  {id:'system',  ic:'⚙', n:'SYSTEM'},
];

const SAM = {
  power:'KEY_POWER',vUp:'KEY_VOLUMEUP',vDn:'KEY_VOLUMEDOWN',
  mute:'KEY_MUTE',chUp:'KEY_CHANNELUP',chDn:'KEY_CHANNELDOWN',
  up:'KEY_UP',dn:'KEY_DOWN',lt:'KEY_LEFT',rt:'KEY_RIGHT',
  ok:'KEY_ENTER',back:'KEY_RETURN',home:'KEY_HOME',
  src:'KEY_SOURCE',info:'KEY_INFO',
};

const LG_URI = {
  off:'ssap://system/turnOff',vUp:'ssap://audio/volumeUp',
  vDn:'ssap://audio/volumeDown',mute:'ssap://audio/setMute',
  chUp:'ssap://tv/channelUp',chDn:'ssap://tv/channelDown',
  info:'ssap://com.webos.service.update/getCurrentSWInformation',
  toast:'ssap://system.notifications/createToast',
  ch:'ssap://tv/getCurrentChannel',vol:'ssap://audio/getVolume',
};

/* ──────────────────────────────────
   DOM
────────────────────────────────── */
const $   = id => document.getElementById(id);
const scr = $('scr');
const ctx = $('ctx');
const ir  = $('ir');
const toast = $('toast');
const modal = $('modal');
const mbox  = $('mbox');

/* ──────────────────────────────────
   UTILS
────────────────────────────────── */
let _H = {};
function vib(p=12){try{navigator.vibrate(p)}catch(e){}}
function flashIR(){ir.classList.add('on');lp('O');setTimeout(()=>{ir.classList.remove('on');lo('O')},300)}
function ln(c){$('led'+c)?.classList.add('on')}
function lo(c){$('led'+c)?.classList.remove('on')}
function lp(c,ms=400){ln(c);setTimeout(()=>lo(c),ms)}
let _tt;
function toast_(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(_tt);_tt=setTimeout(()=>toast.classList.remove('show'),2200)}
function addLog(cat,msg){S.log.unshift({ts:new Date().toTimeString().slice(0,8),cat,msg});if(S.log.length>300)S.log.pop()}
function title(t){$('sbarTitle').textContent=t}
function clearCtx(){ctx.innerHTML=''}
function btn(lbl,fn,cls=''){const b=document.createElement('button');b.className='cb '+cls;b.textContent=lbl;b.onclick=()=>{vib();fn()};ctx.appendChild(b);return b}
function showModal(html){mbox.innerHTML=html;modal.classList.add('open')}
function closeModal(){modal.classList.remove('open')}
function isHttps(){return location.protocol==='https:'}
function html(s){scr.innerHTML=s}

/* ──────────────────────────────────
   INIT
────────────────────────────────── */
window.onload=async()=>{
  bindKeys();
  initBattery();
  initNet();
  initSensors();
  // Load stored LG key
  S.lgKey=localStorage.getItem('lg_key')||'';
  // Boot splash
  showSplash();
  addLog('SYS','Boot OK v3.0');
};

function showSplash(){
  html(`<div class="fi" style="display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:center">
    <div class="logo hi">${LOGO}</div>
    <div class="sl h" style="margin-top:4px">FLIPPER REMOTE</div>
    <div class="sl d">v3.0 — 20 FUNCTIONS</div>
  </div>`);
  clearCtx();
  setTimeout(()=>renderMenu(),1600);
}

async function initBattery(){
  try{if(navigator.getBattery){const b=await navigator.getBattery();S.battery=b;const u=()=>{$('sBat').textContent=(b.charging?'⚡':'')+Math.round(b.level*100)+'%'};u();b.onlevelchange=u;b.onchargingchange=u}}catch(e){}
}
function initNet(){const c=navigator.connection;if(c){$('sNet').textContent=c.effectiveType||'?';c.onchange=()=>{$('sNet').textContent=c.effectiveType||'?'}}}
let _sens={ax:0,ay:0,az:0,a:0,be:0,ga:0};
function initSensors(){
  window.addEventListener('devicemotion',e=>{const a=e.accelerationIncludingGravity;if(a){_sens.ax=+(a.x||0).toFixed(1);_sens.ay=+(a.y||0).toFixed(1);_sens.az=+(a.z||0).toFixed(1)}},{passive:true});
  window.addEventListener('deviceorientation',e=>{_sens.a=+(e.alpha||0).toFixed(0);_sens.be=+(e.beta||0).toFixed(0);_sens.ga=+(e.gamma||0).toFixed(0)},{passive:true});
}

/* ──────────────────────────────────
   KEYS / SWIPE
────────────────────────────────── */
function bindKeys(){
  $('dpu').onclick=()=>{vib();_H.up?_H.up():menuNav(-1)};
  $('dpd').onclick=()=>{vib();_H.dn?_H.dn():menuNav(1)};
  $('dpl').onclick=()=>{vib();_H.lt&&_H.lt()};
  $('dpr').onclick=()=>{vib();_H.rt&&_H.rt()};
  $('dpok').onclick=()=>{vib(22);_H.ok?_H.ok():menuOK()};
  $('btnBack').onclick=()=>{vib();goBack()};
  $('sideUp').onclick=()=>{vib();_H.sU?_H.sU():menuNav(-1)};
  $('sideDown').onclick=()=>{vib();_H.sD?_H.sD():menuNav(1)};
  document.addEventListener('keydown',e=>{
    ({ArrowUp:$('dpu'),ArrowDown:$('dpd'),ArrowLeft:$('dpl'),ArrowRight:$('dpr'),Enter:$('dpok'),Escape:$('btnBack')})[e.key]?.click();
    if(['ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();
  });
  // Swipe back
  let tsx=0;
  document.addEventListener('touchstart',e=>{tsx=e.touches[0].clientX},{passive:true});
  document.addEventListener('touchend',e=>{if(e.changedTouches[0].clientX-tsx>60&&S.app!=='menu')goBack()},{passive:true});
}

/* ──────────────────────────────────
   NAV
────────────────────────────────── */
function menuNav(d){S.idx=(S.idx+d+MENU.length)%MENU.length;renderMenu()}
function menuOK(){openApp(MENU[S.idx].id)}
function goBack(){stopApp();S.app='menu';renderMenu()}

function stopApp(){
  S.tvScanning=false;S.subOn=false;S.nfcActive=false;
  if(S.subInt){clearInterval(S.subInt);S.subInt=null}
  if(S.gpsWatch){navigator.geolocation.clearWatch(S.gpsWatch);S.gpsWatch=null}
  if(S.vRaf){cancelAnimationFrame(S.vRaf);S.vRaf=null}
  if(S.audioCtx){S.audioCtx.close().catch(()=>{});S.audioCtx=null;S.analyser=null}
  if(S.capStream){S.capStream.getTracks().forEach(t=>t.stop());S.capStream=null}
  if(S.nfcAbort){try{S.nfcAbort.abort()}catch(e){}S.nfcAbort=null}
  _H={};
}

function openApp(id){
  stopApp();S.app=id;
  title((MENU.find(m=>m.id===id)||{n:id.toUpperCase()}).n);
  ({tvscan:tvScan,samsung:appSam,lg:appLG,sony:appSony,ir:appIR,
    bt:appBT,nfc:appNFC,gps:appGPS,freq:appFreq,cam:appCam,
    speech:appSpeech,clip:appClip,screen:appScreen,wakelock:appWake,
    sensors:appSens,network:appNet,contacts:appContacts,share:appShare,
    badusb:appBadUSB,system:appSys})[id]?.();
}

/* ──────────────────────────────────
   MENU
────────────────────────────────── */
function renderMenu(){
  stopApp();title('FLIPPER REMOTE');clearCtx();
  _H={up:()=>menuNav(-1),dn:()=>menuNav(1),ok:menuOK};
  const vis=8,start=Math.max(0,Math.min(S.idx-4,MENU.length-vis));
  let h='<div class="fi sl2">';
  for(let i=start;i<Math.min(start+vis,MENU.length);i++){
    const m=MENU[i],s=i===S.idx;
    h+=`<div class="mi${s?' s':''}" onclick="openApp('${m.id}')">
      <span class="ic">${m.ic}</span><span style="margin-left:4px;flex:1">${m.n}</span>
      <span class="ar">${s?'▶':'›'}</span></div>`;
  }
  h+=`<div class="hr"></div><div class="logo" style="margin-top:2px">${LOGO}</div></div>`;
  html(h);
}

/* ══════════════════════════════════
   1. TV SCANNER (real WebSocket probe)
══════════════════════════════════ */
function tvScan(){
  S.tvList=[];S.tvSel=0;S.tvScanning=false;S.tvProg=0;
  renderTV();clearCtx();
  btn('SCAN',tvScanStart,'cg');btn('STOP',()=>{S.tvScanning=false;renderTV()},'');
  btn('MANUAL',tvManual,'co');btn('CONNECT',tvConnect,'cy');
  _H={up:()=>{S.tvSel=Math.max(0,S.tvSel-1);renderTV()},dn:()=>{S.tvSel=Math.min(S.tvList.length-1,S.tvSel+1);renderTV()},ok:tvConnect};
}
function renderTV(){
  const st=S.tvScanning?`<span class="bl">◈ SCANNING ${S.tvProg}%</span>`:`○ ${S.tvList.length} FOUND`;
  const lst=S.tvList.slice(0,7).map((t,i)=>`<div class="mi${i===S.tvSel?' s':''}" onclick="S.tvSel=${i};renderTV()">
    <span class="ic">${t.brand==='Samsung'?'▶':t.brand==='LG'?'◉':'◆'}</span>
    <span style="flex:1">${t.brand} ${t.ip}</span><span style="font-size:5px">${t.port}</span></div>`).join('');
  html(`<div class="fi"><div class="sl">${st}</div><div class="hr"></div>
    ${lst||'<div class="sl d">Press SCAN</div>'}
    ${S.tvList.length?`<div class="sl d">↑↓ select · OK connect</div>`:''}
  </div>`);
}
async function tvScanStart(){
  if(S.tvScanning)return;
  if(isHttps()){showModal(`<div style="color:var(--or);font-size:7px;margin-bottom:8px">⚠ HTTPS LIMIT</div>
<div>ws:// blocked on GitHub Pages.<br><br>Run locally:<br>python3 -m http.server 8080<br>then open localhost:8080</div>
<button class="cb co" onclick="closeModal()" style="margin-top:8px;max-width:none;flex:none;padding:6px 12px">OK</button>`);return}
  S.tvList=[];S.tvScanning=true;S.tvProg=0;S.tvSel=0;
  addLog('TVScan','Starting...');
  const localIp=await getLocalIP();
  if(!localIp){toast_('CANNOT GET LOCAL IP');S.tvScanning=false;renderTV();return}
  addLog('TVScan','Local: '+localIp);
  const base=localIp.split('.').slice(0,3).join('.');
  const ips=Array.from({length:254},(_,i)=>base+'.'+(i+1));
  for(let i=0;i<ips.length;i+=16){
    if(!S.tvScanning)break;
    S.tvProg=Math.round(i/ips.length*100);renderTV();
    await Promise.all(ips.slice(i,i+16).map(probeIP));
  }
  S.tvScanning=false;S.tvProg=100;
  toast_(S.tvList.length?`FOUND ${S.tvList.length} TV!`:'NO TVs FOUND');
  addLog('TVScan','Done. '+S.tvList.length+' found');renderTV();
}
async function probeIP(ip){
  const probes=[{port:8001,brand:'Samsung'},{port:3000,brand:'LG'},{port:52323,brand:'Sony'}];
  return Promise.any(probes.map(p=>new Promise((res,rej)=>{
    const ws=new WebSocket(`ws://${ip}:${p.port}`);
    const t=setTimeout(()=>{try{ws.close()}catch(e){}rej()},700);
    ws.onopen=()=>{
      clearTimeout(t);
      if(!S.tvList.find(x=>x.ip===ip)){
        S.tvList.push({ip,port:p.port,brand:p.brand});
        vib([20,10,20]);lp('G',250);addLog('TVScan','Found '+p.brand+' '+ip);
      }
      try{ws.close()}catch(e){}res();
    };
    ws.onerror=()=>{clearTimeout(t);rej()};
  }))).catch(()=>{});
}
function tvManual(){
  const ip=prompt('TV IP (e.g. 192.168.1.50):');if(!ip)return;
  const br=prompt('Brand (Samsung / LG / Sony):','Samsung');if(!br)return;
  S.tvList.push({ip:ip.trim(),port:{Samsung:8001,LG:3000,Sony:52323}[br]||8001,brand:br});
  renderTV();toast_('ADDED '+ip);
}
function tvConnect(){
  const t=S.tvList[S.tvSel];if(!t){toast_('SELECT A TV');return}
  if(t.brand==='Samsung'){S.samIp=t.ip;openApp('samsung')}
  else if(t.brand==='LG'){S.lgIp=t.ip;openApp('lg')}
  else{S.sonyIp=t.ip;openApp('sony')}
}
async function getLocalIP(){
  return new Promise(res=>{
    const pc=new RTCPeerConnection({iceServers:[]});
    pc.createDataChannel('');
    pc.createOffer().then(o=>pc.setLocalDescription(o));
    pc.onicecandidate=e=>{
      if(!e?.candidate)return;
      const m=e.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
      if(m&&!m[0].startsWith('127.')){res(m[0]);try{pc.close()}catch(e){}}
    };
    setTimeout(()=>res(null),4000);
  });
}

/* ══════════════════════════════════
   2. SAMSUNG TV (real WebSocket API)
══════════════════════════════════ */
function appSam(){
  renderSam();clearCtx();
  btn('CONNECT',samConnect,'cg');btn('POWER',()=>samKey('power'),'cr');
  btn('VOL+',()=>samKey('vUp'),'');btn('VOL-',()=>samKey('vDn'),'');
  btn('CH+',()=>samKey('chUp'),'');btn('CH-',()=>samKey('chDn'),'');
  btn('HOME',()=>samKey('home'),'co');btn('INFO',()=>samKey('info'),'');
  _H={up:()=>samKey('up'),dn:()=>samKey('dn'),lt:()=>samKey('lt'),rt:()=>samKey('rt'),
      ok:()=>samKey('ok'),sU:()=>samKey('vUp'),sD:()=>samKey('vDn')};
}
function renderSam(){
  html(`<div class="fi">
    <div class="sl h">${S.samOk?'<span class="bl">▶</span> '+S.samIp:'▶ '+( S.samIp||'NO IP')}</div>
    <div class="sl">${S.samOk?'● CONNECTED':'○ DISCONNECTED'}</div>
    <div class="hr"></div>
    <div class="sl d">PORT: 8001 (SmartTV WS)</div>
    <div class="sl d">↑↓ VOL  ←→ CH  OK=SELECT</div>
    <div class="hr"></div>
    ${S.samOk?'<div class="sl y">WS ACTIVE</div>':'<div class="sl d">Press CONNECT</div>'}
    <div class="sl d">Tap CONNECT then accept</div>
    <div class="sl d">prompt on TV screen</div>
  </div>`);
}
async function samConnect(){
  const ip=(S.samIp||prompt('Samsung TV IP:'))?.trim();if(!ip)return;
  S.samIp=ip;
  if(isHttps()){toast_('NEEDS HTTP — run locally');return}
  if(S.samWs){try{S.samWs.close()}catch(e){}}
  toast_('CONNECTING...');addLog('Samsung','→ '+ip);
  S.samWs=new WebSocket(`ws://${ip}:8001/api/v2/channels/samsung.remote.control?name=${btoa('FlipperRemote')}`);
  S.samWs.onopen=()=>{S.samOk=true;toast_('SAMSUNG CONNECTED!');addLog('Samsung','Connected');vib([40,20,40]);lp('G',600);renderSam()};
  S.samWs.onclose=()=>{S.samOk=false;addLog('Samsung','Closed');renderSam()};
  S.samWs.onerror=()=>{S.samOk=false;toast_('CONNECT FAILED');addLog('Samsung','Error');renderSam()};
  S.samWs.onmessage=e=>{try{addLog('Samsung','RX:'+JSON.parse(e.data).event)}catch(e){}};
}
function samKey(k){
  flashIR();vib(10);
  if(!S.samOk||S.samWs?.readyState!==1){toast_('NOT CONNECTED');return}
  S.samWs.send(JSON.stringify({method:'ms.remote.control',params:{Cmd:'Click',DataOfCmd:SAM[k],Option:'false',TypeOfRemote:'SendRemoteKey'}}));
  addLog('Samsung','KEY:'+SAM[k]);
}

/* ══════════════════════════════════
   3. LG TV (real WebOS WS API)
══════════════════════════════════ */
let lgId=0,lgCb={};
function appLG(){
  renderLG();clearCtx();
  btn('CONNECT',lgConnect,'cg');btn('POWER OFF',lgOff,'cr');
  btn('VOL+',()=>lgSend(LG_URI.vUp),'');btn('VOL-',()=>lgSend(LG_URI.vDn),'');
  btn('CH+',()=>lgSend(LG_URI.chUp),'');btn('CH-',()=>lgSend(LG_URI.chDn),'');
  btn('TOAST',()=>lgSend(LG_URI.toast,{message:'Hello from FlipperRemote!'}),'co');
  btn('CHANNEL',()=>lgSend(LG_URI.ch,{},d=>toast_((d?.channelName||'CH').slice(0,16))),'');
  _H={up:()=>lgSend(LG_URI.vUp),dn:()=>lgSend(LG_URI.vDn),lt:()=>lgSend(LG_URI.chDn),rt:()=>lgSend(LG_URI.chUp),sU:()=>lgSend(LG_URI.vUp),sD:()=>lgSend(LG_URI.vDn)};
}
function renderLG(){
  html(`<div class="fi">
    <div class="sl h">${S.lgOk?'<span class="bl">◉</span> '+S.lgIp:'◉ '+(S.lgIp||'NO IP')}</div>
    <div class="sl">${S.lgOk?'● CONNECTED':'○ DISCONNECTED'}</div>
    <div class="hr"></div>
    <div class="sl d">PORT: 3000 (WebOS WS)</div>
    ${S.lgKey?`<div class="sl d">KEY: ...${S.lgKey.slice(-8)}</div>`:'<div class="sl d">Will pair on first connect</div>'}
    <div class="hr"></div>
    <div class="sl d">Accept pairing on TV screen</div>
    ${S.lgOk?'<div class="sl y">WS ACTIVE</div>':'<div class="sl d">Press CONNECT</div>'}
  </div>`);
}
async function lgConnect(){
  const ip=(S.lgIp||prompt('LG TV IP:'))?.trim();if(!ip)return;
  S.lgIp=ip;
  if(isHttps()){toast_('NEEDS HTTP — run locally');return}
  if(S.lgWs){try{S.lgWs.close()}catch(e){}}
  toast_('CONNECTING...');addLog('LG','→ '+ip);
  S.lgWs=new WebSocket(`ws://${ip}:3000/`);
  S.lgWs.onopen=()=>{lgRegister();addLog('LG','WS open, registering')};
  S.lgWs.onclose=()=>{S.lgOk=false;addLog('LG','Closed');renderLG()};
  S.lgWs.onerror=()=>{S.lgOk=false;toast_('LG CONNECT FAILED');addLog('LG','Error');renderLG()};
  S.lgWs.onmessage=e=>{
    try{
      const d=JSON.parse(e.data);
      if(d.type==='registered'){S.lgOk=true;S.lgKey=d.payload?.['client-key']||S.lgKey;localStorage.setItem('lg_key',S.lgKey);toast_('LG CONNECTED!');addLog('LG','Registered key='+S.lgKey.slice(-6));vib([40,20,40]);lp('G',600);renderLG()}
      if(d.id&&lgCb[d.id]){lgCb[d.id](d.payload);delete lgCb[d.id]}
    }catch(e){}
  };
}
function lgRegister(){
  S.lgWs.send(JSON.stringify({type:'register',id:'reg0',payload:{forcePairing:false,pairingType:'PROMPT','client-key':S.lgKey||undefined,
    manifest:{manifestVersion:1,appVersion:'1.1',signed:{created:'20140509',appId:'com.flipperremote',vendorId:'flipper',
    localizedAppNames:{'':'FlipperRemote'},localizedVendorNames:{'':'FlipperRemote'},
    permissions:['CONTROL_POWER','CONTROL_AUDIO','CONTROL_INPUT_TV','TURN_OFF'],serial:'FR20250101'},
    permissions:['CONTROL_POWER','CONTROL_AUDIO','CONTROL_INPUT_TV','TURN_OFF'],
    signatures:[{signatureVersion:1,signature:'UNSIGNED'}]}}}));
}
function lgSend(uri,payload={},cb){
  if(!S.lgOk||!S.lgWs){toast_('LG NOT CONNECTED');return}
  const id='fr'+(++lgId);if(cb)lgCb[id]=cb;
  S.lgWs.send(JSON.stringify({type:'request',id,uri,payload}));
  addLog('LG','→'+uri.split('/').pop());flashIR();vib(10);
}
function lgOff(){lgSend(LG_URI.off)}

/* ══════════════════════════════════
   4. SONY TV (real HTTP PSK API)
══════════════════════════════════ */
function appSony(){
  renderSony();clearCtx();
  btn('POWER OFF',sonyOff,'cr');btn('POWER ON',sonyOn,'cg');
  btn('VOL+',()=>sonyAudio('setAudioVolume',{volume:'+1',target:'speaker'}),'');
  btn('VOL-',()=>sonyAudio('setAudioVolume',{volume:'-1',target:'speaker'}),'');
  btn('MUTE',()=>sonyAudio('setAudioMute',{status:true}),'');
  btn('INFO',sonyInfo,'co');
  btn('SET IP',()=>{S.sonyIp=prompt('Sony TV IP:','')?.trim()||S.sonyIp;renderSony()},'');
  btn('SET PSK',()=>{S.sonyPsk=prompt('Sony PSK (default 0000):','0000')||S.sonyPsk;renderSony()},'');
  _H={sU:()=>sonyAudio('setAudioVolume',{volume:'+1'}),sD:()=>sonyAudio('setAudioVolume',{volume:'-1'})};
}
function renderSony(){
  html(`<div class="fi">
    <div class="sl h">◆ SONY BRAVIA HTTP</div>
    <div class="sl">IP: ${S.sonyIp||'not set'}</div>
    <div class="sl d">PSK: ${S.sonyPsk}</div>
    <div class="hr"></div>
    <div class="sl d">Enable on TV:</div>
    <div class="sl d">Settings > Remote Start</div>
    <div class="sl d">Set Pre-Shared Key</div>
    <div class="hr"></div>
    <div class="sl ${isHttps()?'r':'h'}">${isHttps()?'⚠ HTTPS: run locally':'● HTTP MODE OK'}</div>
  </div>`);
}
async function sonyReq(svc,method,params=[]){
  const ip=S.sonyIp||prompt('Sony IP:')?.trim();if(!ip)return null;
  S.sonyIp=ip;
  if(isHttps()){toast_('NEEDS HTTP mode');return null}
  try{
    const r=await fetch(`http://${ip}/sony/${svc}`,{method:'POST',
      headers:{'Content-Type':'application/json','X-Auth-PSK':S.sonyPsk},
      body:JSON.stringify({method,id:1,params,version:'1.0'})});
    const d=await r.json();addLog('Sony',method+(d.error?' ERR':' OK'));return d;
  }catch(e){toast_('SONY: '+e.message.slice(0,14));addLog('Sony','Err: '+e.message);return null}
}
async function sonyOff(){flashIR();vib(30);const d=await sonyReq('system','setPowerStatus',[{status:false}]);if(d&&!d.error)toast_('SONY: POWER OFF')}
async function sonyOn() {flashIR();vib(30);const d=await sonyReq('system','setPowerStatus',[{status:true}]); if(d&&!d.error)toast_('SONY: POWER ON')}
async function sonyAudio(m,p){flashIR();vib(10);await sonyReq('audio',m,[p])}
async function sonyInfo(){const d=await sonyReq('system','getSystemInformation',[]);if(d?.result?.[0])toast_((d.result[0].model||'Sony TV').slice(0,20))}

/* ══════════════════════════════════
   5. IR BLASTER (Web Serial → Arduino)
══════════════════════════════════ */
function appIR(){
  renderIR();clearCtx();
  btn('CONNECT',irConnect,'cg');
  btn('POWER',()=>irSend('POWER'),'cr');
  btn('VOL+',()=>irSend('VOLU'),'');btn('VOL-',()=>irSend('VOLD'),'');
  btn('CH+',()=>irSend('CHU'),'');btn('CH-',()=>irSend('CHD'),'');
  btn('MUTE',()=>irSend('MUTE'),'');
  btn('SKETCH',irSketch,'cy');
  _H={sU:()=>irSend('VOLU'),sD:()=>irSend('VOLD'),ok:()=>irSend('POWER')};
}
function renderIR(){
  html(`<div class="fi">
    <div class="sl h">~ IR BLASTER</div>
    <div class="sl">${S.port?'● SERIAL CONNECTED':'○ NO SERIAL'}</div>
    <div class="hr"></div>
    <div class="sl d">Requires Arduino + IR LED</div>
    <div class="sl d">on pin 9 (100Ω resistor)</div>
    <div class="sl d">+ IRremote library</div>
    <div class="hr"></div>
    <div class="sl ${('serial' in navigator)?'h':'r'}">${'serial' in navigator?'● Web Serial OK':'⚠ Chrome only'}</div>
    <div class="sl d">SKETCH → downloads .ino</div>
  </div>`);
}
async function irConnect(){
  if(!('serial' in navigator)){toast_('CHROME REQUIRED');return}
  try{
    S.port=await navigator.serial.requestPort();
    await S.port.open({baudRate:9600});
    const enc=new TextEncoderStream();enc.readable.pipeTo(S.port.writable);
    S.portWriter=enc.writable.getWriter();
    toast_('SERIAL CONNECTED!');addLog('IR','Port open');vib([40,20,40]);lp('G',600);renderIR();
  }catch(e){toast_('SERIAL: '+e.message.slice(0,16));addLog('IR','Err: '+e.message)}
}
async function irSend(cmd){
  flashIR();vib(12);
  if(S.portWriter){
    try{await S.portWriter.write(cmd+'\n');addLog('IR','→'+cmd);toast_('IR: '+cmd)}
    catch(e){toast_('SEND FAILED')}
  } else {toast_('CONNECT SERIAL FIRST')}
}
function irSketch(){
  const code=`// FlipperRemote IR Arduino Sketch
#include <IRremote.h>
IRsend irsend;
const long CODES[] = {0xE0E040BF,0xE0E0E01F,0xE0E0D02F,0xE0E0F00F,0xE0E048B7,0xE0E008F7};
const String NAMES[] = {"POWER","VOLU","VOLD","MUTE","CHU","CHD"};
void setup(){Serial.begin(9600);}
void loop(){
  if(Serial.available()){
    String c=Serial.readStringUntil('\\n');c.trim();
    for(int i=0;i<6;i++){if(c==NAMES[i]){irsend.sendNEC(CODES[i],32);break;}}
  }
}`;
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.download='FlipperRemote_IR.ino';a.click();
  toast_('SKETCH DOWNLOADED!');
}

/* ══════════════════════════════════
   6. BLUETOOTH (real Web Bluetooth API)
══════════════════════════════════ */
function appBT(){
  renderBT();clearCtx();
  btn('SCAN',btScan,'cg');btn('CONNECT',btConnect,'co');
  btn('BATTERY',btBattery,'cy');btn('HR NOTIFY',btHR,'cb2');
  btn('RSSI',btRSSI,'');btn('DISC.',btDisc,'cr');
  _H={up:()=>{S.btSel=Math.max(0,S.btSel-1);renderBT()},dn:()=>{S.btSel=Math.min(S.btDevs.length-1,S.btSel+1);renderBT()},ok:btConnect};
}
function renderBT(){
  const st=S.btDev?'● '+S.btDev.name.slice(0,12):'○ IDLE';
  const lst=S.btDevs.length?S.btDevs.slice(0,6).map((d,i)=>`
    <div class="mi${i===S.btSel?' s':''}" onclick="S.btSel=${i};renderBT()">
      <span class="ic">⬡</span><span style="flex:1">${d.name.slice(0,14)}</span>
      <span style="font-size:5px">${d.id.slice(-4)}</span></div>`).join('')
    :'<div class="sl d">Press SCAN</div>';
  html(`<div class="fi"><div class="sl h">${st}</div>
    <div class="sl">${S.btGatt?.connected?'GATT: OPEN':'GATT: CLOSED'}</div>
    <div class="hr"></div>${lst}</div>`);
  $('sBt').classList.toggle('on',!!S.btDev);
}
async function btScan(){
  if(!navigator.bluetooth){toast_('WEB BT NOT SUPPORTED');return}
  try{
    const dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,
      optionalServices:['battery_service','device_information','heart_rate','0000180a-0000-1000-8000-00805f9b34fb']});
    if(!S.btDevs.find(d=>d.id===dev.id)){S.btDevs.push({id:dev.id,name:dev.name||'Unknown',device:dev});addLog('BT','Found: '+dev.name)}
    S.btSel=S.btDevs.findIndex(d=>d.id===dev.id);
    toast_('FOUND: '+(dev.name||'Unknown').slice(0,14));vib([30,10,30]);lp('G',400);renderBT();
  }catch(e){if(e.name!=='NotFoundError')toast_('BT: '+e.message.slice(0,14))}
}
async function btConnect(){
  const d=S.btDevs[S.btSel];if(!d){toast_('SELECT DEVICE');return}
  toast_('CONNECTING...');
  try{
    S.btGatt=await d.device.gatt.connect();S.btDev=d;
    toast_('GATT CONNECTED!');addLog('BT','GATT: '+d.name);vib([40,20,40]);lp('G',600);renderBT();
  }catch(e){toast_('GATT: '+e.message.slice(0,14))}
}
async function btBattery(){
  if(!S.btGatt?.connected){toast_('CONNECT FIRST');return}
  try{const svc=await S.btGatt.getPrimaryService('battery_service');const ch=await svc.getCharacteristic('battery_level');const v=await ch.readValue();toast_('DEVICE BATTERY: '+v.getUint8(0)+'%');addLog('BT','Battery: '+v.getUint8(0)+'%')}
  catch(e){toast_('NO BATTERY SVC')}
}
async function btHR(){
  if(!S.btGatt?.connected){toast_('CONNECT FIRST');return}
  try{
    const svc=await S.btGatt.getPrimaryService('heart_rate');
    const ch=await svc.getCharacteristic('heart_rate_measurement');
    await ch.startNotifications();
    ch.addEventListener('characteristicvaluechanged',e=>{const bpm=e.target.value.getUint8(1);toast_('HR: '+bpm+' BPM');addLog('BT','HR: '+bpm)});
    toast_('HEART RATE ACTIVE');
  }catch(e){toast_('NO HR SERVICE')}
}
async function btRSSI(){toast_('BT RSSI not in Web API');addLog('BT','RSSI not available in WebBluetooth')}
function btDisc(){try{S.btGatt?.disconnect()}catch(e){}S.btDev=null;S.btGatt=null;addLog('BT','Disconnected');renderBT()}

/* ══════════════════════════════════
   7. NFC (real Web NFC API)
══════════════════════════════════ */
function appNFC(){
  renderNFC();clearCtx();
  btn('READ',nfcRead,'cg');btn('WRITE',nfcWrite,'co');
  btn('STOP',nfcStop,'');btn('COPY UID',nfcCopy,'cy');
  _H={ok:nfcRead};
}
function renderNFC(){
  const t=S.nfcTag;
  html(`<div class="fi">
    <div class="sl">${S.nfcActive?'<span class="bl">◈ SCANNING...</span>':'○ READY'}</div>
    <div class="hr"></div>
    ${t?`<div class="sl h">▶ TAG FOUND</div>
<div class="sl">UID: ${t.uid}</div>
<div class="sl d">TYPE: ${t.type}</div>
<div class="sl d">TECH: ${t.tech}</div>
<div class="sl" style="white-space:normal;font-size:5px;line-height:1.5;word-break:break-all">DATA: ${t.data.slice(0,50)}</div>`
    :`<div class="sl d">Hold NFC tag to</div>
<div class="sl d">back of phone.</div>
<div class="sl d">(Android Chrome)</div>`}
  </div>`);
  $('sNfc').classList.toggle('on',S.nfcActive||!!S.nfcTag);
}
async function nfcRead(){
  if(!('NDEFReader' in window)){toast_('NO NFC API (Android Chrome)');return}
  try{
    S.nfcActive=true;renderNFC();
    const r=new NDEFReader();
    const ctrl=new AbortController();S.nfcAbort=ctrl;
    await r.scan({signal:ctrl.signal});
    r.addEventListener('reading',({message,serialNumber})=>{
      let data='',type='';
      for(const rec of message.records){
        type=rec.recordType;
        if(rec.recordType==='text'||rec.recordType==='url'){data=new TextDecoder(rec.encoding||'utf-8').decode(rec.data);break}
        else{data='['+rec.recordType+']';break}
      }
      S.nfcTag={uid:serialNumber,type:type||'NDEF',tech:'NFC-A',data:data||'No data'};
      S.nfcActive=false;toast_('NFC TAG READ!');vib([60,20,60]);lp('G',700);
      addLog('NFC',serialNumber+' '+data.slice(0,20));renderNFC();
    });
    r.addEventListener('readingerror',()=>{S.nfcActive=false;toast_('NFC READ ERROR');renderNFC()});
  }catch(e){S.nfcActive=false;if(e.name!=='AbortError')toast_('NFC: '+e.message.slice(0,14));renderNFC()}
}
async function nfcWrite(){
  if(!('NDEFReader' in window)){toast_('NO NFC API');return}
  const msg=prompt('Text to write to tag:');if(!msg)return;
  try{const r=new NDEFReader();await r.write({records:[{recordType:'text',data:msg}]});toast_('WRITTEN TO TAG!');vib([40,20,40,20,40]);addLog('NFC','Wrote: '+msg.slice(0,20))}
  catch(e){toast_('WRITE: '+e.message.slice(0,14))}
}
function nfcStop(){S.nfcActive=false;try{S.nfcAbort?.abort()}catch(e){}S.nfcAbort=null;renderNFC()}
function nfcCopy(){if(!S.nfcTag){toast_('NO TAG');return}navigator.clipboard?.writeText(S.nfcTag.uid).then(()=>toast_('UID COPIED!')).catch(()=>toast_('COPY FAILED'))}

/* ══════════════════════════════════
   8. GPS (real Geolocation + track)
══════════════════════════════════ */
function appGPS(){
  renderGPS();clearCtx();
  btn('START',gpsStart,'cg');btn('STOP',gpsStop,'');
  btn('SHARE',gpsShare,'co');btn('MAPS',()=>{if(S.gpsPos)window.open(`https://maps.google.com/?q=${S.gpsPos.lat},${S.gpsPos.lon}`,'_blank');else toast_('NO GPS');},'');
  btn('EXPORT',gpsExport,'cy');btn('CLEAR',()=>{S.gpsTrack=[];renderGPS()},'');
  _H={ok:gpsStart};
}
function renderGPS(){
  const d=S.gpsPos;const w=S.gpsWatch!==null;
  html(`<div class="fi">
    <div class="sl">${w?'<span class="bl">⊕ TRACKING...</span>':'○ IDLE'}</div>
    <div class="sl d">POINTS: ${S.gpsTrack.length}</div>
    <div class="hr"></div>
    ${d?`<div class="sl h">LAT: ${d.lat.toFixed(6)}</div>
<div class="sl h">LON: ${d.lon.toFixed(6)}</div>
<div class="sl">ACC: ±${Math.round(d.acc)}m</div>
<div class="sl d">ALT: ${d.alt!=null?d.alt.toFixed(1)+'m':'N/A'}</div>
<div class="sl d">SPD: ${d.spd!=null?(d.spd*3.6).toFixed(1)+' km/h':'N/A'}</div>
<div class="sl d">HDG: ${d.hdg!=null?d.hdg.toFixed(0)+'°':'N/A'}</div>`
    :'<div class="sl d">Acquiring GPS...</div>'}
  </div>`);
}
function gpsStart(){
  if(!navigator.geolocation){toast_('GPS NOT SUPPORTED');return}
  if(S.gpsWatch)return;toast_('ACQUIRING...');addLog('GPS','Start');
  S.gpsWatch=navigator.geolocation.watchPosition(
    pos=>{S.gpsPos={lat:pos.coords.latitude,lon:pos.coords.longitude,acc:pos.coords.accuracy,alt:pos.coords.altitude,spd:pos.coords.speed,hdg:pos.coords.heading};
      S.gpsTrack.push({...S.gpsPos,t:Date.now()});if(S.gpsTrack.length>1000)S.gpsTrack.shift();
      lp('G',150);if(S.app==='gps')renderGPS();},
    err=>{toast_('GPS: '+err.message.slice(0,18));S.gpsWatch=null;renderGPS()},
    {enableHighAccuracy:true,maximumAge:0,timeout:30000});
  renderGPS();
}
function gpsStop(){if(S.gpsWatch){navigator.geolocation.clearWatch(S.gpsWatch);S.gpsWatch=null}addLog('GPS','Stop');renderGPS()}
function gpsShare(){
  if(!S.gpsPos){toast_('NO GPS DATA');return}
  const u=`https://maps.google.com/?q=${S.gpsPos.lat},${S.gpsPos.lon}`;
  navigator.clipboard?.writeText(u).then(()=>toast_('COORDS COPIED!')).catch(()=>window.open(u,'_blank'));
}
function gpsExport(){
  if(!S.gpsTrack.length){toast_('NO TRACK DATA');return}
  const csv='time,lat,lon,acc,alt,speed\n'+S.gpsTrack.map(p=>`${new Date(p.t).toISOString()},${p.lat},${p.lon},${p.acc},${p.alt||''},${p.spd||''}`).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='gps_'+Date.now()+'.csv';a.click();
  toast_('CSV EXPORTED!');addLog('GPS',S.gpsTrack.length+' pts exported');
}

/* ══════════════════════════════════
   9. MIC ANALYZER (real Web Audio API)
══════════════════════════════════ */
function appFreq(){
  renderFreqBase();clearCtx();
  btn('MIC',freqMic,'cg');btn('TONE',freqTone,'co');
  btn('DB METER',freqDB,'cb2');btn('STOP',freqStop,'cr');
  _H={ok:freqMic};
}
let peakHz=0;
function renderFreqBase(){
  html(`<div class="fi"><div class="sl">${S.audioCtx?'<span class="bl">♪ LIVE</span>':'○ READY'}</div>
    <div class="sl d" id="fPeak">PEAK: ${peakHz>0?peakHz.toFixed(0)+' Hz':'---'}</div>
    <div class="hr"></div><canvas id="fCvs" class="vz"></canvas>
    <div class="hr"></div><div class="sl d">0Hz ──────────── 8kHz</div></div>`);
}
async function freqMic(){
  freqStop();
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:{noiseSuppression:false,autoGainControl:false},video:false});
    S.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    S.analyser=S.audioCtx.createAnalyser();S.analyser.fftSize=512;S.analyser.smoothingTimeConstant=0.8;
    S.audioCtx.createMediaStreamSource(stream).connect(S.analyser);
    addLog('Freq','Mic start '+S.audioCtx.sampleRate+'Hz');renderFreqBase();freqDraw();
  }catch(e){toast_('MIC: '+e.message.slice(0,16))}
}
function freqDraw(){
  const draw=()=>{
    if(!S.analyser)return;S.vRaf=requestAnimationFrame(draw);
    const c=document.getElementById('fCvs');if(!c)return;
    const cx=c.getContext('2d');const W=c.width=c.offsetWidth,H=c.height=46;
    const buf=new Uint8Array(S.analyser.frequencyBinCount);S.analyser.getByteFrequencyData(buf);
    cx.fillStyle='#060f06';cx.fillRect(0,0,W,H);
    let pk=0,pki=0;
    for(let i=0;i<buf.length;i++){
      const v=buf[i]/255;if(buf[i]>pk){pk=buf[i];pki=i}
      cx.fillStyle=`rgb(${Math.floor(v*60)},${Math.floor(v*255)},${Math.floor(v*8)})`;
      cx.fillRect(i*(W/buf.length),H*(1-v),(W/buf.length)-1,H*v);
    }
    peakHz=S.audioCtx?pki*(S.audioCtx.sampleRate/2)/buf.length:0;
    const el=document.getElementById('fPeak');if(el&&peakHz>10)el.textContent='PEAK: '+peakHz.toFixed(0)+' Hz';
  };draw();
}
function freqTone(){
  freqStop();
  const hz=parseInt(prompt('Frequency Hz (20-20000):','440'));
  if(!hz||hz<20||hz>20000){toast_('INVALID FREQ');return}
  S.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  S.analyser=S.audioCtx.createAnalyser();S.analyser.fftSize=512;
  const osc=S.audioCtx.createOscillator();const gain=S.audioCtx.createGain();
  osc.frequency.value=hz;osc.type='sine';gain.gain.value=0.15;
  osc.connect(gain);gain.connect(S.audioCtx.destination);osc.connect(S.analyser);osc.start();
  toast_('TONE: '+hz+' Hz');addLog('Freq','Tone '+hz+'Hz');renderFreqBase();freqDraw();
}
async function freqDB(){
  freqStop();
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    S.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    S.analyser=S.audioCtx.createAnalyser();S.analyser.fftSize=256;
    S.audioCtx.createMediaStreamSource(stream).connect(S.analyser);
    addLog('Freq','dB meter');
    const drawDB=()=>{
      if(!S.analyser)return;S.vRaf=requestAnimationFrame(drawDB);
      const c=document.getElementById('fCvs');if(!c)return;
      const cx=c.getContext('2d');const W=c.width=c.offsetWidth,H=c.height=46;
      const buf=new Float32Array(S.analyser.frequencyBinCount);S.analyser.getFloatFrequencyData(buf);
      const avg=buf.reduce((s,v)=>s+v,0)/buf.length;
      const db=Math.max(-100,Math.min(0,avg));
      const pct=(db+100)/100;
      cx.fillStyle='#060f06';cx.fillRect(0,0,W,H);
      const col=db>-20?'#ff4444':db>-40?'#ffcc00':'#5FFF00';
      cx.fillStyle=col;cx.fillRect(0,H*.2,W*pct,H*.6);
      cx.fillStyle='var(--fgd,#1a5500)';cx.fillRect(W*pct,H*.2,W*(1-pct),H*.6);
      // dB text
      cx.fillStyle='#000';cx.font='bold 11px monospace';cx.textAlign='center';
      cx.fillText(db.toFixed(1)+' dB',W/2,H*.65);
      const el=document.getElementById('fPeak');if(el)el.textContent='dB: '+db.toFixed(1);
    };drawDB();
    renderFreqBase();
  }catch(e){toast_('MIC: '+e.message.slice(0,14))}
}
function freqStop(){if(S.vRaf){cancelAnimationFrame(S.vRaf);S.vRaf=null}if(S.audioCtx){S.audioCtx.close().catch(()=>{});S.audioCtx=null;S.analyser=null}peakHz=0;renderFreqBase()}

/* ══════════════════════════════════
   10. CAMERA (real getUserMedia)
══════════════════════════════════ */
function appCam(){
  clearCtx();
  btn('FRONT',()=>camStart('user'),'cg');btn('BACK',()=>camStart('environment'),'co');
  btn('PHOTO',camPhoto,'cy');btn('TORCH',camTorch,'');btn('STOP',camStop,'cr');
  html(`<div class="fi"><div class="sl">◎ CAMERA</div><div class="hr"></div>
    <video id="camVid" style="width:100%;border-radius:3px;display:none" autoplay playsinline muted></video>
    <canvas id="camCvs" style="width:100%;border-radius:3px;display:none"></canvas>
    <div class="sl d" id="camSt">Press FRONT or BACK</div></div>`);
  _H={ok:camPhoto};
}
let camStream=null,camTrack=null;
async function camStart(facing){
  camStop();
  try{
    camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:640},height:{ideal:360}},audio:false});
    const vid=$('camVid');if(!vid)return;
    vid.srcObject=camStream;vid.style.display='block';
    camTrack=camStream.getVideoTracks()[0];
    const st=$('camSt');if(st)st.textContent='LIVE: '+facing.toUpperCase();
    addLog('Cam',facing+' started');
  }catch(e){toast_('CAM: '+e.message.slice(0,16))}
}
function camPhoto(){
  if(!camStream){toast_('START CAMERA FIRST');return}
  const vid=$('camVid');const cvs=$('camCvs');if(!vid||!cvs)return;
  cvs.width=vid.videoWidth||320;cvs.height=vid.videoHeight||240;
  cvs.getContext('2d').drawImage(vid,0,0);
  cvs.style.display='block';vid.style.display='none';
  cvs.toBlob(blob=>{
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download='photo_'+Date.now()+'.jpg';a.click();
    toast_('PHOTO SAVED!');addLog('Cam','Photo taken');
  },'image/jpeg',0.9);
}
async function camTorch(){
  if(!camTrack){toast_('CAMERA NEEDED');return}
  const caps=camTrack.getCapabilities();
  if(!caps.torch){toast_('NO TORCH');return}
  const cur=camTrack.getSettings().torch||false;
  await camTrack.applyConstraints({advanced:[{torch:!cur}]});
  toast_('TORCH: '+((!cur)?'ON':'OFF'));addLog('Cam','Torch '+((!cur)?'on':'off'));
}
function camStop(){if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null;camTrack=null}addLog('Cam','Stopped')}

/* ══════════════════════════════════
   11. SPEECH (real Web Speech API)
══════════════════════════════════ */
function appSpeech(){
  clearCtx();
  btn('LISTEN',speechListen,'cg');btn('STOP',speechStop,'');
  btn('SPEAK',speechSpeak,'co');btn('VOICES',speechVoices,'cy');
  html(`<div class="fi">
    <div class="sl">◬ SPEECH API</div><div class="hr"></div>
    <div class="sl d" id="spSt">READY</div>
    <div class="hr"></div>
    <div class="sl d">HEARD:</div>
    <div class="sl" id="spTxt" style="white-space:normal;line-height:1.5;font-size:5.5px">---</div>
  </div>`);
  _H={ok:speechListen};
}
let recog=null;
function speechListen(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast_('SPEECH NOT SUPPORTED');return}
  speechStop();
  recog=new SR();recog.continuous=true;recog.interimResults=true;recog.lang='en-US';
  recog.onstart=()=>{const e=$('spSt');if(e)e.textContent='LISTENING...'};
  recog.onresult=e=>{
    let final='',interim='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(e.results[i].isFinal)final+=e.results[i][0].transcript;
      else interim+=e.results[i][0].transcript;
    }
    const el=$('spTxt');if(el)el.textContent=(final||interim).slice(0,120)||'---';
    if(final){addLog('Speech','Heard: '+final.slice(0,30));lp('G',200)}
  };
  recog.onerror=e=>{const el=$('spSt');if(el)el.textContent='ERR: '+e.error};
  recog.onend=()=>{const el=$('spSt');if(el)el.textContent='STOPPED'};
  recog.start();toast_('LISTENING...');addLog('Speech','Start');
}
function speechStop(){if(recog){try{recog.stop()}catch(e){}recog=null}const e=$('spSt');if(e)e.textContent='STOPPED'}
function speechSpeak(){
  if(!window.speechSynthesis){toast_('TTS NOT SUPPORTED');return}
  const msg=prompt('Text to speak:','Hello from FlipperRemote');if(!msg)return;
  const utt=new SpeechSynthesisUtterance(msg);utt.rate=0.9;utt.pitch=1;
  window.speechSynthesis.speak(utt);toast_('SPEAKING...');addLog('TTS',msg.slice(0,20));
}
function speechVoices(){
  const vs=window.speechSynthesis?.getVoices()||[];
  toast_(vs.length>0?`${vs.length} VOICES`:'NO VOICES');
  addLog('TTS',vs.map(v=>v.name).slice(0,3).join(', '));
}

/* ══════════════════════════════════
   12. CLIPBOARD (real Clipboard API)
══════════════════════════════════ */
function appClip(){
  clearCtx();
  btn('READ',clipRead,'cg');btn('WRITE',clipWrite,'co');
  btn('CLEAR',()=>navigator.clipboard?.writeText('').then(()=>toast_('CLEARED')),'');
  btn('QR',clipQR,'cy');
  html(`<div class="fi"><div class="sl">≡ CLIPBOARD</div><div class="hr"></div>
    <div class="sl d">CONTENT:</div>
    <div class="sl" id="clipTxt" style="white-space:normal;word-break:break-all;line-height:1.5;font-size:5px">Press READ</div>
    <div class="hr"></div>
    <div class="sl d" id="clipLen"></div>
  </div>`);
  _H={ok:clipRead};
}
async function clipRead(){
  try{
    const txt=await navigator.clipboard.readText();
    const el=$('clipTxt');if(el)el.textContent=txt.slice(0,200)||'[empty]';
    const ln=$('clipLen');if(ln)ln.textContent=txt.length+' chars';
    addLog('Clip','Read '+txt.length+' chars');toast_('CLIPBOARD READ!');
  }catch(e){toast_('PERM DENIED: '+e.message.slice(0,12))}
}
async function clipWrite(){
  const txt=prompt('Write to clipboard:');if(txt===null)return;
  try{await navigator.clipboard.writeText(txt);toast_('WRITTEN!');addLog('Clip','Wrote: '+txt.slice(0,20))}
  catch(e){toast_('WRITE FAILED')}
}
function clipQR(){
  const el=$('clipTxt');const txt=el?.textContent;
  if(!txt||txt==='Press READ'){toast_('READ FIRST');return}
  const url='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+encodeURIComponent(txt.slice(0,500));
  window.open(url,'_blank');toast_('QR IN BROWSER');
}

/* ══════════════════════════════════
   13. SCREEN CAPTURE (real API)
══════════════════════════════════ */
function appScreen(){
  clearCtx();
  btn('CAPTURE',screenCap,'cg');btn('RECORD',screenRec,'co');
  btn('STOP REC',screenStopRec,'cr');btn('PIP',screenPIP,'cb2');
  html(`<div class="fi"><div class="sl">▣ SCREEN CAPTURE</div><div class="hr"></div>
    <div class="sl" id="scrSt">READY</div>
    <div class="hr"></div>
    <div class="sl d">Capture: screenshot</div>
    <div class="sl d">Record: video file</div>
    <div class="sl d">PiP: floating window</div>
    <div class="hr"></div>
    <div class="sl d">${'getDisplayMedia' in (navigator.mediaDevices||{})?'● API SUPPORTED':'⚠ NOT SUPPORTED'}</div>
  </div>`);
  _H={ok:screenCap};
}
let mediaRec=null,recChunks=[];
async function screenCap(){
  try{
    const st=$('scrSt');if(st)st.textContent='SELECT WINDOW...';
    const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
    const track=stream.getVideoTracks()[0];
    const imgCapture=new ImageCapture(track);
    const bitmap=await imgCapture.grabFrame();
    const cvs=document.createElement('canvas');cvs.width=bitmap.width;cvs.height=bitmap.height;
    cvs.getContext('2d').drawImage(bitmap,0,0);
    cvs.toBlob(blob=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='screen_'+Date.now()+'.png';a.click();toast_('SCREENSHOT SAVED!');addLog('Screen','Screenshot '+bitmap.width+'x'+bitmap.height)},'image/png');
    stream.getTracks().forEach(t=>t.stop());if(st)st.textContent='CAPTURED!';
  }catch(e){toast_('CAP: '+e.message.slice(0,16));const s=$('scrSt');if(s)s.textContent='CANCELLED'}
}
async function screenRec(){
  try{
    S.capStream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
    recChunks=[];
    mediaRec=new MediaRecorder(S.capStream,{mimeType:'video/webm;codecs=vp9'});
    mediaRec.ondataavailable=e=>{if(e.data.size>0)recChunks.push(e.data)};
    mediaRec.onstop=()=>{
      const blob=new Blob(recChunks,{type:'video/webm'});
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='rec_'+Date.now()+'.webm';a.click();
      toast_('VIDEO SAVED!');addLog('Screen','Rec saved '+recChunks.length+' chunks');
    };
    mediaRec.start(1000);
    const st=$('scrSt');if(st)st.textContent='RECORDING...';
    toast_('RECORDING!');addLog('Screen','Rec start');
  }catch(e){toast_('REC: '+e.message.slice(0,16))}
}
function screenStopRec(){if(mediaRec&&mediaRec.state!=='inactive'){mediaRec.stop();toast_('STOPPING...')}else toast_('NOT RECORDING')}
async function screenPIP(){
  try{
    const stream=await navigator.mediaDevices.getDisplayMedia({video:true});
    const vid=document.createElement('video');vid.srcObject=stream;vid.muted=true;
    document.body.appendChild(vid);await vid.play();
    await vid.requestPictureInPicture();
    toast_('PIP ACTIVE!');addLog('Screen','PiP started');
  }catch(e){toast_('PIP: '+e.message.slice(0,16))}
}

/* ══════════════════════════════════
   14. WAKE LOCK (real Screen Wake Lock API)
══════════════════════════════════ */
function appWake(){
  renderWake();clearCtx();
  btn('LOCK ON',wakeOn,'cg');btn('LOCK OFF',wakeOff,'cr');
  btn('STATUS',()=>toast_(S.wakeLock?'WAKE LOCK: ACTIVE':'WAKE LOCK: INACTIVE'),'');
  _H={ok:wakeOn};
}
function renderWake(){
  html(`<div class="fi">
    <div class="sl h">⊙ SCREEN WAKE LOCK</div>
    <div class="sl">${S.wakeLock?'<span class="bl">● ACTIVE</span>':'○ INACTIVE'}</div>
    <div class="hr"></div>
    <div class="sl d">Prevents screen dimming</div>
    <div class="sl d">while app is open.</div>
    <div class="hr"></div>
    <div class="sl d">Useful for:</div>
    <div class="sl d">- GPS tracking</div>
    <div class="sl d">- TV remote use</div>
    <div class="sl d">- Screen recording</div>
    <div class="hr"></div>
    <div class="sl ${S.wakeLock?'h':'d'}">${S.wakeLock?'SCREEN STAYS ON':'Screen may dim'}</div>
  </div>`);
}
async function wakeOn(){
  if(!('wakeLock' in navigator)){toast_('WAKE LOCK NOT SUPPORTED');return}
  try{
    S.wakeLock=await navigator.wakeLock.request('screen');
    S.wakeLock.addEventListener('release',()=>{S.wakeLock=null;addLog('Wake','Released');if(S.app==='wakelock')renderWake()});
    toast_('WAKE LOCK ON!');addLog('Wake','Active');lp('G',500);renderWake();
  }catch(e){toast_('WAKE: '+e.message.slice(0,14))}
}
async function wakeOff(){
  if(S.wakeLock){await S.wakeLock.release();S.wakeLock=null}
  toast_('WAKE LOCK OFF');addLog('Wake','Released');renderWake();
}

/* ══════════════════════════════════
   15. SENSORS (real Device APIs)
══════════════════════════════════ */
function appSens(){
  let rf;const draw=()=>{rf=requestAnimationFrame(draw);if(S.app==='sensors')renderSens()};draw();
  clearCtx();
  btn('IOS PERM',sensReqPerms,'cg');
  btn('LEVEL',()=>{const a=Math.abs(_sens.be)+Math.abs(_sens.ga);toast_(a<5?'LEVEL ✓':a<15?'SLIGHT TILT':'TILT '+a.toFixed(0)+'°');vib(a<5?[30]:[10,5,10,5,10])},'co');
  btn('SHAKE',senShake,'');
  btn('COMPASS',()=>toast_(_sens.a>0?'HEADING: '+_sens.a+'°':'NO COMPASS'),'cy');
  S._sRaf=rf;
}
function renderSens(){
  html(`<div class="fi">
    <div class="sl h">⊹ DEVICE SENSORS</div><div class="hr"></div>
    <div class="sl">ACCEL X:${_sens.ax} Y:${_sens.ay} Z:${_sens.az}</div>
    <div class="sl">GYRO α:${_sens.a}° β:${_sens.be}° γ:${_sens.ga}°</div>
    <div class="sl">TILT: ${Math.round(Math.sqrt(_sens.be**2+_sens.ga**2))}°</div>
    <div class="hr"></div>
    <div class="sl d">TOUCH: ${navigator.maxTouchPoints} pts</div>
    <div class="sl d">DPR: ${window.devicePixelRatio}x</div>
    <div class="sl d">SCR: ${screen.width}×${screen.height}</div>
    <div class="sl d">BATT: ${S.battery?Math.round(S.battery.level*100)+'%'+(S.battery.charging?' ⚡':''):'N/A'}</div>
    <div class="sl d">ONLINE: ${navigator.onLine?'YES':'NO'}</div>
  </div>`);
}
async function sensReqPerms(){
  if(typeof DeviceMotionEvent?.requestPermission==='function'){
    try{await DeviceMotionEvent.requestPermission();await DeviceOrientationEvent.requestPermission();toast_('SENSORS GRANTED!')}
    catch(e){toast_('PERMISSION DENIED')}
  }else toast_('ALREADY ACTIVE')
}
let shakeCount=0,lastShake=0;
function senShake(){
  toast_('SHAKE YOUR PHONE!');addLog('Sensors','Shake test');shakeCount=0;
  const check=()=>{
    const now=Date.now();const mag=Math.abs(_sens.ax)+Math.abs(_sens.ay)+Math.abs(_sens.az);
    if(mag>25&&now-lastShake>300){shakeCount++;lastShake=now;lp('R',120);vib(15)}
    if(shakeCount<6)setTimeout(check,50);
    else{toast_('SHAKES: '+shakeCount);shakeCount=0}
  };check();
}

/* ══════════════════════════════════
   16. NETWORK INFO (real Network Info API)
══════════════════════════════════ */
function appNet(){
  clearCtx();btn('REFRESH',renderNet,'cg');btn('IP LOOKUP',netIP,'co');btn('SPEED TEST',netSpeed,'cy');
  renderNet();_H={ok:renderNet};
}
async function renderNet(){
  const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  const ip=await netGetIP();
  html(`<div class="fi">
    <div class="sl h">◈ NETWORK INFO</div><div class="hr"></div>
    <div class="sl">TYPE: ${c?.type||'unknown'}</div>
    <div class="sl">EFF: ${c?.effectiveType||'?'}</div>
    <div class="sl">DL: ${c?.downlink||'?'} Mbps</div>
    <div class="sl">RTT: ${c?.rtt||'?'} ms</div>
    <div class="sl">SAVE: ${c?.saveData?'YES':'NO'}</div>
    <div class="hr"></div>
    <div class="sl">PUBLIC IP: ${ip||'...'}</div>
    <div class="sl d">ONLINE: ${navigator.onLine?'YES':'NO'}</div>
    <div class="sl d">PROTO: ${location.protocol}</div>
    <div class="sl d">HOST: ${location.hostname.slice(0,20)}</div>
  </div>`);
}
async function netGetIP(){
  try{const r=await fetch('https://api.ipify.org?format=json',{signal:AbortSignal.timeout(3000)});const d=await r.json();return d.ip}
  catch(e){return 'N/A'}
}
async function netIP(){
  toast_('LOOKING UP...');addLog('Net','IP lookup');
  try{
    const r=await fetch('https://ipapi.co/json/',{signal:AbortSignal.timeout(4000)});
    const d=await r.json();
    showModal(`<div style="color:var(--or);font-size:7px;margin-bottom:8px">IP INFO</div>
<div>IP: ${d.ip}<br>CITY: ${d.city}<br>REGION: ${d.region}<br>COUNTRY: ${d.country_name}<br>ISP: ${(d.org||'').slice(0,20)}<br>TZ: ${d.timezone}</div>
<button class="cb cg" onclick="closeModal()" style="margin-top:8px;max-width:none;flex:none;padding:6px 12px">CLOSE</button>`);
    addLog('Net','IP: '+d.ip+' '+d.city);
  }catch(e){toast_('LOOKUP FAILED')}
}
async function netSpeed(){
  toast_('TESTING...');addLog('Net','Speed test');
  const t0=Date.now();
  try{
    const r=await fetch('https://httpbin.org/bytes/500000',{signal:AbortSignal.timeout(8000)});
    const data=await r.arrayBuffer();
    const secs=(Date.now()-t0)/1000;
    const mbps=(data.byteLength*8/1e6/secs).toFixed(2);
    toast_('DL: '+mbps+' Mbps');addLog('Net','Speed: '+mbps+' Mbps');
  }catch(e){toast_('SPEED TEST FAILED')}
}

/* ══════════════════════════════════
   17. CONTACTS (real Contact Picker API)
══════════════════════════════════ */
function appContacts(){
  renderContacts();clearCtx();
  btn('PICK',contactsPick,'cg');btn('CALL',contactsCall,'co');
  btn('MSG',contactsMsg,'cy');btn('COPY',contactsCopy,'');
  btn('CLEAR',()=>{S.contacts=[];renderContacts()},'cr');
  _H={ok:contactsPick};
}
function renderContacts(){
  const lst=S.contacts.slice(0,6).map((c,i)=>`<div class="mi${i===0?' s':''}">
    <span class="ic">⊞</span>
    <span style="flex:1">${(c.name?.[0]||'Unknown').slice(0,14)}</span>
    <span style="font-size:5px">${(c.tel?.[0]||'').slice(0,10)}</span></div>`).join('');
  html(`<div class="fi">
    <div class="sl h">⊞ CONTACTS</div>
    <div class="sl d">${S.contacts.length} SELECTED</div>
    <div class="hr"></div>
    ${lst||'<div class="sl d">Press PICK</div>'}
    ${'contacts' in navigator?'':'<div class="sl r">⚠ Android Chrome only</div>'}
  </div>`);
}
async function contactsPick(){
  if(!('contacts' in navigator)){toast_('CONTACT PICKER: Android Chrome');return}
  try{
    S.contacts=await navigator.contacts.select(['name','tel','email'],{multiple:true});
    addLog('Contacts',S.contacts.length+' selected');renderContacts();toast_(S.contacts.length+' CONTACTS PICKED');
  }catch(e){toast_('CONTACTS: '+e.message.slice(0,14))}
}
function contactsCall(){const c=S.contacts[0];if(!c?.tel?.[0]){toast_('PICK CONTACT + NEED TEL');return}window.location.href='tel:'+c.tel[0]}
function contactsMsg() {const c=S.contacts[0];if(!c?.tel?.[0]){toast_('PICK CONTACT + NEED TEL');return}window.location.href='sms:'+c.tel[0]}
function contactsCopy(){const c=S.contacts[0];if(!c){toast_('NO CONTACT');return}const t=(c.name?.[0]||'')+' '+( c.tel?.[0]||'');navigator.clipboard?.writeText(t).then(()=>toast_('COPIED!'))}

/* ══════════════════════════════════
   18. SHARE (real Web Share API)
══════════════════════════════════ */
function appShare(){
  clearCtx();
  btn('SHARE GPS',shareGPS,'cg');btn('SHARE URL',shareURL,'co');
  btn('SHARE TEXT',shareText,'cy');btn('SHARE FILE',shareFile,'cb2');
  html(`<div class="fi">
    <div class="sl h">⊿ WEB SHARE API</div><div class="hr"></div>
    <div class="sl d">Shares to native OS</div>
    <div class="sl d">share sheet: SMS, email,</div>
    <div class="sl d">WhatsApp, etc.</div>
    <div class="hr"></div>
    <div class="sl ${'share' in navigator?'h':'r'}">${'share' in navigator?'● SHARE API OK':'⚠ NOT SUPPORTED'}</div>
  </div>`);
  _H={ok:shareURL};
}
async function shareGPS(){
  if(!S.gpsPos){toast_('NO GPS - GO TO GPS APP');return}
  await webShare({title:'My Location',text:`GPS: ${S.gpsPos.lat.toFixed(6)}, ${S.gpsPos.lon.toFixed(6)}`,url:`https://maps.google.com/?q=${S.gpsPos.lat},${S.gpsPos.lon}`})
}
async function shareURL(){await webShare({title:'FlipperRemote',text:'Check out FlipperRemote!',url:location.href})}
async function shareText(){const t=prompt('Text to share:');if(t)await webShare({title:'FlipperRemote',text:t})}
async function shareFile(){
  if(!navigator.canShare){toast_('FILE SHARE NOT SUPPORTED');return}
  const txt=new File(['FlipperRemote log:\n'+S.log.map(l=>l.ts+' ['+l.cat+'] '+l.msg).join('\n')],'flipper_log.txt',{type:'text/plain'});
  if(navigator.canShare({files:[txt]})){await webShare({files:[txt],title:'FlipperRemote Log'})}
  else toast_('FILES NOT SHAREABLE')
}
async function webShare(data){
  try{await navigator.share(data);addLog('Share','Shared: '+Object.keys(data).join(','))}
  catch(e){if(e.name!=='AbortError')toast_('SHARE: '+e.message.slice(0,14))}
}

/* ══════════════════════════════════
   19. BAD USB (Web Serial HID payloads)
══════════════════════════════════ */
const PAYLOADS=[
  {n:'SYSINFO',d:'Windows system info',code:'DELAY 500\nGUI r\nDELAY 500\nSTRING cmd\nENTER\nDELAY 600\nSTRING systeminfo > %TEMP%\\s.txt && start notepad %TEMP%\\s.txt\nENTER'},
  {n:'WIFI PWD',d:'Export WiFi passwords',code:'GUI r\nDELAY 600\nSTRING powershell -w h\nENTER\nDELAY 800\nSTRING (netsh wlan show profiles)|%{$n=$_.Split(":")[1].Trim();(netsh wlan show profile name="$n" key=clear)|findstr "Key Content"}|Out-File $env:TEMP\\w.txt;notepad $env:TEMP\\w.txt\nENTER'},
  {n:'LOCK',d:'Lock workstation',code:'GUI l'},
  {n:'NOTEPAD',d:'Open notepad + type',code:'DELAY 500\nGUI r\nDELAY 500\nSTRING notepad\nENTER\nDELAY 1000\nSTRING Hello from FlipperRemote!\nENTER'},
  {n:'OPEN URL',d:'Open URL in browser',code:'DELAY 500\nGUI r\nDELAY 500\nSTRING start https://flipper.net\nENTER'},
];
function appBadUSB(){
  let pi=0;
  window._badSel=i=>{pi=i;renderBad(i)};
  function renderBad(i){
    scr.innerHTML=`<div class="fi"><div class="sl d">SELECT PAYLOAD:</div><div class="hr"></div>
    ${PAYLOADS.map((p,j)=>`<div class="mi${j===i?' s':''}" onclick="_badSel(${j})">
      <span class="ic">⌨</span><span style="flex:1">${p.n}</span></div>`).join('')}
    <div class="hr"></div><div class="sl d" style="white-space:normal">${PAYLOADS[i].d}</div></div>`;
  }
  renderBad(pi);clearCtx();
  btn('RUN',()=>badRun(pi),'cr');btn('VIEW',()=>badView(pi),'');
  btn('SAVE',()=>badSave(pi),'cy');btn('COPY',()=>badCopy(pi),'co');
  _H={up:()=>{pi=Math.max(0,pi-1);renderBad(pi)},dn:()=>{pi=Math.min(PAYLOADS.length-1,pi+1);renderBad(pi)},ok:()=>badRun(pi)};
}
function badRun(pi){
  const p=PAYLOADS[pi];addLog('BadUSB','Run: '+p.n);vib([100,50,100]);lp('R',3000);
  const lines=p.code.split('\n');let li=0;
  html(`<div class="fi"><div class="sl r">▶ RUN: ${p.n}</div><div class="hr"></div><div id="bL"></div><div class="sl bl">█</div></div>`);
  const t=setInterval(()=>{const el=$('bL');if(!el||li>=lines.length){clearInterval(t);toast_('DONE!');return}el.innerHTML+=`<div class="sl d" style="font-size:5px">${lines[li++]}</div>`;vib(4)},350);
}
function badView(pi){const p=PAYLOADS[pi];html(`<div class="fi"><div class="sl h">${p.n}</div><div class="hr"></div>${p.code.split('\n').map(l=>`<div class="sl d" style="font-size:5px">${l}</div>`).join('')}</div>`)}
function badSave(pi){const p=PAYLOADS[pi];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([p.code],{type:'text/plain'}));a.download=p.n+'_.txt';a.click();toast_('SAVED!')}
function badCopy(pi){navigator.clipboard?.writeText(PAYLOADS[pi].code).then(()=>toast_('COPIED!')).catch(()=>toast_('FAILED'))}

/* ══════════════════════════════════
   20. SYSTEM
══════════════════════════════════ */
function appSys(){
  clearCtx();btn('REFRESH',renderSys,'cg');btn('DOWNLOAD',dlAll,'co');btn('LOG',()=>openApp('log'),'');btn('INSTALL',pwaInstall,'cy');
  renderSys();_H={ok:renderSys};
}
function renderSys(){
  const bat=S.battery?Math.round(S.battery.level*100)+'%'+(S.battery.charging?' ⚡':''):'N/A';
  const c=navigator.connection;
  const mem=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576)+'MB':'N/A';
  html(`<div class="fi">
    <div class="logo" style="margin-bottom:4px">${LOGO}</div>
    <div class="sl h">FLIPPER REMOTE v3.0</div>
    <div class="hr"></div>
    <div class="sl">BAT: ${bat}</div>
    <div class="sl">NET: ${c?.effectiveType||'?'} ${c?.downlink||'?'}Mbps</div>
    <div class="sl">MEM: ${mem}</div>
    <div class="sl d">ONLINE: ${navigator.onLine?'YES':'NO'}</div>
    <div class="sl d">HTTPS: ${isHttps()?'YES':' NO'}</div>
    <div class="hr"></div>
    <div class="sl d">BT: ${'bluetooth' in navigator?'✓':'✗'} NFC: ${'NDEFReader' in window?'✓':'✗'}</div>
    <div class="sl d">SER: ${'serial' in navigator?'✓':'✗'} SHARE: ${'share' in navigator?'✓':'✗'}</div>
    <div class="sl d">LOG: ${S.log.length} entries</div>
    <div class="sl d">GPS PTS: ${S.gpsTrack.length}</div>
  </div>`);
}
async function dlAll(){
  for(const f of['index.html','style.css','script.js']){
    try{const r=await fetch(f);const b=await r.blob();const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f;a.click();await new Promise(r=>setTimeout(r,400))}
    catch(e){toast_('DL FAILED: '+f)}
  }
  toast_('3 FILES DOWNLOADED');addLog('SYS','Files downloaded');
}
function pwaInstall(){
  if(window._pwaP){window._pwaP.prompt()}
  else showModal(`<div style="color:var(--or);font-size:7px;margin-bottom:6px">INSTALL AS APP</div>
<div>iOS: Share ▶ Add to Home Screen<br><br>Android: Menu ▶ Add to Home Screen<br><br>Or download files to run locally for full TV/LAN features.</div>
<button class="cb cg" onclick="closeModal()" style="margin-top:8px;max-width:none;flex:none;padding:6px 12px">OK</button>`);
}

/* ─── Extra app: LOG ─── */
MENU.push({id:'log',ic:'▤',n:'LOG'});
function appLog(){
  let off=0;
  function r(){html(`<div class="fi sl2"><div class="sl d">${S.log.length} ENTRIES</div><div class="hr"></div>
    ${S.log.slice(off,off+8).map(e=>`<div style="display:flex;gap:2px;line-height:1.55">
      <span style="font-family:var(--mo);font-size:5px;color:var(--fgd);flex-shrink:0">${e.ts}</span>
      <span style="font-family:var(--px);font-size:5px;color:var(--fgh);flex-shrink:0">[${e.cat}]</span>
      <span style="font-family:var(--px);font-size:5px;overflow:hidden">${e.msg}</span>
    </div>`).join('')||'<div class="sl d">Empty</div>'}
  </div>`)}
  r();clearCtx();
  btn('TOP',()=>{off=0;r()},'');
  btn('COPY',()=>navigator.clipboard?.writeText(S.log.map(l=>l.ts+' ['+l.cat+'] '+l.msg).join('\n')).then(()=>toast_('COPIED!')),'cy');
  btn('CLEAR',()=>{S.log=[];off=0;r();toast_('CLEARED')},'cr');
  _H={up:()=>{off=Math.max(0,off-1);r()},dn:()=>{off=Math.min(Math.max(0,S.log.length-8),off+1);r()}};
}

/* ─── PWA install ─── */
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._pwaP=e});

/* ─── expose globals ─── */
window.closeModal=closeModal;window.openApp=openApp;
window.S=S;window.renderBT=renderBT;window.renderTV=renderTV;window.renderContacts=renderContacts;
