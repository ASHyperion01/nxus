/* ================================================
   FLIPPER REMOTE v5.1  -  script.js
   Hardware tools. Orange / white / black theme.
================================================ */
'use strict';

/* ================================================
   PIXEL ART FLIPPER LOGO (20x12)
================================================ */
const PIXEL_LOGO = [
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],
  [1,1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1,1],
  [1,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0,0,1],
  [1,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0,0,1],
  [1,0,0,0,1,1,0,0,1,1,1,1,0,0,1,1,0,0,0,1],
  [1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,1],
  [0,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
];

/* ================================================
   FAKE DEVICE POOLS
================================================ */
const FAKE_WIFI = [
  'TELE2_HOME_5G','UPC1234567','Vodafone-A4B2','dlink-GUEST',
  'FRITZ!Box 7590','Telenet-B82A','ASUS_RT-AX88U','SKY12345',
  'VM123456-2G','AndroidAP_5G','iPhone-of-J','TP-LINK_3F20',
  'Netgear_EXT','ORBI99','HomeNetwork_HID','CoxWifi-Guest',
  'SSID_HIDDEN','[hidden]','DIRECT-roku-123','HP-Print-7E',
  'XFINITY_3B2F','BT-Hub6-AABC','Linksys00123','ATT-WIFI-4F',
  'Spectrum_7G2B','Starlink','MEO-WiFi-5G','NOS_WIFI_44A1',
];
const FAKE_BT = [
  'AirPods Pro','JBL Flip 6','Galaxy Buds2','WH-1000XM5',
  'Pixel Buds A','Bose QC45','Mi Band 7','Apple Watch S8',
  'Tile Mate','Logitech MX','Xbox Controller','PS5 DualSense',
  'Fitbit Charge5','Amazfit GTR','BeatsX','SOUNDPEATS T3',
  'Anker Q30','Jabra Elite85h','HP Officejet','Galaxy S23',
  'BT Keyboard','Magic Mouse','Redmi Note12','Garmin Fenix7',
];
const FAKE_TV = [
  {brand:'Samsung',ip:'192.168.1.101',model:'QN65QN900B'},
  {brand:'LG',    ip:'192.168.1.102',model:'OLED65C2'},
  {brand:'Sony',  ip:'192.168.1.104',model:'XR-55A80K'},
  {brand:'Philips',ip:'192.168.1.107',model:'55OLED807'},
  {brand:'TCL',   ip:'192.168.1.112',model:'55C835'},
  {brand:'Hisense',ip:'192.168.1.115',model:'65U8H'},
];

/* ================================================
   STATE
================================================ */
const S = {
  app:'menu', idx:0,
  samWs:null, samIp:'', samOk:false,
  lgWs:null,  lgIp:'',  lgOk:false, lgKey:'',
  sonyIp:'',  sonyPsk:'0000',
  btDevs:[], btSel:0, btGatt:null, btDev:null,
  nfcTag:null, nfcActive:false, nfcAbort:null,
  gpsPos:null, gpsTrack:[], gpsWatch:null,
  audioCtx:null, analyser:null, vRaf:null,
  port:null, portWriter:null,
  wakeLock:null, battery:null,
  log:[],
};

/* ================================================
   MENU
================================================ */
const MENU = [
  {id:'wifi_scan',   ic:'~', n:'NET INFO',         cat:'SCAN'},
  {id:'bt_scan',     ic:'*', n:'BT SCANNER',      cat:'SCAN'},
  {id:'tv_scan',     ic:'#', n:'TV SCANNER',      cat:'SCAN'},
  {id:'subghz',      ic:'=', n:'SUB-GHz',         cat:'SCAN'},
  {id:'nfc',         ic:'o', n:'NFC READ/WRITE',  cat:'SCAN'},
  {id:'samsung',     ic:'>', n:'SAMSUNG TV',      cat:'TV'},
  {id:'lg',          ic:'@', n:'LG TV',           cat:'TV'},
  {id:'sony',        ic:'+', n:'SONY TV',         cat:'TV'},
  {id:'ir',          ic:'-', n:'IR BLASTER',      cat:'TV'},
  {id:'bt_connect',  ic:'*', n:'BT CONNECT',      cat:'BT'},
  {id:'bt_pair',     ic:'*', n:'BT GATT BROWSER', cat:'BT'},
  {id:'serial_term', ic:'>', n:'SERIAL TERM',     cat:'TOOL'},
  {id:'flashlight',  ic:'o', n:'FLASHLIGHT',      cat:'TOOL'},
  {id:'sound',       ic:'~', n:'SOUND METER',     cat:'TOOL'},
  {id:'compass',     ic:'+', n:'COMPASS',         cat:'TOOL'},
  {id:'level',       ic:'=', n:'BUBBLE LEVEL',    cat:'TOOL'},
  {id:'qr',          ic:'#', n:'QR SCANNER',      cat:'TOOL'},
  {id:'cam',         ic:'o', n:'CAMERA',          cat:'TOOL'},
  {id:'morse',       ic:'.', n:'MORSE VIBRO',     cat:'TOOL'},
  {id:'speech',      ic:'>', n:'SPEECH TO TEXT',  cat:'TOOL'},
  {id:'ping',        ic:'o', n:'PING / NET INFO', cat:'TOOL'},
  {id:'gps',         ic:'+', n:'GPS TRACKER',     cat:'GPS'},
  {id:'fake_hack',   ic:'>', n:'RF SIM [DEMO]',   cat:'SYS'},
  {id:'wakelock',    ic:'o', n:'WAKE LOCK',       cat:'SYS'},
  {id:'system',      ic:'*', n:'SYSTEM',          cat:'SYS'},
  {id:'custom1',     ic:'1', n:'CUSTOM SCRIPT 1', cat:'CUSTOM'},
  {id:'custom2',     ic:'2', n:'CUSTOM SCRIPT 2', cat:'CUSTOM'},
];

const CAT_C = {
  SCAN:'var(--fl)', TV:'var(--fb)', BT:'var(--fl)',
  TOOL:'var(--fg)', GPS:'#FF9500',  SYS:'var(--fp)',
  CUSTOM:'#fff'
};

/* ================================================
   DOM  —  ALL captured inside window.onload (BUG FIX)
   Using getters so functions always get live refs
================================================ */
const $   = id => document.getElementById(id);
let scr, ctx, ir, toast, modal, mbox;
let _H = {};

function vib(p=12){try{navigator.vibrate(p)}catch(e){}}
function flashIR(){
  const d=$('ir');
  if(d){d.classList.add('on');setTimeout(()=>d.classList.remove('on'),300)}
}
function ln(c){$('led'+c)?.classList.add('on')}
function lo(c){$('led'+c)?.classList.remove('on')}
function lp(c,ms=400){ln(c);setTimeout(()=>lo(c),ms)}
let _tt;
function T(m){
  const t=$('toast');
  if(!t)return;
  t.textContent=m;t.classList.add('show');
  clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),2400);
}
function addLog(cat,msg){S.log.unshift({ts:new Date().toTimeString().slice(0,8),cat,msg});if(S.log.length>300)S.log.pop()}
function setTitle(t){const el=$('sbarTitle');if(el)el.textContent=t}
function clearCtx(){if(ctx)ctx.innerHTML=''}
function btn(lbl,fn,cls=''){
  if(!ctx)return;
  const b=document.createElement('button');
  b.className='cb '+(cls||'');
  b.textContent=lbl;
  b.onclick=()=>{vib();fn()};
  ctx.appendChild(b);
  return b;
}
function showModal(html){
  const m=$('modal'),mb=$('mbox');
  if(m&&mb){mb.innerHTML=html;m.classList.add('open')}
}
function closeModal(){$('modal')?.classList.remove('open')}
function isHttps(){return location.protocol==='https:'}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}

/* loading bar */
let _lt;
function startLoad(ms=500){
  const f=$('loadFill');if(!f)return;
  f.className='load-fill';f.style.width='0%';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    f.classList.add('go');f.style.width='100%';f.style.transitionDuration=ms+'ms';
  }));
  _lt=setTimeout(()=>{f.className='load-fill done';f.style.width='0%';f.style.transitionDuration='250ms'},ms+120);
}
function quickLoad(){startLoad(280)}

function rssiBar(pct){
  const bars=4,lit=Math.round(pct*bars);
  const heights=[4,7,10,14];
  return `<span class="rssi-bar">${Array.from({length:bars},(_,i)=>`<span style="height:${heights[i]}px" class="${i<lit?'on':''}"></span>`).join('')}</span>`;
}

/* ================================================
   BOOT  —  all DOM work happens after onload fires
================================================ */
window.onload = async () => {
  // FIX: capture all DOM refs here, after DOM is ready
  scr   = $('scr');
  ctx   = $('ctx');
  ir    = $('ir');
  toast = $('toast');
  modal = $('modal');
  mbox  = $('mbox');

  bindKeys();
  initBattery();
  initNet();
  initSensors();

  S.lgKey  = localStorage.getItem('lg_key') ||'';
  S.samIp  = localStorage.getItem('sam_ip') ||'';
  S.lgIp   = localStorage.getItem('lg_ip')  ||'';
  S.sonyIp = localStorage.getItem('sony_ip')||'';

  try{await bootSequence()}catch(e){console.warn('boot err',e)}
  renderMenu();
  addLog('SYS','Boot OK v5.1');
};

async function bootSequence(){
  startLoad(3600);

  // Phase 1: draw pixel logo pixel by pixel
  const rows=PIXEL_LOGO.length, cols=PIXEL_LOGO[0].length;
  const total=rows*cols;
  const litSet=new Set();

  scr.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;padding:6px">
      <div class="px-logo" id="pxg" style="gap:1.5px;max-width:160px">
        ${PIXEL_LOGO.flat().map((v,i)=>`<span id="pc${i}"></span>`).join('')}
      </div>
      <div id="bootTxt" class="sl d" style="text-align:center;font-size:5px;letter-spacing:.08em">INITIALIZING...</div>
    </div>`;

  await new Promise(res=>{
    let i=0;
    const step=()=>{
      if(i>=total){res();return}
      const r2=Math.floor(i/cols), c2=i%cols;
      if(PIXEL_LOGO[r2][c2]){
        litSet.add(i);
        const el=document.getElementById('pc'+i);
        if(el)el.className='on';
      }
      i++;
      if(i%4===0)requestAnimationFrame(step); else step();
    };
    step();
  });

  // Phase 2: braille ASCII art splash
  scr.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:4px 6px;gap:6px">
      <pre id="bArt" style="
        font-family:var(--mo);font-size:clamp(4px,1.1vw,5.5px);
        line-height:1.45;color:var(--fl);
        text-shadow:0 0 10px rgba(255,107,0,.4);
        text-align:center;margin:0;
        opacity:0;transition:opacity .35s;
        position:relative;z-index:2;white-space:pre;">      .-----..-------.
     / FLIPPER \\ ZERO  \\
    |  REMOTE    v5.1  |
     \\________________/
     [BT] [NFC] [RF] [IR]</pre>
      <div id="bSub" style="font-family:var(--px);font-size:4.5px;color:var(--fgd);
        opacity:0;transition:opacity .35s;letter-spacing:.12em;">INITIALIZING HARDWARE...</div>
    </div>`;
  await new Promise(r=>setTimeout(r,60));
  document.getElementById('bArt').style.opacity='1';
  document.getElementById('bSub').style.opacity='1';
  await new Promise(r=>setTimeout(r,900));

  // Phase 3: POST system check
  const lines=[
    {d:150,t:'FLIPPER REMOTE v5.1',         c:'#fff'},
    {d:100,t:'CPU: F-ZERO CORE @ 64MHz...OK'},
    {d:80, t:'RAM: 320KB SRAM..........OK'},
    {d:80, t:'FLASH: 1MB...............OK'},
    {d:75, t:'RF MODULE: CC1101........OK'},
    {d:75, t:'BLE: NRF52840............OK'},
    {d:75, t:'NFC: ST25R3916...........OK'},
    {d:75, t:'IR: 38KHz BLASTER........OK'},
    {d:75, t:'GPS: GNSS MODULE.........OK'},
    {d:150,t:'ALL SYSTEMS NOMINAL',         c:'#fff'},
    {d:260,t:'> READY',                     c:'var(--fl)'},
  ];

  scr.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:5px;padding:6px">
      <div class="px-logo" style="gap:1.5px;max-width:140px">
        ${PIXEL_LOGO.flat().map(v=>`<span ${v?'class="on"':''}></span>`).join('')}
      </div>
      <div id="postLines" style="width:100%;padding:0 4px;margin-top:4px"></div>
    </div>`;

  const pl=$('postLines');
  for(const l of lines){
    await new Promise(r=>setTimeout(r,l.d));
    const div=document.createElement('div');
    div.className='sl d fi';
    div.style.cssText=`font-family:var(--mo);font-size:5.5px;color:${l.c||(l.t.includes('OK')?'var(--fg)':'var(--fgd)')}`;
    div.textContent=l.t;
    pl.appendChild(div);
    pl.scrollTop=9999;
    if(l.t.includes('OK'))vib(4);
  }
  await new Promise(r=>setTimeout(r,400));
}

/* ================================================
   INIT HELPERS
================================================ */
async function initBattery(){
  try{
    if(navigator.getBattery){
      const b=await navigator.getBattery();
      S.battery=b;
      const u=()=>{const el=$('sBat');if(el)el.textContent=(b.charging?'CHG ':'')+Math.round(b.level*100)+'%'};
      u();b.onlevelchange=u;b.onchargingchange=u;
    }
  }catch(e){}
}
function initNet(){
  const c=navigator.connection;
  if(c){const el=$('sNet');if(el)el.textContent=c.effectiveType||'RF';c.onchange=()=>{const e=$('sNet');if(e)e.textContent=c.effectiveType||'RF'}}
}
let _sx={ax:0,ay:0,az:0,al:0,be:0,ga:0};
function initSensors(){
  window.addEventListener('devicemotion',e=>{const a=e.accelerationIncludingGravity;if(a){_sx.ax=+(a.x||0).toFixed(1);_sx.ay=+(a.y||0).toFixed(1);_sx.az=+(a.z||0).toFixed(1)}},{passive:true});
  window.addEventListener('deviceorientation',e=>{_sx.al=+(e.alpha||0).toFixed(0);_sx.be=+(e.beta||0).toFixed(0);_sx.ga=+(e.gamma||0).toFixed(0)},{passive:true});
}

/* ================================================
   NAVIGATION
================================================ */
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
  let tsx=0;
  document.addEventListener('touchstart',e=>{tsx=e.touches[0].clientX},{passive:true});
  document.addEventListener('touchend',e=>{if(e.changedTouches[0].clientX-tsx>60&&S.app!=='menu')goBack()},{passive:true});
}
function menuNav(d){S.idx=(S.idx+d+MENU.length)%MENU.length;renderMenu()}
function menuOK(){openApp(MENU[S.idx].id)}
function goBack(){stopApp();S.app='menu';renderMenu()}

function stopApp(){
  S.nfcActive=false;
  ['_subInt','_wifiInt','_btScanInt','_tvScanInt','_hackInt'].forEach(k=>{
    if(S[k]||window[k]){clearInterval(S[k]||window[k]);S[k]=null;window[k]=null}
  });
  if(S.gpsWatch){navigator.geolocation.clearWatch(S.gpsWatch);S.gpsWatch=null}
  if(S.vRaf){cancelAnimationFrame(S.vRaf);S.vRaf=null}
  if(S.audioCtx){S.audioCtx.close().catch(()=>{});S.audioCtx=null;S.analyser=null}
  if(S.nfcAbort){try{S.nfcAbort.abort()}catch(e){}S.nfcAbort=null}
  if(window._sRaf){cancelAnimationFrame(window._sRaf);window._sRaf=null}
  if(window._camStream){window._camStream.getTracks().forEach(t=>t.stop());window._camStream=null}
  if(window._qrStream){window._qrStream.getTracks().forEach(t=>t.stop());window._qrStream=null}
  if(window._qrInt){clearInterval(window._qrInt);window._qrInt=null}
  document.querySelector('.clr-screen')?.remove();
  _H={};
}

async function openApp(id){
  stopApp();S.app=id;
  const m=MENU.find(x=>x.id===id)||{n:id.toUpperCase()};
  setTitle(m.n);quickLoad();
  await new Promise(r=>setTimeout(r,80));
  const apps={
    wifi_scan:appWifiScan, bt_scan:appBtScan, tv_scan:appTvScan,
    subghz:appSubGHz,      nfc:appNFC,
    samsung:appSam,        lg:appLG,     sony:appSony,   ir:appIR,
    bt_connect:appBT,      bt_pair:appBTPair,
    serial_term:appSerialTerm,
    flashlight:appFlashlight, sound:appSound, compass:appCompass,
    level:appLevel,        qr:appQR,     cam:appCam,
    morse:appMorse,        speech:appSpeech, ping:appPing,
    gps:appGPS,
    fake_hack:appHack,     wakelock:appWake,  system:appSystem,
    custom1:()=>appCustom(1),
    custom2:()=>appCustom(2),
  };
  apps[id]?.();
}

/* ================================================
   MENU RENDER
================================================ */
function renderMenu(){
  stopApp();setTitle('FLIPPER REMOTE');clearCtx();
  _H={up:()=>menuNav(-1),dn:()=>menuNav(1),ok:menuOK};
  const vis=9, start=Math.max(0,Math.min(S.idx-4,MENU.length-vis));
  let h='<div class="fi sl2" style="height:100%">';
  let lastCat='';
  for(let i=start;i<Math.min(start+vis,MENU.length);i++){
    const m=MENU[i], sel=i===S.idx, col=CAT_C[m.cat]||'var(--fl)';
    if(m.cat!==lastCat&&!sel){
      h+=`<div style="font-family:var(--px);font-size:4px;color:var(--fgd);padding:2px 3px 0;letter-spacing:.06em">[${m.cat}]</div>`;
      lastCat=m.cat;
    }
    h+=`<div class="mi${sel?' s':''}" onclick="openApp('${m.id}')">
      <span class="ic" style="${sel?'':'color:'+col}">[${m.ic}]</span>
      <span style="margin-left:4px;flex:1">${m.n}</span>
      <span class="ar">${sel?'>':''}</span>
    </div>`;
  }
  h+=`<div class="hr" style="margin-top:3px"></div>
    <div class="sl d" style="text-align:center;font-size:4px">${S.idx+1} / ${MENU.length}</div>
  </div>`;
  if(scr)scr.innerHTML=h;
}

/* ================================================
   LOCAL IP
================================================ */
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
    setTimeout(()=>res(null),3500);
  });
}

/* ================================================
   1. WIFI / NETWORK INFO
   Browsers block WiFi scanning at the OS level —
   no API exists to enumerate nearby networks.
   We show everything the browser DOES expose:
   connection type, speed, RTT, local IP.
================================================ */
function appWifiScan(){
  let localIp='detecting...';let fetching=false;

  const render=()=>{
    const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    const online=navigator.onLine;
    const rows=[
      {k:'STATUS',    v:online?'[ONLINE]':'[OFFLINE]', hi:online},
      {k:'TYPE',      v:c?.type||'unknown'},
      {k:'EFF TYPE',  v:c?.effectiveType||'unknown'},
      {k:'DOWNLINK',  v:c?.downlink!=null?c.downlink+' Mbps':'unknown'},
      {k:'UPLINK',    v:c?.uplinkMax!=null?c.uplinkMax+' Mbps':'unknown'},
      {k:'RTT',       v:c?.rtt!=null?c.rtt+'ms':'unknown'},
      {k:'SAVE DATA', v:c?.saveData?'YES':'NO'},
      {k:'LOCAL IP',  v:localIp},
    ].map(r=>`<div style="display:flex;gap:4px;font-family:var(--mo);font-size:5px;line-height:1.7;position:relative;z-index:2;border-bottom:1px solid rgba(255,107,0,.06);padding:1px 2px">
      <span style="width:52px;color:var(--fgd);flex-shrink:0">${r.k}</span>
      <span style="color:${r.hi?'var(--fl)':'#fff'}">${r.v}</span>
    </div>`).join('');

    scr.innerHTML=`<div class="fi sl2" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl h">WIFI / NET INFO</span>
        <span class="sl d" style="font-size:4px">[LIVE DATA]</span>
      </div>
      <div class="hr"></div>
      ${rows}
      <div class="hr"></div>
      <div class="sl d" style="font-size:4px;white-space:normal;line-height:1.5">
        [!] Browsers block WiFi network enumeration at OS level. No API exists to list nearby SSIDs in any browser.
      </div>
    </div>`;
  };

  const fetchIp=async()=>{
    if(fetching)return;fetching=true;
    localIp='detecting...';render();
    const ip=await getLocalIP();
    localIp=ip||'unavailable';
    fetching=false;render();
  };

  render();fetchIp();clearCtx();

  btn('REFRESH',()=>{render();T('REFRESHED')},'cg');
  btn('GET IP',fetchIp,'co');
  btn('COPY',()=>{
    const c=navigator.connection||{};
    const txt=`Status: ${navigator.onLine?'online':'offline'}\nType: ${c.type||'?'}\nEffective: ${c.effectiveType||'?'}\nDownlink: ${c.downlink||'?'} Mbps\nRTT: ${c.rtt||'?'}ms\nLocal IP: ${localIp}`;
    navigator.clipboard?.writeText(txt).then(()=>T('COPIED!'));
  },'cy');

  // auto-refresh on connection change
  if(navigator.connection){
    navigator.connection.onchange=()=>render();
  }
  window.addEventListener('online',render,{once:false});
  window.addEventListener('offline',render,{once:false});

  _H={ok:()=>{render();fetchIp()}};
}

/* ================================================
   2. BT SCANNER  —  real Web Bluetooth
   Each SCAN call opens the browser BT picker.
   Devices accumulate in the list with real RSSI
   where available, or estimated from discovery.
================================================ */
function appBtScan(){
  let devs=[];

  const render=()=>{
    const rows=devs.map((d,i)=>`
      <div class="scan-row">
        <span style="width:14px;font-size:4.5px;color:var(--fg);font-family:var(--mo)">[B]</span>
        <span class="name" style="font-size:5.5px">${d.name}</span>
        <span class="extra" style="font-size:4px">${d.id.slice(0,8)}</span>
      </div>`).join('');
    scr.innerHTML=`<div class="fi sl2" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl h">BT SCANNER</span>
        <span class="sl d" style="font-size:4.5px">[REAL] ${devs.length}dev</span>
      </div>
      <div class="sl d" style="font-size:4px;margin-bottom:2px">Web BT — browser shows picker, tap device to add</div>
      <div class="hr"></div>
      ${rows||'<div class="sl d">> Press SCAN — real BT picker opens</div>'}
      ${devs.length?`<div class="hr"></div><div class="sl d" style="font-size:4px">[*] = connected via GATT</div>`:''}
    </div>`;
  };

  render();clearCtx();

  btn('SCAN',async()=>{
    if(!navigator.bluetooth){
      T('WEB BT NOT SUPPORTED');
      scr.innerHTML+=`<div class="sl r" style="margin-top:4px;font-size:4.5px">[!] Requires Chrome/Edge on Android or desktop. Not supported on iOS/Firefox.</div>`;
      return;
    }
    try{
      T('OPENING BT PICKER...');
      const dev=await navigator.bluetooth.requestDevice({
        acceptAllDevices:true,
        optionalServices:[
          'battery_service','heart_rate','generic_access',
          'generic_attribute','device_information'
        ]
      });
      const existing=devs.findIndex(d=>d.id===dev.id);
      if(existing===-1){
        devs.unshift({id:dev.id,name:dev.name||'Unknown Device',device:dev});
        lp('G',400);vib([30,10,30]);
        T('FOUND: '+(dev.name||'Unknown').slice(0,18));
        addLog('BT','Found: '+(dev.name||dev.id.slice(0,8)));
      } else {
        T('ALREADY IN LIST');
      }
      render();
    }catch(e){
      if(e.name==='NotFoundError')T('NO DEVICE SELECTED');
      else T('BT ERR: '+e.message.slice(0,18));
    }
  },'cg');

  btn('CONNECT',async()=>{
    if(!devs.length){T('SCAN FIRST');return}
    const d=devs[0];
    T('CONNECTING...');startLoad(4000);
    try{
      const gatt=await d.device.gatt.connect();
      T('CONNECTED: '+(d.name||'?').slice(0,16));
      vib([40,20,40]);lp('G',600);
      addLog('BT','GATT OK: '+d.name);
      // Store for use in BT CONNECT app
      S.btDev={...d,connected:true};S.btGatt=gatt;
      const existing=S.btDevs.findIndex(x=>x.id===d.id);
      if(existing===-1)S.btDevs.push({...d,connected:true,alias:null});
      else S.btDevs[existing].connected=true;
    }catch(e){T('GATT FAILED: '+e.message.slice(0,16))}
  },'co');

  btn('GO GATT',()=>{
    if(!devs.length){T('SCAN FIRST');return}
    openApp('bt_pair');
  },'cy');

  btn('CLEAR',()=>{devs=[];render()},'');
  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ================================================
   3. TV SCANNER
================================================ */
function appTvScan(){
  let tvs=[];let scanning=false;

  const render=()=>{
    const rows=tvs.map(t=>`
      <div class="scan-row">
        <span style="width:16px;font-size:4.5px;color:${t.real?'var(--fl)':'var(--fgd)'};font-family:var(--mo)">${t.real?'[!]':'[?]'}</span>
        <span class="name" style="font-size:5.5px">${t.brand} ${t.model}</span>
        <span class="extra">${t.ip}</span>
      </div>`).join('');
    scr.innerHTML=`<div class="fi" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl h">TV SCAN</span>
        <span class="sl d" style="font-size:4.5px">${scanning?'<span class="bl">[SCAN]</span>':'[IDLE]'}</span>
      </div>
      <div class="hr"></div>
      ${rows||'<div class="sl d">> SCAN finds Smart TVs on LAN</div>'}
    </div>`;
  };
  render();clearCtx();

  btn('SCAN LAN',async()=>{
    if(scanning)return;
    scanning=true;tvs=[];render();T('SCANNING LAN...');startLoad(6000);
    const pool=shuffle(FAKE_TV);
    pool.slice(0,rand(1,3)).forEach((tv,i)=>{
      setTimeout(()=>{tvs.push({...tv,real:false});render();vib(15);lp('O',200)},800+i*600);
    });
    const localIp=await getLocalIP();
    if(localIp){
      const subnet=localIp.split('.').slice(0,3).join('.');
      for(let i=1;i<100;i++){
        const ip=`${subnet}.${i}`;
        ['8001','3000'].forEach(port=>{
          const ws=new WebSocket(`ws://${ip}:${port}/`);
          const brand=port==='8001'?'Samsung':'LG';
          ws.onopen=()=>{
            ws.close();
            if(!tvs.find(t=>t.ip===ip)){
              tvs.push({brand,ip,model:'Smart TV',real:true});
              render();vib([20,10,20]);lp('G',400);
              addLog('TV','Found '+brand+' at '+ip);
            }
          };
          ws.onerror=()=>{};
          setTimeout(()=>{try{ws.close()}catch(e){}},800);
        });
        if(i%15===0)await new Promise(r=>setTimeout(r,100));
      }
    }
    setTimeout(()=>{scanning=false;render();T(tvs.length?tvs.length+' TV(S) FOUND!':'SCAN DONE')},6000);
  },'cg');
  btn('ADD IP',()=>{
    const ip=prompt('TV IP address:')?.trim();
    const brand=prompt('Brand (Samsung/LG/Sony):','Samsung')?.trim()||'Custom';
    if(ip){tvs.push({brand,ip,model:'Custom',real:true});render()}
  },'co');
  btn('CONNECT',()=>{
    const tv=tvs[0];if(!tv){T('SCAN FIRST');return}
    const id=tv.brand.toLowerCase();
    if(['samsung','lg','sony'].includes(id))openApp(id);
    else T('USE SAMSUNG/LG/SONY APPS');
  },'cy');
  btn('CLEAR',()=>{tvs=[];render()},'');
  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ================================================
   4. SUB-GHz
   NOTE: Browsers have zero access to radio hardware.
   Real Sub-GHz scanning requires physical RF chips
   (CC1101 etc). This is a SIMULATION / visualizer.
   Labeled clearly so there's no confusion.
================================================ */
const SUBF=[315.00,433.92,868.35,915.00];
function appSubGHz(){
  S._subSigs=S._subSigs||[];S._subOn=false;S._subIdx=S._subIdx||1;
  rSub();clearCtx();
  btn('SCAN',subScan,'cg');
  btn('STOP',subStop,'');
  btn('REPLAY',()=>{
    if(!S._subSigs?.length){T('NOTHING TO REPLAY');return}
    T('REPLAYING...');
    for(let i=0;i<8;i++)setTimeout(()=>{flashIR();vib(8)},i*100);
  },'co');
  btn('< FREQ',()=>{S._subIdx=(S._subIdx-1+SUBF.length)%SUBF.length;rSub()},'');
  btn('FREQ >',()=>{S._subIdx=(S._subIdx+1)%SUBF.length;rSub()},'');
  btn('CLEAR',()=>{S._subSigs=[];rSub()},'');
  _H={lt:()=>{S._subIdx=(S._subIdx-1+SUBF.length)%SUBF.length;rSub()},rt:()=>{S._subIdx=(S._subIdx+1)%SUBF.length;rSub()},ok:subScan};
}
function rSub(){
  const f=SUBF[S._subIdx||1].toFixed(2);
  const st=S._subOn?'<span class="bl">[SIM ACTIVE]</span>':'[IDLE]';
  const sigs=(S._subSigs||[]).slice(-6).reverse().map(s=>
    `<div class="scan-row"><span style="font-size:4.5px;color:var(--fgd);font-family:var(--mo);width:28px">${s.m}</span><span class="name">${s.f}MHz</span><span class="extra">${s.r}dBm</span></div>`
  ).join('');
  scr.innerHTML=`<div class="fi">
    <div class="sl h" style="font-size:9px;text-align:center;letter-spacing:2px">${f}</div>
    <div class="sl d" style="text-align:center;font-size:4.5px">< 315 / 433 / 868 / 915 ></div>
    <div class="sl" style="text-align:center;margin:2px 0">${st}</div>
    <div class="hr"></div>
    ${sigs||'<div class="sl d">No signals captured</div>'}
    <div class="hr"></div>
    <div class="sl d">TOTAL: ${(S._subSigs||[]).length}</div>
    <div class="hr"></div>
    <div class="sl r" style="font-size:4px;white-space:normal;line-height:1.5">[SIM] Browsers cannot access RF hardware. Real Sub-GHz requires CC1101 chip + firmware.</div>
  </div>`;
}
function subScan(){
  if(S._subOn)return;
  S._subOn=true;S._subSigs=[];rSub();
  const m=['ASK','FSK','OOK','2-FSK'];
  S._subInt=setInterval(()=>{
    if(!S._subOn)return;
    if(Math.random()>.42){
      S._subSigs.push({f:SUBF[S._subIdx||1].toFixed(2),r:-(25+rand(0,60)),m:m[rand(0,3)]});
      vib(5);lp('O',100);
    }
    rSub();
  },750);
}
function subStop(){S._subOn=false;if(S._subInt){clearInterval(S._subInt);S._subInt=null}rSub()}

/* ================================================
   5. NFC
================================================ */
function appNFC(){
  rNFC();clearCtx();
  btn('READ',nfcRead,'cg');
  btn('WRITE',nfcWrite,'co');
  btn('STOP',()=>{S.nfcActive=false;try{S.nfcAbort?.abort()}catch(e){}rNFC()},'');
  btn('COPY UID',()=>{if(!S.nfcTag)return;navigator.clipboard?.writeText(S.nfcTag.uid).then(()=>T('UID COPIED!'))},'cy');
  _H={ok:nfcRead};
}
function rNFC(){
  const t=S.nfcTag;
  scr.innerHTML=`<div class="fi">
    <div class="sl">${S.nfcActive?'<span class="bl">[NFC SCANNING...]</span>':'[READY]'}</div>
    <div class="hr"></div>
    ${t?`<div class="sl h">> TAG FOUND</div>
      <div class="sl">UID: ${t.uid}</div>
      <div class="sl d">TYPE: ${t.type}</div>
      <div style="white-space:normal;font-size:5px;line-height:1.5;word-break:break-all;position:relative;z-index:2;color:var(--fg);font-family:var(--px)">DATA: ${t.data.slice(0,60)}</div>`
    :'<div class="sl d">Hold NFC tag to device.</div><div class="sl d">(Android Chrome only)</div>'}
  </div>`;
  $('sNfc')?.classList.toggle('on',S.nfcActive||!!S.nfcTag);
}
async function nfcRead(){
  if(!('NDEFReader' in window)){T('NO NFC - Android Chrome req');return}
  try{
    S.nfcActive=true;rNFC();
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
      S.nfcTag={uid:serialNumber,type:type||'NDEF',data:data||'No data'};
      S.nfcActive=false;
      T('TAG READ!');vib([60,20,60]);lp('G',700);addLog('NFC','UID:'+serialNumber);rNFC();
    });
    r.addEventListener('readingerror',()=>{S.nfcActive=false;T('NFC READ ERROR');rNFC()});
  }catch(e){
    S.nfcActive=false;
    if(e.name!=='AbortError')T('NFC: '+e.message.slice(0,14));
    rNFC();
  }
}
async function nfcWrite(){
  if(!('NDEFReader' in window)){T('NO NFC');return}
  const msg=prompt('Text to write:');if(!msg)return;
  try{const r=new NDEFReader();await r.write({records:[{recordType:'text',data:msg}]});T('WRITTEN!');vib([40,20,40])}
  catch(e){T('WRITE: '+e.message.slice(0,14))}
}

/* ================================================
   6. SAMSUNG TV
================================================ */
const SAM={
  power:'KEY_POWER',vUp:'KEY_VOLUMEUP',vDn:'KEY_VOLUMEDOWN',
  mute:'KEY_MUTE',chUp:'KEY_CHANNELUP',chDn:'KEY_CHANNELDOWN',
  up:'KEY_UP',dn:'KEY_DOWN',lt:'KEY_LEFT',rt:'KEY_RIGHT',
  ok:'KEY_ENTER',back:'KEY_RETURN',home:'KEY_HOME',
  menu:'KEY_MENU',source:'KEY_SOURCE'
};
function appSam(){
  rSam();clearCtx();
  btn('CONNECT',samConnect,'cg');btn('POWER',()=>samKey('power'),'cr');
  btn('VOL+',()=>samKey('vUp'),'');btn('VOL-',()=>samKey('vDn'),'');
  btn('CH+',()=>samKey('chUp'),'');btn('CH-',()=>samKey('chDn'),'');
  btn('HOME',()=>samKey('home'),'co');btn('MUTE',()=>samKey('mute'),'cy');
  btn('SOURCE',()=>samKey('source'),'');
  _H={up:()=>samKey('up'),dn:()=>samKey('dn'),lt:()=>samKey('lt'),rt:()=>samKey('rt'),ok:()=>samKey('ok'),sU:()=>samKey('vUp'),sD:()=>samKey('vDn')};
}
function rSam(){
  scr.innerHTML=`<div class="fi">
    <div class="sl h">${S.samOk?'<span class="bl">[>]</span> '+S.samIp:'[>] '+(S.samIp||'NOT SET')}</div>
    <div class="sl">${S.samOk?'[CONNECTED]':'[DISCONNECTED]'}</div>
    <div class="hr"></div>
    <div class="sl d">Port 8001 - SmartThings WS</div>
    <div class="sl d">Requires HTTP (not HTTPS)</div>
    ${S.samOk?'<div class="sl y">[WS ACTIVE]</div>':'<div class="sl d">Enter TV IP to connect</div>'}
  </div>`;
}
async function samConnect(){
  const ip=(S.samIp||prompt('Samsung TV IP:'))?.trim();if(!ip)return;
  S.samIp=ip;localStorage.setItem('sam_ip',ip);
  if(isHttps()){T('NEEDS HTTP MODE');return}
  if(S.samWs){try{S.samWs.close()}catch(e){}}
  T('CONNECTING...');startLoad(3500);
  S.samWs=new WebSocket(`ws://${ip}:8001/api/v2/channels/samsung.remote.control?name=${btoa('FlipperRemote')}`);
  S.samWs.onopen=()=>{S.samOk=true;T('SAMSUNG CONNECTED!');addLog('Sam','OK '+ip);vib([40,20,40]);lp('G',600);rSam()};
  S.samWs.onclose=()=>{S.samOk=false;if(S.app==='samsung')rSam()};
  S.samWs.onerror=()=>{S.samOk=false;T('CONNECT FAILED');if(S.app==='samsung')rSam()};
}
function samKey(k){
  flashIR();vib(10);
  if(!S.samOk||S.samWs?.readyState!==1){T('NOT CONNECTED');return}
  S.samWs.send(JSON.stringify({method:'ms.remote.control',params:{Cmd:'Click',DataOfCmd:SAM[k],Option:'false',TypeOfRemote:'SendRemoteKey'}}));
}

/* ================================================
   7. LG TV
================================================ */
const LGU={
  off:'ssap://system/turnOff',vUp:'ssap://audio/volumeUp',
  vDn:'ssap://audio/volumeDown',chUp:'ssap://tv/channelUp',
  chDn:'ssap://tv/channelDown',toast:'ssap://system.notifications/createToast'
};
let lgId=0,lgCb={};
function appLG(){
  rLG();clearCtx();
  btn('CONNECT',lgConnect,'cg');btn('POWER OFF',()=>lgSend(LGU.off),'cr');
  btn('VOL+',()=>lgSend(LGU.vUp),'');btn('VOL-',()=>lgSend(LGU.vDn),'');
  btn('CH+',()=>lgSend(LGU.chUp),'');btn('CH-',()=>lgSend(LGU.chDn),'');
  btn('MSG',()=>lgSend(LGU.toast,{message:'FlipperRemote'}),'co');
  _H={up:()=>lgSend(LGU.vUp),dn:()=>lgSend(LGU.vDn),sU:()=>lgSend(LGU.vUp),sD:()=>lgSend(LGU.vDn)};
}
function rLG(){
  scr.innerHTML=`<div class="fi">
    <div class="sl h">${S.lgOk?'<span class="bl">[@]</span> '+S.lgIp:'[@] '+(S.lgIp||'NOT SET')}</div>
    <div class="sl">${S.lgOk?'[CONNECTED]':'[DISCONNECTED]'}</div>
    <div class="hr"></div>
    <div class="sl d">Port 3000 - WebOS WS</div>
    ${S.lgKey?`<div class="sl d">KEY: ...${S.lgKey.slice(-8)}</div>`:'<div class="sl d">Will pair on TV screen</div>'}
  </div>`;
}
async function lgConnect(){
  const ip=(S.lgIp||prompt('LG TV IP:'))?.trim();if(!ip)return;
  S.lgIp=ip;localStorage.setItem('lg_ip',ip);
  if(isHttps()){T('NEEDS HTTP');return}
  if(S.lgWs){try{S.lgWs.close()}catch(e){}}
  T('CONNECTING...');startLoad(3500);
  S.lgWs=new WebSocket(`ws://${ip}:3000/`);
  S.lgWs.onopen=()=>lgReg();
  S.lgWs.onclose=()=>{S.lgOk=false;if(S.app==='lg')rLG()};
  S.lgWs.onerror=()=>{S.lgOk=false;T('LG FAILED');if(S.app==='lg')rLG()};
  S.lgWs.onmessage=e=>{
    try{
      const d=JSON.parse(e.data);
      if(d.type==='registered'){
        S.lgOk=true;S.lgKey=d.payload?.['client-key']||S.lgKey;
        localStorage.setItem('lg_key',S.lgKey);
        T('LG CONNECTED!');vib([40,20,40]);lp('G',600);rLG();
      }
      if(d.id&&lgCb[d.id]){lgCb[d.id](d.payload);delete lgCb[d.id]}
    }catch(e){}
  };
}
function lgReg(){
  S.lgWs.send(JSON.stringify({type:'register',id:'reg0',payload:{forcePairing:false,pairingType:'PROMPT','client-key':S.lgKey||undefined,manifest:{manifestVersion:1,appVersion:'1.1',signed:{created:'20140509',appId:'com.flipperremote',vendorId:'flipper',localizedAppNames:{'':'FlipperRemote'},localizedVendorNames:{'':'FlipperRemote'},permissions:['CONTROL_POWER','CONTROL_AUDIO','TURN_OFF'],serial:'FR51'},permissions:['CONTROL_POWER','CONTROL_AUDIO','TURN_OFF'],signatures:[{signatureVersion:1,signature:'UNSIGNED'}]}}}));
}
function lgSend(uri,payload={},cb){
  if(!S.lgOk||!S.lgWs){T('LG NOT CONNECTED');return}
  const id='fr'+(++lgId);
  if(cb)lgCb[id]=cb;
  S.lgWs.send(JSON.stringify({type:'request',id,uri,payload}));
  flashIR();vib(10);
}

/* ================================================
   8. SONY TV
================================================ */
function appSony(){
  scr.innerHTML=`<div class="fi">
    <div class="sl h">[+] SONY BRAVIA</div>
    <div class="sl">IP: ${S.sonyIp||'not set'}</div>
    <div class="sl d">PSK: ${S.sonyPsk}</div>
    <div class="hr"></div>
    <div class="sl d">TV Settings > Remote Start ON</div>
    <div class="hr"></div>
    <div class="sl ${isHttps()?'r':'h'}">${isHttps()?'[!] Run via HTTP only':'[OK] HTTP MODE OK'}</div>
  </div>`;
  clearCtx();
  btn('POWER OFF',sonyOff,'cr');btn('POWER ON',sonyOn,'cg');
  btn('VOL+',()=>sonyA('setAudioVolume',{volume:'+1',target:'speaker'}),'');
  btn('VOL-',()=>sonyA('setAudioVolume',{volume:'-1',target:'speaker'}),'');
  btn('INFO',sonyInfo,'co');
  btn('SET IP',()=>{const ip=prompt('Sony IP:','')?.trim();if(ip){S.sonyIp=ip;localStorage.setItem('sony_ip',ip);openApp('sony')}},'');
  _H={sU:()=>sonyA('setAudioVolume',{volume:'+1'}),sD:()=>sonyA('setAudioVolume',{volume:'-1'})};
}
async function sonyReq(svc,method,params=[]){
  const ip=S.sonyIp||prompt('Sony IP:')?.trim();if(!ip)return null;S.sonyIp=ip;
  if(isHttps())return null;
  try{
    const r=await fetch(`http://${ip}/sony/${svc}`,{method:'POST',headers:{'Content-Type':'application/json','X-Auth-PSK':S.sonyPsk},body:JSON.stringify({method,id:1,params,version:'1.0'})});
    return await r.json();
  }catch(e){T('SONY ERR');return null}
}
async function sonyOff(){flashIR();vib(30);const d=await sonyReq('system','setPowerStatus',[{status:false}]);if(d&&!d.error)T('POWER OFF')}
async function sonyOn(){flashIR();vib(30);const d=await sonyReq('system','setPowerStatus',[{status:true}]);if(d&&!d.error)T('POWER ON')}
async function sonyA(m,p){flashIR();vib(10);await sonyReq('audio',m,[p])}
async function sonyInfo(){const d=await sonyReq('system','getSystemInformation',[]);if(d?.result?.[0])T((d.result[0].model||'Sony').slice(0,20))}

/* ================================================
   9. IR BLASTER
================================================ */
/* ================================================
   IR BLASTER
   Real NEC protocol hex codes per brand.
   Sends via Web Serial to Arduino running IRremote.
   Arduino sketch: read line from Serial, call
     IrSender.sendNEC(0xHEXCODE, 32);
   Pin 9 + 100ohm resistor + IR LED (940nm).

   Code format sent over serial: "NEC:XXXXXXXX"
   or named aliases like "POWER","VOLU" etc.
   Arduino maps these to brand-specific hex.
================================================ */

/* Real NEC hex codes. Format: address<<16 | command */
const IR_CODES = {
  samsung:{
    POWER:'0xE0E040BF', VOLU:'0xE0E0E01F', VOLD:'0xE0E0D02F',
    MUTE:'0xE0E0F00F', CHU:'0xE0E048B7',  CHDN:'0xE0E008F7',
    UP:'0xE0E006F9',   DOWN:'0xE0E08679', LEFT:'0xE0E0A659',
    RIGHT:'0xE0E046B9',OK:'0xE0E016E9',   BACK:'0xE0E01AE5',
    HOME:'0xE0E09768', MENU:'0xE0E058A7', SOURCE:'0xE0E0807F',
    NUM1:'0xE0E020DF', NUM2:'0xE0E0A05F', NUM3:'0xE0E0609F',
    NUM4:'0xE0E010EF', NUM5:'0xE0E0906F', NUM6:'0xE0E050AF',
    NUM7:'0xE0E030CF', NUM8:'0xE0E0B04F', NUM9:'0xE0E000FF',
    NUM0:'0xE0E034CB', INFO:'0xE0E0F20D', EXIT:'0xE0E0B44B',
  },
  lg:{
    POWER:'0x20DF10EF', VOLU:'0x20DF40BF',  VOLD:'0x20DFC03F',
    MUTE:'0x20DF906F',  CHU:'0x20DF00FF',   CHDN:'0x20DF807F',
    UP:'0x20DF02FD',    DOWN:'0x20DF827D',  LEFT:'0x20DFE01F',
    RIGHT:'0x20DF609F', OK:'0x20DF22DD',    BACK:'0x20DF14EB',
    HOME:'0x20DF3EC1',  MENU:'0x20DFC23D',  SOURCE:'0x20DFD02F',
    NUM1:'0x20DF8877',  NUM2:'0x20DF48B7',  NUM3:'0x20DFC837',
    NUM4:'0x20DF28D7',  NUM5:'0x20DFA857',  NUM6:'0x20DF6897',
    NUM7:'0x20DFE817',  NUM8:'0x20DF18E7',  NUM9:'0x20DF9867',
    NUM0:'0x20DF08F7',  INFO:'0x20DFF00F',  EXIT:'0x20DFDA25',
  },
  sony:{
    POWER:'0xA90',   VOLU:'0x490',   VOLD:'0xC90',
    MUTE:'0x290',    CHU:'0x090',    CHDN:'0x890',
    UP:'0x2F',       DOWN:'0xAF',    LEFT:'0x2CF',
    RIGHT:'0x6CF',   OK:'0xBCF',     BACK:'0x62F',
    HOME:'0x729',    MENU:'0x529',   SOURCE:'0xA50',
    NUM1:'0x010',    NUM2:'0x810',   NUM3:'0x410',
    NUM4:'0xC10',    NUM5:'0x210',   NUM6:'0xA10',
    NUM7:'0x610',    NUM8:'0xE10',   NUM9:'0x110',
    NUM0:'0x910',    INFO:'0x5CF',   EXIT:'0x1CF',
  },
  philips:{
    POWER:'0x170C',  VOLU:'0x1003',  VOLD:'0x1002',
    MUTE:'0x100D',   CHU:'0x100A',   CHDN:'0x100B',
    UP:'0x1058',     DOWN:'0x1059',  LEFT:'0x105A',
    RIGHT:'0x105B',  OK:'0x105C',    BACK:'0x1000',
    HOME:'0x1070',   MENU:'0x1071',  SOURCE:'0x1038',
    NUM1:'0x1001',   NUM2:'0x1002',  NUM3:'0x1003',
  },
  universal:{
    POWER:'0xFFFFFF01', VOLU:'0xFFFFFF02', VOLD:'0xFFFFFF03',
    MUTE:'0xFFFFFF04',  CHU:'0xFFFFFF05',  CHDN:'0xFFFFFF06',
  }
};

const IR_BRANDS = Object.keys(IR_CODES);
let _irBrand = localStorage.getItem('ir_brand')||'samsung';
let _irPage  = 'remote'; // 'remote' | 'numpad' | 'info'

function appIR(){
  _irBrand = localStorage.getItem('ir_brand')||'samsung';
  rIR();
}

function rIR(){
  const connected = !!S.portWriter;
  const brand     = _irBrand;
  const codes     = IR_CODES[brand];

  if(_irPage==='info'){
    scr.innerHTML=`<div class="fi sl2" style="height:100%">
      <div class="sl h">IR BLASTER — SETUP</div>
      <div class="hr"></div>
      <div class="sl d" style="white-space:normal;line-height:1.6;font-size:4.8px">
        1. Wire Arduino:<br>
        &nbsp;&nbsp;Pin 9 -> 100ohm -> IR LED (+)<br>
        &nbsp;&nbsp;IR LED (-) -> GND<br><br>
        2. Upload sketch (IRremote lib):<br>
        &nbsp;&nbsp;#include &lt;IRremote.hpp&gt;<br>
        &nbsp;&nbsp;void setup(){IrSender.begin(9);Serial.begin(9600);}<br>
        &nbsp;&nbsp;void loop(){<br>
        &nbsp;&nbsp;&nbsp;if(Serial.available()){<br>
        &nbsp;&nbsp;&nbsp;&nbsp;String s=Serial.readStringUntil('\\n');<br>
        &nbsp;&nbsp;&nbsp;&nbsp;s.trim();<br>
        &nbsp;&nbsp;&nbsp;&nbsp;if(s.startsWith("NEC:")){<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;long c=strtol(s.substring(4).c_str(),NULL,16);<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IrSender.sendNEC(c,32);<br>
        &nbsp;&nbsp;&nbsp;&nbsp;}<br>
        &nbsp;&nbsp;&nbsp;}<br>
        &nbsp;&nbsp;}<br><br>
        3. Connect at 9600 baud.
      </div>
      <div class="hr"></div>
      <div class="sl ${'serial' in navigator?'h':'r'}">${'serial' in navigator?'[OK] Web Serial ready':'[!] Chrome/Edge desktop only'}</div>
    </div>`;
    clearCtx();
    btn('BACK',()=>{_irPage='remote';rIR()},'cg');
    btn('CONNECT',irConnect,'co');
    return;
  }

  if(_irPage==='numpad'){
    const nums=['1','2','3','4','5','6','7','8','9','BACK','0','EXIT'];
    const cells=nums.map(n=>`
      <div onclick="irSendKey('NUM${n==='0'?'0':n==='BACK'?'':n==='EXIT'?'':n}','${n}')"
        style="background:#1a0800;border:1px solid #2a1000;border-radius:4px;
               padding:6px 2px;text-align:center;cursor:pointer;
               font-family:var(--px);font-size:6px;color:${connected?'var(--fl)':'#333'};
               position:relative;z-index:2">
        ${n}
      </div>`).join('');
    scr.innerHTML=`<div class="fi" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl h">NUMPAD</span>
        <span class="sl d" style="font-size:4px">${brand.toUpperCase()} ${connected?'<span style="color:var(--fl)">[LIVE]</span>':'[NO SERIAL]'}</span>
      </div>
      <div class="hr"></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:2px;position:relative;z-index:2">
        ${cells}
      </div>
    </div>`;
    clearCtx();
    btn('REMOTE',()=>{_irPage='remote';rIR()},'cg');
    btn('CONNECT',irConnect,'co');
    _H={ok:()=>irSendKey('NUM5','5')};
    return;
  }

  // Main remote view
  const mk=(label,key,col='')=>`
    <div onclick="irSendKey('${key}','${label}')"
      style="background:linear-gradient(180deg,#1a0800,#0d0400);
             border:1px solid ${connected?'#2a1000':'#111'};border-radius:4px;
             padding:5px 2px;text-align:center;cursor:pointer;
             font-family:var(--px);font-size:5px;
             color:${connected?(col||'var(--fl)'):'#2a1200'};
             position:relative;z-index:2;transition:filter .1s"
      onpointerdown="this.style.filter='brightness(.6)'"
      onpointerup="this.style.filter=''">${label}</div>`;

  scr.innerHTML=`<div class="fi" style="height:100%">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
      <span class="sl h" style="font-size:6px">${brand.toUpperCase()}</span>
      <span style="font-family:var(--mo);font-size:4.5px;color:${connected?'var(--fl)':'var(--fr)'}">${connected?'[SERIAL OK]':'[NO SERIAL]'}</span>
    </div>
    <div class="hr"></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;padding:1px;position:relative;z-index:2">
      ${mk('POWER','POWER','var(--fr)')}
      ${mk('MUTE','MUTE','var(--fp)')}
      ${mk('SOURCE','SOURCE','')}
      ${mk('INFO','INFO','')}

      ${mk('CH+','CHU','')}
      ${mk('CH-','CHDN','')}
      ${mk('VOL+','VOLU','')}
      ${mk('VOL-','VOLD','')}

      <div style="grid-column:span 4;display:grid;grid-template-columns:repeat(3,1fr);gap:3px">
        <div></div>${mk('UP','UP','')}   <div></div>
        ${mk('LEFT','LEFT','')}${mk('OK','OK','#fff')}${mk('RIGHT','RIGHT','')}
        <div></div>${mk('DOWN','DOWN','')}<div></div>
      </div>

      ${mk('BACK','BACK','')}
      ${mk('HOME','HOME','var(--fl)')}
      ${mk('MENU','MENU','')}
      ${mk('EXIT','EXIT','')}
    </div>
  </div>`;

  clearCtx();
  btn('CONNECT', irConnect, connected?'co':'cg');
  btn('NUMPAD',  ()=>{_irPage='numpad';rIR()}, '');
  btn('BRAND',   irCycleBrand, 'cy');
  btn('SETUP',   ()=>{_irPage='info';rIR()}, '');
  _H={
    up:()=>irSendKey('UP','UP'), dn:()=>irSendKey('DOWN','DOWN'),
    lt:()=>irSendKey('LEFT','LEFT'), rt:()=>irSendKey('RIGHT','RIGHT'),
    ok:()=>irSendKey('OK','OK'),
    sU:()=>irSendKey('VOLU','VOL+'), sD:()=>irSendKey('VOLD','VOL-')
  };
}

async function irConnect(){
  if(!('serial' in navigator)){T('CHROME/EDGE DESKTOP ONLY');return}
  if(S.portWriter){T('ALREADY CONNECTED');return}
  try{
    S.port=await navigator.serial.requestPort();
    await S.port.open({baudRate:9600});
    const enc=new TextEncoderStream();
    enc.readable.pipeTo(S.port.writable);
    S.portWriter=enc.writable.getWriter();
    T('IR SERIAL CONNECTED!');lp('G',600);vib([30,10,30]);rIR();
    addLog('IR','Serial connected');
  }catch(e){T('ERR: '+e.message.slice(0,18))}
}

function irCycleBrand(){
  const idx=(IR_BRANDS.indexOf(_irBrand)+1)%IR_BRANDS.length;
  _irBrand=IR_BRANDS[idx];
  localStorage.setItem('ir_brand',_irBrand);
  T('BRAND: '+_irBrand.toUpperCase());rIR();
}

async function irSendKey(key, label){
  flashIR();vib(12);
  const code = IR_CODES[_irBrand]?.[key];
  if(!code){T('[!] NO CODE: '+key+' / '+_irBrand);return}
  const line = 'NEC:'+code+'\n';
  if(S.portWriter){
    try{await S.portWriter.write(line);T('IR '+_irBrand.toUpperCase()+' > '+label)}
    catch(e){T('SEND FAILED: '+e.message.slice(0,14))}
  } else {
    // Fallback: show what would be sent
    T('[NO SERIAL] Would send: '+code.slice(0,12));
  }
}

/* keep old irSend alias for compatibility */
async function irSend(cmd){return irSendKey(cmd,cmd)}

/* ================================================
   10. BT CONNECT  —  full GATT control
   Pair, read device info, live notify, write chars
================================================ */
function appBT(){
  rBT();clearCtx();
  btn('PAIR',btScan,'cg');
  btn('INFO',btInfo,'co');
  btn('NOTIFY',btNotify,'cy');
  btn('WRITE',btWrite,'cb2');
  btn('DISC',btDisc,'cr');
  _H={
    up:()=>{S.btSel=Math.max(0,S.btSel-1);rBT()},
    dn:()=>{S.btSel=Math.min(S.btDevs.length-1,S.btSel+1);rBT()},
    ok:()=>{if(S.btDevs.length)btConn();else btScan()}
  };
}
function rBT(){
  const lst=S.btDevs.length
    ?S.btDevs.slice(0,6).map((d,i)=>{
        const sel=i===S.btSel;
        return `<div class="mi${sel?' s':''}" onclick="S.btSel=${i};rBT();btConn()">
          <span class="ic">[B]</span>
          <span style="flex:1;margin-left:3px;overflow:hidden;text-overflow:ellipsis">${(d.alias||d.name).slice(0,15)}</span>
          <span style="font-size:4px;font-family:var(--mo);margin-right:2px">${d.battery!=null?d.battery+'%':''}</span>
          ${d.connected?'<span class="bt-badge ok">ON</span>':'<span class="bt-badge">OFF</span>'}
        </div>`;
      }).join('')
    :'<div class="sl d">> Press PAIR to find device</div>';
  const conn=S.btGatt?.connected;
  const st=S.btDev
    ?`<div class="sl h" style="font-size:6px"><span class="${conn?'bl':''}">[B]</span> ${(S.btDev.alias||S.btDev.name).slice(0,16)}</div>
       <div class="sl d">GATT: ${conn?'<span style=\'color:var(--fl)\'>OPEN</span>':'CLOSED'}</div>
       ${S.btDev.battery!=null?`<div class="sl d">BATT: ${S.btDev.battery}%</div>`:''}
       ${S.btDev.model?`<div class="sl d">MDL: ${S.btDev.model}</div>`:''}
       ${S.btDev.mfr?`<div class="sl d">MFR: ${S.btDev.mfr}</div>`:''}`
    :'<div class="sl d">No device paired</div>';
  scr.innerHTML=`<div class="fi sl2" style="height:100%">
    ${st}<div class="hr"></div>${lst}
    ${(S._btNotifyLog||[]).length?`<div class="hr"></div><div style="font-family:var(--mo);font-size:4.5px;color:var(--fl);position:relative;z-index:2">${(S._btNotifyLog||[]).slice(-3).map(l=>`<div>${l}</div>`).join('')}</div>`:''}
  </div>`;
  $('sBt')?.classList.toggle('on',!!conn);
}
async function btScan(){
  if(!navigator.bluetooth){T('WEB BT NOT SUPPORTED');return}
  try{
    T('OPENING BT PICKER...');
    const dev=await navigator.bluetooth.requestDevice({
      acceptAllDevices:true,
      optionalServices:['battery_service','heart_rate','generic_access','generic_attribute','device_information',
        '0000180a-0000-1000-8000-00805f9b34fb','0000180f-0000-1000-8000-00805f9b34fb']
    });
    const existing=S.btDevs.findIndex(d=>d.id===dev.id);
    const entry={id:dev.id,name:dev.name||'Unknown',alias:null,device:dev,connected:false,battery:null,model:null,mfr:null};
    if(existing===-1){S.btDevs.push(entry);S.btSel=S.btDevs.length-1}
    else{S.btDevs[existing].device=dev;S.btSel=existing}
    dev.addEventListener('gattserverdisconnected',()=>{
      const idx=S.btDevs.findIndex(d=>d.id===dev.id);
      if(idx!==-1)S.btDevs[idx].connected=false;
      if(S.btDev?.id===dev.id){S.btGatt=null;lp('R',600)}
      S._btNotifyLog=[];
      if(S.app==='bt_connect')rBT();
      T('BT DISCONNECTED');
    });
    T('FOUND: '+(dev.name||'?').slice(0,16));vib([30,10,30]);lp('G',400);rBT();
    await btConn();
  }catch(e){if(e.name!=='NotFoundError')T('BT: '+e.message.slice(0,18))}
}
async function btConn(){
  const d=S.btDevs[S.btSel];
  if(!d){T('PAIR A DEVICE FIRST');return}
  if(S.btGatt?.connected&&S.btDev?.id===d.id){T('ALREADY CONNECTED');return}
  T('CONNECTING...');startLoad(4000);
  try{
    S.btGatt=await d.device.gatt.connect();
    S.btDev=d;d.connected=true;
    T('CONNECTED!');vib([40,20,40]);lp('G',600);addLog('BT','Connected: '+d.name);
    rBT();btBattSilent();
  }catch(e){T('GATT FAILED: '+e.message.slice(0,16));d.connected=false;rBT()}
}
async function btBattSilent(){
  if(!S.btGatt?.connected)return;
  try{
    const svc=await S.btGatt.getPrimaryService('battery_service');
    const chr=await svc.getCharacteristic('battery_level');
    const v=await chr.readValue();
    const pct=v.getUint8(0);
    if(S.btDev)S.btDev.battery=pct;
    const idx=S.btDevs.findIndex(d=>d.id===S.btDev?.id);
    if(idx!==-1)S.btDevs[idx].battery=pct;
    rBT();
    if(chr.properties.notify){
      await chr.startNotifications();
      chr.addEventListener('characteristicvaluechanged',e=>{
        const p=e.target.value.getUint8(0);
        if(S.btDev)S.btDev.battery=p;
        const i=S.btDevs.findIndex(d=>d.id===S.btDev?.id);
        if(i!==-1)S.btDevs[i].battery=p;
        rBT();
      });
    }
  }catch(e){}
}
async function btInfo(){
  if(!S.btGatt?.connected){if(S.btDevs.length){await btConn();if(!S.btGatt?.connected)return}else{T('PAIR FIRST');return}}
  T('READING DEVICE INFO...');startLoad(3000);
  const info={};
  const charMap={'00002a29-0000-1000-8000-00805f9b34fb':'manufacturer','00002a24-0000-1000-8000-00805f9b34fb':'model',
    '00002a25-0000-1000-8000-00805f9b34fb':'serial','00002a27-0000-1000-8000-00805f9b34fb':'hw_rev',
    '00002a26-0000-1000-8000-00805f9b34fb':'fw_rev','00002a28-0000-1000-8000-00805f9b34fb':'sw_rev'};
  try{
    const svc=await S.btGatt.getPrimaryService('device_information');
    const chrs=await svc.getCharacteristics();
    for(const chr of chrs){
      const key=charMap[chr.uuid]||chr.uuid.slice(4,8);
      try{const v=await chr.readValue();info[key]=new TextDecoder().decode(v).replace(/[^\x20-\x7E]/g,'').trim()||'(empty)'}catch(e){}
    }
  }catch(e){info.note='device_information svc not found'}
  try{
    const bs=await S.btGatt.getPrimaryService('battery_service');
    const bc=await bs.getCharacteristic('battery_level');
    const bv=await bc.readValue();info.battery=bv.getUint8(0)+'%';
    if(S.btDev)S.btDev.battery=bv.getUint8(0);
  }catch(e){}
  if(S.btDev){if(info.model)S.btDev.model=info.model.slice(0,16);if(info.manufacturer)S.btDev.mfr=info.manufacturer.slice(0,16)}
  const rows=Object.entries(info).map(([k,v])=>`<div style="display:flex;gap:4px;font-family:var(--mo);font-size:4.8px;line-height:1.7;position:relative;z-index:2;border-bottom:1px solid rgba(255,107,0,.06)"><span style="width:56px;color:var(--fgd);flex-shrink:0">${k.toUpperCase()}</span><span style="color:#fff;overflow:hidden;text-overflow:ellipsis">${String(v).slice(0,28)}</span></div>`).join('');
  scr.innerHTML=`<div class="fi sl2" style="height:100%"><div class="sl h">DEVICE INFO</div><div class="sl d">${S.btDev?.name||'Unknown'}</div><div class="hr"></div>${rows||'<div class="sl d">No info available</div>'}</div>`;
  clearCtx();btn('BACK',()=>{rBT();clearCtx();appBT()},'cg');btn('RENAME',btRename,'cy');T('INFO READ');
}
async function btNotify(){
  if(!S.btGatt?.connected){T('CONNECT FIRST');return}
  S._btNotifyLog=S._btNotifyLog||[];
  T('FINDING NOTIFY CHARS...');startLoad(3000);
  const notifiables=[];
  try{
    const svcs=await S.btGatt.getPrimaryServices();
    for(const svc of svcs){try{const chrs=await svc.getCharacteristics();for(const chr of chrs){if(chr.properties.notify||chr.properties.indicate)notifiables.push({svc:svc.uuid.slice(4,8),chr,uuid:chr.uuid})}}catch(e){}}
  }catch(e){T('ERR: '+e.message.slice(0,16));return}
  if(!notifiables.length){T('NO NOTIFY CHARS FOUND');return}
  let subCount=0;
  for(const n of notifiables){
    try{
      await n.chr.startNotifications();
      n.chr.addEventListener('characteristicvaluechanged',e=>{
        const bytes=Array.from(new Uint8Array(e.target.value.buffer));
        const hex=bytes.map(b=>b.toString(16).padStart(2,'0')).join(' ');
        const ascii=bytes.map(b=>b>=32&&b<127?String.fromCharCode(b):'.').join('');
        const line=`[${n.svc}:${n.uuid.slice(4,8)}] ${hex.slice(0,18)} ${ascii.slice(0,8)}`;
        S._btNotifyLog.push(line);if(S._btNotifyLog.length>20)S._btNotifyLog.shift();
        if(S.app==='bt_connect'){const el=$('notifyOut');if(el){el.innerHTML=S._btNotifyLog.slice(-12).map(l=>`<div>${l}</div>`).join('');el.scrollTop=9999}}
        lp('G',60);
      });
      subCount++;
    }catch(e){}
  }
  scr.innerHTML=`<div class="fi sl2" style="height:100%"><div class="sl h">LIVE NOTIFY</div><div class="sl d">Subscribed: ${subCount}/${notifiables.length} chars</div><div class="hr"></div><div id="notifyOut" style="font-family:var(--mo);font-size:4.5px;color:var(--fg);line-height:1.6;position:relative;z-index:2">${(S._btNotifyLog||[]).slice(-12).map(l=>`<div>${l}</div>`).join('')||'<div style="color:var(--fgd)">Waiting for data...</div>'}</div></div>`;
  clearCtx();btn('BACK',()=>{rBT();clearCtx();appBT()},'cg');btn('CLEAR',()=>{S._btNotifyLog=[];T('CLEARED')},'');
  T('SUBSCRIBED TO '+subCount+' CHARS');
}
async function btWrite(){
  if(!S.btGatt?.connected){T('CONNECT FIRST');return}
  T('FINDING WRITABLE CHARS...');startLoad(2000);
  const writables=[];
  try{
    const svcs=await S.btGatt.getPrimaryServices();
    for(const svc of svcs){try{const chrs=await svc.getCharacteristics();for(const chr of chrs){if(chr.properties.write||chr.properties.writeWithoutResponse)writables.push({svc:svc.uuid.slice(4,8),chr,uuid:chr.uuid})}}catch(e){}}
  }catch(e){T('ERR: '+e.message.slice(0,16));return}
  if(!writables.length){T('NO WRITABLE CHARS');return}
  const rows=writables.map((w,i)=>`<div class="mi" onclick="window._btWriteTo(${i})"><span class="ic">[W]</span><span style="flex:1;margin-left:3px;font-family:var(--mo);font-size:5px">${w.svc}:${w.uuid.slice(4,8)}..</span></div>`).join('');
  scr.innerHTML=`<div class="fi sl2" style="height:100%"><div class="sl h">WRITE CHAR</div><div class="sl d">${writables.length} writable — tap to write hex</div><div class="hr"></div>${rows}</div>`;
  window._btWriteTo=async(i)=>{
    const w=writables[i];const hex=prompt('Hex bytes (e.g. 01 FF A3):');if(!hex)return;
    try{
      const bytes=hex.trim().split(/\s+/).map(h=>parseInt(h,16)).filter(b=>!isNaN(b));
      if(!bytes.length){T('INVALID HEX');return}
      await w.chr.writeValue(new Uint8Array(bytes));
      T('WRITTEN: '+bytes.map(b=>b.toString(16).padStart(2,'0')).join(' '));
      vib([20,10,20]);lp('G',300);
    }catch(e){T('WRITE FAILED: '+e.message.slice(0,16))}
  };
  clearCtx();btn('BACK',()=>{rBT();clearCtx();appBT()},'cg');
}
function btRename(){
  const d=S.btDev||S.btDevs[S.btSel];if(!d){T('NO DEVICE');return}
  const name=prompt('Alias for device:',d.alias||d.name||'');
  if(name!==null){d.alias=name||null;const idx=S.btDevs.findIndex(x=>x.id===d.id);if(idx!==-1)S.btDevs[idx].alias=d.alias;T('RENAMED');rBT()}
}
function btDisc(){
  if(window._btNotifyRaf){cancelAnimationFrame(window._btNotifyRaf);window._btNotifyRaf=null}
  try{S.btGatt?.disconnect()}catch(e){}
  if(S.btDev){const idx=S.btDevs.findIndex(d=>d.id===S.btDev.id);if(idx!==-1)S.btDevs[idx].connected=false}
  S.btDev=null;S.btGatt=null;S._btNotifyLog=[];rBT();T('DISCONNECTED');
}

/* ================================================
   11. BT GATT BROWSER
================================================ */
function appBTPair(){
  let services=[];let connected=false;let devName='';let gatt=null;

  const render=()=>{
    const svcRows=services.map(svc=>{
      const chrRows=svc.chars.map(c=>`
        <div style="padding:1px 3px 1px 10px;font-family:var(--mo);font-size:4.5px;color:#888;position:relative;z-index:2">
          CHR: ${c.uuid.slice(0,8)}..
          <span style="color:#FF9500;margin-left:3px">${c.props.join(' ')}</span>
          ${c.value?`<div style="color:#FF9500;font-size:4px;padding-left:4px">= ${c.value.slice(0,32)}</div>`:''}
        </div>`).join('');
      return `<div class="gatt-row svc">SVC: ${svc.uuid.slice(0,8)}.. (${svc.chars.length} chr)</div>${chrRows}`;
    }).join('');
    scr.innerHTML=`<div class="fi sl2" style="height:100%">
      <div style="display:flex;justify-content:space-between">
        <span class="sl h">BT GATT BROWSER</span>
        <span class="sl d" style="font-size:4.5px">${connected?'<span class="bl">[ON]</span>':'[OFF]'}</span>
      </div>
      <div class="sl d">${devName||'No device'}</div>
      <div class="hr"></div>
      ${services.length?svcRows:'<div class="sl d">> Connect to browse GATT</div><div class="sl d">> Reads all characteristics</div>'}
    </div>`;
  };
  render();clearCtx();

  btn('PAIR',async()=>{
    if(!navigator.bluetooth){T('WEB BT NOT SUPPORTED');return}
    T('REQUESTING...');
    try{
      const dev=await navigator.bluetooth.requestDevice({
        acceptAllDevices:true,
        optionalServices:['battery_service','heart_rate','generic_access','generic_attribute','device_information','0000180a-0000-1000-8000-00805f9b34fb','0000180f-0000-1000-8000-00805f9b34fb']
      });
      devName=dev.name||'Unknown';
      T('CONNECTING GATT...');startLoad(5000);
      gatt=await dev.gatt.connect();connected=true;services=[];
      lp('G',600);vib([40,20,40]);addLog('BT','GATT: '+devName);
      const rawSvcs=await gatt.getPrimaryServices();
      for(const svc of rawSvcs){
        const chars=[];
        try{
          const rawChrs=await svc.getCharacteristics();
          for(const chr of rawChrs){
            const props=[];
            if(chr.properties.read)props.push('R');
            if(chr.properties.write)props.push('W');
            if(chr.properties.notify)props.push('N');
            if(chr.properties.indicate)props.push('I');
            let value='';
            if(chr.properties.read){try{const v=await chr.readValue();value=Array.from(new Uint8Array(v.buffer)).map(b=>b.toString(16).padStart(2,'0')).join(' ')}catch(e){}}
            chars.push({uuid:chr.uuid,props,value});
          }
        }catch(e){}
        services.push({uuid:svc.uuid,chars});
      }
      T('GATT OK - '+services.length+' SVC');render();
      dev.addEventListener('gattserverdisconnected',()=>{connected=false;gatt=null;T('BT DISCONNECTED');render()});
    }catch(e){connected=false;if(e.name!=='NotFoundError')T('ERR: '+e.message.slice(0,18));render()}
  },'cg');
  btn('DISC',()=>{try{gatt?.disconnect()}catch(e){}connected=false;gatt=null;services=[];devName='';render();T('DISCONNECTED')},'cr');
  btn('EXPORT',()=>{
    if(!services.length){T('NOTHING TO EXPORT');return}
    const out=services.map(s=>`SVC: ${s.uuid}\n`+s.chars.map(c=>`  CHR: ${c.uuid} [${c.props.join('')}]${c.value?' = '+c.value:''}`).join('\n')).join('\n\n');
    navigator.clipboard?.writeText(out).then(()=>T('GATT DATA COPIED!'));
  },'co');
  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ================================================
   12. SERIAL TERMINAL
================================================ */
function appSerialTerm(){
  let writer=null;let lines=[];
  const append=txt=>{lines.push(txt);if(lines.length>30)lines.shift();renderLines()};
  const renderLines=()=>{
    const el=$('stOut');
    if(el){el.innerHTML=lines.map(l=>`<div class="term">${l}</div>`).join('');el.scrollTop=9999}
  };
  scr.innerHTML=`<div class="fi" style="height:100%">
    <div style="display:flex;justify-content:space-between">
      <span class="sl h">SERIAL TERM</span>
      <span class="sl d" style="font-size:4.5px" id="stSt">[DISC]</span>
    </div>
    <div class="hr"></div>
    <div id="stOut" style="flex:1;overflow-y:auto;height:calc(100% - 32px);padding:2px 0;scrollbar-width:none"></div>
  </div>`;
  clearCtx();
  btn('CONNECT',async()=>{
    if(!('serial' in navigator)){T('CHROME DESKTOP ONLY');return}
    try{
      const port=await navigator.serial.requestPort();
      const baud=parseInt(prompt('Baud rate:','115200')||'115200');
      await port.open({baudRate:baud});S.port=port;
      const st=$('stSt');if(st)st.textContent='['+baud+']';
      const enc=new TextEncoderStream();enc.readable.pipeTo(port.writable);
      writer=enc.writable.getWriter();S.portWriter=writer;
      const reader=port.readable.getReader();
      const dec=new TextDecoder();let buf='';
      (async()=>{try{while(true){const{value,done}=await reader.read();if(done)break;buf+=dec.decode(value);const parts=buf.split('\n');buf=parts.pop();parts.forEach(l=>append(l))}}catch(e){}})();
      T('CONNECTED @ '+baud);lp('G',600);append('> connected @ '+baud+' baud');
    }catch(e){T('ERR: '+e.message.slice(0,18))}
  },'cg');
  btn('SEND',async()=>{
    if(!writer){T('CONNECT FIRST');return}
    const msg=prompt('Send string:');if(!msg)return;
    try{await writer.write(msg+'\r\n');append('< '+msg);lp('O',150)}catch(e){T('WRITE ERR')}
  },'co');
  btn('BLINK',async()=>{
    if(!writer){T('CONNECT FIRST');return}
    for(let i=0;i<5;i++){await new Promise(r=>setTimeout(r,200));await writer.write('BLINK\r\n').catch(()=>{})}
    T('BLINK SENT x5');
  },'cy');
  btn('CLEAR',()=>{lines=[];renderLines()},'');
  btn('DISC',async()=>{
    try{if(S.port){await S.port.close();S.port=null}}catch(e){}
    writer=null;S.portWriter=null;
    const st=$('stSt');if(st)st.textContent='[DISC]';
    append('> disconnected');T('DISCONNECTED');
  },'cr');
  _H={ok:()=>document.querySelector('.cb.co')?.click()};
}

/* ================================================
   13. FLASHLIGHT
================================================ */
function appFlashlight(){
  let torchOn=false,screenOn=false,strobeInt=null,_ftStream=null;
  const render=()=>{
    scr.innerHTML=`<div class="fi" style="text-align:center">
      <div class="sl h">FLASHLIGHT</div>
      <div class="hr"></div>
      <div class="sl d">TORCH: ${torchOn?'<span style="color:var(--fl)">[ON]</span>':'[OFF]'}</div>
      <div class="sl d">SCREEN: ${screenOn?'<span style="color:var(--fl)">[WHITE]</span>':'[OFF]'}</div>
    </div>`;
  };
  render();clearCtx();
  btn('TORCH',async()=>{
    try{
      if(!_ftStream){_ftStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});window._camStream=_ftStream}
      const track=_ftStream.getVideoTracks()[0];
      const caps=track.getCapabilities();
      if(!caps.torch){T('NO TORCH ON THIS DEVICE');return}
      torchOn=!torchOn;
      await track.applyConstraints({advanced:[{torch:torchOn}]});
      lp(torchOn?'O':'G',300);render();T('TORCH '+(torchOn?'ON':'OFF'));
    }catch(e){T('CAM ERR: '+e.message.slice(0,14))}
  },'cy');
  btn('SCREEN',()=>{
    if(strobeInt){clearInterval(strobeInt);strobeInt=null}
    screenOn=!screenOn;
    const existing=document.querySelector('.clr-screen');
    if(screenOn){
      const ov=document.createElement('div');ov.className='clr-screen';ov.style.background='#ffffff';ov.style.color='#000';
      ov.innerHTML='<span style="font-family:var(--px);font-size:8px">TAP TO CLOSE</span>';
      ov.onclick=()=>{ov.remove();screenOn=false;render()};
      document.querySelector('.screen').appendChild(ov);
    }else{existing?.remove()}
    render();
  },'cg');
  btn('STROBE',()=>{
    if(strobeInt){clearInterval(strobeInt);strobeInt=null;document.querySelector('.clr-screen')?.remove();T('STROBE OFF');render();return}
    const s=document.querySelector('.screen');let on=false;
    strobeInt=setInterval(()=>{document.querySelector('.clr-screen')?.remove();if(on){const ov=document.createElement('div');ov.className='clr-screen';ov.style.background='#ffffff';s.appendChild(ov)}on=!on;vib(4)},80);
    T('STROBE ON!');
  },'cp');
  btn('SOS',()=>{
    const morse=[3,1,3,1,3,2,1,1,1,1,1,1,3,1,3,1,3];let i=0;
    const s=document.querySelector('.screen');
    const next=()=>{if(i>=morse.length){i=0;setTimeout(next,800);return}const d=morse[i]*150;const ov=document.createElement('div');ov.className='clr-screen';ov.style.background='#FF2233';s.appendChild(ov);vib(d);setTimeout(()=>{ov.remove();i++;setTimeout(next,80)},d)};
    document.querySelector('.clr-screen')?.remove();next();T('SOS SIGNAL');
  },'cr');
}

/* ================================================
   14. SOUND METER
================================================ */
function appSound(){
  scr.innerHTML=`<div class="fi">
    <div class="sl h">SOUND METER</div>
    <div class="hr"></div>
    <canvas id="sCvs" class="vz"></canvas>
    <div class="sl d" id="sDb">LEVEL: ---</div>
    <div class="sl d" id="sPk">PEAK:  ---</div>
    <div id="sRank" class="sl" style="text-align:center;margin-top:3px"></div>
  </div>`;
  clearCtx();
  btn('START',soundStart,'cg');btn('STOP',soundStop,'cr');
  btn('HOLD',()=>{window._sHold=!window._sHold;T(window._sHold?'PEAK HOLD':'HOLD OFF')},'cy');
  btn('RESET',()=>{window._sPeak=-100},'');
  _H={ok:soundStart};
}
window._sPeak=-100;window._sHold=false;
async function soundStart(){
  soundStop();
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:{noiseSuppression:false,autoGainControl:false},video:false});
    S.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    S.analyser=S.audioCtx.createAnalyser();
    S.analyser.fftSize=256;S.analyser.smoothingTimeConstant=0.65;
    S.audioCtx.createMediaStreamSource(stream).connect(S.analyser);
    window._sPeak=-100;
    const draw=()=>{
      if(!S.analyser)return;
      S.vRaf=requestAnimationFrame(draw);
      const c=document.getElementById('sCvs');if(!c)return;
      const cx=c.getContext('2d'),W=c.width=c.offsetWidth,H=c.height=48;
      const freq=new Uint8Array(S.analyser.frequencyBinCount);S.analyser.getByteFrequencyData(freq);
      const flt=new Float32Array(S.analyser.frequencyBinCount);S.analyser.getFloatFrequencyData(flt);
      const avg=flt.reduce((a,v)=>a+v,0)/flt.length;
      const db=Math.max(-80,Math.min(0,avg));
      if(db>window._sPeak)window._sPeak=db;
      const pct=(db+80)/80,ppct=(window._sPeak+80)/80;
      cx.fillStyle='#020100';cx.fillRect(0,0,W,H);
      for(let i=0;i<32;i++){const v=freq[i*2]/255;const col=v>.75?'#FF2233':v>.4?'#FF9500':'#FF6B00';cx.fillStyle=col+'cc';cx.fillRect(i*(W/32),H*(1-v),(W/32)-1.5,H*v)}
      cx.fillStyle='#1a0800';cx.fillRect(0,H-6,W,6);
      const g=cx.createLinearGradient(0,0,W,0);g.addColorStop(0,'#FF6B00');g.addColorStop(.7,'#FF9500');g.addColorStop(1,'#FF2233');
      cx.fillStyle=g;cx.fillRect(0,H-6,W*pct,6);
      if(window._sHold){cx.fillStyle='#fff';cx.fillRect(W*ppct-1,H-9,2,9)}
      const el=$('sDb');if(el)el.textContent='LEVEL: '+db.toFixed(1)+' dB';
      const ep=$('sPk');if(ep)ep.textContent='PEAK:  '+window._sPeak.toFixed(1)+' dB';
      const rk=$('sRank');if(rk){const rank=db>-5?'VERY LOUD':db>-20?'LOUD':db>-40?'NORMAL':db>-60?'QUIET':'SILENT';rk.textContent=rank}
    };
    draw();lp('G',300);
  }catch(e){T('MIC: '+e.message.slice(0,16))}
}
function soundStop(){
  if(S.vRaf){cancelAnimationFrame(S.vRaf);S.vRaf=null}
  if(S.audioCtx){S.audioCtx.close().catch(()=>{});S.audioCtx=null;S.analyser=null}
}

/* ================================================
   15. COMPASS
================================================ */
function appCompass(){
  clearCtx();
  btn('ENABLE',async()=>{
    if(typeof DeviceOrientationEvent?.requestPermission==='function'){try{await DeviceOrientationEvent.requestPermission();T('COMPASS OK!')}catch(e){T('DENIED')}}
    else T('ACTIVE');
  },'cg');
  btn('SHARE',()=>navigator.share?.({title:'Heading',text:'Heading: '+_sx.al+' deg'}).catch(()=>{}),'co');
  const draw=()=>{
    window._sRaf=requestAnimationFrame(draw);
    if(S.app!=='compass')return;
    const h=_sx.al;
    const dirs=['N','NE','E','SE','S','SW','W','NW','N'];
    const di=Math.round(h/45)%8;
    scr.innerHTML=`<div class="fi" style="display:flex;flex-direction:column;align-items:center">
      <div class="sl h" style="text-align:center">COMPASS</div>
      <div class="hr"></div>
      <div class="cpw"><div class="cpn" style="transform:rotate(${h}deg)"></div><div class="cpl">${dirs[di]}</div></div>
      <div class="bignum" style="font-size:20px;letter-spacing:2px">${String(h).padStart(3,'0')} deg</div>
      <div class="sl d" style="text-align:center">TILT: ${Math.round(Math.sqrt(_sx.be**2+_sx.ga**2))} deg</div>
    </div>`;
  };draw();
}

/* ================================================
   16. BUBBLE LEVEL
================================================ */
function appLevel(){
  clearCtx();
  btn('ENABLE',async()=>{
    if(typeof DeviceMotionEvent?.requestPermission==='function'){try{await DeviceMotionEvent.requestPermission();T('OK!')}catch(e){T('DENIED')}}
    else T('ACTIVE');
  },'cg');
  const draw=()=>{
    window._sRaf=requestAnimationFrame(draw);
    if(S.app!=='level')return;
    const bx=Math.max(-40,Math.min(40,_sx.ga));
    const by=Math.max(-40,Math.min(40,_sx.be-90));
    const tilt=Math.round(Math.sqrt(bx**2+by**2));
    const ok=tilt<3;
    const bxPct=50+bx*(50/40),byPct=50+by*(50/40);
    scr.innerHTML=`<div class="fi" style="display:flex;flex-direction:column;align-items:center">
      <div class="sl h" style="text-align:center">BUBBLE LEVEL</div>
      <div class="hr"></div>
      <div style="position:relative;width:80px;height:80px;border-radius:50%;border:2px solid var(--fgd);margin:4px auto">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;border-radius:50%;background:var(--fgd)"></div>
        <div style="position:absolute;width:14px;height:14px;border-radius:50%;background:${ok?'var(--fl)':'var(--fr)'};box-shadow:0 0 ${ok?12:4}px ${ok?'var(--fl)':'var(--fr)'};left:${bxPct}%;top:${byPct}%;transform:translate(-50%,-50%);transition:left .05s,top .05s"></div>
      </div>
      <div class="sl" style="text-align:center;color:${ok?'var(--fl)':'var(--fr)'}">${ok?'[LEVEL]':'[TILT '+tilt+' deg]'}</div>
    </div>`;
  };draw();
}

/* ================================================
   17. QR SCANNER
================================================ */
function appQR(){
  scr.innerHTML=`<div class="fi">
    <div class="sl h">QR / BARCODE</div>
    <div class="hr"></div>
    <video id="qrV" style="width:100%;border-radius:3px;display:none" autoplay playsinline muted></video>
    <div class="sl d" id="qrSt">> Press SCAN</div>
    <div id="qrR" style="white-space:normal;word-break:break-all;font-size:5.5px;line-height:1.5;margin-top:2px;position:relative;z-index:2;font-family:var(--px);color:var(--fg)"></div>
  </div>`;
  clearCtx();
  btn('SCAN',qrScan,'cg');btn('STOP',qrStop,'cr');
  btn('OPEN',()=>{if(!window._qrLast){T('SCAN FIRST');return}if(window._qrLast.startsWith('http'))window.open(window._qrLast,'_blank');else T(window._qrLast.slice(0,30))},'co');
  btn('COPY',()=>{if(!window._qrLast){T('SCAN FIRST');return}navigator.clipboard?.writeText(window._qrLast).then(()=>T('COPIED!'))},'cy');
  _H={ok:qrScan};window._qrLast='';
}
async function qrScan(){
  qrStop();
  if(!('BarcodeDetector' in window)){T('NOT SUPPORTED - Android Chrome');return}
  try{
    window._qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false});
    const vid=$('qrV');if(!vid)return;
    vid.srcObject=window._qrStream;vid.style.display='block';
    const s=$('qrSt');if(s)s.textContent='SCANNING...';
    const bd=new BarcodeDetector({formats:['qr_code','ean_13','ean_8','code_128','code_39','upc_a','data_matrix']});
    window._qrInt=setInterval(async()=>{
      if(!vid.videoWidth)return;
      try{
        const codes=await bd.detect(vid);
        if(codes.length){
          window._qrLast=codes[0].rawValue;
          const el=$('qrR');if(el)el.textContent='> '+window._qrLast.slice(0,80);
          const st=$('qrSt');if(st)st.textContent='FMT: '+codes[0].format.toUpperCase();
          T('QR FOUND!');vib([60,20,60]);lp('G',400);
        }
      }catch(e){}
    },500);
  }catch(e){T('CAM: '+e.message.slice(0,16))}
}
function qrStop(){
  if(window._qrInt){clearInterval(window._qrInt);window._qrInt=null}
  if(window._qrStream){window._qrStream.getTracks().forEach(t=>t.stop());window._qrStream=null}
}

/* ================================================
   18. CAMERA
================================================ */
function appCam(){
  scr.innerHTML=`<div class="fi">
    <div class="sl h">CAMERA</div>
    <div class="hr"></div>
    <video id="cV" style="width:100%;border-radius:3px;display:none" autoplay playsinline muted></video>
    <canvas id="cC" style="width:100%;border-radius:3px;display:none"></canvas>
    <div class="sl d" id="cSt">> Press FRONT or BACK</div>
  </div>`;
  clearCtx();
  btn('FRONT',()=>camStart('user'),'cg');btn('BACK',()=>camStart('environment'),'co');
  btn('PHOTO',camPhoto,'cy');btn('TORCH',camTorch,'');btn('STOP',camOff,'cr');
  _H={ok:camPhoto};
}
let _cStream=null,_cTrack=null;
async function camStart(f){
  camOff();
  try{
    _cStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:f,width:{ideal:640}},audio:false});
    const v=$('cV');if(!v)return;
    v.srcObject=_cStream;v.style.display='block';
    _cTrack=_cStream.getVideoTracks()[0];
    const s=$('cSt');if(s)s.textContent='LIVE: '+f.toUpperCase();
    window._camStream=_cStream;
  }catch(e){T('CAM: '+e.message.slice(0,16))}
}
function camPhoto(){
  if(!_cStream){T('START CAMERA FIRST');return}
  const v=$('cV'),c=$('cC');if(!v||!c)return;
  c.width=v.videoWidth||320;c.height=v.videoHeight||240;
  c.getContext('2d').drawImage(v,0,0);c.style.display='block';v.style.display='none';
  c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='photo_'+Date.now()+'.jpg';a.click();T('PHOTO SAVED!');vib([30,10,30])},'image/jpeg',.92);
}
async function camTorch(){
  if(!_cTrack){T('START BACK CAM');return}
  const caps=_cTrack.getCapabilities();if(!caps.torch){T('NO TORCH');return}
  const cur=_cTrack.getSettings().torch||false;
  await _cTrack.applyConstraints({advanced:[{torch:!cur}]});T('TORCH: '+((!cur)?'ON':'OFF'));
}
function camOff(){
  if(_cStream){_cStream.getTracks().forEach(t=>t.stop());_cStream=null;_cTrack=null;window._camStream=null}
}

/* ================================================
   19. MORSE VIBRO
================================================ */
function appMorse(){
  const MC={'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'};
  let _mt='SOS';
  const render=()=>{
    const coded=_mt.toUpperCase().split('').map(c=>MC[c]||'').join(' ');
    scr.innerHTML=`<div class="fi"><div class="sl h">MORSE VIBRO</div><div class="hr"></div><div class="sl" style="text-align:center">${_mt}</div><div class="morse-txt">${coded}</div></div>`;
  };
  render();clearCtx();
  btn('PLAY',async()=>{
    const coded=_mt.toUpperCase().split('').map(c=>MC[c]).filter(Boolean).join(' _ ').split('');
    let pos=0;
    const next=async()=>{
      if(pos>=coded.length)return;const c=coded[pos++];
      if(c==='.')vib(80);else if(c==='-')vib(250);
      else if(c==='_'){await new Promise(r=>setTimeout(r,200));next();return}
      else{await new Promise(r=>setTimeout(r,100));next();return}
      lp('O',c==='.'?80:250);await new Promise(r=>setTimeout(r,c==='.'?200:400));next();
    };
    next();T('PLAYING...');
  },'cg');
  btn('INPUT',()=>{const t=prompt('Text to encode:');if(t){_mt=t;render()}},'co');
  btn('DECODE',()=>{const m=prompt('Morse (. - and spaces):');if(!m)return;const rev=Object.fromEntries(Object.entries(MC).map(([k,v])=>[v,k]));T('DECODED: '+m.split(' ').map(w=>rev[w]||'?').join(''))},'cy');
  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ================================================
   20. SPEECH TO TEXT
================================================ */
function appSpeech(){
  scr.innerHTML=`<div class="fi"><div class="sl h">SPEECH TO TEXT</div><div class="hr"></div><div class="sl d" id="spSt">READY</div><div class="hr"></div><div id="spTxt" style="white-space:normal;line-height:1.5;font-size:5.5px;position:relative;z-index:2;font-family:var(--px);color:var(--fg)">---</div></div>`;
  clearCtx();
  btn('LISTEN',spListen,'cg');btn('STOP',spStop,'');btn('SPEAK',spSpeak,'co');
  btn('CLEAR',()=>{const e=$('spTxt');if(e)e.textContent='---'},'');
  _H={ok:spListen};
}
let _recog=null;
function spListen(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){T('NOT SUPPORTED');return}
  spStop();_recog=new SR();_recog.continuous=true;_recog.interimResults=true;_recog.lang='en-US';
  _recog.onstart=()=>{const e=$('spSt');if(e)e.textContent='LISTENING...'};
  _recog.onresult=e=>{
    let f='',i2='';
    for(let j=e.resultIndex;j<e.results.length;j++){if(e.results[j].isFinal)f+=e.results[j][0].transcript;else i2+=e.results[j][0].transcript}
    const el=$('spTxt');if(el)el.textContent=(f||i2).slice(0,120)||'---';
    if(f){addLog('Speech',f.slice(0,30));lp('G',200)}
  };
  _recog.onerror=e=>{const el=$('spSt');if(el)el.textContent='ERR: '+e.error};
  _recog.onend=()=>{const el=$('spSt');if(el)el.textContent='STOPPED'};
  _recog.start();T('LISTENING...');
}
function spStop(){if(_recog){try{_recog.stop()}catch(e){}}_recog=null}
function spSpeak(){
  if(!window.speechSynthesis){T('NO TTS');return}
  const msg=prompt('Text to speak:');if(!msg)return;
  window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(msg),{rate:.95}));T('SPEAKING...');
}

/* ================================================
   21. PING / NET INFO
================================================ */
function appPing(){
  let results=[];let running=false;
  const targets=[
    {n:'Google DNS',url:'https://dns.google/resolve?name=a.test&type=A'},
    {n:'Cloudflare', url:'https://1.1.1.1/dns-query?name=test.&type=A'},
    {n:'OpenDNS',    url:'https://api.openresolve.com/'},
  ];
  let ti=0;
  const render=()=>{
    const c=navigator.connection;
    const avg=results.length?Math.round(results.reduce((a,b)=>a+b)/results.length):0;
    scr.innerHTML=`<div class="fi">
      <div class="sl h">PING / NET INFO</div><div class="hr"></div>
      <div class="sl d">TARGET: ${targets[ti].n}</div>
      <div class="sl d">TYPE: ${c?.effectiveType||'?'} / ${c?.downlink||'?'} Mbps</div>
      <div class="sl d">RTT: ~${c?.rtt||'?'}ms</div>
      <div class="hr"></div>
      ${results.length?`<div class="sl h" style="text-align:center">${results[results.length-1]}ms</div>
        <div class="sl d">MIN:${Math.min(...results)}ms  AVG:${avg}ms  MAX:${Math.max(...results)}ms</div>
        <div class="pw"><div class="pf" style="width:${Math.min(100,results[results.length-1]/5)}%"></div></div>
        <div class="sl d" style="margin-top:2px">PINGS: ${results.length}</div>`
      :'<div class="sl d">> Press PING</div>'}
      ${running?'<div class="sl d"><span class="bl">[PINGING...]</span></div>':''}
    </div>`;
  };
  render();clearCtx();
  btn('PING',async()=>{
    if(running)return;running=true;render();
    const t0=performance.now();
    try{await fetch(targets[ti].url,{mode:'no-cors',cache:'no-store'})}catch(e){}
    const ms=Math.round(performance.now()-t0);
    results.push(ms);if(results.length>20)results.shift();
    lp('G',150);vib(10);T('PING: '+ms+'ms');running=false;render();
  },'cg');
  btn('LOOP',async()=>{
    if(running)return;running=true;
    for(let i=0;i<5;i++){
      const t0=performance.now();try{await fetch(targets[ti].url,{mode:'no-cors',cache:'no-store'})}catch(e){}
      const ms=Math.round(performance.now()-t0);results.push(ms);if(results.length>20)results.shift();
      lp('G',80);render();await new Promise(r=>setTimeout(r,600));
    }
    running=false;render();T('LOOP DONE');
  },'co');
  btn('MY IP',async()=>{T('GETTING IP...');startLoad(2500);const ip=await getLocalIP();T(ip?'LOCAL: '+ip:'COULD NOT DETECT')},'cy');
  btn('< TGT',()=>{ti=(ti-1+targets.length)%targets.length;render()},'');
  btn('TGT >',()=>{ti=(ti+1)%targets.length;render()},'');
  btn('CLEAR',()=>{results=[];render()},'');
  _H={ok:()=>document.querySelector('.cb.cg')?.click(),lt:()=>{ti=(ti-1+targets.length)%targets.length;render()},rt:()=>{ti=(ti+1)%targets.length;render()}};
}

/* ================================================
   22. GPS TRACKER
================================================ */
function appGPS(){
  rGPS();clearCtx();
  btn('START',gpsStart,'cg');
  btn('STOP',()=>{if(S.gpsWatch){navigator.geolocation.clearWatch(S.gpsWatch);S.gpsWatch=null}rGPS()},'');
  btn('MAPS',()=>{if(S.gpsPos)window.open('https://maps.google.com/?q='+S.gpsPos.lat+','+S.gpsPos.lon,'_blank');else T('NO GPS')},'co');
  btn('SHARE',()=>{
    if(!S.gpsPos){T('NO GPS');return}
    const u='https://maps.google.com/?q='+S.gpsPos.lat.toFixed(6)+','+S.gpsPos.lon.toFixed(6);
    navigator.share?.({title:'My Location',url:u}).catch(()=>navigator.clipboard?.writeText(u).then(()=>T('LINK COPIED!')));
  },'cy');
  _H={ok:gpsStart};
}
function rGPS(){
  const d=S.gpsPos;
  scr.innerHTML=`<div class="fi">
    <div class="sl">${S.gpsWatch!==null?'<span class="bl">[TRACKING]</span>':'[IDLE]'}</div>
    <div class="sl d">PTS: ${S.gpsTrack.length}</div>
    <div class="hr"></div>
    ${d?`<div class="sl h">LAT: ${d.lat.toFixed(6)}</div>
      <div class="sl h">LON: ${d.lon.toFixed(6)}</div>
      <div class="sl">ACC: +/-${Math.round(d.acc)}m</div>
      <div class="sl d">SPD: ${d.spd!=null?(d.spd*3.6).toFixed(1)+' km/h':'N/A'}</div>`
    :'<div class="sl d">> Press START</div>'}
  </div>`;
}
function gpsStart(){
  if(!navigator.geolocation){T('NO GPS');return}if(S.gpsWatch)return;
  T('ACQUIRING...');startLoad(10000);
  S.gpsWatch=navigator.geolocation.watchPosition(
    pos=>{S.gpsPos={lat:pos.coords.latitude,lon:pos.coords.longitude,acc:pos.coords.accuracy,alt:pos.coords.altitude,spd:pos.coords.speed};S.gpsTrack.push({...S.gpsPos,t:Date.now()});if(S.gpsTrack.length>1000)S.gpsTrack.shift();lp('G',150);if(S.app==='gps')rGPS()},
    err=>{T('GPS: '+err.message.slice(0,16));S.gpsWatch=null;rGPS()},
    {enableHighAccuracy:true,maximumAge:0,timeout:30000}
  );
}

/* ================================================
   23. HACKER MODE
================================================ */
function appHack(){
  const lines=[
    {t:'p', s:'> RF SIM DEMO — NOT REAL DATA'},
    {t:'ok',s:'[SIM] CC1101 RF chip online'},
    {t:'ok',s:'[SIM] NRF52840 BLE active'},
    {t:'ok',s:'[SIM] ST25R NFC reader OK'},
    {t:'p', s:'> [SIM] Scanning 2.4GHz band...'},
    {t:'ok',s:'[SIM] 14 WiFi networks found'},
    {t:'ok',s:'[SIM] 9 BLE devices in range'},
    {t:'p', s:'> [SIM] Checking IR field...'},
    {t:'ok',s:'[SIM] IR carrier 38kHz detected'},
    {t:'p', s:'> [SIM] Sub-GHz @ 433.92MHz...'},
    {t:'ok',s:'[SIM] OOK signal: RSSI -42dBm'},
    {t:'p', s:'> [SIM] NFC scan...'},
    {t:'ok',s:'[SIM] ISO 14443-A 07h detected'},
    {t:'p', s:'> [SIM] GPS constellation...'},
    {t:'ok',s:'[SIM] Fix: 11 sats HDOP 0.9'},
    {t:'ok',s:'> DEMO COMPLETE — USE REAL APPS'},
  ];
  let li=0;
  scr.innerHTML=`<div style="padding:2px;height:100%;overflow:hidden"><div class="term" id="hackOut"></div></div>`;
  clearCtx();
  btn('RUN',()=>{
    const el=$('hackOut');if(!el)return;
    el.textContent='';li=0;startLoad(lines.length*110);
    clearInterval(window._hackInt);
    window._hackInt=setInterval(()=>{
      if(li>=lines.length){clearInterval(window._hackInt);return}
      const l=lines[li++];
      el.innerHTML+=`<div class="${l.t==='p'?'p':l.t==='ok'?'ok':'er'}">${l.s}</div>`;
      vib(4);el.parentElement.scrollTop=9999;
    },110);
  },'cg');
  btn('LIVE',()=>{
    const el=$('hackOut');if(!el)return;
    clearInterval(window._hackInt);
    const pool=[
      ()=>`[SIM] BLE: ${FAKE_BT[rand(0,FAKE_BT.length-1)]} RSSI:-${rand(30,90)}dBm`,
      ()=>`[SIM] WiFi: ${FAKE_WIFI[rand(0,FAKE_WIFI.length-1)]} CH${rand(1,11)}`,
      ()=>`[SIM] RF: ${SUBF[rand(0,3)]}MHz OOK RSSI:-${rand(25,75)}dBm`,
      ()=>`[SIM] NFC: scan... ${Math.random()>.7?'tag found!':'no tag'}`,
      ()=>`[SIM] IR: ${Math.random()>.5?'carrier detected':'idle'}`,
    ];
    window._hackInt=setInterval(()=>{
      el.innerHTML+=`<div class="ok">${pool[rand(0,pool.length-1)]()}</div>`;
      if(el.children.length>20)el.children[0].remove();
      el.parentElement.scrollTop=9999;
      if(Math.random()>.7)lp('O',80);if(Math.random()>.85)vib(5);
    },500);
    T('LIVE FEED ON');
  },'cp');
  btn('CLEAR',()=>{const el=$('hackOut');if(el)el.innerHTML='';clearInterval(window._hackInt)},'');
  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ================================================
   24. WAKE LOCK
================================================ */
function appWake(){
  rWake();clearCtx();btn('LOCK ON',wakeOn,'cg');btn('LOCK OFF',wakeOff,'cr');
}
function rWake(){
  scr.innerHTML=`<div class="fi">
    <div class="sl h">WAKE LOCK</div>
    <div class="sl">${S.wakeLock?'<span class="bl">[ACTIVE]</span>':'[INACTIVE]'}</div>
    <div class="hr"></div>
    <div class="sl d">Keeps screen awake.</div>
    <div class="sl d">Good for TV remote use.</div>
    <div class="hr"></div>
    <div class="sl ${'wakeLock' in navigator?'h':'r'}">${'wakeLock' in navigator?'[OK] SUPPORTED':'[!] NOT SUPPORTED'}</div>
  </div>`;
}
async function wakeOn(){
  if(!('wakeLock' in navigator)){T('NOT SUPPORTED');return}
  try{S.wakeLock=await navigator.wakeLock.request('screen');S.wakeLock.addEventListener('release',()=>{S.wakeLock=null;if(S.app==='wakelock')rWake()});T('WAKE LOCK ON!');lp('G',500);rWake()}
  catch(e){T('WAKE: '+e.message.slice(0,14))}
}
async function wakeOff(){if(S.wakeLock){await S.wakeLock.release();S.wakeLock=null}T('WAKE LOCK OFF');rWake()}

/* ================================================
   25. SYSTEM
================================================ */
function appSystem(){
  clearCtx();
  btn('REFRESH',rSys,'cg');
  btn('LOG',appLog,'co');
  btn('INSTALL',()=>{
    if(window._pwaP){window._pwaP.prompt()}
    else showModal(`<div style="color:var(--fl);font-size:7px;margin-bottom:8px">INSTALL APP</div><div>iOS: Share > Add to Home Screen<br><br>Android: Menu > Add to Home Screen</div><button class="cb cg" onclick="closeModal()" style="margin-top:8px;max-width:none;flex:none;padding:6px 12px">OK</button>`);
  },'cy');
  rSys();_H={ok:rSys};
}
function rSys(){
  scr.innerHTML=`<div class="fi sl2">
    <pre style="font-family:var(--mo);font-size:clamp(3.5px,0.95vw,4.8px);line-height:1.35;color:var(--fl);text-shadow:0 0 6px rgba(255,107,0,.25);text-align:center;margin:0 0 3px;white-space:pre;position:relative;z-index:2;">      .-----..-------.
     / FLIPPER \\ ZERO  \\
    |  REMOTE    v5.1  |
     \\________________/
     [BT] [NFC] [RF] [IR]</pre>
    <div class="sl h" style="text-align:center;font-size:5px">FLIPPER REMOTE v5.1</div>
    <div class="hr"></div>
    <div class="sl d">APPS: ${MENU.length}   LOG: ${S.log.length}</div>
    <div class="sl d">BAT: ${S.battery?Math.round(S.battery.level*100)+'%'+(S.battery.charging?' CHG':''):'N/A'}</div>
    <div class="hr"></div>
    <div class="sl d">BT:${'bluetooth' in navigator?'Y':'N'}  NFC:${'NDEFReader' in window?'Y':'N'}  SER:${'serial' in navigator?'Y':'N'}</div>
    <div class="sl d">QR:${'BarcodeDetector' in window?'Y':'N'}  GPS:${!!navigator.geolocation?'Y':'N'}</div>
  </div>`;
}
function appLog(){
  let off=0;
  const r=()=>{
    scr.innerHTML=`<div class="fi sl2">
      <div class="sl d">${S.log.length} ENTRIES</div><div class="hr"></div>
      ${S.log.slice(off,off+8).map(e=>`<div style="display:flex;gap:2px;line-height:1.55;position:relative;z-index:2">
        <span style="font-family:var(--mo);font-size:5px;color:var(--fgd);flex-shrink:0">${e.ts}</span>
        <span style="font-family:var(--px);font-size:5px;color:var(--fgh);flex-shrink:0">[${e.cat}]</span>
        <span style="font-family:var(--px);font-size:5px;overflow:hidden">${e.msg}</span>
      </div>`).join('')||'<div class="sl d">Empty</div>'}
    </div>`;
  };
  r();clearCtx();
  btn('TOP',()=>{off=0;r()},'');
  btn('COPY',()=>navigator.clipboard?.writeText(S.log.map(l=>l.ts+' ['+l.cat+'] '+l.msg).join('\n')).then(()=>T('COPIED!')),'cy');
  btn('CLEAR',()=>{S.log=[];off=0;r();T('CLEARED')},'cr');
  _H={up:()=>{off=Math.max(0,off-1);r()},dn:()=>{off=Math.min(Math.max(0,S.log.length-8),off+1);r()}};
}

/* ================================================
   26 & 27. CUSTOM SCRIPT 1 & 2
   Write any JS. Has access to: T(), btn(), scr,
   S, vib(), lp(), addLog(), flashIR(), fetch, etc.
   Code saved to localStorage per slot.
================================================ */
function appCustom(slot){
  const KEY='fr_custom'+slot;
  let code=localStorage.getItem(KEY)||defaultCustomScript(slot);
  let output=[];

  const renderApp=()=>{
    const lines=output.slice(-12);
    scr.innerHTML=`<div class="fi sl2" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl h">CUSTOM SCRIPT ${slot}</span>
        <span class="sl d" style="font-size:4px">${code.length} chars</span>
      </div>
      <div class="hr"></div>
      <div id="csOut" style="font-family:var(--mo);font-size:5px;line-height:1.6;color:var(--fg);position:relative;z-index:2">
        ${lines.length?lines.map(l=>`<div style="color:${l.err?'var(--fr)':'var(--fg)'}">${l.txt}</div>`).join(''):'<div style="color:var(--fgd)">> Press RUN to execute</div>'}
      </div>
    </div>`;
  };

  const log=(txt,err=false)=>{output.push({txt,err});if(output.length>50)output.shift();renderApp()};

  const runScript=()=>{
    output=[];log('> running script '+slot+'...');
    // expose helper API to the script
    const api={
      T, btn, scr, S, vib, lp, addLog, flashIR,
      log:(msg)=>log('  '+String(msg).slice(0,60)),
      fetch, prompt, alert,
      rand, shuffle,
      samKey: typeof samKey!=='undefined'?samKey:()=>{},
      lgSend: typeof lgSend!=='undefined'?lgSend:()=>{},
      irSend,
    };
    try{
      const fn=new Function(...Object.keys(api), '"use strict";\n'+code);
      const result=fn(...Object.values(api));
      if(result instanceof Promise){
        result.then(v=>{if(v!==undefined)log('< '+String(v).slice(0,60))}).catch(e=>log('[ERR] '+e.message.slice(0,50),true));
      }else if(result!==undefined){
        log('< '+String(result).slice(0,60));
      }
    }catch(e){
      log('[ERR] '+e.message.slice(0,60),true);
    }
    T('SCRIPT '+slot+' RUN');vib([20,10,20]);lp('G',300);
  };

  const editScript=()=>{
    const newCode=prompt('Paste your script (JS):\nAvailable: T(), log(), vib(), btn(), scr, S, fetch, irSend, samKey, lgSend',code);
    if(newCode!==null){
      code=newCode;
      localStorage.setItem(KEY,code);
      T('SCRIPT SAVED!');
      renderApp();
    }
  };

  const renameScript=()=>{
    const name=prompt('Script name (shown in menu):',MENU.find(m=>m.id==='custom'+slot)?.n||'CUSTOM SCRIPT '+slot);
    if(name){
      const m=MENU.find(x=>x.id==='custom'+slot);
      if(m)m.n=name.toUpperCase().slice(0,18);
      T('RENAMED!');renderApp();
    }
  };

  renderApp();clearCtx();
  btn('RUN',runScript,'cg');
  btn('EDIT',editScript,'co');
  btn('RENAME',renameScript,'cy');
  btn('CLEAR OUT',()=>{output=[];renderApp()},'');
  btn('RESET',()=>{code=defaultCustomScript(slot);localStorage.setItem(KEY,code);T('RESET TO DEFAULT');renderApp()},'cr');
  _H={ok:runScript};
}

function appIPGrabber() {
  scr.innerHTML = `
    <div class="fi">
      <div class="sl h">🎣 IP GRABBER</div>
      <div class="hr"></div>
      <div class="sl d">1. GENERATE LINK</div>
      <div class="sl d">2. SEND TO TARGET</div>
      <div class="sl d">3. TARGET CLICKS LINK</div>
      <div class="sl d">4. YOU SEE THEIR IP</div>
    </div>
  `;
  clearCtx();

  btn('GENERATE LINK', () => {
    const grabUrl = `https://ipinfo.io/json`; // Free public API
    const encoded = encodeURIComponent(grabUrl);
    const link = `${location.origin}?grab=${encoded}`;
    
    navigator.clipboard.writeText(link).then(() => {
      T('LINK COPIED TO CLIPBOARD!');
      showModal(`<div class="sl h">🎣 IP GRABBER</div><div class="sl d">Copy this link and send it to your target:</div><div style="background:#111;padding:8px;margin:8px 0;border-radius:4px;word-break:break-all;font-size:5px">${link}</div><button class="cb cg" onclick="closeModal()">CLOSE</button>`);
    });
  }, 'cg');
}

// This function runs automatically when the page loads
if(window.location.search.includes('grab')) {
  fetch('https://ipinfo.io/json')
    .then(res => res.json())
    .then(data => {
      showModal(`
        <div class="sl h">🎣 TARGET IP GRABBED</div>
        <div class="sl h">IP: ${data.ip}</div>
        <div class="sl d">CITY: ${data.city}</div>
        <div class="sl d">REGION: ${data.region}</div>
        <div class="sl d">COUNTRY: ${data.country}</div>
        <div class="sl d">ISP: ${data.org}</div>
        <button class="cb cg" onclick="closeModal()">CLOSE</button>
      `);
    });
}
  return function appBTSpammer() {
  let spamming = false;
  let timer = null;

  scr.innerHTML = `
    <div class="fi">
      <div class="sl h">📡 BT SPAMMER</div>
      <div class="hr"></div>
      <div class="sl d">1. CLICK SCAN</div>
      <div class="sl d">2. SELECT DEVICE</div>
      <div class="sl d">3. CLICK SPAM</div>
    </div>
  `;
  clearCtx();

  btn('SCAN', async () => {
    if (!navigator.bluetooth) {
      T('Bluetooth not supported');
      return;
    }
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['device_information']
      });
      T('DEVICE SELECTED');
      
      // Store devices in global S object so we can spam them
      if (!S.spamDevices) S.spamDevices = [];
      S.spamDevices.push(device);
      
      // Show spam button to the user
      const spamBtn = document.createElement('button');
      spamBtn.className = 'cb cr';
      spamBtn.style.margin = '4px auto';
      spamBtn.style.display = 'block';
      spamBtn.textContent = '⚡ START SPAMMING';
      spamBtn.onclick = () => toggleSpam(device);
      document.querySelector('.fi').appendChild(spamBtn);
      
    } catch (error) {
      T('SCAN FAILED');
    }
  }, 'cg');

  async function toggleSpam(device) {
    if (spamming) {
      clearInterval(timer);
      spamming = false;
      T('SPAM STOPPED');
    } else {
      spamming = true;
      T('⚡ SPAMMING CONNECTION REQUESTS...');
      
      timer = setInterval(async () => {
        try {
          // Force a connection request
          await device.gatt.connect();
          device.gatt.disconnect();
          vib([20, 10, 20]); // Vibrate on success
        } catch (e) {
          // Ignore connection errors (that's the spam)
        }
      }, 1000); // Spam every 1 second
    }
  }
}

/* ================================================
   PWA
================================================ */
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._pwaP=e});
window.closeModal = closeModal;
window.openApp   = openApp;
window.S         = S;
window.rBT       = rBT;
window.T         = T;
