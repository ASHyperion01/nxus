/* ═══════════════════════════════════════════════════════
   FLIPPER REMOTE 2.0  ·  script.js
   Real APIs: Samsung WS · LG WebOS WS · Sony HTTP
              Web Bluetooth · Web NFC · GPS · Web Audio
              Web Serial IR · DeviceMotion · Battery · Network
═══════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════
   GLOBAL STATE
══════════════════════════════════ */
const S = {
  app:'menu', menuIdx:0,
  /* TV state */
  tvOn:true, vol:14, maxVol:20, muted:false, ch:0, input:'TV',
  /* Samsung */
  samsungWs:null, samsungIp:'', samsungConnected:false,
  /* LG */
  lgWs:null, lgIp:'', lgConnected:false, lgClientKey:'',
  /* Sony */
  sonyIp:'', sonyPsk:'0000',
  /* TV scan */
  foundTVs:[], scanActive:false, scanProgress:0,
  /* BT */
  btDevs:[], btConnected:null, btGatt:null,
  /* NFC */
  nfcReader:null, nfcTag:null, nfcActive:false,
  /* GPS */
  gpsWatch:null, gpsPos:null, gpsHistory:[],
  /* Audio */
  audioCtx:null, analyser:null, vizRaf:null,
  /* Sensors */
  sensorData:{ax:0,ay:0,az:0,alpha:0,beta:0,gamma:0,lux:null},
  /* Serial */
  serialPort:null, serialWriter:null,
  /* Battery */
  battery:null,
  /* Log */
  log:[],
  /* Sub-GHz */
  subIdx:1, subSigs:[], subScanInt:null, subScanning:false,
};

/* ══════════════════════════════════
   CONSTANTS
══════════════════════════════════ */
const CHANNELS = [
  {n:'LRT TELEVIZIJA',c:'#003388'},{n:'LNK',c:'#880000'},
  {n:'TV3',c:'#005500'},{n:'BTV',c:'#440088'},
  {n:'TV6',c:'#885500'},{n:'TV8',c:'#005566'},
  {n:'INFO TV',c:'#1a3355'},{n:'VIASAT SPORT',c:'#770033'},
  {n:'DISCOVERY',c:'#004455'},{n:'MTV',c:'#553300'},
];

// Real Samsung TV IR/WS command keys
const SAM_KEYS = {
  power:'KEY_POWER', volUp:'KEY_VOLUMEUP', volDown:'KEY_VOLUMEDOWN',
  mute:'KEY_MUTE', chUp:'KEY_CHANNELUP', chDown:'KEY_CHANNELDOWN',
  up:'KEY_UP', down:'KEY_DOWN', left:'KEY_LEFT', right:'KEY_RIGHT',
  ok:'KEY_ENTER', back:'KEY_RETURN', home:'KEY_HOME', menu:'KEY_MENU',
  source:'KEY_SOURCE', info:'KEY_INFO', exit:'KEY_EXIT',
  '0':'KEY_0','1':'KEY_1','2':'KEY_2','3':'KEY_3','4':'KEY_4',
  '5':'KEY_5','6':'KEY_6','7':'KEY_7','8':'KEY_8','9':'KEY_9',
};

// LG WebOS URIs
const LG_URIS = {
  power:        'ssap://system/turnOff',
  volUp:        'ssap://audio/volumeUp',
  volDown:      'ssap://audio/volumeDown',
  mute:         'ssap://audio/setMute',
  chUp:         'ssap://tv/channelUp',
  chDown:       'ssap://tv/channelDown',
  setInput:     'ssap://tv/switchInput',
  getInfo:      'ssap://com.webos.service.update/getCurrentSWInformation',
  openApp:      'ssap://system.launcher/open',
  listApps:     'ssap://com.webos.applicationManager/listApps',
  getCh:        'ssap://tv/getCurrentChannel',
  getVolume:    'ssap://audio/getVolume',
  toast:        'ssap://system.notifications/createToast',
};

const SUBFREQS = [315.00, 433.92, 868.35, 915.00];

const PAYLOADS = [
  {n:'SYSINFO',    d:'Collect OS information',
   code:'DELAY 500\nGUI r\nDELAY 500\nSTRING cmd\nENTER\nSTRING systeminfo > %TEMP%\\si.txt && start notepad %TEMP%\\si.txt\nENTER'},
  {n:'WIFI CREDS', d:'Export saved WiFi passwords',
   code:'GUI r\nDELAY 600\nSTRING powershell -w hidden\nENTER\nDELAY 800\nSTRING (netsh wlan show profiles) | Select-String ":(.+)$" | %{$n=$_.Matches.Groups[1].Value.Trim(); (netsh wlan show profile name="$n" key=clear)} | Select-String "Key Content" | %{$_.Matches.Groups[0].Value} | Out-File $env:TEMP\\w.txt; notepad $env:TEMP\\w.txt\nENTER'},
  {n:'LOCK',       d:'Lock workstation immediately',   code:'GUI l'},
  {n:'OPEN URL',   d:'Open URL in browser',            code:'DELAY 500\nGUI r\nDELAY 500\nSTRING start https://flipper.net\nENTER'},
  {n:'HELLO',      d:'Type message in focused window', code:'DELAY 500\nSTRING Hello from FlipperRemote 2.0!\nENTER'},
];

const MENU = [
  {id:'tvscan',  ic:'◈', n:'TV SCANNER'},
  {id:'samsung', ic:'▶', n:'SAMSUNG TV'},
  {id:'lg',      ic:'◉', n:'LG TV'},
  {id:'sony',    ic:'◆', n:'SONY TV'},
  {id:'irblast', ic:'~', n:'IR BLASTER'},
  {id:'bt',      ic:'⬡', n:'BLUETOOTH'},
  {id:'nfc',     ic:'○', n:'NFC'},
  {id:'subghz',  ic:'≋', n:'SUB-GHz'},
  {id:'gps',     ic:'⊕', n:'GPS'},
  {id:'freq',    ic:'♪', n:'FREQ ANALYZER'},
  {id:'sensors', ic:'⊹', n:'SENSORS'},
  {id:'badusb',  ic:'⌨', n:'BAD USB'},
  {id:'log',     ic:'▤', n:'DEVICE LOG'},
  {id:'system',  ic:'⚙', n:'SYSTEM'},
];

/* ══════════════════════════════════
   DOM REFS
══════════════════════════════════ */
const $ = id => document.getElementById(id);
const scrBody = $('scrBody');
const ctx     = $('ctx');
const irDot   = $('irDot');
const toast   = $('toast');
const modal   = $('modal');
const mbox    = $('mbox');

/* ══════════════════════════════════
   UTILITIES
══════════════════════════════════ */
let _H = {};

function vib(p=12){try{navigator.vibrate(p)}catch(e){}}
function flashIR(){irDot.classList.add('on');ledOn('O');setTimeout(()=>{irDot.classList.remove('on');ledOff('O')},300)}
function ledOn(c)  {$('led'+c)?.classList.add('on')}
function ledOff(c) {$('led'+c)?.classList.remove('on')}
function ledPulse(c,ms=400){ledOn(c);setTimeout(()=>ledOff(c),ms)}

let _tt;
function showToast(msg){
  toast.textContent=msg;toast.classList.add('show');
  clearTimeout(_tt);_tt=setTimeout(()=>toast.classList.remove('show'),2200);
}

function log(cat,msg){
  const ts=new Date().toTimeString().slice(0,8);
  S.log.unshift({ts,cat,msg});
  if(S.log.length>200)S.log.pop();
}

function setTitle(t){$('sbTitle').textContent=t}
function clearCtx(){ctx.innerHTML=''}
function addBtn(label,fn,cls=''){
  const b=document.createElement('button');
  b.className='cbtn '+cls;b.textContent=label;
  b.addEventListener('click',()=>{vib();fn()});
  ctx.appendChild(b);return b;
}

function showModal(html){
  mbox.innerHTML=html;modal.classList.add('open');
}
function closeModal(){modal.classList.remove('open')}

function isHttps(){return location.protocol==='https:'}

function warnHttps(action){
  if(isHttps()){
    showModal(`<div class="mbox-title">⚠ HTTPS LIMIT</div>
<div>TV LAN control needs HTTP.<br>GitHub Pages uses HTTPS which<br>blocks ws:// connections.<br><br>
<strong>Fix options:</strong><br>
1. Download & run locally<br>
2. chrome://flags → "Insecure<br>&nbsp;&nbsp;origins treated as secure"<br><br>
${action||''}
</div>
<button class="mbox-btn hi" onclick="closeModal();downloadAll()">DOWNLOAD</button>
<button class="mbox-btn" onclick="closeModal()">CLOSE</button>`);
    return true;
  }
  return false;
}

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
window.addEventListener('load',()=>{
  initBattery();
  initSensors();
  bindButtons();
  updateNetworkIcon();
  renderMenu();
  log('SYS','Boot OK v2.0');
});

/* Battery */
async function initBattery(){
  try{
    if(navigator.getBattery){
      const b=await navigator.getBattery();
      S.battery=b;
      const upd=()=>{
        const pct=Math.round(b.level*100);
        $('sbBat').textContent=(b.charging?'⚡':'')+pct+'%';
      };
      upd();b.addEventListener('levelchange',upd);b.addEventListener('chargingchange',upd);
    }
  }catch(e){}
}

/* Network icon */
function updateNetworkIcon(){
  const c=navigator.connection;
  const el=$('sbNet');
  if(c){el.textContent=(c.effectiveType||'?')}
  else{el.textContent=navigator.onLine?'NET':'OFF'}
}

/* Sensors */
function initSensors(){
  window.addEventListener('devicemotion',e=>{
    if(e.accelerationIncludingGravity){
      S.sensorData.ax=+(e.accelerationIncludingGravity.x||0).toFixed(2);
      S.sensorData.ay=+(e.accelerationIncludingGravity.y||0).toFixed(2);
      S.sensorData.az=+(e.accelerationIncludingGravity.z||0).toFixed(2);
    }
  });
  window.addEventListener('deviceorientation',e=>{
    S.sensorData.alpha=+(e.alpha||0).toFixed(1);
    S.sensorData.beta= +(e.beta||0).toFixed(1);
    S.sensorData.gamma=+(e.gamma||0).toFixed(1);
  });
  // Ambient light
  if('AmbientLightSensor' in window){
    try{
      const als=new AmbientLightSensor();
      als.addEventListener('reading',()=>{S.sensorData.lux=als.illuminance.toFixed(0)});
      als.start();
    }catch(e){}
  }
}

/* Buttons */
function bindButtons(){
  $('dpU').onclick =()=>{vib();_H.up   ?_H.up()   :menuNav(-1)};
  $('dpD').onclick =()=>{vib();_H.down ?_H.down()  :menuNav(1)};
  $('dpL').onclick =()=>{vib();_H.left ?_H.left()  :null};
  $('dpR').onclick =()=>{vib();_H.right?_H.right()  :null};
  $('dpOk').onclick=()=>{vib(22);_H.ok?_H.ok()    :menuOK()};
  $('btnBack').onclick=()=>{vib();goBack()};
  $('sideUp').onclick  =()=>{vib();_H.sideUp  ?_H.sideUp()  :menuNav(-1)};
  $('sideDown').onclick=()=>{vib();_H.sideDown?_H.sideDown():menuNav(1)};
  document.addEventListener('keydown',e=>{
    const map={ArrowUp:$('dpU'),ArrowDown:$('dpD'),ArrowLeft:$('dpL'),ArrowRight:$('dpR'),Enter:$('dpOk'),Escape:$('btnBack')};
    if(map[e.key]){e.preventDefault();map[e.key].click()}
  });
}

/* ══════════════════════════════════
   NAVIGATION
══════════════════════════════════ */
function menuNav(d){S.menuIdx=(S.menuIdx+d+MENU.length)%MENU.length;renderMenu()}
function menuOK(){openApp(MENU[S.menuIdx].id)}

function stopApp(){
  S.scanActive=false;S.subScanning=false;S.nfcActive=false;
  if(S.subScanInt){clearInterval(S.subScanInt);S.subScanInt=null}
  if(S.gpsWatch){navigator.geolocation.clearWatch(S.gpsWatch);S.gpsWatch=null}
  if(S.vizRaf){cancelAnimationFrame(S.vizRaf);S.vizRaf=null}
  if(S.audioCtx){S.audioCtx.close();S.audioCtx=null;S.analyser=null}
  _H={};
}

function goBack(){stopApp();S.app='menu';renderMenu()}

function openApp(id){
  stopApp();S.app=id;
  const m=MENU.find(x=>x.id===id);
  setTitle(m?m.n:id.toUpperCase());
  const apps={tvscan:appTVScan,samsung:appSamsung,lg:appLG,sony:appSony,
               irblast:appIRBlast,bt:appBT,nfc:appNFC,subghz:appSubGHz,
               gps:appGPS,freq:appFreq,sensors:appSensors,
               badusb:appBadUSB,log:appLog,system:appSystem};
  apps[id]?.();
}

/* ══════════════════════════════════
   MENU
══════════════════════════════════ */
function renderMenu(){
  stopApp();setTitle('FLIPPER REMOTE');clearCtx();
  _H={up:()=>menuNav(-1),down:()=>menuNav(1),ok:menuOK};
  const vis=8,start=Math.max(0,Math.min(S.menuIdx-4,MENU.length-vis));
  let h='<div class="fadein slist">';
  for(let i=start;i<Math.min(start+vis,MENU.length);i++){
    const m=MENU[i],sel=i===S.menuIdx;
    h+=`<div class="mitem${sel?' sel':''}" onclick="openApp('${m.id}')">
      <span class="ic">${m.ic}</span><span style="margin-left:4px;flex:1">${m.n}</span>
      <span class="ar">${sel?'▶':'›'}</span></div>`;
  }
  h+='</div>';
  scrBody.innerHTML=h;
}

/* ══════════════════════════════════
   TV SCANNER (Real network probe)
══════════════════════════════════ */
function appTVScan(){
  S.foundTVs=[];S.scanActive=false;S.scanProgress=0;
  renderTVScan();clearCtx();
  addBtn('SCAN', tvScanStart, 'cg');
  addBtn('STOP', tvScanStop,  '');
  addBtn('MANUAL',tvAddManual,'co');
  addBtn('CONNECT',tvConnectSelected,'cy');
  _H={up:()=>{S.menuIdx=Math.max(0,S.menuIdx-1);renderTVScan()},
      down:()=>{S.menuIdx=Math.min(S.foundTVs.length-1,S.menuIdx+1);renderTVScan()},
      ok:tvConnectSelected};
}

function renderTVScan(){
  const status=S.scanActive?`<span class="blink">◈ SCANNING ${S.scanProgress}%</span>`:`○ IDLE ${S.foundTVs.length} FOUND`;
  let lst=S.foundTVs.length?S.foundTVs.slice(0,7).map((t,i)=>`
    <div class="mitem${i===S.tvSelIdx?' sel':''}" onclick="tvSelect(${i})">
      <span class="ic">${t.brand==='Samsung'?'▶':t.brand==='LG'?'◉':'◆'}</span>
      <span style="flex:1">${t.brand} ${t.ip}</span>
      <span style="font-size:5px">${t.port}</span>
    </div>`).join('')
    :'<div class="sl dim">No TVs found yet</div>';
  scrBody.innerHTML=`<div class="fadein"><div class="sl">${status}</div><div class="hr"></div>${lst}</div>`;
}
let tvSelIdx=0;
function tvSelect(i){tvSelIdx=i;renderTVScan()}

async function tvScanStart(){
  if(S.scanActive)return;
  if(isHttps()){warnHttps('Scanning only works over HTTP.');return}
  S.foundTVs=[];S.scanActive=true;S.scanProgress=0;tvSelIdx=0;
  log('TVScan','Starting...');
  renderTVScan();

  // Get local IP via WebRTC
  let localIp=await getLocalIP();
  if(!localIp){showToast('CANNOT GET LOCAL IP');S.scanActive=false;renderTVScan();return}
  log('TVScan','Local IP: '+localIp);
  const base=localIp.split('.').slice(0,3).join('.');

  // Scan in batches of 16
  const ips=Array.from({length:254},(_,i)=>base+'.'+(i+1));
  const batch=16;
  for(let i=0;i<ips.length;i+=batch){
    if(!S.scanActive)break;
    S.scanProgress=Math.round(i/ips.length*100);
    const chunk=ips.slice(i,i+batch);
    await Promise.all(chunk.map(ip=>probeTV(ip)));
    renderTVScan();
  }
  S.scanActive=false;S.scanProgress=100;
  showToast(S.foundTVs.length?`FOUND ${S.foundTVs.length} TV(S)!`:'NO TVs FOUND');
  log('TVScan','Done. '+S.foundTVs.length+' found');
  renderTVScan();
}

async function probeTV(ip){
  const probes=[
    {port:8001,brand:'Samsung',path:'/api/v2/'},
    {port:3000,brand:'LG',path:'/'},
    {port:52323,brand:'Sony',path:'/sony/system'},
  ];
  return Promise.any(probes.map(p=>new Promise((res,rej)=>{
    const ws=new WebSocket(`ws://${ip}:${p.port}`);
    const t=setTimeout(()=>{try{ws.close()}catch(e){};rej()},800);
    ws.onopen=()=>{
      clearTimeout(t);
      if(!S.foundTVs.find(x=>x.ip===ip)){
        S.foundTVs.push({ip,port:p.port,brand:p.brand});
        vib([20,10,20]);ledPulse('G',300);
        log('TVScan','Found: '+p.brand+' at '+ip);
      }
      try{ws.close()}catch(e){}
      res();
    };
    ws.onerror=()=>{clearTimeout(t);rej()};
  }))).catch(()=>{});
}

function tvScanStop(){S.scanActive=false;renderTVScan()}

function tvAddManual(){
  const ip=prompt('Enter TV IP address (e.g. 192.168.1.50):');
  if(!ip)return;
  const brand=prompt('Brand? (Samsung / LG / Sony):','Samsung');
  if(!brand)return;
  const portMap={Samsung:8001,LG:3000,Sony:52323};
  S.foundTVs.push({ip:ip.trim(),port:portMap[brand]||8001,brand});
  renderTVScan();
  showToast('ADDED '+ip);
}

function tvConnectSelected(){
  const tv=S.foundTVs[tvSelIdx];
  if(!tv){showToast('SELECT A TV FIRST');return}
  if(tv.brand==='Samsung'){S.samsungIp=tv.ip;openApp('samsung')}
  else if(tv.brand==='LG'){S.lgIp=tv.ip;openApp('lg')}
  else{S.sonyIp=tv.ip;openApp('sony')}
}

async function getLocalIP(){
  return new Promise(res=>{
    const pc=new RTCPeerConnection({iceServers:[]});
    pc.createDataChannel('');
    pc.createOffer().then(o=>pc.setLocalDescription(o));
    pc.onicecandidate=e=>{
      if(!e||!e.candidate)return;
      const m=e.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
      if(m&&!m[0].startsWith('127.')){res(m[0]);try{pc.close()}catch(e){}}
    };
    setTimeout(()=>res(null),4000);
  });
}

/* ══════════════════════════════════
   SAMSUNG TV (Real WebSocket API)
══════════════════════════════════ */
function appSamsung(){
  renderSamsung();clearCtx();
  addBtn('CONNECT',samConnect,'cg');
  addBtn('POWER',  samPower,  'cr');
  addBtn('VOL+',   ()=>samKey('volUp'), '');
  addBtn('VOL-',   ()=>samKey('volDown'),'');
  addBtn('CH+',    ()=>samKey('chUp'),  '');
  addBtn('CH-',    ()=>samKey('chDown'),'');
  addBtn('HOME',   ()=>samKey('home'),  'co');
  addBtn('MUTE',   ()=>samKey('mute'),  '');
  _H={
    up:   ()=>samKey('up'),   down: ()=>samKey('down'),
    left: ()=>samKey('left'), right:()=>samKey('right'),
    ok:   ()=>samKey('ok'),   sideUp:()=>samKey('volUp'), sideDown:()=>samKey('volDown'),
  };
}

function renderSamsung(){
  const st=S.samsungConnected?'● CONNECTED':'○ DISCONNECTED';
  const ip=S.samsungIp||'not set';
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl hi">${S.samsungConnected?'<span class="blink">◈</span> '+ip:'○ '+ip}</div>
    <div class="sl">${st}</div>
    <div class="hr"></div>
    <div class="sl dim">IP: ${ip}</div>
    <div class="sl dim">PORT: 8001</div>
    <div class="hr"></div>
    <div class="sl dim">↑↓ VOL  ←→ CH</div>
    <div class="sl dim">OK=SELECT  BACK=RETURN</div>
    ${S.samsungConnected?'<div class="sl yel">WS ACTIVE</div>':'<div class="sl dim">Press CONNECT</div>'}
  </div>`;
  $('sbBt').style.color=S.samsungConnected?'var(--fg)':'';
}

async function samConnect(){
  const ip=S.samsungIp||prompt('Samsung TV IP address:');
  if(!ip)return;
  S.samsungIp=ip;
  if(isHttps()){warnHttps('ws://'+ip+':8001 is blocked on HTTPS.');return}
  samDisconnect();
  showToast('CONNECTING...');
  log('Samsung','Connecting to '+ip);
  const name=btoa('FlipperRemote');
  try{
    S.samsungWs=new WebSocket(`ws://${ip}:8001/api/v2/channels/samsung.remote.control?name=${name}`);
    S.samsungWs.onopen=()=>{
      S.samsungConnected=true;
      showToast('SAMSUNG CONNECTED!');
      log('Samsung','Connected');
      vib([40,20,40]);ledPulse('G',600);
      renderSamsung();
    };
    S.samsungWs.onclose=()=>{
      S.samsungConnected=false;
      log('Samsung','Disconnected');
      renderSamsung();
    };
    S.samsungWs.onerror=()=>{
      S.samsungConnected=false;
      showToast('CONNECTION FAILED');
      log('Samsung','Error');
      renderSamsung();
    };
    S.samsungWs.onmessage=e=>{
      try{const d=JSON.parse(e.data);log('Samsung','RX: '+d.event)}catch(e){}
    };
  }catch(e){showToast('WS ERROR');log('Samsung','Exception: '+e.message)}
}

function samDisconnect(){
  if(S.samsungWs){try{S.samsungWs.close()}catch(e){}S.samsungWs=null}
  S.samsungConnected=false;
}

function samKey(key){
  flashIR();vib(10);
  const cmd=SAM_KEYS[key];
  if(!cmd)return;
  if(S.samsungConnected&&S.samsungWs?.readyState===WebSocket.OPEN){
    S.samsungWs.send(JSON.stringify({
      method:'ms.remote.control',
      params:{Cmd:'Click',DataOfCmd:cmd,Option:'false',TypeOfRemote:'SendRemoteKey'}
    }));
    log('Samsung','KEY: '+cmd);
  } else {
    showToast('NOT CONNECTED');
  }
}

function samPower(){samKey('power')}

/* ══════════════════════════════════
   LG TV (Real WebOS WebSocket API)
══════════════════════════════════ */
let lgMsgId=0;
const lgCallbacks={};

function appLG(){
  renderLG();clearCtx();
  addBtn('CONNECT',lgConnect,'cg');
  addBtn('POWER',  lgPower,  'cr');
  addBtn('VOL+',   ()=>lgSend(LG_URIS.volUp),    '');
  addBtn('VOL-',   ()=>lgSend(LG_URIS.volDown),  '');
  addBtn('CH+',    ()=>lgSend(LG_URIS.chUp),     '');
  addBtn('CH-',    ()=>lgSend(LG_URIS.chDown),   '');
  addBtn('TOAST',  lgToast,  'co');
  addBtn('INFO',   lgGetInfo,'');
  _H={
    up:   ()=>lgSend(LG_URIS.chUp),  down: ()=>lgSend(LG_URIS.chDown),
    left: ()=>lgSend(LG_URIS.volDown), right:()=>lgSend(LG_URIS.volUp),
    sideUp:()=>lgSend(LG_URIS.volUp), sideDown:()=>lgSend(LG_URIS.volDown),
  };
}

function renderLG(){
  const ip=S.lgIp||'not set';
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl hi">${S.lgConnected?'<span class="blink">◉</span> '+ip:'○ '+ip}</div>
    <div class="sl">${S.lgConnected?'● CONNECTED':'○ DISCONNECTED'}</div>
    <div class="hr"></div>
    <div class="sl dim">PORT: 3000 (WebOS)</div>
    ${S.lgClientKey?`<div class="sl dim">KEY: ${S.lgClientKey.slice(0,16)}</div>`:'<div class="sl dim">Pair on first connect</div>'}
    <div class="hr"></div>
    <div class="sl dim">TV will prompt pairing</div>
    ${S.lgConnected?'<div class="sl yel">WS ACTIVE</div>':'<div class="sl dim">Press CONNECT</div>'}
  </div>`;
}

async function lgConnect(){
  const ip=S.lgIp||prompt('LG TV IP address:');
  if(!ip)return;
  S.lgIp=ip;
  if(isHttps()){warnHttps('ws://'+ip+':3000 blocked on HTTPS.');return}
  if(S.lgWs){try{S.lgWs.close()}catch(e){}}
  showToast('CONNECTING...');
  log('LG','Connecting to '+ip);
  S.lgWs=new WebSocket(`ws://${ip}:3000/`);
  S.lgWs.onopen=()=>{
    lgRegister();
    log('LG','WS open, registering...');
  };
  S.lgWs.onclose=()=>{S.lgConnected=false;log('LG','Closed');renderLG()};
  S.lgWs.onerror=()=>{S.lgConnected=false;showToast('LG CONNECTION FAILED');log('LG','Error');renderLG()};
  S.lgWs.onmessage=e=>{
    try{
      const d=JSON.parse(e.data);
      if(d.type==='registered'){
        S.lgConnected=true;
        S.lgClientKey=d.payload?.['client-key']||S.lgClientKey;
        localStorage.setItem('lg_key',S.lgClientKey);
        showToast('LG CONNECTED!');
        log('LG','Registered. Key: '+S.lgClientKey);
        vib([40,20,40]);ledPulse('G',600);
        renderLG();
      }
      if(d.id&&lgCallbacks[d.id]){lgCallbacks[d.id](d.payload);delete lgCallbacks[d.id]}
    }catch(e){}
  };
}

function lgRegister(){
  S.lgClientKey=localStorage.getItem('lg_key')||'';
  S.lgWs.send(JSON.stringify({
    type:'register',id:'reg0',
    payload:{
      forcePairing:false,pairingType:'PROMPT',
      'client-key':S.lgClientKey||undefined,
      manifest:{
        manifestVersion:1,appVersion:'1.1',
        signed:{
          created:'20140509',appId:'com.flipperremote',vendorId:'flipper',
          localizedAppNames:{'':'FlipperRemote'},
          localizedVendorNames:{'':'FlipperRemote'},
          permissions:['CONTROL_POWER','CONTROL_AUDIO','CONTROL_INPUT_TV','READ_CURRENT_CHANNEL','TURN_OFF'],
          serial:'FR20240101'
        },
        permissions:['CONTROL_POWER','CONTROL_AUDIO','CONTROL_INPUT_TV','READ_CURRENT_CHANNEL','TURN_OFF'],
        signatures:[{signatureVersion:1,signature:'UNSIGNED'}]
      }
    }
  }));
}

function lgSend(uri,payload={},cb){
  if(!S.lgConnected||!S.lgWs){showToast('LG NOT CONNECTED');return}
  const id='fr_'+(++lgMsgId);
  if(cb)lgCallbacks[id]=cb;
  S.lgWs.send(JSON.stringify({type:'request',id,uri,payload}));
  log('LG','CMD: '+uri.split('/').pop());
  flashIR();vib(10);
}

function lgPower(){lgSend(LG_URIS.power)}
function lgToast(){lgSend(LG_URIS.toast,{message:'Hello from FlipperRemote!'})}
function lgGetInfo(){lgSend(LG_URIS.getInfo,{},d=>{if(d)showToast((d.product_name||'LG TV').slice(0,20))})}

/* ══════════════════════════════════
   SONY TV (Real HTTP REST API)
══════════════════════════════════ */
function appSony(){
  renderSony();clearCtx();
  addBtn('POWER OFF', sonyPowerOff, 'cr');
  addBtn('POWER ON',  sonyPowerOn,  'cg');
  addBtn('VOL+',  ()=>sonyCmd('setAudioVolume',{volume:'+1',target:'speaker'}),'');
  addBtn('VOL-',  ()=>sonyCmd('setAudioVolume',{volume:'-1',target:'speaker'}),'');
  addBtn('INFO',  sonyGetInfo, 'co');
  addBtn('SET IP',()=>{S.sonyIp=prompt('Sony TV IP:')||S.sonyIp;renderSony()},'');
  _H={ok:sonyPowerOff, sideUp:()=>sonyCmd('setAudioVolume',{volume:'+1'}), sideDown:()=>sonyCmd('setAudioVolume',{volume:'-1'})};
}

function renderSony(){
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl hi">◆ SONY BRAVIA</div>
    <div class="sl">IP: ${S.sonyIp||'not set'}</div>
    <div class="sl dim">PSK: ${S.sonyPsk} (change in code)</div>
    <div class="hr"></div>
    <div class="sl dim">Uses HTTP REST API</div>
    <div class="sl dim">X-Auth-PSK header auth</div>
    <div class="hr"></div>
    <div class="sl dim">Set PSK on TV:</div>
    <div class="sl dim">Settings > Remote Start</div>
    <div class="sl or">${isHttps()?'⚠ HTTPS MODE':'● HTTP MODE'}</div>
  </div>`;
}

async function sonyReq(service,method,params=[]){
  const ip=S.sonyIp||prompt('Sony TV IP:');
  if(!ip)return null;
  S.sonyIp=ip;
  if(isHttps()){warnHttps();return null}
  try{
    const r=await fetch(`http://${ip}/sony/${service}`,{
      method:'POST',
      headers:{'Content-Type':'application/json','X-Auth-PSK':S.sonyPsk},
      body:JSON.stringify({method,id:1,params,version:'1.0'})
    });
    const d=await r.json();
    log('Sony',method+' -> '+(d.error?'ERR':'OK'));
    return d;
  }catch(e){
    showToast('SONY ERROR: '+e.message.slice(0,12));
    log('Sony','Error: '+e.message);
    return null;
  }
}

async function sonyCmd(method,params){
  flashIR();vib(10);
  const d=await sonyReq('audio',method,[params||{}]);
  if(d&&!d.error)showToast('SONY: '+method.replace('set','').toUpperCase());
}

async function sonyPowerOff(){
  flashIR();vib(30);
  const d=await sonyReq('system','setPowerStatus',[{status:false}]);
  if(d&&!d.error)showToast('SONY: POWER OFF');
}

async function sonyPowerOn(){
  flashIR();vib(30);
  // Wake-on-LAN or REST
  const d=await sonyReq('system','setPowerStatus',[{status:true}]);
  if(d&&!d.error)showToast('SONY: POWER ON');
}

async function sonyGetInfo(){
  const d=await sonyReq('system','getSystemInformation',[]);
  if(d?.result?.[0]){
    const r=d.result[0];
    showToast((r.model||'Sony TV').slice(0,20));
    log('Sony','Model: '+r.model+' SW:'+r.softwareVersion);
  }
}

/* ══════════════════════════════════
   IR BLASTER (Web Serial API → Arduino)
══════════════════════════════════ */
function appIRBlast(){
  renderIRBlast();clearCtx();
  addBtn('CONNECT',irBlastConnect,'cg');
  addBtn('POWER',  ()=>irSend('POWER'),'cr');
  addBtn('VOL+',   ()=>irSend('VOLU'), '');
  addBtn('VOL-',   ()=>irSend('VOLD'), '');
  addBtn('CH+',    ()=>irSend('CHU'),  '');
  addBtn('CH-',    ()=>irSend('CHD'),  '');
  addBtn('MUTE',   ()=>irSend('MUTE'), '');
  addBtn('DISCONNECT',irBlastDisconnect,'');
  _H={sideUp:()=>irSend('VOLU'),sideDown:()=>irSend('VOLD'),ok:()=>irSend('POWER')};
}

function renderIRBlast(){
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl hi">~ IR BLASTER (Serial)</div>
    <div class="sl">${S.serialPort?'● CONNECTED':'○ DISCONNECTED'}</div>
    <div class="hr"></div>
    <div class="sl dim">Requires Arduino with</div>
    <div class="sl dim">IRremote library via USB.</div>
    <div class="hr"></div>
    <div class="sl dim">Arduino sketch available</div>
    <div class="sl dim">in SYSTEM > DOWNLOAD</div>
    <div class="hr"></div>
    <div class="sl or">${'serial' in navigator?'● Web Serial OK':'⚠ Not supported'}</div>
  </div>`;
}

async function irBlastConnect(){
  if(!('serial' in navigator)){showToast('WEB SERIAL NOT SUPPORTED');return}
  try{
    S.serialPort=await navigator.serial.requestPort();
    await S.serialPort.open({baudRate:9600});
    const enc=new TextEncoderStream();
    enc.readable.pipeTo(S.serialPort.writable);
    S.serialWriter=enc.writable.getWriter();
    showToast('IR BLASTER CONNECTED!');
    log('IRBlast','Connected');
    vib([40,20,40]);ledPulse('G',600);
    renderIRBlast();
  }catch(e){
    showToast('SERIAL: '+e.message.slice(0,16));
    log('IRBlast','Error: '+e.message);
  }
}

async function irSend(cmd){
  flashIR();vib(12);
  if(S.serialWriter){
    try{
      await S.serialWriter.write(cmd+'\n');
      log('IRBlast','Sent: '+cmd);
      showToast('IR: '+cmd);
    }catch(e){showToast('SEND FAILED')}
  } else {
    // Simulate without hardware
    showToast('IR: '+cmd+' (no HW)');
    log('IRBlast','Simulated: '+cmd);
  }
}

function irBlastDisconnect(){
  try{S.serialWriter?.close();S.serialPort?.close()}catch(e){}
  S.serialPort=null;S.serialWriter=null;
  showToast('DISCONNECTED');renderIRBlast();
}

/* ══════════════════════════════════
   BLUETOOTH (Real Web Bluetooth API)
══════════════════════════════════ */
function appBT(){
  S.btDevs=[];
  renderBT();clearCtx();
  addBtn('SCAN',    btScan,      'cg');
  addBtn('CONNECT', btConnect,   'co');
  addBtn('GATT',    btReadGATT,  '');
  addBtn('NOTIFY',  btNotify,    '');
  addBtn('DISC.',   btDisconnect,'cr');
  addBtn('CLEAR',   ()=>{S.btDevs=[];S.btConnected=null;renderBT()},'');
  _H={up:()=>{btSelIdx=Math.max(0,btSelIdx-1);renderBT()},
      down:()=>{btSelIdx=Math.min(S.btDevs.length-1,btSelIdx+1);renderBT()},
      ok:btConnect};
}

let btSelIdx=0;
function renderBT(){
  const st=S.btConnected?`● ${S.btConnected.name.slice(0,12)}`:'○ IDLE';
  let lst=S.btDevs.length?S.btDevs.slice(0,6).map((d,i)=>`
    <div class="mitem${i===btSelIdx?' sel':''}" onclick="btSelIdx=${i};renderBT()">
      <span class="ic">⬡</span>
      <span style="flex:1">${d.name.slice(0,14)}</span>
      <span style="font-size:5px">${d.id.slice(-4)}</span>
    </div>`).join('')
    :'<div class="sl dim">Press SCAN</div>';
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl hi">${st}</div>
    <div class="sl">${S.btConnected?'GATT: '+(S.btGatt?.connected?'OPEN':'CLOSED'):'Not paired'}</div>
    <div class="hr"></div>${lst}
  </div>`;
  $('sbBt').classList.toggle('on',!!S.btConnected);
}

async function btScan(){
  if(!navigator.bluetooth){showToast('WEB BT NOT SUPPORTED');return}
  try{
    const dev=await navigator.bluetooth.requestDevice({
      acceptAllDevices:true,
      optionalServices:['battery_service','device_information','heart_rate',
                        '0000180a-0000-1000-8000-00805f9b34fb']
    });
    if(!S.btDevs.find(d=>d.id===dev.id)){
      S.btDevs.push({id:dev.id,name:dev.name||'Unknown',device:dev});
      log('BT','Found: '+dev.name);
      showToast('DEVICE: '+(dev.name||'Unknown').slice(0,16)+'!');
      vib([30,10,30]);ledPulse('G',400);
    }
    btSelIdx=S.btDevs.findIndex(d=>d.id===dev.id);
    renderBT();
  }catch(e){
    if(e.name!=='NotFoundError')showToast('BT: '+e.message.slice(0,14));
  }
}

async function btConnect(){
  const d=S.btDevs[btSelIdx];
  if(!d){showToast('SELECT DEVICE FIRST');return}
  showToast('CONNECTING...');
  try{
    S.btGatt=await d.device.gatt.connect();
    S.btConnected=d;
    log('BT','GATT connected to '+d.name);
    showToast('GATT CONNECTED!');
    vib([40,20,40]);ledPulse('G',600);
    renderBT();
  }catch(e){showToast('GATT: '+e.message.slice(0,14));log('BT','GATT err: '+e.message)}
}

async function btReadGATT(){
  if(!S.btGatt?.connected){showToast('CONNECT FIRST');return}
  try{
    const svc=await S.btGatt.getPrimaryService('battery_service');
    const ch=await svc.getCharacteristic('battery_level');
    const val=await ch.readValue();
    const bat=val.getUint8(0);
    showToast('DEVICE BATTERY: '+bat+'%');
    log('BT','Battery: '+bat+'%');
  }catch(e){
    showToast('GATT READ ERR');
    log('BT','Read err: '+e.message);
  }
}

async function btNotify(){
  if(!S.btGatt?.connected){showToast('CONNECT FIRST');return}
  try{
    const svc=await S.btGatt.getPrimaryService('heart_rate');
    const ch=await svc.getCharacteristic('heart_rate_measurement');
    await ch.startNotifications();
    ch.addEventListener('characteristicvaluechanged',e=>{
      const bpm=e.target.value.getUint8(1);
      showToast('HEART RATE: '+bpm+' BPM');
      log('BT','HR: '+bpm);
    });
    showToast('NOTIFICATIONS ON');
  }catch(e){showToast('NOTIFY: '+e.message.slice(0,14))}
}

function btDisconnect(){
  try{S.btGatt?.disconnect()}catch(e){}
  S.btConnected=null;S.btGatt=null;
  log('BT','Disconnected');renderBT();
}

/* ══════════════════════════════════
   NFC (Real Web NFC API)
══════════════════════════════════ */
function appNFC(){
  S.nfcTag=null;
  renderNFC();clearCtx();
  addBtn('READ',    nfcRead,    'cg');
  addBtn('WRITE',   nfcWrite,   'co');
  addBtn('STOP',    nfcStop,    '');
  addBtn('SIMULATE',nfcSimulate,'');
  addBtn('COPY UID',nfcCopy,   'cy');
  _H={ok:nfcRead};
}

function renderNFC(){
  const st=S.nfcActive?'<span class="blink">◈ SCANNING...</span>':'○ READY';
  const t=S.nfcTag;
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl">${st}</div>
    <div class="hr"></div>
    ${t?`<div class="sl hi">▶ TAG DETECTED</div>
<div class="sl">UID: ${t.uid}</div>
<div class="sl dim">TYPE: ${t.type}</div>
<div class="sl dim">TECH: ${t.tech}</div>
<div class="sl" style="white-space:normal;word-break:break-all;font-size:5px;line-height:1.6">DATA: ${t.data.slice(0,40)}</div>`
    :`<div class="sl dim">Hold NFC tag near</div>
<div class="sl dim">back of phone.</div>
<div class="sl dim">(Android Chrome only)</div>`}
  </div>`;
  $('sbNfc').classList.toggle('on',S.nfcActive||!!S.nfcTag);
}

async function nfcRead(){
  if(!('NDEFReader' in window)){showToast('NO NFC - TRY SIMULATE');return}
  try{
    S.nfcActive=true;renderNFC();
    if(S.nfcReader){try{await S.nfcReader.abort()}catch(e){}}
    S.nfcReader=new NDEFReader();
    const ctrl=new AbortController();
    S.nfcAbort=ctrl;
    await S.nfcReader.scan({signal:ctrl.signal});
    S.nfcReader.addEventListener('reading',({message,serialNumber})=>{
      let data='',recType='';
      for(const r of message.records){
        recType=r.recordType;
        if(r.recordType==='text'||r.recordType==='url'){
          data=new TextDecoder(r.encoding||'utf-8').decode(r.data);break;
        } else if(r.recordType==='mime'){
          data='[MIME: '+r.mediaType+']';break;
        } else {
          data='['+r.recordType+']';break;
        }
      }
      S.nfcTag={uid:serialNumber,type:recType||'NDEF',tech:'NFC-A',data:data||'No NDEF data'};
      S.nfcActive=false;
      showToast('NFC TAG READ!');
      vib([60,20,60]);ledPulse('G',700);
      log('NFC','Tag: '+serialNumber+' data: '+data.slice(0,20));
      renderNFC();
    });
    S.nfcReader.addEventListener('readingerror',()=>{
      S.nfcActive=false;showToast('NFC READ ERROR');renderNFC();
    });
  }catch(e){
    S.nfcActive=false;
    if(e.name!=='AbortError')showToast('NFC: '+e.message.slice(0,14));
    renderNFC();
  }
}

async function nfcWrite(){
  if(!('NDEFReader' in window)){showToast('NO NFC API');return}
  const msg=prompt('Text to write to tag:','Hello from FlipperRemote!');
  if(!msg)return;
  try{
    const r=new NDEFReader();
    await r.write({records:[{recordType:'text',data:msg}]});
    showToast('WRITTEN TO TAG!');
    log('NFC','Wrote: '+msg.slice(0,20));
    vib([40,20,40,20,40]);
  }catch(e){showToast('WRITE: '+e.message.slice(0,14))}
}

function nfcStop(){
  S.nfcActive=false;
  try{S.nfcAbort?.abort()}catch(e){}
  renderNFC();
}

function nfcSimulate(){
  S.nfcActive=true;renderNFC();
  const tags=[
    {uid:'04:A3:F2:1B:C8:11:90',type:'NDEF/Text',tech:'MIFARE Classic 1K',data:'Hello World'},
    {uid:'E1:FF:20:C3:44:AB:01',type:'NDEF/URL', tech:'NTAG213',          data:'https://flipper.net'},
    {uid:'AB:12:CD:34:EF:56:78',type:'NDEF/Text',tech:'ISO 14443-A',       data:'EMPLOYEE:EMP-00123'},
    {uid:'11:22:33:44:55:66:77',type:'NDEF/Mime',tech:'NTAG215',           data:'[vCard: John Doe]'},
  ];
  setTimeout(()=>{
    S.nfcTag=tags[Math.floor(Math.random()*tags.length)];
    S.nfcActive=false;
    showToast('TAG SIMULATED');vib([60,20,60]);ledPulse('G',500);
    log('NFC','Simulated: '+S.nfcTag.uid);
    renderNFC();
  },2000);
}

function nfcCopy(){
  if(!S.nfcTag){showToast('NO TAG');return}
  navigator.clipboard?.writeText(S.nfcTag.uid)
    .then(()=>showToast('UID COPIED!'))
    .catch(()=>showToast('COPY FAILED'));
}

/* ══════════════════════════════════
   SUB-GHz
══════════════════════════════════ */
function appSubGHz(){
  S.subSigs=[];S.subScanning=false;
  renderSub();clearCtx();
  addBtn('SCAN',   subScan,'cg');
  addBtn('STOP',   subStop,'');
  addBtn('REPLAY', subReplay,'co');
  addBtn('◄ FREQ', ()=>{S.subIdx=(S.subIdx-1+SUBFREQS.length)%SUBFREQS.length;renderSub()},'');
  addBtn('FREQ ►', ()=>{S.subIdx=(S.subIdx+1)%SUBFREQS.length;renderSub()},'');
  _H={left:()=>{S.subIdx=(S.subIdx-1+SUBFREQS.length)%SUBFREQS.length;renderSub()},
      right:()=>{S.subIdx=(S.subIdx+1)%SUBFREQS.length;renderSub()},ok:subScan};
}
function renderSub(){
  const freq=SUBFREQS[S.subIdx].toFixed(2);
  const st=S.subScanning?'<span class="blink">▶ RX ACTIVE</span>':'○ IDLE';
  const sigs=S.subSigs.slice(-6).reverse().map(s=>
    `<div class="sl dim" style="font-size:5px">${s.freq}MHz RSSI:${s.rssi}dBm MOD:${s.mod}</div>`).join('');
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl hi">${freq} MHz</div>
    <div class="sl dim">◄ 315 · 433 · 868 · 915 ►</div>
    <div class="sl">${st}</div>
    <div class="hr"></div>
    ${sigs||'<div class="sl dim">No signals captured</div>'}
    <div class="hr"></div>
    <div class="sl dim">TOTAL: ${S.subSigs.length} signals</div>
  </div>`;
}
function subScan(){
  if(S.subScanning)return;
  S.subScanning=true;S.subSigs=[];renderSub();
  log('Sub','Scan '+SUBFREQS[S.subIdx]+'MHz');
  const mods=['ASK','FSK','OOK','2-FSK'];
  S.subScanInt=setInterval(()=>{
    if(!S.subScanning)return;
    if(Math.random()>.5){
      S.subSigs.push({
        freq:SUBFREQS[S.subIdx].toFixed(2),
        rssi:-(25+Math.floor(Math.random()*65)),
        mod:mods[Math.floor(Math.random()*mods.length)]
      });
      vib(6);ledPulse('O',100);
    }
    renderSub();
  },650);
}
function subStop(){S.subScanning=false;if(S.subScanInt){clearInterval(S.subScanInt);S.subScanInt=null}renderSub()}
function subReplay(){
  if(!S.subSigs.length){showToast('NOTHING TO REPLAY');return}
  showToast('REPLAYING...');log('Sub','Replay');
  for(let i=0;i<8;i++)setTimeout(()=>{flashIR();vib(8)},i*100);
}

/* ══════════════════════════════════
   GPS (Real Geolocation API)
══════════════════════════════════ */
function appGPS(){
  renderGPS();clearCtx();
  addBtn('START',  gpsStart, 'cg');
  addBtn('STOP',   gpsStop,  '');
  addBtn('SHARE',  gpsShare, 'co');
  addBtn('MAPS',   gpsMaps,  '');
  addBtn('EXPORT', gpsExport,'cy');
  _H={ok:gpsStart};
}
function renderGPS(){
  const d=S.gpsPos;
  const watching=S.gpsWatch!==null;
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl">${watching?'<span class="blink">⊕ TRACKING...</span>':'○ IDLE'}</div>
    <div class="sl dim">POINTS: ${S.gpsHistory.length}</div>
    <div class="hr"></div>
    ${d?`<div class="sl hi">LAT: ${d.lat.toFixed(6)}</div>
<div class="sl hi">LON: ${d.lon.toFixed(6)}</div>
<div class="sl">ACC: ±${Math.round(d.acc)}m</div>
<div class="sl dim">ALT: ${d.alt!=null?d.alt.toFixed(1)+'m':'N/A'}</div>
<div class="sl dim">SPD: ${d.spd!=null?(d.spd*3.6).toFixed(1)+' km/h':'N/A'}</div>
<div class="sl dim">HDG: ${d.hdg!=null?d.hdg.toFixed(0)+'°':'N/A'}</div>`
    :'<div class="sl dim">Acquiring GPS signal...</div><div class="sl dim">May take up to 30s</div>'}
  </div>`;
}
function gpsStart(){
  if(!navigator.geolocation){showToast('GPS NOT SUPPORTED');return}
  if(S.gpsWatch)return;
  showToast('ACQUIRING...');log('GPS','Start');
  S.gpsWatch=navigator.geolocation.watchPosition(
    pos=>{
      S.gpsPos={lat:pos.coords.latitude,lon:pos.coords.longitude,
                acc:pos.coords.accuracy,alt:pos.coords.altitude,
                spd:pos.coords.speed,hdg:pos.coords.heading};
      S.gpsHistory.push({...S.gpsPos,t:Date.now()});
      if(S.gpsHistory.length>500)S.gpsHistory.shift();
      ledPulse('G',150);renderGPS();
    },
    err=>{showToast('GPS: '+err.message.slice(0,18));S.gpsWatch=null;renderGPS()},
    {enableHighAccuracy:true,maximumAge:0,timeout:30000}
  );
  renderGPS();
}
function gpsStop(){if(S.gpsWatch){navigator.geolocation.clearWatch(S.gpsWatch);S.gpsWatch=null}log('GPS','Stop');renderGPS()}
function gpsShare(){
  if(!S.gpsPos){showToast('NO GPS DATA');return}
  const u=`https://maps.google.com/?q=${S.gpsPos.lat},${S.gpsPos.lon}`;
  navigator.clipboard?.writeText(u).then(()=>showToast('COORDS COPIED!')).catch(()=>{window.open(u,'_blank')});
}
function gpsMaps(){
  if(!S.gpsPos){showToast('NO GPS DATA');return}
  window.open(`https://maps.google.com/?q=${S.gpsPos.lat},${S.gpsPos.lon}`,'_blank');
}
function gpsExport(){
  if(!S.gpsHistory.length){showToast('NO TRACK DATA');return}
  const csv='timestamp,lat,lon,acc,alt,speed\n'+
    S.gpsHistory.map(p=>`${new Date(p.t).toISOString()},${p.lat},${p.lon},${p.acc},${p.alt||''},${p.spd||''}`).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download='gps_track.csv';a.click();
  showToast('CSV EXPORTED!');
}

/* ══════════════════════════════════
   FREQUENCY ANALYZER (Real Web Audio)
══════════════════════════════════ */
function appFreq(){
  renderFreqBase();clearCtx();
  addBtn('MIC',    freqMic,'cg');
  addBtn('SIM',    freqSim,'co');
  addBtn('TONE',   freqTone,'');
  addBtn('STOP',   freqStop,'cr');
  addBtn('PEAK',   freqPeak,'cy');
  _H={ok:freqMic};
}
let freqPeakHz=0;
function renderFreqBase(){
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl">${S.audioCtx?'<span class="blink">♪ ANALYZING...</span>':'○ READY'}</div>
    <div class="sl dim">PEAK: ${freqPeakHz>0?freqPeakHz.toFixed(0)+' Hz':'---'}</div>
    <div class="hr"></div>
    <canvas id="fCvs" class="viz"></canvas>
    <div class="hr"></div>
    <div class="sl dim">0Hz ──────────── 8kHz</div>
  </div>`;
}
async function freqMic(){
  freqStop();
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    S.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    const src=S.audioCtx.createMediaStreamSource(stream);
    S.analyser=S.audioCtx.createAnalyser();
    S.analyser.fftSize=512;S.analyser.smoothingTimeConstant=0.75;
    src.connect(S.analyser);
    log('Freq','Mic start');
    renderFreqBase();freqDraw();
  }catch(e){showToast('MIC DENIED');freqSim()}
}
function freqDraw(){
  const draw=()=>{
    if(!S.audioCtx||!S.analyser)return;
    S.vizRaf=requestAnimationFrame(draw);
    const c=document.getElementById('fCvs');
    if(!c)return;
    const cx=c.getContext('2d');
    const W=c.width=c.offsetWidth,H=c.height=46;
    const buf=new Uint8Array(S.analyser.frequencyBinCount);
    S.analyser.getByteFrequencyData(buf);
    cx.fillStyle='#060f06';cx.fillRect(0,0,W,H);
    let peak=0,peakI=0;
    const bw=W/buf.length;
    for(let i=0;i<buf.length;i++){
      const v=buf[i]/255;
      if(buf[i]>peak){peak=buf[i];peakI=i}
      const g=Math.floor(v*255),r=Math.floor(v*60);
      cx.fillStyle=`rgb(${r},${g},${Math.floor(v*10)})`;
      cx.fillRect(i*bw,H*(1-v),bw-1,H*v);
    }
    if(S.audioCtx){freqPeakHz=peakI*(S.audioCtx.sampleRate/2)/buf.length}
    const el=document.querySelector('.scr-body .sl.dim');
    if(el&&freqPeakHz>10)el.nextSibling&&(document.querySelectorAll('.scr-body .sl.dim')[0].textContent='PEAK: '+freqPeakHz.toFixed(0)+' Hz');
  };draw();
}
function freqSim(){
  freqStop();
  renderFreqBase();let t=0;
  const draw=()=>{
    S.vizRaf=requestAnimationFrame(draw);
    const c=document.getElementById('fCvs');if(!c)return;
    const cx=c.getContext('2d');
    const W=c.width=c.offsetWidth,H=c.height=46,N=64;
    cx.fillStyle='#060f06';cx.fillRect(0,0,W,H);
    for(let i=0;i<N;i++){
      const v=Math.max(0.02,(Math.sin(t*.04+i*.25)*.3+Math.sin(t*.015+i*.12)*.35+Math.random()*.07)*.5+.08);
      cx.fillStyle=`rgba(95,255,0,${v*.9})`;
      cx.fillRect(i*(W/N),H*(1-v),(W/N)-1,H*v);
    }t++;
  };draw();
  log('Freq','Simulate');
}
function freqTone(){
  freqStop();
  const hz=parseInt(prompt('Frequency in Hz (e.g. 440):','440'));
  if(!hz||hz<20||hz>22000){showToast('INVALID FREQ');return}
  S.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  const osc=S.audioCtx.createOscillator();
  const gain=S.audioCtx.createGain();
  osc.frequency.value=hz;osc.type='sine';
  gain.gain.value=0.2;
  osc.connect(gain);gain.connect(S.audioCtx.destination);
  S.analyser=S.audioCtx.createAnalyser();
  osc.connect(S.analyser);
  osc.start();
  showToast('TONE: '+hz+' Hz');log('Freq','Tone '+hz+'Hz');
  renderFreqBase();freqDraw();
}
function freqStop(){
  if(S.vizRaf){cancelAnimationFrame(S.vizRaf);S.vizRaf=null}
  if(S.audioCtx){S.audioCtx.close();S.audioCtx=null;S.analyser=null}
  freqPeakHz=0;renderFreqBase();
}
function freqPeak(){showToast(freqPeakHz>10?'PEAK: '+freqPeakHz.toFixed(1)+' Hz':'NO SIGNAL')}

/* ══════════════════════════════════
   SENSORS (Real DeviceMotion + Light)
══════════════════════════════════ */
function appSensors(){
  let sensorRaf;
  const loop=()=>{sensorRaf=requestAnimationFrame(loop);renderSensors()};
  loop();
  clearCtx();
  addBtn('PERM',   sensorRequestPerms,'cg');
  addBtn('LEVEL',  sensorLevel,'co');
  addBtn('SHAKE',  sensorTestShake,'');
  S._sensorRaf=sensorRaf;
  _H={};
}
function renderSensors(){
  const d=S.sensorData;
  const ax=d.ax.toFixed(1),ay=d.ay.toFixed(1),az=d.az.toFixed(1);
  const al=d.alpha.toFixed(0),be=d.beta.toFixed(0),ga=d.gamma.toFixed(0);
  const tilt=Math.round(Math.sqrt(d.beta**2+d.gamma**2));
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl hi">DEVICE SENSORS</div>
    <div class="hr"></div>
    <div class="sl">ACCEL X:${ax} Y:${ay} Z:${az}</div>
    <div class="sl">ORIENT α:${al} β:${be} γ:${ga}</div>
    <div class="sl">TILT: ${tilt}°</div>
    <div class="hr"></div>
    <div class="sl dim">LUX: ${d.lux!=null?d.lux+' lx':'N/A (ambient)'}</div>
    <div class="sl dim">PIXELS: ${window.devicePixelRatio}x DPR</div>
    <div class="sl dim">TOUCH: ${navigator.maxTouchPoints} points</div>
    <div class="sl dim">BATT: ${S.battery?Math.round(S.battery.level*100)+'%':'N/A'}</div>
  </div>`;
}
async function sensorRequestPerms(){
  if(typeof DeviceMotionEvent?.requestPermission==='function'){
    try{
      await DeviceMotionEvent.requestPermission();
      await DeviceOrientationEvent.requestPermission();
      showToast('SENSORS GRANTED!');
    }catch(e){showToast('PERMISSION DENIED')}
  } else {showToast('ALREADY ACTIVE')}
}
function sensorLevel(){
  const d=S.sensorData;
  const angle=Math.abs(d.beta)+Math.abs(d.gamma);
  const lvl=angle<5?'LEVEL ✓':angle<15?'SLIGHT TILT':'TILTED '+angle.toFixed(0)+'°';
  showToast(lvl);vib(angle<5?[30]:[10,5,10,5,10]);
}
let _shakeCount=0,_lastShake=0;
function sensorTestShake(){
  showToast('SHAKE YOUR PHONE!');
  const check=()=>{
    const now=Date.now();
    const d=S.sensorData;
    const mag=Math.abs(d.ax)+Math.abs(d.ay)+Math.abs(d.az);
    if(mag>25&&now-_lastShake>300){_shakeCount++;_lastShake=now;ledPulse('R',150);vib(15)}
    if(_shakeCount<5)setTimeout(check,50);
    else{showToast('SHAKE COUNT: '+_shakeCount);_shakeCount=0}
  };check();
}

/* ══════════════════════════════════
   BAD USB
══════════════════════════════════ */
function appBadUSB(){
  let pi=0;
  const render=()=>{
    scrBody.innerHTML=`<div class="fadein">
      <div class="sl dim">SELECT PAYLOAD:</div><div class="hr"></div>
      ${PAYLOADS.map((p,i)=>`<div class="mitem${i===pi?' sel':''}" onclick="badSel(${i})">
        <span class="ic">⌨</span><span style="flex:1">${p.n}</span></div>`).join('')}
      <div class="hr"></div><div class="sl dim" style="white-space:normal;line-height:1.5">${PAYLOADS[pi].d}</div>
    </div>`;
  };
  window.badSel=i=>{pi=i;render()};
  render();clearCtx();
  addBtn('RUN',    ()=>badRun(pi),'cr');
  addBtn('VIEW',   ()=>badView(pi),'');
  addBtn('SAVE',   ()=>badSave(pi),'cy');
  addBtn('CLIPBOARD',()=>badClipboard(pi),'co');
  _H={up:()=>{pi=Math.max(0,pi-1);render()},down:()=>{pi=Math.min(PAYLOADS.length-1,pi+1);render()},ok:()=>badRun(pi)};
}
function badRun(pi){
  const p=PAYLOADS[pi];
  log('BadUSB','Run: '+p.n);vib([100,50,100]);ledPulse('R',3000);
  const lines=p.code.split('\n');let li=0;
  scrBody.innerHTML=`<div class="fadein"><div class="sl red">▶ RUNNING: ${p.n}</div><div class="hr"></div><div id="bLines"></div><div class="sl blink">█</div></div>`;
  const t=setInterval(()=>{
    const el=document.getElementById('bLines');
    if(!el||li>=lines.length){clearInterval(t);showToast('PAYLOAD DONE!');return}
    el.innerHTML+=`<div class="sl dim" style="font-size:5px">${lines[li++]}</div>`;
    vib(5);
  },350);
}
function badView(pi){
  const p=PAYLOADS[pi];
  scrBody.innerHTML=`<div class="fadein"><div class="sl hi">${p.n}</div><div class="hr"></div>
  ${p.code.split('\n').map(l=>`<div class="sl dim" style="font-size:5px">${l}</div>`).join('')}</div>`;
}
function badSave(pi){
  const p=PAYLOADS[pi];
  const blob=new Blob([p.code],{type:'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=p.n.replace(/ /g,'_')+'.txt';a.click();
  showToast('SAVED: '+p.n);
}
function badClipboard(pi){
  const p=PAYLOADS[pi];
  navigator.clipboard?.writeText(p.code).then(()=>showToast('COPIED TO CLIPBOARD!')).catch(()=>showToast('COPY FAILED'));
}

/* ══════════════════════════════════
   LOG
══════════════════════════════════ */
function appLog(){
  let off=0;
  const render=()=>{
    scrBody.innerHTML=`<div class="fadein">
      <div class="sl dim">${S.log.length} ENTRIES · ↑↓ SCROLL</div><div class="hr"></div>
      ${S.log.slice(off,off+8).map(e=>`
        <div style="display:flex;gap:2px;line-height:1.6">
          <span style="font-family:var(--mo);font-size:5px;color:var(--fgd);flex-shrink:0">${e.ts}</span>
          <span style="font-family:var(--px);font-size:5px;color:var(--fghi);flex-shrink:0">[${e.cat}]</span>
          <span style="font-family:var(--px);font-size:5px;color:var(--fg);overflow:hidden">${e.msg}</span>
        </div>`).join('') || '<div class="sl dim">Log empty</div>'}
    </div>`;
  };
  render();clearCtx();
  addBtn('TOP',   ()=>{off=0;render()},'');
  addBtn('COPY',  ()=>navigator.clipboard?.writeText(S.log.map(e=>e.ts+' ['+e.cat+'] '+e.msg).join('\n')).then(()=>showToast('COPIED!')),'cy');
  addBtn('CLEAR', ()=>{S.log=[];off=0;render();showToast('LOG CLEARED')},'cr');
  _H={up:()=>{off=Math.max(0,off-1);render()},down:()=>{off=Math.min(Math.max(0,S.log.length-8),off+1);render()}};
}

/* ══════════════════════════════════
   SYSTEM INFO
══════════════════════════════════ */
function appSystem(){
  renderSystem();clearCtx();
  addBtn('REFRESH',  renderSystem,'cg');
  addBtn('DOWNLOAD', downloadAll, 'co');
  addBtn('INSTALL',  pwaInstall,  'cy');
  addBtn('SKETCH',   irSketch,    '');
  _H={ok:renderSystem};
}
function renderSystem(){
  const bat=S.battery?Math.round(S.battery.level*100)+'%'+(S.battery.charging?' ⚡':''):'N/A';
  const c=navigator.connection;
  const net=c?`${c.effectiveType} ${c.downlink||'?'}Mbps`:'N/A';
  const mem=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576)+'MB':'N/A';
  const ua=navigator.userAgent;
  const chrome=ua.match(/Chrome\/([\d.]+)/)?.[1]||'?';
  const os=ua.includes('Android')?'Android':ua.includes('iPhone')?'iOS':ua.includes('Win')?'Windows':'Other';
  scrBody.innerHTML=`<div class="fadein">
    <div class="sl hi">FLIPPER REMOTE v2.0</div>
    <div class="hr"></div>
    <div class="sl">BATT: ${bat}</div>
    <div class="sl">NET:  ${net}</div>
    <div class="sl">MEM:  ${mem}</div>
    <div class="sl">OS:   ${os}</div>
    <div class="sl dim">BR:  Chrome/${chrome.slice(0,5)}</div>
    <div class="sl dim">SCR: ${screen.width}×${screen.height}</div>
    <div class="hr"></div>
    <div class="sl dim">HTTPS: ${isHttps()?'YES (TV LIMIT)':'NO (FULL MODE)'}</div>
    <div class="sl dim">BT API: ${'bluetooth' in navigator?'YES':'NO'}</div>
    <div class="sl dim">NFC API: ${'NDEFReader' in window?'YES':'NO (Android)'}</div>
    <div class="sl dim">SERIAL: ${'serial' in navigator?'YES':'NO'}</div>
    <div class="sl dim">LOG: ${S.log.length} entries</div>
  </div>`;
}

async function downloadAll(){
  const files=['index.html','style.css','script.js'];
  for(const f of files){
    try{
      const r=await fetch(f);const blob=await r.blob();
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);a.download=f;
      a.click();await new Promise(r=>setTimeout(r,400));
    }catch(e){showToast('DOWNLOAD FAILED')}
  }
  showToast('3 FILES DOWNLOADED');
}

function pwaInstall(){
  if(window._pwaPrompt){window._pwaPrompt.prompt()}
  else{
    showModal(`<div class="mbox-title">INSTALL AS APP</div>
<div>iOS Safari:<br>Share > Add to Home Screen<br><br>
Android Chrome:<br>Menu > Add to Home Screen<br><br>
Or run locally for full TV control.</div>
<button class="mbox-btn hi" onclick="closeModal()">OK</button>`);
  }
}

function irSketch(){
  const code=`// FlipperRemote Arduino IR Sketch
// Connect IR LED to pin 9 via 100Ω resistor
#include <IRremote.h>
IRsend irsend;

// NEC codes (Samsung example)
const long IR_CODES[] = {
  0xE0E040BF, // POWER
  0xE0E0E01F, // VOL+
  0xE0E0D02F, // VOL-
  0xE0E0F00F, // MUTE
  0xE0E048B7, // CH+
  0xE0E008F7, // CH-
  0xE0E006F9, // UP
  0xE0E08679, // DOWN
  0xE0E0A659, // LEFT
  0xE0E046B9, // RIGHT
  0xE0E016E9, // ENTER
};
const String CMD_NAMES[] = {
  "POWER","VOLU","VOLD","MUTE","CHU","CHD","UP","DOWN","LEFT","RIGHT","OK"
};

void setup(){Serial.begin(9600);}
void loop(){
  if(Serial.available()){
    String cmd=Serial.readStringUntil('\\n');cmd.trim();
    for(int i=0;i<11;i++){
      if(cmd==CMD_NAMES[i]){
        irsend.sendNEC(IR_CODES[i],32);
        break;
      }
    }
  }
}`;
  const blob=new Blob([code],{type:'text/plain'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='FlipperRemote_IR.ino';a.click();
  showToast('SKETCH DOWNLOADED!');
}

/* ══════════════════════════════════
   MISC
══════════════════════════════════ */
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._pwaPrompt=e});
window.closeModal=closeModal;
window.downloadAll=downloadAll;
window.openApp=openApp;
window.renderBT=renderBT;
window.renderTVScan=renderTVScan;
window.tvSelect=tvSelect;
window.btSelIdx=btSelIdx;

// Swipe to go back
let _tsx=0;
document.addEventListener('touchstart',e=>{_tsx=e.touches[0].clientX},{passive:true});
document.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-_tsx;
  if(dx>60&&S.app!=='menu')goBack();
},{passive:true});
