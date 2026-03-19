/* ══════════════════════════════════════════════
   FLIPPER REMOTE v5.1  ·  script.js
   Pixel boot · Mall Scanner · 28 apps
══════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════
   PIXEL ART FLIPPER LOGO (20×12 grid)
   1 = yellow pixel, 0 = off
══════════════════════════════════ */
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

/* ══════════════════════════════════
   FAKE DEVICE NAME POOLS (for scanner visuals)
══════════════════════════════════ */
const FAKE_WIFI = [
  'TELE2_HOME_5G','UPC1234567','Vodafone-A4B2','dlink-GUEST',
  'FRITZ!Box 7590','Telenet-B82A','ASUS_RT-AX88U','SKY12345',
  'VM123456-2G','AndroidAP_5G','iPhone of Jonas','TP-LINK_3F20',
  'Netgear_EXT','ORBI99','HomeNetwork_HID','CoxWifi-Guest',
  'SSID_HIDDEN','[hidden]','DIRECT-roku-123','HP-Print-7E',
  'XFINITY_3B2F','BT-Hub6-AABC','Linksys00123','ATT-WIFI-4F',
  'Spectrum_7G2B','Starlink','MEO-WiFi-5G','NOS_WIFI_44A1',
];
const FAKE_BT = [
  "AirPods Pro",'JBL Flip 6','Galaxy Buds2','WH-1000XM5',
  'Pixel Buds A','Bose QC45','Mi Band 7','Apple Watch S8',
  'Tile Mate','Logitech MX','Xbox Controller','PS5 DualSense',
  'Fitbit Charge5','Amazfit GTR','BeatsX','SOUNDPEATS T3',
  'Anker Q30','Jabra Elite85h','HP Officejet','Galaxy S23+',
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

/* ══════════════════════════════════
   STATE
══════════════════════════════════ */
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

/* ══════════════════════════════════
   MENU
══════════════════════════════════ */
const MENU = [
  // SCANNER — the mall hacker section
  {id:'wifi_scan',  ic:'◈', n:'WIFI SCANNER',    cat:'SCAN'},
  {id:'bt_scan',    ic:'⬡', n:'BT SCANNER',       cat:'SCAN'},
  {id:'tv_scan',    ic:'▣', n:'TV SCANNER',        cat:'SCAN'},
  {id:'subghz',     ic:'≋', n:'SUB-GHz',          cat:'SCAN'},
  {id:'nfc',        ic:'○', n:'NFC READ/WRITE',    cat:'SCAN'},
  // TV CONTROL
  {id:'samsung',    ic:'▶', n:'SAMSUNG TV',        cat:'TV'},
  {id:'lg',         ic:'◉', n:'LG TV',             cat:'TV'},
  {id:'sony',       ic:'◆', n:'SONY TV',           cat:'TV'},
  {id:'ir',         ic:'~', n:'IR BLASTER',        cat:'TV'},
  // TOOLS
  {id:'flashlight', ic:'◎', n:'FLASHLIGHT',        cat:'TOOL'},
  {id:'sound',      ic:'♪', n:'SOUND METER',       cat:'TOOL'},
  {id:'compass',    ic:'⊕', n:'COMPASS',           cat:'TOOL'},
  {id:'level',      ic:'═', n:'BUBBLE LEVEL',      cat:'TOOL'},
  {id:'qr',         ic:'▣', n:'QR SCANNER',        cat:'TOOL'},
  {id:'cam',        ic:'◎', n:'CAMERA',            cat:'TOOL'},
  {id:'morse',      ic:'·', n:'MORSE VIBRO',       cat:'TOOL'},
  {id:'speech',     ic:'◬', n:'SPEECH',            cat:'TOOL'},
  // FUN
  {id:'reaction',   ic:'!', n:'REACTION TIME',     cat:'FUN'},
  {id:'tally',      ic:'#', n:'TALLY',             cat:'FUN'},
  {id:'stopwatch',  ic:'⏱', n:'STOPWATCH',         cat:'FUN'},
  {id:'fake_hack',  ic:'»', n:'HACKER MODE',       cat:'FUN'},
  {id:'calc',       ic:'∑', n:'CALCULATOR',        cat:'FUN'},
  {id:'notes',      ic:'≡', n:'NOTES',             cat:'FUN'},
  // GPS
  {id:'gps',        ic:'⊕', n:'GPS TRACKER',       cat:'GPS'},
  // EXTRA TOOLS
  {id:'timer',      ic:'◷', n:'TIMER / ALARM',     cat:'TOOL'},
  {id:'converter',  ic:'⇄', n:'UNIT CONVERTER',    cat:'TOOL'},
  {id:'randomizer', ic:'◈', n:'RANDOMIZER',        cat:'TOOL'},
  {id:'ping',       ic:'◌', n:'PING / NETWORK',    cat:'TOOL'},
  {id:'colors',     ic:'■', n:'COLOR PICKER',      cat:'TOOL'},
  // SYS
  {id:'wakelock',   ic:'⊙', n:'WAKE LOCK',         cat:'SYS'},
  {id:'share',      ic:'⊿', n:'SHARE',             cat:'SYS'},
  {id:'system',     ic:'⚙', n:'SYSTEM',            cat:'SYS'},
  {id:'bt_connect', ic:'⬡', n:'BT CONNECT',        cat:'SYS'},
];

const CAT_C = {SCAN:'var(--fl)',TV:'var(--fb)',TOOL:'var(--fl)',FUN:'#FFD600',GPS:'#FF9500',SYS:'var(--fp)'};

/* ══════════════════════════════════
   DOM / UTILS
══════════════════════════════════ */
const $=id=>document.getElementById(id);
const scr=$('scr'),ctx=$('ctx'),ir=$('ir');
const toast=$('toast'),modal=$('modal'),mbox=$('mbox');
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

/* ══════════════════════════════════
   BOOT — PIXEL ART
══════════════════════════════════ */
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
  startLoad(3200);
  await pixelBoot();
}

async function pixelBoot(){
  // Phase 1: Draw pixel logo pixel by pixel
  const rows=PIXEL_LOGO.length, cols=PIXEL_LOGO[0].length;
  const total=rows*cols;
  const cells=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push([r,c]);

  // render empty grid
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

  // Light up pixels one by one (row by row, fast)
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

  // Phase 2: POST-style system check lines
  const lines=[
    {d:180, t:'FLIPPER REMOTE v5.1'},
    {d:120, t:'CPU: F-ZERO CORE @ 64MHz....OK'},
    {d:100, t:'RAM: 320KB SRAM..........OK'},
    {d:100, t:'FLASH: 1MB.................OK'},
    {d:80,  t:'RF MODULE: CC1101..........OK'},
    {d:80,  t:'BLE: NRF52840..............OK'},
    {d:80,  t:'NFC: ST25R3916.............OK'},
    {d:80,  t:'IR: 38KHz BLASTER..........OK'},
    {d:80,  t:'GPS: GNSS MODULE...........OK'},
    {d:180, t:'ALL SYSTEMS NOMINAL'},
    {d:300, t:'► READY'},
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
    div.style.cssText='font-family:var(--mo);font-size:5.5px;color:'+(l.t.startsWith('►')?'var(--fl)':l.t.includes('OK')?'var(--fg)':'var(--fgh)');
    div.textContent=l.t;
    pl.appendChild(div);
    pl.scrollTop=9999;
    if(l.t.includes('OK'))vib(4);
  }
  await new Promise(r=>setTimeout(r,500));
}

/* ══════════════════════════════════
   INIT HELPERS
══════════════════════════════════ */
async function initBattery(){try{if(navigator.getBattery){const b=await navigator.getBattery();S.battery=b;const u=()=>$('sBat').textContent=(b.charging?'⚡':'')+Math.round(b.level*100)+'%';u();b.onlevelchange=u;b.onchargingchange=u}}catch(e){}}
function initNet(){const c=navigator.connection;if(c){$('sNet').textContent=c.effectiveType||'RF';c.onchange=()=>($('sNet').textContent=c.effectiveType||'RF')}}
let _sx={ax:0,ay:0,az:0,al:0,be:0,ga:0};
function initSensors(){
  window.addEventListener('devicemotion',e=>{const a=e.accelerationIncludingGravity;if(a){_sx.ax=+(a.x||0).toFixed(1);_sx.ay=+(a.y||0).toFixed(1);_sx.az=+(a.z||0).toFixed(1)}},{passive:true});
  window.addEventListener('deviceorientation',e=>{_sx.al=+(e.alpha||0).toFixed(0);_sx.be=+(e.beta||0).toFixed(0);_sx.ga=+(e.gamma||0).toFixed(0)},{passive:true});
}

/* ══════════════════════════════════
   NAVIGATION
══════════════════════════════════ */
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
    flashlight:appFlashlight, sound:appSound, compass:appCompass,
    level:appLevel, qr:appQR, cam:appCam, morse:appMorse, speech:appSpeech,
    reaction:appReaction, tally:appTally, stopwatch:appStopwatch,
    fake_hack:appHack, calc:appCalc, notes:appNotes,
    gps:appGPS, wakelock:appWake, share:appShare,
    system:appSystem, bt_connect:appBT,
    timer:appTimer, converter:appConverter, randomizer:appRandomizer,
    ping:appPing, colors:appColors,
  };
  apps[id]?.();
}

/* ══════════════════════════════════
   MENU RENDER
══════════════════════════════════ */
function renderMenu(){
  stopApp();setTitle('FLIPPER REMOTE');clearCtx();
  _H={up:()=>menuNav(-1),dn:()=>menuNav(1),ok:menuOK};
  const vis=9,start=Math.max(0,Math.min(S.idx-4,MENU.length-vis));
  let h='<div class="fi sl2" style="height:100%">';

  let lastCat='';
  for(let i=start;i<Math.min(start+vis,MENU.length);i++){
    const m=MENU[i],sel=i===S.idx,col=CAT_C[m.cat]||'var(--fl)';
    if(m.cat!==lastCat&&!sel){
      h+=`<div style="font-family:var(--px);font-size:4px;color:var(--fgd);padding:2px 3px 0;letter-spacing:.05em">${m.cat}</div>`;
      lastCat=m.cat;
    }
    h+=`<div class="mi${sel?' s':''}" onclick="openApp('${m.id}')">
      <span class="ic" style="${sel?'':'color:'+col}">${m.ic}</span>
      <span style="margin-left:4px;flex:1">${m.n}</span>
      <span class="ar">${sel?'▶':'›'}</span>
    </div>`;
  }
  h+=`<div class="hr" style="margin-top:3px"></div>
    <div class="sl d" style="text-align:center;font-size:4px">${S.idx+1} / ${MENU.length}</div>
  </div>`;
  scr.innerHTML=h;
}

/* ══════════════════════════════════
   LOCAL IP
══════════════════════════════════ */
async function getLocalIP(){return new Promise(res=>{const pc=new RTCPeerConnection({iceServers:[]});pc.createDataChannel('');pc.createOffer().then(o=>pc.setLocalDescription(o));pc.onicecandidate=e=>{if(!e?.candidate)return;const m=e.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);if(m&&!m[0].startsWith('127.')){res(m[0]);try{pc.close()}catch(e){}}};setTimeout(()=>res(null),3500)})}

/* ══════════════════════════════════
   1. WIFI SCANNER — MALL MODE
   Uses real WiFi networks when possible via
   navigator.connection; enriches with visuals
══════════════════════════════════ */
function appWifiScan(){
  let networks=[];let scanning=false;let interval=null;
  const fakePool=shuffle(FAKE_WIFI);let fakeIdx=0;

  const addNet=(ssid,rssi,secure,isReal=false)=>{
    const existing=networks.findIndex(n=>n.ssid===ssid);
    const entry={ssid,rssi,secure,isReal,ts:Date.now()};
    if(existing>=0)networks[existing]={...entry};
    else networks.unshift(entry);
    if(networks.length>24)networks.pop();
  };

  const render=()=>{
    const sorted=[...networks].sort((a,b)=>b.rssi-a.rssi);
    const rows=sorted.slice(0,10).map(n=>{
      const pct=Math.max(0,Math.min(1,(n.rssi+100)/65));
      const lock=n.secure?'▲':'○';
      const age=Date.now()-n.ts;
      const fresh=age<2000;
      return `<div class="scan-row${fresh&&!n.isReal?' new-dev':''}">
        <span style="width:8px;font-size:5px;color:var(--fgd)">${lock}</span>
        ${rssiBar(pct)}
        <span class="name" style="font-size:5.5px">${n.ssid}</span>
        <span class="extra">${n.rssi}dBm</span>
      </div>`;
    }).join('');

    scr.innerHTML=`<div class="fi" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl h">◈ WIFI SCAN</span>
        <span class="sl d" style="font-size:4.5px">${scanning?'<span class="bl">● LIVE</span>':'IDLE'} ${networks.length} NET</span>
      </div>
      <div class="hr"></div>
      <div style="font-family:var(--mo);font-size:4.5px;color:var(--fgd);display:flex;gap:8px;margin-bottom:2px">
        <span>SSID</span><span style="margin-left:auto">RSSI</span>
      </div>
      ${rows||'<div class="sl d" style="margin-top:6px">Press SCAN to start</div>'}
    </div>`;
  };

  render();clearCtx();

  btn('SCAN',()=>{
    if(scanning)return;
    scanning=true;render();
    // Try real scan via navigator APIs first
    const c=navigator.connection;
    if(c?.type==='wifi'){
      addNet('(current network)',rand(-65,-35),true,true);
    }
    // Populate with realistic fake nearby networks (visual prop)
    const addFake=()=>{
      const ssid=fakePool[fakeIdx%fakePool.length];fakeIdx++;
      addNet(ssid,rand(-95,-28),Math.random()>.2);
      lp('G',80);
      render();
    };
    // burst initial
    for(let i=0;i<6;i++)setTimeout(addFake,i*120);
    interval=setInterval(()=>{
      if(!scanning){clearInterval(interval);return}
      // randomly update RSSI of existing + occasionally add new
      networks.forEach(n=>{n.rssi=Math.max(-100,Math.min(-20,n.rssi+rand(-3,3)))});
      if(Math.random()>.6)addFake();
      render();
    },900);
    S._wifiInt=interval;
    T('SCANNING 2.4/5GHz...');
  },'cg');

  btn('STOP',()=>{scanning=false;clearInterval(interval);render();T('SCAN STOPPED')},'');
  btn('SORT RSSI',()=>{networks.sort((a,b)=>b.rssi-a.rssi);render()},'cy');
  btn('CLEAR',()=>{networks=[];render()},'');
  btn('EXPORT',()=>{
    const txt=networks.map(n=>`${n.ssid}\t${n.rssi}dBm\t${n.secure?'WPA':'OPEN'}`).join('\n');
    navigator.clipboard?.writeText(txt).then(()=>T('COPIED TO CLIPBOARD!'));
  },'co');

  _H={ok:()=>document.querySelector('.cb.cg')?.click(),up:()=>{},dn:()=>{}};
}

/* ══════════════════════════════════
   2. BLUETOOTH SCANNER — MALL MODE
══════════════════════════════════ */
function appBtScan(){
  let devs=[];let scanning=false;let interval=null;
  const fakePool=shuffle(FAKE_BT);let fakeIdx=0;
  const TYPES=['Phone','Headphones','Watch','Speaker','Laptop','Keyboard','Mouse','Tag','TV','Unknown'];

  const addDev=(name,rssi,type)=>{
    const existing=devs.findIndex(d=>d.name===name);
    const entry={name,rssi,type,ts:Date.now(),addr:Array.from({length:6},()=>rand(0,255).toString(16).padStart(2,'0').toUpperCase()).join(':')};
    if(existing>=0)devs[existing]={...entry};
    else devs.unshift(entry);
    if(devs.length>20)devs.pop();
  };

  const render=()=>{
    const rows=devs.slice(0,9).map(d=>{
      const pct=Math.max(0,(d.rssi+100)/70);
      const fresh=Date.now()-d.ts<2000;
      return `<div class="scan-row${fresh?' new-dev':''}">
        <span style="width:8px;font-size:5px;color:var(--fb)">⬡</span>
        ${rssiBar(pct)}
        <span class="name" style="font-size:5.5px">${d.name}</span>
        <span class="extra">${d.rssi}dBm</span>
      </div>`;
    }).join('');

    scr.innerHTML=`<div class="fi" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl b">⬡ BT SCAN</span>
        <span class="sl d" style="font-size:4.5px">${scanning?'<span class="bl" style="color:var(--fb)">● BLE</span>':'IDLE'} ${devs.length}</span>
      </div>
      <div class="hr"></div>
      ${rows||'<div class="sl d" style="margin-top:6px">Press SCAN to detect BLE</div>'}
    </div>`;
  };

  render();clearCtx();

  btn('SCAN',async()=>{
    if(scanning)return;
    scanning=true;render();

    // Try real BT scan via Web Bluetooth (just the requestDevice dialog)
    // We also run visual scanner in background
    const types=TYPES;
    const addFake=()=>{
      const name=fakePool[fakeIdx%fakePool.length];fakeIdx++;
      const type=types[rand(0,types.length-1)];
      addDev(name,rand(-92,-30),type);
      lp('G',80);render();
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
  btn('REAL SCAN',async()=>{
    if(!navigator.bluetooth){T('WEB BT NOT SUPPORTED');return}
    try{
      const dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:['battery_service','heart_rate']});
      addDev(dev.name||'Unknown BLE',rand(-55,-30),'BLE Device');
      render();T('REAL DEVICE ADDED!');vib([30,10,30]);
    }catch(e){if(e.name!=='NotFoundError')T('BT: '+e.message.slice(0,16))}
  },'cb2');
  btn('CLEAR',()=>{devs=[];render()},'');

  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ══════════════════════════════════
   3. TV SCANNER
══════════════════════════════════ */
function appTvScan(){
  let tvs=[];let scanning=false;

  const render=()=>{
    const rows=tvs.map((t,i)=>`
      <div class="scan-row">
        <span style="width:10px;font-size:5px;color:${t.real?'var(--fl)':'var(--fgb)'}">◈</span>
        <span class="name" style="font-size:5.5px">${t.brand} ${t.model}</span>
        <span class="extra">${t.ip}</span>
      </div>`).join('');

    scr.innerHTML=`<div class="fi" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl h">◈ TV SCAN</span>
        <span class="sl d" style="font-size:4.5px">${scanning?'<span class="bl">● SCANNING</span>':'IDLE'}</span>
      </div>
      <div class="hr"></div>
      ${rows||'<div class="sl d">Press SCAN — finds Smart TVs<br><br><span style="color:var(--fgd)">Works on home/office LAN</span></div>'}
    </div>`;
  };

  render();clearCtx();

  btn('SCAN LAN',async()=>{
    if(scanning)return;
    scanning=true;tvs=[];render();T('SCANNING LOCAL NETWORK...');startLoad(6000);

    // Show fake visual TVs immediately for prop effect
    const pool=shuffle(FAKE_TV);
    pool.slice(0,rand(1,3)).forEach((tv,i)=>{
      setTimeout(()=>{
        tvs.push({...tv,real:false});render();vib(15);lp('O',200);
      },800+i*600);
    });

    // Real LAN scan
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
    setTimeout(()=>{scanning=false;render();T(tvs.length?tvs.length+' TV(s) FOUND!':'SCAN DONE')},6000);
  },'cg');

  btn('ADD MANUAL',()=>{
    const ip=prompt('TV IP address:')?.trim();
    const brand=prompt('Brand (Samsung/LG/Sony):','Samsung')?.trim()||'Custom';
    if(ip)tvs.push({brand,ip,model:'Custom',real:true});
    render();
  },'co');

  btn('CONNECT',()=>{
    const tv=tvs[0];if(!tv){T('SCAN FIRST');return}
    const id=tv.brand.toLowerCase();
    if(['samsung','lg','sony'].includes(id)){openApp(id)}
    else T('USE SAMSUNG/LG/SONY APPS');
  },'cy');

  btn('CLEAR',()=>{tvs=[];render()},'');
  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ══════════════════════════════════
   4. SUB-GHz
══════════════════════════════════ */
const SUBF=[315.00,433.92,868.35,915.00];
function appSubGHz(){
  S._subSigs=S._subSigs||[];S._subOn=false;S._subIdx=S._subIdx||1;
  rSub();clearCtx();
  btn('SCAN',subScan,'cg');btn('STOP',subStop,'');
  btn('REPLAY',()=>{if(!S._subSigs?.length){T('NOTHING TO REPLAY');return}T('REPLAYING...');for(let i=0;i<8;i++)setTimeout(()=>{flashIR();vib(8)},i*100)},'co');
  btn('◄ FREQ',()=>{S._subIdx=(S._subIdx-1+SUBF.length)%SUBF.length;rSub()},'');
  btn('FREQ ►',()=>{S._subIdx=(S._subIdx+1)%SUBF.length;rSub()},'');
  btn('CLEAR',()=>{S._subSigs=[];rSub()},'');
  _H={lt:()=>{S._subIdx=(S._subIdx-1+SUBF.length)%SUBF.length;rSub()},rt:()=>{S._subIdx=(S._subIdx+1)%SUBF.length;rSub()},ok:subScan}
}
function rSub(){
  const f=SUBF[S._subIdx||1].toFixed(2);
  const st=S._subOn?'<span class="bl">▶ RX ACTIVE</span>':'○ IDLE';
  const sigs=(S._subSigs||[]).slice(-6).reverse().map(s=>
    `<div class="scan-row"><span style="font-size:4.5px;color:var(--fgd)">${s.m}</span><span class="name">${s.f}MHz</span><span class="extra">${s.r}dBm</span></div>`
  ).join('');
  scr.innerHTML=`<div class="fi">
    <div class="sl h" style="font-size:8px;text-align:center">${f}<span class="sl d" style="font-size:5px"> MHz</span></div>
    <div class="sl d" style="text-align:center">◄ 315 · 433 · 868 · 915 ►</div>
    <div class="sl" style="text-align:center;margin:2px 0">${st}</div>
    <div class="hr"></div>
    ${sigs||'<div class="sl d">No signals captured</div>'}
    <div class="hr"></div>
    <div class="sl d">TOTAL: ${(S._subSigs||[]).length}</div>
  </div>`;
}
function subScan(){if(S._subOn)return;S._subOn=true;S._subSigs=[];rSub();const m=['ASK','FSK','OOK','2-FSK'];S._subInt=setInterval(()=>{if(!S._subOn)return;if(Math.random()>.42){S._subSigs.push({f:SUBF[S._subIdx||1].toFixed(2),r:-(25+rand(0,60)),m:m[rand(0,3)]});vib(5);lp('O',100)}rSub()},750)}
function subStop(){S._subOn=false;if(S._subInt){clearInterval(S._subInt);S._subInt=null}rSub()}

/* ══════════════════════════════════
   5. NFC
══════════════════════════════════ */
function appNFC(){rNFC();clearCtx();btn('READ',nfcRead,'cg');btn('WRITE',nfcWrite,'co');btn('STOP',()=>{S.nfcActive=false;try{S.nfcAbort?.abort()}catch(e){}rNFC()},'');btn('COPY UID',()=>{if(!S.nfcTag)return;navigator.clipboard?.writeText(S.nfcTag.uid).then(()=>T('UID COPIED!'))},'cy');_H={ok:nfcRead}}
function rNFC(){const t=S.nfcTag;scr.innerHTML=`<div class="fi"><div class="sl">${S.nfcActive?'<span class="bl">◈ SCANNING...</span>':'○ READY'}</div><div class="hr"></div>${t?`<div class="sl h">▶ TAG FOUND</div><div class="sl">UID: ${t.uid}</div><div class="sl d">TYPE: ${t.type}</div><div style="white-space:normal;font-size:5px;line-height:1.5;word-break:break-all;position:relative;z-index:2;color:var(--fg);font-family:var(--px)">DATA: ${t.data.slice(0,60)}</div>`:`<div class="sl d">Hold NFC tag to device.</div><div class="sl d">(Android Chrome)</div>`}</div>`;$('sNfc').classList.toggle('on',S.nfcActive||!!S.nfcTag)}
async function nfcRead(){if(!('NDEFReader' in window)){T('NO NFC (Android Chrome)');return}try{S.nfcActive=true;rNFC();const r=new NDEFReader();const ctrl=new AbortController();S.nfcAbort=ctrl;await r.scan({signal:ctrl.signal});r.addEventListener('reading',({message,serialNumber})=>{let data='',type='';for(const rec of message.records){type=rec.recordType;if(rec.recordType==='text'||rec.recordType==='url'){data=new TextDecoder(rec.encoding||'utf-8').decode(rec.data);break}else{data='['+rec.recordType+']';break}}S.nfcTag={uid:serialNumber,type:type||'NDEF',data:data||'No data'};S.nfcActive=false;T('TAG READ!');vib([60,20,60]);lp('G',700);addLog('NFC','UID:'+serialNumber);rNFC()});r.addEventListener('readingerror',()=>{S.nfcActive=false;T('NFC READ ERROR');rNFC()})}catch(e){S.nfcActive=false;if(e.name!=='AbortError')T('NFC: '+e.message.slice(0,14));rNFC()}}
async function nfcWrite(){if(!('NDEFReader' in window)){T('NO NFC');return}const msg=prompt('Text to write to NFC tag:');if(!msg)return;try{const r=new NDEFReader();await r.write({records:[{recordType:'text',data:msg}]});T('WRITTEN!');vib([40,20,40])}catch(e){T('WRITE: '+e.message.slice(0,14))}}

/* ══════════════════════════════════
   6–8. SAMSUNG / LG / SONY TV CONTROL
══════════════════════════════════ */
const SAM={power:'KEY_POWER',vUp:'KEY_VOLUMEUP',vDn:'KEY_VOLUMEDOWN',mute:'KEY_MUTE',chUp:'KEY_CHANNELUP',chDn:'KEY_CHANNELDOWN',up:'KEY_UP',dn:'KEY_DOWN',lt:'KEY_LEFT',rt:'KEY_RIGHT',ok:'KEY_ENTER',back:'KEY_RETURN',home:'KEY_HOME',menu:'KEY_MENU',source:'KEY_SOURCE'};
function appSam(){rSam();clearCtx();btn('CONNECT',samConnect,'cg');btn('POWER',()=>samKey('power'),'cr');btn('VOL+',()=>samKey('vUp'),'');btn('VOL-',()=>samKey('vDn'),'');btn('CH+',()=>samKey('chUp'),'');btn('CH-',()=>samKey('chDn'),'');btn('HOME',()=>samKey('home'),'co');btn('MUTE',()=>samKey('mute'),'cy');btn('SOURCE',()=>samKey('source'),'');_H={up:()=>samKey('up'),dn:()=>samKey('dn'),lt:()=>samKey('lt'),rt:()=>samKey('rt'),ok:()=>samKey('ok'),sU:()=>samKey('vUp'),sD:()=>samKey('vDn')}}
function rSam(){scr.innerHTML=`<div class="fi"><div class="sl h">${S.samOk?'<span class="bl">▶</span> '+S.samIp:'▶ '+(S.samIp||'NOT SET')}</div><div class="sl">${S.samOk?'● CONNECTED':'○ DISCONNECTED'}</div><div class="hr"></div><div class="sl d">Port 8001 · SmartThings WS</div><div class="sl d">Needs HTTP (not HTTPS)</div>${S.samOk?'<div class="sl y">● WS ACTIVE</div>':'<div class="sl d">Enter your TV\'s IP</div>'}</div>`}
async function samConnect(){const ip=(S.samIp||prompt('Samsung TV IP (e.g. 192.168.1.10):'))?.trim();if(!ip)return;S.samIp=ip;localStorage.setItem('sam_ip',ip);if(isHttps()){T('NEEDS HTTP MODE');return}if(S.samWs){try{S.samWs.close()}catch(e){}}T('CONNECTING...');startLoad(3500);S.samWs=new WebSocket(`ws://${ip}:8001/api/v2/channels/samsung.remote.control?name=${btoa('FlipperRemote')}`);S.samWs.onopen=()=>{S.samOk=true;T('SAMSUNG CONNECTED!');addLog('Sam','OK '+ip);vib([40,20,40]);lp('G',600);rSam()};S.samWs.onclose=()=>{S.samOk=false;if(S.app==='samsung')rSam()};S.samWs.onerror=()=>{S.samOk=false;T('CONNECT FAILED');if(S.app==='samsung')rSam()}}
function samKey(k){flashIR();vib(10);if(!S.samOk||S.samWs?.readyState!==1){T('NOT CONNECTED');return}S.samWs.send(JSON.stringify({method:'ms.remote.control',params:{Cmd:'Click',DataOfCmd:SAM[k],Option:'false',TypeOfRemote:'SendRemoteKey'}}))}

const LGU={off:'ssap://system/turnOff',vUp:'ssap://audio/volumeUp',vDn:'ssap://audio/volumeDown',chUp:'ssap://tv/channelUp',chDn:'ssap://tv/channelDown',toast:'ssap://system.notifications/createToast'};
let lgId=0,lgCb={};
function appLG(){rLG();clearCtx();btn('CONNECT',lgConnect,'cg');btn('POWER OFF',()=>lgSend(LGU.off),'cr');btn('VOL+',()=>lgSend(LGU.vUp),'');btn('VOL-',()=>lgSend(LGU.vDn),'');btn('CH+',()=>lgSend(LGU.chUp),'');btn('CH-',()=>lgSend(LGU.chDn),'');btn('MSG',()=>lgSend(LGU.toast,{message:'FlipperRemote 👾'}),'co');_H={up:()=>lgSend(LGU.vUp),dn:()=>lgSend(LGU.vDn),sU:()=>lgSend(LGU.vUp),sD:()=>lgSend(LGU.vDn)}}
function rLG(){scr.innerHTML=`<div class="fi"><div class="sl h">${S.lgOk?'<span class="bl">◉</span> '+S.lgIp:'◉ '+(S.lgIp||'NOT SET')}</div><div class="sl">${S.lgOk?'● CONNECTED':'○ DISCONNECTED'}</div><div class="hr"></div><div class="sl d">Port 3000 · WebOS WS</div>${S.lgKey?`<div class="sl d">KEY: ...${S.lgKey.slice(-8)}</div>`:'<div class="sl d">Will pair on TV screen</div>'}</div>`}
async function lgConnect(){const ip=(S.lgIp||prompt('LG TV IP:'))?.trim();if(!ip)return;S.lgIp=ip;localStorage.setItem('lg_ip',ip);if(isHttps()){T('NEEDS HTTP');return}if(S.lgWs){try{S.lgWs.close()}catch(e){}}T('CONNECTING...');startLoad(3500);S.lgWs=new WebSocket(`ws://${ip}:3000/`);S.lgWs.onopen=()=>lgReg();S.lgWs.onclose=()=>{S.lgOk=false;if(S.app==='lg')rLG()};S.lgWs.onerror=()=>{S.lgOk=false;T('LG FAILED');if(S.app==='lg')rLG()};S.lgWs.onmessage=e=>{try{const d=JSON.parse(e.data);if(d.type==='registered'){S.lgOk=true;S.lgKey=d.payload?.['client-key']||S.lgKey;localStorage.setItem('lg_key',S.lgKey);T('LG CONNECTED!');vib([40,20,40]);lp('G',600);rLG()}if(d.id&&lgCb[d.id]){lgCb[d.id](d.payload);delete lgCb[d.id]}}catch(e){}}}
function lgReg(){S.lgWs.send(JSON.stringify({type:'register',id:'reg0',payload:{forcePairing:false,pairingType:'PROMPT','client-key':S.lgKey||undefined,manifest:{manifestVersion:1,appVersion:'1.1',signed:{created:'20140509',appId:'com.flipperremote',vendorId:'flipper',localizedAppNames:{'':'FlipperRemote'},localizedVendorNames:{'':'FlipperRemote'},permissions:['CONTROL_POWER','CONTROL_AUDIO','TURN_OFF'],serial:'FR51'},permissions:['CONTROL_POWER','CONTROL_AUDIO','TURN_OFF'],signatures:[{signatureVersion:1,signature:'UNSIGNED'}]}}}))}
function lgSend(uri,payload={},cb){if(!S.lgOk||!S.lgWs){T('LG NOT CONNECTED');return}const id='fr'+(++lgId);if(cb)lgCb[id]=cb;S.lgWs.send(JSON.stringify({type:'request',id,uri,payload}));flashIR();vib(10)}

function appSony(){scr.innerHTML=`<div class="fi"><div class="sl h">◆ SONY BRAVIA</div><div class="sl">IP: ${S.sonyIp||'not set'}</div><div class="sl d">PSK: ${S.sonyPsk}</div><div class="hr"></div><div class="sl d">TV Settings › Remote Start ON</div><div class="hr"></div><div class="sl ${isHttps()?'r':'h'}">${isHttps()?'⚠ Run via HTTP only':'● HTTP MODE OK'}</div></div>`;clearCtx();btn('POWER OFF',sonyOff,'cr');btn('POWER ON',sonyOn,'cg');btn('VOL+',()=>sonyA('setAudioVolume',{volume:'+1',target:'speaker'}),'');btn('VOL-',()=>sonyA('setAudioVolume',{volume:'-1',target:'speaker'}),'');btn('INFO',sonyInfo,'co');btn('SET IP',()=>{const ip=prompt('Sony IP:','')?.trim();if(ip){S.sonyIp=ip;localStorage.setItem('sony_ip',ip);openApp('sony')}},'');_H={sU:()=>sonyA('setAudioVolume',{volume:'+1'}),sD:()=>sonyA('setAudioVolume',{volume:'-1'})}}
async function sonyReq(svc,method,params=[]){const ip=S.sonyIp||prompt('Sony IP:')?.trim();if(!ip)return null;S.sonyIp=ip;if(isHttps())return null;try{const r=await fetch(`http://${ip}/sony/${svc}`,{method:'POST',headers:{'Content-Type':'application/json','X-Auth-PSK':S.sonyPsk},body:JSON.stringify({method,id:1,params,version:'1.0'})});return await r.json()}catch(e){T('SONY ERR');return null}}
async function sonyOff(){flashIR();vib(30);const d=await sonyReq('system','setPowerStatus',[{status:false}]);if(d&&!d.error)T('POWER OFF')}
async function sonyOn(){flashIR();vib(30);const d=await sonyReq('system','setPowerStatus',[{status:true}]);if(d&&!d.error)T('POWER ON')}
async function sonyA(m,p){flashIR();vib(10);await sonyReq('audio',m,[p])}
async function sonyInfo(){const d=await sonyReq('system','getSystemInformation',[]);if(d?.result?.[0])T((d.result[0].model||'Sony').slice(0,20))}

/* ══════════════════════════════════
   9. IR BLASTER
══════════════════════════════════ */
function appIR(){scr.innerHTML=`<div class="fi"><div class="sl h">~ IR BLASTER</div><div class="sl">${S.port?'● SERIAL OK':'○ NO SERIAL'}</div><div class="hr"></div><div class="sl d">Needs: Arduino + IR LED</div><div class="sl d">Pin 9 + 100Ω + IRremote</div><div class="hr"></div><div class="sl ${'serial' in navigator?'h':'r'}">${'serial' in navigator?'● Web Serial OK':'⚠ Chrome desktop only'}</div></div>`;clearCtx();btn('CONNECT',async()=>{if(!('serial' in navigator)){T('CHROME DESKTOP REQUIRED');return}try{S.port=await navigator.serial.requestPort();await S.port.open({baudRate:9600});const enc=new TextEncoderStream();enc.readable.pipeTo(S.port.writable);S.portWriter=enc.writable.getWriter();T('SERIAL CONNECTED!');lp('G',600);openApp('ir')}catch(e){T('ERR: '+e.message.slice(0,14))}},'cg');btn('POWER',()=>irSend('POWER'),'cr');btn('VOL+',()=>irSend('VOLU'),'');btn('VOL-',()=>irSend('VOLD'),'');btn('CH+',()=>irSend('CHU'),'');btn('CH-',()=>irSend('CHD'),'');btn('MUTE',()=>irSend('MUTE'),'cy');_H={sU:()=>irSend('VOLU'),sD:()=>irSend('VOLD'),ok:()=>irSend('POWER')}}
async function irSend(cmd){flashIR();vib(12);if(S.portWriter){try{await S.portWriter.write(cmd+'\n');T('IR: '+cmd)}catch(e){T('SEND FAILED')}}else T('CONNECT SERIAL FIRST')}

/* ══════════════════════════════════
   10. FLASHLIGHT
══════════════════════════════════ */
function appFlashlight(){let torchOn=false,screenOn=false,strobeInt=null,_ftStream=null;const render=()=>{scr.innerHTML=`<div class="fi" style="text-align:center"><div class="sl h">◎ FLASHLIGHT</div><div class="hr"></div><div class="sl d">TORCH: ${torchOn?'<span style="color:var(--fl)">● ON</span>':'○ OFF'}</div><div class="sl d">SCREEN: ${screenOn?'<span style="color:var(--fl)">● WHITE</span>':'○ OFF'}</div></div>`};render();clearCtx();btn('TORCH',async()=>{try{if(!_ftStream){_ftStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});window._camStream=_ftStream}const track=_ftStream.getVideoTracks()[0];const caps=track.getCapabilities();if(!caps.torch){T('NO TORCH ON THIS DEVICE');return}torchOn=!torchOn;await track.applyConstraints({advanced:[{torch:torchOn}]});lp(torchOn?'O':'G',300);render();T('TORCH '+(torchOn?'ON':'OFF'))}catch(e){T('CAM ERR: '+e.message.slice(0,14))}},'cy');btn('SCREEN',()=>{if(strobeInt){clearInterval(strobeInt);strobeInt=null}screenOn=!screenOn;const existing=document.querySelector('.clr-screen');if(screenOn){const ov=document.createElement('div');ov.className='clr-screen';ov.style.background='#ffffff';ov.style.color='#000';ov.innerHTML='<span style="font-family:var(--px);font-size:8px">TAP TO CLOSE</span>';ov.onclick=()=>{ov.remove();screenOn=false;render()};document.querySelector('.screen').appendChild(ov)}else{existing?.remove()}render()},'cg');btn('STROBE',()=>{if(strobeInt){clearInterval(strobeInt);strobeInt=null;document.querySelector('.clr-screen')?.remove();T('STROBE OFF');render();return}const s=document.querySelector('.screen');let on=false;strobeInt=setInterval(()=>{document.querySelector('.clr-screen')?.remove();if(on){const ov=document.createElement('div');ov.className='clr-screen';ov.style.background='#ffffff';s.appendChild(ov)}on=!on;vib(4)},80);T('STROBE ON!')},'cp');btn('SOS',()=>{const morse=[3,1,3,1,3,2,1,1,1,1,1,1,3,1,3,1,3];let i=0;const s=document.querySelector('.screen');const next=()=>{if(i>=morse.length){i=0;setTimeout(next,800);return}const d=morse[i]*150;const ov=document.createElement('div');ov.className='clr-screen';ov.style.background='#FF3355';s.appendChild(ov);vib(d);setTimeout(()=>{ov.remove();i++;setTimeout(next,80)},d)};document.querySelector('.clr-screen')?.remove();next();T('SOS SIGNAL')},'cr')}

/* ══════════════════════════════════
   11. SOUND METER
══════════════════════════════════ */
function appSound(){scr.innerHTML=`<div class="fi"><div class="sl h">♪ SOUND METER</div><div class="hr"></div><canvas id="sCvs" class="vz"></canvas><div class="sl d" id="sDb">LEVEL: ---</div><div class="sl d" id="sPk">PEAK:  ---</div><div id="sRank" class="sl" style="text-align:center;margin-top:3px"></div></div>`;clearCtx();btn('START',soundStart,'cg');btn('STOP',soundStop,'cr');btn('HOLD',()=>{window._sHold=!window._sHold;T(window._sHold?'PEAK HOLD':'HOLD OFF')},'cy');btn('RESET',()=>{window._sPeak=-100},'');_H={ok:soundStart}}
window._sPeak=-100;window._sHold=false;
async function soundStart(){soundStop();try{const stream=await navigator.mediaDevices.getUserMedia({audio:{noiseSuppression:false,autoGainControl:false},video:false});S.audioCtx=new(window.AudioContext||window.webkitAudioContext)();S.analyser=S.audioCtx.createAnalyser();S.analyser.fftSize=256;S.analyser.smoothingTimeConstant=0.65;S.audioCtx.createMediaStreamSource(stream).connect(S.analyser);window._sPeak=-100;const draw=()=>{if(!S.analyser)return;S.vRaf=requestAnimationFrame(draw);const c=document.getElementById('sCvs');if(!c)return;const cx=c.getContext('2d'),W=c.width=c.offsetWidth,H=c.height=48;const freq=new Uint8Array(S.analyser.frequencyBinCount);S.analyser.getByteFrequencyData(freq);const flt=new Float32Array(S.analyser.frequencyBinCount);S.analyser.getFloatFrequencyData(flt);const avg=flt.reduce((a,v)=>a+v,0)/flt.length;const db=Math.max(-80,Math.min(0,avg));if(db>window._sPeak)window._sPeak=db;const pct=(db+80)/80,ppct=(window._sPeak+80)/80;cx.fillStyle='#020202';cx.fillRect(0,0,W,H);for(let i=0;i<32;i++){const v=freq[i*2]/255;const col=v>.75?'#FF3355':v>.4?'#FFD600':'#F5C400';cx.fillStyle=col+'cc';cx.fillRect(i*(W/32),H*(1-v),(W/32)-1.5,H*v)}cx.fillStyle='#1a1400';cx.fillRect(0,H-6,W,6);const g=cx.createLinearGradient(0,0,W,0);g.addColorStop(0,'#F5C400');g.addColorStop(.7,'#FFD600');g.addColorStop(1,'#FF3355');cx.fillStyle=g;cx.fillRect(0,H-6,W*pct,6);if(window._sHold){cx.fillStyle='#fff';cx.fillRect(W*ppct-1,H-9,2,9)}const el=$('sDb');if(el)el.textContent='LEVEL: '+db.toFixed(1)+' dB';const ep=$('sPk');if(ep)ep.textContent='PEAK:  '+window._sPeak.toFixed(1)+' dB';const rk=$('sRank');if(rk){const rank=db>-5?'VERY LOUD':db>-20?'LOUD':db>-40?'NORMAL':db>-60?'QUIET':'SILENT';rk.textContent=rank}};draw();lp('G',300)}catch(e){T('MIC: '+e.message.slice(0,16))}}
function soundStop(){if(S.vRaf){cancelAnimationFrame(S.vRaf);S.vRaf=null}if(S.audioCtx){S.audioCtx.close().catch(()=>{});S.audioCtx=null;S.analyser=null}}

/* ══════════════════════════════════
   12. COMPASS
══════════════════════════════════ */
function appCompass(){clearCtx();btn('REQUEST',async()=>{if(typeof DeviceOrientationEvent?.requestPermission==='function'){try{await DeviceOrientationEvent.requestPermission();T('COMPASS OK!')}catch(e){T('DENIED')}}else T('ACTIVE')},'cg');btn('SHARE',()=>navigator.share?.({title:'Heading',text:`Heading: ${_sx.al}°`}).catch(()=>{}),'co');const draw=()=>{window._sRaf=requestAnimationFrame(draw);if(S.app!=='compass')return;const h=_sx.al;const dirs=['N','NE','E','SE','S','SW','W','NW','N'];const di=Math.round(h/45)%8;scr.innerHTML=`<div class="fi" style="display:flex;flex-direction:column;align-items:center"><div class="sl h" style="text-align:center">⊕ COMPASS</div><div class="hr"></div><div class="cpw"><div class="cpn" style="transform:rotate(${h}deg)"></div><div class="cpl">${dirs[di]}</div></div><div class="bignum" style="font-size:20px;letter-spacing:2px">${String(h).padStart(3,'0')}°</div><div class="sl d" style="text-align:center">TILT: ${Math.round(Math.sqrt(_sx.be**2+_sx.ga**2))}°</div></div>`};draw()}

/* ══════════════════════════════════
   13. BUBBLE LEVEL
══════════════════════════════════ */
function appLevel(){clearCtx();btn('REQUEST',async()=>{if(typeof DeviceMotionEvent?.requestPermission==='function'){try{await DeviceMotionEvent.requestPermission();T('OK!')}catch(e){T('DENIED')}}else T('ACTIVE')},'cg');const draw=()=>{window._sRaf=requestAnimationFrame(draw);if(S.app!=='level')return;const bx=Math.max(-40,Math.min(40,_sx.ga));const by=Math.max(-40,Math.min(40,_sx.be-90));const tilt=Math.round(Math.sqrt(bx**2+by**2));const ok=tilt<3;const bxPct=50+bx*(50/40);const byPct=50+by*(50/40);scr.innerHTML=`<div class="fi" style="display:flex;flex-direction:column;align-items:center"><div class="sl h" style="text-align:center">═ BUBBLE LEVEL</div><div class="hr"></div><div style="position:relative;width:80px;height:80px;border-radius:50%;border:2px solid var(--fgd);margin:4px auto"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;border-radius:50%;background:var(--fgd)"></div><div style="position:absolute;width:14px;height:14px;border-radius:50%;background:${ok?'var(--fl)':'var(--fr)'};box-shadow:0 0 ${ok?12:4}px ${ok?'var(--fl)':'var(--fr)'};left:${bxPct}%;top:${byPct}%;transform:translate(-50%,-50%);transition:left .05s,top .05s"></div></div><div class="sl" style="text-align:center;color:${ok?'var(--fl)':'var(--fr)'}">${ok?'● LEVEL':'○ TILT '+tilt+'°'}</div></div>`};draw()}

/* ══════════════════════════════════
   14. QR SCANNER
══════════════════════════════════ */
function appQR(){scr.innerHTML=`<div class="fi"><div class="sl h">▣ QR / BARCODE</div><div class="hr"></div><video id="qrV" style="width:100%;border-radius:3px;display:none" autoplay playsinline muted></video><div class="sl d" id="qrSt">Press SCAN</div><div id="qrR" style="white-space:normal;word-break:break-all;font-size:5.5px;line-height:1.5;margin-top:2px;position:relative;z-index:2;font-family:var(--px);color:var(--fg)"></div></div>`;clearCtx();btn('SCAN',qrScan,'cg');btn('STOP',qrStop,'cr');btn('OPEN',()=>{if(!window._qrLast){T('SCAN FIRST');return}if(window._qrLast.startsWith('http'))window.open(window._qrLast,'_blank');else T(window._qrLast.slice(0,30))},'co');btn('COPY',()=>{if(!window._qrLast){T('SCAN FIRST');return}navigator.clipboard?.writeText(window._qrLast).then(()=>T('COPIED!'))},'cy');_H={ok:qrScan};window._qrLast=''}
async function qrScan(){qrStop();if(!('BarcodeDetector' in window)){T('NOT SUPPORTED (Android Chrome)');return}try{window._qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false});const vid=$('qrV');if(!vid)return;vid.srcObject=window._qrStream;vid.style.display='block';const s=$('qrSt');if(s)s.textContent='SCANNING...';const bd=new BarcodeDetector({formats:['qr_code','ean_13','ean_8','code_128','code_39','upc_a','data_matrix']});window._qrInt=setInterval(async()=>{if(!vid.videoWidth)return;try{const codes=await bd.detect(vid);if(codes.length){window._qrLast=codes[0].rawValue;const el=$('qrR');if(el)el.textContent='▶ '+window._qrLast.slice(0,80);const st=$('qrSt');if(st)st.textContent='FMT: '+codes[0].format.toUpperCase();T('QR FOUND!');vib([60,20,60]);lp('G',400)}}catch(e){}},500)}catch(e){T('CAM: '+e.message.slice(0,16))}}
function qrStop(){if(window._qrInt){clearInterval(window._qrInt);window._qrInt=null}if(window._qrStream){window._qrStream.getTracks().forEach(t=>t.stop());window._qrStream=null}}

/* ══════════════════════════════════
   15. CAMERA
══════════════════════════════════ */
function appCam(){scr.innerHTML=`<div class="fi"><div class="sl h">◎ CAMERA</div><div class="hr"></div><video id="cV" style="width:100%;border-radius:3px;display:none" autoplay playsinline muted></video><canvas id="cC" style="width:100%;border-radius:3px;display:none"></canvas><div class="sl d" id="cSt">Press FRONT or BACK</div></div>`;clearCtx();btn('FRONT',()=>camStart('user'),'cg');btn('BACK',()=>camStart('environment'),'co');btn('PHOTO',camPhoto,'cy');btn('TORCH',camTorch,'');btn('STOP',camOff,'cr');_H={ok:camPhoto}}
let _cStream=null,_cTrack=null;
async function camStart(f){camOff();try{_cStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:f,width:{ideal:640}},audio:false});const v=$('cV');if(!v)return;v.srcObject=_cStream;v.style.display='block';_cTrack=_cStream.getVideoTracks()[0];const s=$('cSt');if(s)s.textContent='LIVE: '+f.toUpperCase();window._camStream=_cStream}catch(e){T('CAM: '+e.message.slice(0,16))}}
function camPhoto(){if(!_cStream){T('START CAMERA FIRST');return}const v=$('cV'),c=$('cC');if(!v||!c)return;c.width=v.videoWidth||320;c.height=v.videoHeight||240;c.getContext('2d').drawImage(v,0,0);c.style.display='block';v.style.display='none';c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='photo_'+Date.now()+'.jpg';a.click();T('PHOTO SAVED!');vib([30,10,30])},'image/jpeg',.92)}
async function camTorch(){if(!_cTrack){T('START BACK CAM');return}const caps=_cTrack.getCapabilities();if(!caps.torch){T('NO TORCH');return}const cur=_cTrack.getSettings().torch||false;await _cTrack.applyConstraints({advanced:[{torch:!cur}]});T('TORCH: '+((!cur)?'ON':'OFF'))}
function camOff(){if(_cStream){_cStream.getTracks().forEach(t=>t.stop());_cStream=null;_cTrack=null;window._camStream=null}}

/* ══════════════════════════════════
   16. MORSE
══════════════════════════════════ */
function appMorse(){const MC={'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'};let _mt='SOS';const render=()=>{const coded=_mt.toUpperCase().split('').map(c=>MC[c]||'').join(' ');scr.innerHTML=`<div class="fi"><div class="sl h">· MORSE VIBRO</div><div class="hr"></div><div class="sl" style="text-align:center">${_mt}</div><div class="morse-txt">${coded}</div></div>`};render();clearCtx();btn('PLAY',async()=>{const coded=_mt.toUpperCase().split('').map(c=>MC[c]).filter(Boolean).join(' _ ').split('');let pos=0;const next=async()=>{if(pos>=coded.length)return;const c=coded[pos++];if(c==='.')vib(80);else if(c==='-')vib(250);else if(c==='_'){await new Promise(r=>setTimeout(r,200));next();return}else{await new Promise(r=>setTimeout(r,100));next();return}lp('O',c==='.'?80:250);await new Promise(r=>setTimeout(r,c==='.'?200:400));next()};next();T('PLAYING...')},'cg');btn('INPUT',()=>{const t=prompt('Text to encode:');if(t){_mt=t;render()}},'co');btn('DECODE',()=>{const m=prompt('Morse (. - and spaces):');if(!m)return;const rev=Object.fromEntries(Object.entries(MC).map(([k,v])=>[v,k]));T('DECODED: '+m.split(' ').map(w=>rev[w]||'?').join(''))},'cy');_H={ok:()=>document.querySelector('.cb.cg')?.click()}}

/* ══════════════════════════════════
   17. SPEECH
══════════════════════════════════ */
function appSpeech(){scr.innerHTML=`<div class="fi"><div class="sl h">◬ SPEECH</div><div class="hr"></div><div class="sl d" id="spSt">READY</div><div class="hr"></div><div id="spTxt" style="white-space:normal;line-height:1.5;font-size:5.5px;position:relative;z-index:2;font-family:var(--px);color:var(--fg)">---</div></div>`;clearCtx();btn('LISTEN',spListen,'cg');btn('STOP',spStop,'');btn('SPEAK',spSpeak,'co');btn('CLEAR',()=>{const e=$('spTxt');if(e)e.textContent='---'},'');_H={ok:spListen}}
let _recog=null;
function spListen(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){T('NOT SUPPORTED');return}spStop();_recog=new SR();_recog.continuous=true;_recog.interimResults=true;_recog.lang='en-US';_recog.onstart=()=>{const e=$('spSt');if(e)e.textContent='LISTENING...'};_recog.onresult=e=>{let f='',i2='';for(let j=e.resultIndex;j<e.results.length;j++){if(e.results[j].isFinal)f+=e.results[j][0].transcript;else i2+=e.results[j][0].transcript}const el=$('spTxt');if(el)el.textContent=(f||i2).slice(0,120)||'---';if(f){addLog('Speech',f.slice(0,30));lp('G',200)}};_recog.onerror=e=>{const el=$('spSt');if(el)el.textContent='ERR: '+e.error};_recog.onend=()=>{const el=$('spSt');if(el)el.textContent='STOPPED'};_recog.start();T('LISTENING...')}
function spStop(){if(_recog){try{_recog.stop()}catch(e){}}_recog=null}
function spSpeak(){if(!window.speechSynthesis){T('NO TTS');return}const msg=prompt('Text to speak:');if(!msg)return;window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(msg),{rate:.95}));T('SPEAKING...')}

/* ══════════════════════════════════
   18. REACTION TIME
══════════════════════════════════ */
function appReaction(){let state='idle',t0=0,results=[];const grade=ms=>ms<180?'INHUMAN ⚡':ms<220?'PRO ⚡':ms<280?'GREAT!':ms<350?'GOOD':ms<450?'OK':'SLOW';const render=(msg='TAP TO START',cls='')=>{const avg=results.length?Math.round(results.reduce((a,b)=>a+b)/results.length):0;scr.innerHTML=`<div class="fi" style="display:flex;flex-direction:column;align-items:center"><div class="sl h" style="text-align:center">! REACTION TIME</div><div class="hr"></div><div class="rc${cls?' '+cls:''}" id="rC">${msg}</div><div class="sl d" style="text-align:center;font-size:5px">${state==='waiting'?'WAIT...':state==='go'?'TAP NOW!':''}</div><div class="hr"></div><div class="sl d">BEST: ${results.length?Math.min(...results)+'ms':'---'}  AVG: ${avg?avg+'ms':'---'}</div></div>`;setTimeout(()=>document.getElementById('rC')?.addEventListener('click',tap),0)};const tap=()=>{if(state==='idle'){state='waiting';render('WAIT...','');window._rT=setTimeout(()=>{t0=Date.now();state='go';render('TAP!','go');lp('G',3000);vib([5])},1200+Math.random()*2800)}else if(state==='go'){const ms=Date.now()-t0;results.push(ms);state='idle';clearTimeout(window._rT);render(ms+'ms');T(ms+'ms — '+grade(ms));vib(ms<260?[30,10,30]:[15])}else if(state==='waiting'){state='idle';clearTimeout(window._rT);render('TOO EARLY!','bad');vib([120]);setTimeout(()=>render('TAP TO START'),1300)}else render('TAP TO START')};render();clearCtx();btn('START',tap,'cg');btn('RESET',()=>{results=[];state='idle';clearTimeout(window._rT);render('TAP TO START')},'');_H={ok:tap}}

/* ══════════════════════════════════
   19. TALLY
══════════════════════════════════ */
function appTally(){let count=0,total=0,sets=[];const render=()=>{scr.innerHTML=`<div class="fi"><div class="sl d" style="text-align:center;font-size:5px">TAP SCREEN OR OK TO COUNT</div><div class="tally">${String(count).padStart(4,'0')}</div><div class="sl d" style="text-align:center">SESSION: ${total}</div><div class="hr"></div>${sets.slice(-3).reverse().map(s=>`<div class="sl d" style="text-align:center;font-size:5px">SET: ${s}</div>`).join('')}</div>`;scr.onclick=tap};const tap=()=>{count++;total++;vib([6]);lp('G',55);render()};render();clearCtx();btn('+1',tap,'cg');btn('UNDO',()=>{if(count>0){count--;total--;vib([18]);render()}},'');btn('SAVE SET',()=>{sets.push(count);count=0;render();T('SET '+sets.length+' SAVED!')},'co');btn('RESET',()=>{if(count>0)sets.push(count);count=0;render()},'');_H={ok:tap,sU:tap,sD:()=>{if(count>0){count--;total--;vib([18]);render()}}}}

/* ══════════════════════════════════
   20. STOPWATCH
══════════════════════════════════ */
function appStopwatch(){let start=0,elapsed=0,running=false,laps=[];const fmt=ms=>{const min=Math.floor(ms/60000);const sec=Math.floor((ms%60000)/1000);const mss=Math.floor((ms%1000)/10);return `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}<span class="sw-ms">.${String(mss).padStart(2,'0')}</span>`};const render=()=>{const now=running?elapsed+(Date.now()-start):elapsed;scr.innerHTML=`<div class="fi"><div class="sl h" style="text-align:center">⏱ STOPWATCH</div><div class="sw-time" style="text-align:center">${fmt(now)}</div><div class="hr"></div>${laps.slice(-4).reverse().map((l,i)=>`<div class="sl d" style="text-align:center;font-size:5px">LAP ${laps.length-i}: ${fmt(l).replace(/<[^>]+>/g,'')}</div>`).join('')}</div>`};render();window._swInt=setInterval(()=>{if(running&&S.app==='stopwatch')render()},33);clearCtx();btn('START/STOP',()=>{if(running){elapsed+=Date.now()-start;running=false}else{start=Date.now();running=true}render();vib(running?[15]:[30])},'cg');btn('LAP',()=>{if(!running){T('START FIRST');return}laps.push(elapsed+(Date.now()-start));T('LAP '+laps.length);vib([10,5,10])},'co');btn('RESET',()=>{running=false;elapsed=0;laps=[];render();T('RESET')},'');_H={ok:()=>{if(running){elapsed+=Date.now()-start;running=false}else{start=Date.now();running=true}render()}}}

/* ══════════════════════════════════
   21. HACKER MODE — ENHANCED
══════════════════════════════════ */
function appHack(){
  const lines=[
    {t:'p',s:'> FLIPPER REMOTE v5.1 BOOT...'},
    {t:'ok',s:'[OK] CC1101 RF chip online'},
    {t:'ok',s:'[OK] NRF52840 BLE active'},
    {t:'ok',s:'[OK] ST25R NFC reader OK'},
    {t:'p',s:'> Scanning 2.4GHz band...'},
    {t:'ok',s:'[OK] 14 WiFi networks found'},
    {t:'ok',s:'[OK] 9 BLE devices in range'},
    {t:'p',s:'> Checking IR field...'},
    {t:'ok',s:'[OK] IR carrier 38kHz detected'},
    {t:'p',s:'> Sub-GHz @ 433.92MHz...'},
    {t:'ok',s:'[OK] OOK signal: RSSI -42dBm'},
    {t:'p',s:'> NFC scan...'},
    {t:'ok',s:'[OK] ISO 14443-A 07h detected'},
    {t:'p',s:'> GPS constellation...'},
    {t:'ok',s:'[OK] Fix: 11 sats · HDOP 0.9'},
    {t:'ok',s:'> ALL SYSTEMS GO ◈'},
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
    // Continuous rolling fake scan output
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

/* ══════════════════════════════════
   22. CALCULATOR
══════════════════════════════════ */
function appCalc(){let expr='';const render=()=>{scr.innerHTML=`<div class="fi"><div class="sl h" style="text-align:center">∑ CALCULATOR</div><div class="hr"></div><div style="text-align:right;font-family:var(--mo);font-size:10px;color:var(--fl);padding:4px;min-height:20px;word-break:break-all;position:relative;z-index:2">${expr||'0'}</div><div class="hr"></div><div id="calcPad" style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;padding:2px;position:relative;z-index:2"></div></div>`;const pad=$('calcPad');['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+','C','(',')','%'].forEach(k=>{const b=document.createElement('button');b.style.cssText=`padding:5px 2px;background:#111;border:1px solid #1e1e1e;border-radius:3px;color:${k==='='?'#000':'var(--fl)'};font-family:var(--px);font-size:5px;cursor:pointer;${k==='='?'background:var(--fl);':''}`;b.textContent=k;b.onclick=()=>{vib(6);if(k==='C'){expr='';render();return}if(k==='='){try{const r=Function('"use strict";return ('+expr.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-')+')')();expr=String(parseFloat(r.toFixed(8)))}catch(e){expr='ERR'}render();return}expr+=k;render()};pad?.appendChild(b)})};render();clearCtx();_H={ok:()=>{}}}

/* ══════════════════════════════════
   23. NOTES
══════════════════════════════════ */
function appNotes(){let notes=JSON.parse(localStorage.getItem('fr_notes')||'[]');let sel=-1;const save=()=>localStorage.setItem('fr_notes',JSON.stringify(notes));const render=()=>{scr.innerHTML=`<div class="fi sl2"><div class="sl h">≡ NOTES (${notes.length})</div><div class="hr"></div>${notes.length?notes.map((n,i)=>`<div class="mi${i===sel?' s':''}" onclick="window._noteSel(${i})"><span class="ic">≡</span><span style="flex:1;margin-left:3px">${n.slice(0,22)}</span></div>`).join(''):'<div class="sl d">No notes yet</div>'}</div>`;window._noteSel=i=>{sel=i;render()}};render();clearCtx();btn('NEW',()=>{const t=prompt('New note:');if(t){notes.unshift(t);save();sel=0;render();T('SAVED!')}},'cg');btn('VIEW',()=>{if(sel<0||!notes[sel]){T('SELECT A NOTE');return}showModal(`<div style="color:var(--fl);font-size:6px;margin-bottom:6px">≡ NOTE</div><div style="white-space:pre-wrap;line-height:2;font-size:5px">${notes[sel]}</div><button class="cb cg" onclick="closeModal()" style="margin-top:8px;max-width:none;flex:none;padding:6px 12px">CLOSE</button>`)},'co');btn('DELETE',()=>{if(sel<0){T('SELECT NOTE');return}notes.splice(sel,1);sel=-1;save();render();T('DELETED')},'cr');btn('COPY',()=>{if(sel<0){T('SELECT NOTE');return}navigator.clipboard?.writeText(notes[sel]).then(()=>T('COPIED!'))},'');_H={up:()=>{sel=Math.max(0,sel-1);render()},dn:()=>{sel=Math.min(notes.length-1,sel+1);render()},ok:()=>document.querySelector('.cb.co')?.click()}}

/* ══════════════════════════════════
   24. GPS
══════════════════════════════════ */
function appGPS(){rGPS();clearCtx();btn('START',gpsStart,'cg');btn('STOP',()=>{if(S.gpsWatch){navigator.geolocation.clearWatch(S.gpsWatch);S.gpsWatch=null}rGPS()},'');btn('MAPS',()=>{if(S.gpsPos)window.open(`https://maps.google.com/?q=${S.gpsPos.lat},${S.gpsPos.lon}`,'_blank');else T('NO GPS')},'co');btn('SHARE',()=>{if(!S.gpsPos){T('NO GPS');return}const u=`https://maps.google.com/?q=${S.gpsPos.lat.toFixed(6)},${S.gpsPos.lon.toFixed(6)}`;navigator.share?.({title:'My Location',url:u}).catch(()=>navigator.clipboard?.writeText(u).then(()=>T('LINK COPIED!')))},'cy');_H={ok:gpsStart}}
function rGPS(){const d=S.gpsPos;scr.innerHTML=`<div class="fi"><div class="sl">${S.gpsWatch!==null?'<span class="bl">⊕ TRACKING</span>':'○ IDLE'}</div><div class="sl d">PTS: ${S.gpsTrack.length}</div><div class="hr"></div>${d?`<div class="sl h">LAT: ${d.lat.toFixed(6)}</div><div class="sl h">LON: ${d.lon.toFixed(6)}</div><div class="sl">ACC: ±${Math.round(d.acc)}m</div><div class="sl d">SPD: ${d.spd!=null?(d.spd*3.6).toFixed(1)+' km/h':'N/A'}</div>`:'<div class="sl d">Press START</div>'}</div>`}
function gpsStart(){if(!navigator.geolocation){T('NO GPS');return}if(S.gpsWatch)return;T('ACQUIRING...');startLoad(10000);S.gpsWatch=navigator.geolocation.watchPosition(pos=>{S.gpsPos={lat:pos.coords.latitude,lon:pos.coords.longitude,acc:pos.coords.accuracy,alt:pos.coords.altitude,spd:pos.coords.speed};S.gpsTrack.push({...S.gpsPos,t:Date.now()});if(S.gpsTrack.length>1000)S.gpsTrack.shift();lp('G',150);if(S.app==='gps')rGPS()},err=>{T('GPS: '+err.message.slice(0,16));S.gpsWatch=null;rGPS()},{enableHighAccuracy:true,maximumAge:0,timeout:30000})}

/* ══════════════════════════════════
   25. WAKE LOCK
══════════════════════════════════ */
function appWake(){rWake();clearCtx();btn('LOCK ON',wakeOn,'cg');btn('LOCK OFF',wakeOff,'cr');}
function rWake(){scr.innerHTML=`<div class="fi"><div class="sl h">⊙ WAKE LOCK</div><div class="sl">${S.wakeLock?'<span class="bl">● ACTIVE</span>':'○ INACTIVE'}</div><div class="hr"></div><div class="sl d">Keeps screen awake.</div><div class="sl d">Good for TV use.</div><div class="hr"></div><div class="sl ${'wakeLock' in navigator?'h':'r'}">${'wakeLock' in navigator?'● SUPPORTED':'⚠ NOT SUPPORTED'}</div></div>`}
async function wakeOn(){if(!('wakeLock' in navigator)){T('NOT SUPPORTED');return}try{S.wakeLock=await navigator.wakeLock.request('screen');S.wakeLock.addEventListener('release',()=>{S.wakeLock=null;if(S.app==='wakelock')rWake()});T('WAKE LOCK ON!');lp('G',500);rWake()}catch(e){T('WAKE: '+e.message.slice(0,14))}}
async function wakeOff(){if(S.wakeLock){await S.wakeLock.release();S.wakeLock=null}T('WAKE LOCK OFF');rWake()}

/* ══════════════════════════════════
   26. SHARE
══════════════════════════════════ */
function appShare(){scr.innerHTML=`<div class="fi"><div class="sl h">⊿ SHARE</div><div class="hr"></div><div class="sl d">Share content to any app.</div><div class="hr"></div><div class="sl ${'share' in navigator?'h':'r'}">${'share' in navigator?'● SHARE API OK':'⚠ NOT SUPPORTED'}</div></div>`;clearCtx();btn('SHARE APP',()=>navigator.share?.({title:'FlipperRemote',text:'Check out FlipperRemote 👾',url:location.href}).catch(()=>{}),'cg');btn('SHARE GPS',()=>{if(!S.gpsPos){T('GET GPS FIRST');return}navigator.share?.({title:'My Location',url:`https://maps.google.com/?q=${S.gpsPos.lat.toFixed(6)},${S.gpsPos.lon.toFixed(6)}`}).catch(()=>{})},'co');btn('SHARE TEXT',()=>{const t=prompt('Text to share:');if(t)navigator.share?.({title:'FR',text:t}).catch(()=>{})},'cy')}

/* ══════════════════════════════════
   27. SYSTEM
══════════════════════════════════ */
function appSystem(){
  clearCtx();btn('REFRESH',rSys,'cg');btn('LOG',appLog,'co');btn('INSTALL',()=>{if(window._pwaP){window._pwaP.prompt()}else showModal(`<div style="color:var(--fl);font-size:7px;margin-bottom:8px">INSTALL APP</div><div>iOS: Share ▶ Add to Home Screen<br><br>Android: Menu ▶ Add to Home Screen</div><button class="cb cg" onclick="closeModal()" style="margin-top:8px;max-width:none;flex:none;padding:6px 12px">OK</button>`)},'cy');
  rSys();_H={ok:rSys};
}
function rSys(){
  scr.innerHTML=`<div class="fi">
    <div style="display:flex;justify-content:center;margin:2px 0">
      <div class="px-logo" style="max-width:80px;gap:1px">
        ${PIXEL_LOGO.flat().map(v=>`<span ${v?'class="on"':''}></span>`).join('')}
      </div>
    </div>
    <div class="sl h" style="text-align:center;font-size:5px">FLIPPER REMOTE v5.1</div>
    <div class="hr"></div>
    <div class="sl d">APPS: ${MENU.length}  LOG: ${S.log.length}</div>
    <div class="sl d">BAT: ${S.battery?Math.round(S.battery.level*100)+'%'+(S.battery.charging?' ⚡':''):'N/A'}</div>
    <div class="hr"></div>
    <div class="sl d">BT:${'bluetooth' in navigator?'✓':'✗'} NFC:${'NDEFReader' in window?'✓':'✗'} SER:${'serial' in navigator?'✓':'✗'}</div>
    <div class="sl d">QR:${'BarcodeDetector' in window?'✓':'✗'} GPS:${!!navigator.geolocation?'✓':'✗'}</div>
  </div>`;
}

/* ── LOG ── */
function appLog(){let off=0;const r=()=>{scr.innerHTML=`<div class="fi sl2"><div class="sl d">${S.log.length} ENTRIES</div><div class="hr"></div>${S.log.slice(off,off+8).map(e=>`<div style="display:flex;gap:2px;line-height:1.55;position:relative;z-index:2"><span style="font-family:var(--mo);font-size:5px;color:var(--fgd);flex-shrink:0">${e.ts}</span><span style="font-family:var(--px);font-size:5px;color:var(--fgh);flex-shrink:0">[${e.cat}]</span><span style="font-family:var(--px);font-size:5px;overflow:hidden">${e.msg}</span></div>`).join('')||'<div class="sl d">Empty</div>'}</div>`};r();clearCtx();btn('TOP',()=>{off=0;r()},'');btn('COPY',()=>navigator.clipboard?.writeText(S.log.map(l=>l.ts+' ['+l.cat+'] '+l.msg).join('\n')).then(()=>T('COPIED!')),'cy');btn('CLEAR',()=>{S.log=[];off=0;r();T('CLEARED')},'cr');_H={up:()=>{off=Math.max(0,off-1);r()},dn:()=>{off=Math.min(Math.max(0,S.log.length-8),off+1);r()}}}

/* ══════════════════════════════════
   28. BT CONNECT (advanced)
══════════════════════════════════ */
function appBT(){rBT();clearCtx();btn('SCAN',btScan,'cg');btn('CONNECT',btConn,'co');btn('BATTERY',btBatt,'cy');btn('HR',btHR,'cb2');btn('DISCONNECT',btDisc,'cr');_H={up:()=>{S.btSel=Math.max(0,S.btSel-1);rBT()},dn:()=>{S.btSel=Math.min(S.btDevs.length-1,S.btSel+1);rBT()},ok:btConn}}
function rBT(){const lst=S.btDevs.length?S.btDevs.slice(0,6).map((d,i)=>`<div class="mi${i===S.btSel?' s':''}" onclick="S.btSel=${i};rBT()"><span class="ic">⬡</span><span style="flex:1;margin-left:3px">${(d.alias||d.name).slice(0,14)}</span>${d.connected?'<span class="bt-badge ok">ON</span>':''}</div>`).join(''):'<div class="sl d">Press SCAN</div>';const st=S.btDev?`<div class="sl h"><span class="bl">⬡</span> ${(S.btDev.alias||S.btDev.name).slice(0,16)}</div><div class="sl d">GATT: ${S.btGatt?.connected?'OPEN':'CLOSED'}</div>`:'<div class="sl d">No device connected</div>';scr.innerHTML=`<div class="fi">${st}<div class="hr"></div>${lst}</div>`;$('sBt').classList.toggle('on',!!S.btDev&&S.btGatt?.connected)}
async function btScan(){if(!navigator.bluetooth){T('WEB BT NOT SUPPORTED');return}try{const dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:['battery_service','heart_rate','generic_access']});const existing=S.btDevs.findIndex(d=>d.id===dev.id);const entry={id:dev.id,name:dev.name||'Unknown',alias:null,device:dev,connected:false};if(existing===-1){S.btDevs.push(entry);S.btSel=S.btDevs.length-1}else{S.btDevs[existing].device=dev;S.btSel=existing}dev.addEventListener('gattserverdisconnected',()=>{const idx=S.btDevs.findIndex(d=>d.id===dev.id);if(idx!==-1)S.btDevs[idx].connected=false;if(S.btDev?.id===dev.id){S.btGatt=null;lp('R',600)}if(S.app==='bt_connect')rBT();T('BT DISCONNECTED')});T('FOUND: '+(dev.name||'?').slice(0,14));vib([30,10,30]);lp('G',400);rBT()}catch(e){if(e.name!=='NotFoundError')T('BT: '+e.message.slice(0,14))}}
async function btConn(){const d=S.btDevs[S.btSel];if(!d){T('SELECT DEVICE FIRST');return}T('CONNECTING...');startLoad(4000);try{S.btGatt=await d.device.gatt.connect();S.btDev=d;d.connected=true;T('CONNECTED!');vib([40,20,40]);lp('G',600);addLog('BT','Connected: '+d.name);rBT()}catch(e){T('GATT FAILED');d.connected=false;rBT()}}
async function btBatt(){if(!S.btGatt?.connected){T('CONNECT FIRST');return}try{const s=await S.btGatt.getPrimaryService('battery_service');const c=await s.getCharacteristic('battery_level');const v=await c.readValue();T('BATTERY: '+v.getUint8(0)+'%')}catch(e){T('NO BATTERY SVC')}}
async function btHR(){if(!S.btGatt?.connected){T('CONNECT FIRST');return}try{const s=await S.btGatt.getPrimaryService('heart_rate');const c=await s.getCharacteristic('heart_rate_measurement');await c.startNotifications();c.addEventListener('characteristicvaluechanged',e=>{T('❤ HR: '+e.target.value.getUint8(1)+' BPM')});T('HR MONITOR ON ❤')}catch(e){T('NO HR SERVICE')}}
function btDisc(){try{S.btGatt?.disconnect()}catch(e){}if(S.btDev){const idx=S.btDevs.findIndex(d=>d.id===S.btDev.id);if(idx!==-1)S.btDevs[idx].connected=false}S.btDev=null;S.btGatt=null;rBT();T('DISCONNECTED')}

/* ══════════════════════════════════
   29. TIMER / ALARM
   Countdown + repeating buzzer
══════════════════════════════════ */
function appTimer(){
  let totalMs=0, remaining=0, running=false, finished=false;
  let _tInt=null;
  const presets=[{l:'1 MIN',ms:60000},{l:'5 MIN',ms:300000},{l:'10 MIN',ms:600000},{l:'25 MIN',ms:1500000}];

  const fmt=ms=>{
    const h=Math.floor(ms/3600000);
    const m=Math.floor((ms%3600000)/60000);
    const s=Math.floor((ms%60000)/1000);
    return h?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
           :`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const pct=()=>totalMs>0?Math.max(0,remaining/totalMs):0;

  const render=()=>{
    const col=finished?'var(--fr)':remaining<10000&&remaining>0?'var(--fr)':'var(--fl)';
    scr.innerHTML=`<div class="fi">
      <div class="sl h" style="text-align:center">◷ TIMER</div>
      <div class="hr"></div>
      <div class="bignum${finished?' danger':''}" style="font-size:clamp(22px,6.5vw,32px)">${fmt(remaining)}</div>
      <div class="pw"><div class="pf" style="width:${pct()*100}%;background:${col}"></div></div>
      <div class="sl d" style="text-align:center;margin-top:3px">${running?'<span class="bl">● RUNNING</span>':finished?'<span style="color:var(--fr)">■ DONE</span>':'○ READY'}</div>
      <div class="hr"></div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;position:relative;z-index:2">
        ${presets.map(p=>`<span onclick="window._timerPreset(${p.ms})" style="font-family:var(--px);font-size:5px;color:var(--fgd);cursor:pointer;padding:3px 5px;border:1px solid #1e1e1e;border-radius:3px">${p.l}</span>`).join('')}
      </div>
    </div>`;
    window._timerPreset=ms=>{remaining=ms;totalMs=ms;running=false;finished=false;clearInterval(_tInt);render()};
  };

  render();clearCtx();

  btn('SET',()=>{
    const input=prompt('Enter seconds (or mm:ss):','60');
    if(!input)return;
    if(input.includes(':')){
      const [m,s]=input.split(':').map(Number);
      totalMs=(m*60+s)*1000;
    } else {
      totalMs=parseInt(input)*1000;
    }
    if(isNaN(totalMs)||totalMs<=0){T('INVALID TIME');return}
    remaining=totalMs;running=false;finished=false;clearInterval(_tInt);render();
  },'cg');

  btn('START',()=>{
    if(!totalMs){T('SET TIME FIRST');return}
    if(remaining<=0)remaining=totalMs;
    running=true;finished=false;
    clearInterval(_tInt);
    _tInt=setInterval(()=>{
      if(!running){clearInterval(_tInt);return}
      remaining=Math.max(0,remaining-1000);
      if(remaining<=0){
        running=false;finished=true;
        clearInterval(_tInt);
        let buzz=0;
        const alarm=setInterval(()=>{vib([150,80,150,80,150]);lp('R',500);buzz++;if(buzz>=5)clearInterval(alarm)},800);
        T('TIMER DONE!  ■');addLog('Timer','Done');
      }
      render();
    },1000);
    render();
  },'co');

  btn('PAUSE',()=>{running=!running;if(running){const saved=remaining;_tInt=setInterval(()=>{if(!running){clearInterval(_tInt);return}remaining=Math.max(0,remaining-1000);if(remaining<=0){running=false;finished=true;clearInterval(_tInt);T('DONE!')}render()},1000)}render();T(running?'RUNNING':'PAUSED')},'cy');

  btn('RESET',()=>{running=false;finished=false;remaining=totalMs;clearInterval(_tInt);render();T('RESET')},'');

  _H={ok:()=>document.querySelector('.cb.co')?.click()};
}

/* ══════════════════════════════════
   30. UNIT CONVERTER
   Length · Weight · Temp · Speed · Data
══════════════════════════════════ */
function appConverter(){
  const CATS={
    'LENGTH':[
      {n:'Meters',f:v=>v,t:v=>v},
      {n:'Feet',f:v=>v/0.3048,t:v=>v*0.3048},
      {n:'Inches',f:v=>v/0.0254,t:v=>v*0.0254},
      {n:'Miles',f:v=>v/1609.34,t:v=>v*1609.34},
      {n:'Km',f:v=>v/1000,t:v=>v*1000},
      {n:'Yards',f:v=>v/0.9144,t:v=>v*0.9144},
    ],
    'WEIGHT':[
      {n:'Kg',f:v=>v,t:v=>v},
      {n:'Pounds',f:v=>v/0.453592,t:v=>v*0.453592},
      {n:'Oz',f:v=>v/0.0283495,t:v=>v*0.0283495},
      {n:'Grams',f:v=>v*1000,t:v=>v/1000},
      {n:'Stones',f:v=>v/6.35029,t:v=>v*6.35029},
    ],
    'TEMP':[
      {n:'Celsius',f:v=>v,t:v=>v},
      {n:'Fahrenheit',f:v=>v*9/5+32,t:v=>(v-32)*5/9},
      {n:'Kelvin',f:v=>v+273.15,t:v=>v-273.15},
    ],
    'SPEED':[
      {n:'m/s',f:v=>v,t:v=>v},
      {n:'km/h',f:v=>v*3.6,t:v=>v/3.6},
      {n:'mph',f:v=>v*2.23694,t:v=>v/2.23694},
      {n:'knots',f:v=>v*1.94384,t:v=>v/1.94384},
    ],
    'DATA':[
      {n:'Bytes',f:v=>v,t:v=>v},
      {n:'KB',f:v=>v/1024,t:v=>v*1024},
      {n:'MB',f:v=>v/1048576,t:v=>v*1048576},
      {n:'GB',f:v=>v/1073741824,t:v=>v*1073741824},
      {n:'Bits',f:v=>v*8,t:v=>v/8},
    ],
  };
  const cats=Object.keys(CATS);
  let catIdx=0, val=1;

  const render=()=>{
    const cat=cats[catIdx];
    const units=CATS[cat];
    const baseVal=val;
    const rows=units.map(u=>{
      const result=u.f(baseVal);
      const disp=Math.abs(result)<0.001||Math.abs(result)>999999?result.toExponential(3):parseFloat(result.toFixed(4));
      return `<div class="mi" onclick="window._cvSet(${baseVal},${units.indexOf(u)})">
        <span class="ic" style="width:40px;font-family:var(--mo);font-size:5.5px;color:var(--fl)">${disp}</span>
        <span style="margin-left:4px;font-size:5px">${u.n}</span>
      </div>`;
    }).join('');
    scr.innerHTML=`<div class="fi sl2">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="sl h" style="font-size:6px">⇄ ${cat}</span>
        <span class="sl d" style="font-size:4.5px">${catIdx+1}/${cats.length}</span>
      </div>
      <div class="sl d" style="text-align:center;font-size:5px">INPUT: ${baseVal}</div>
      <div class="hr"></div>
      ${rows}
    </div>`;
    window._cvSet=(v,ui)=>{
      // convert from that unit to base, then re-render as base
      val=CATS[cats[catIdx]][ui].t(v);render();
    };
  };

  render();clearCtx();
  btn('◄ CAT',()=>{catIdx=(catIdx-1+cats.length)%cats.length;render()},'');
  btn('CAT ►',()=>{catIdx=(catIdx+1)%cats.length;render()},'');
  btn('INPUT',()=>{const v=parseFloat(prompt('Enter value:','1'));if(!isNaN(v)){val=v;render()}},'cg');
  btn('RESET',()=>{val=1;render()},'');
  _H={lt:()=>{catIdx=(catIdx-1+cats.length)%cats.length;render()},rt:()=>{catIdx=(catIdx+1)%cats.length;render()},ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ══════════════════════════════════
   31. RANDOMIZER
   Dice · Coin · Numbers · Shuffle
══════════════════════════════════ */
function appRandomizer(){
  let lastResult='---';let history=[];
  const DICE=[4,6,8,10,12,20,100];
  let diceIdx=2; // default d8

  const addResult=(label,val)=>{
    lastResult=val;
    history.unshift({l:label,v:val,t:new Date().toTimeString().slice(0,8)});
    if(history.length>8)history.pop();
    render();vib([20,10,20]);lp('G',300);
  };

  const render=()=>{
    scr.innerHTML=`<div class="fi">
      <div class="sl h" style="text-align:center">◈ RANDOMIZER</div>
      <div class="bignum" style="font-size:clamp(20px,5.5vw,28px)">${lastResult}</div>
      <div class="hr"></div>
      <div class="sl d" style="text-align:center;font-size:5px">d${DICE[diceIdx]} selected  ◄ ►</div>
      <div class="hr"></div>
      ${history.slice(0,5).map(h=>`<div style="display:flex;gap:4px;font-family:var(--mo);font-size:5px;color:var(--fgd);position:relative;z-index:2"><span style="color:var(--fgd)">${h.t}</span><span style="color:var(--fl)">[${h.l}]</span><span>${h.v}</span></div>`).join('')}
    </div>`;
  };

  render();clearCtx();
  btn('DICE',()=>addResult('d'+DICE[diceIdx],rand(1,DICE[diceIdx])),'cg');
  btn('COIN',()=>addResult('COIN',Math.random()>.5?'HEADS ▲':'TAILS ▼'),'co');
  btn('1-100',()=>addResult('1-100',rand(1,100)),'cy');
  btn('◄d',()=>{diceIdx=(diceIdx-1+DICE.length)%DICE.length;render()},'');
  btn('d►',()=>{diceIdx=(diceIdx+1)%DICE.length;render()},'');
  btn('RANGE',()=>{
    const a=parseInt(prompt('Min:','1')||'1');
    const b=parseInt(prompt('Max:','100')||'100');
    if(!isNaN(a)&&!isNaN(b)&&b>a)addResult(`${a}-${b}`,rand(a,b));
    else T('INVALID RANGE');
  },'cp');
  btn('CLEAR',()=>{history=[];lastResult='---';render()},'');
  _H={
    lt:()=>{diceIdx=(diceIdx-1+DICE.length)%DICE.length;render()},
    rt:()=>{diceIdx=(diceIdx+1)%DICE.length;render()},
    ok:()=>addResult('d'+DICE[diceIdx],rand(1,DICE[diceIdx]))
  };
}

/* ══════════════════════════════════
   32. PING / NETWORK INFO
   Latency test + device IP + connection info
══════════════════════════════════ */
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
      <div class="sl h">◌ PING / NETWORK</div>
      <div class="hr"></div>
      <div class="sl d">TARGET: ${targets[targetIdx].n}</div>
      <div class="sl d">TYPE: ${c?.effectiveType||'?'} · ${c?.downlink||'?'} Mbps</div>
      <div class="sl d">RTT: ~${c?.rtt||'?'}ms</div>
      <div class="hr"></div>
      ${results.length?`
        <div class="sl h" style="text-align:center">${results[results.length-1]}ms</div>
        <div class="sl d">MIN:${min}ms  AVG:${avg}ms  MAX:${max}ms</div>
        <div class="pw"><div class="pf" style="width:${Math.min(100,results[results.length-1]/5)}%"></div></div>
        <div class="sl d" style="margin-top:2px">PINGS: ${results.length}</div>
      `:'<div class="sl d">Press PING to test latency</div>'}
      ${running?'<div class="sl d"><span class="bl">● PINGING...</span></div>':''}
    </div>`;
  };

  render();clearCtx();

  btn('PING',async()=>{
    if(running)return;running=true;render();
    const t0=performance.now();
    try{
      await fetch(targets[targetIdx].url,{mode:'no-cors',cache:'no-store'});
      const ms=Math.round(performance.now()-t0);
      results.push(ms);if(results.length>20)results.shift();
      lp('G',150);vib(10);T('PING: '+ms+'ms');
    }catch(e){
      const ms=Math.round(performance.now()-t0);
      results.push(ms);if(results.length>20)results.shift();
      T('PING: '+ms+'ms');
    }
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

  btn('IP INFO',async()=>{
    T('GETTING IP...');startLoad(2500);
    const localIp=await getLocalIP();
    T(localIp?'LOCAL: '+localIp:'COULD NOT GET IP');
  },'cy');

  btn('◄ TARGET',()=>{targetIdx=(targetIdx-1+targets.length)%targets.length;render()},'');
  btn('TARGET ►',()=>{targetIdx=(targetIdx+1)%targets.length;render()},'');
  btn('CLEAR',()=>{results=[];render()},'');

  _H={ok:()=>document.querySelector('.cb.cg')?.click(),
      lt:()=>{targetIdx=(targetIdx-1+targets.length)%targets.length;render()},
      rt:()=>{targetIdx=(targetIdx+1)%targets.length;render()}};
}

/* ══════════════════════════════════
   33. COLOR PICKER
   HEX / RGB / HSL — visual swatch
══════════════════════════════════ */
function appColors(){
  let h=220,s=80,l=55; // default blue

  const hslToRgb=(h,s,l)=>{
    s/=100;l/=100;
    const k=n=>(n+h/30)%12;
    const a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    return [Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)];
  };

  const toHex=(r,g,b)=>'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();

  const PALETTES=[
    {n:'MATERIAL',colors:[{h:0,s:80,l:50},{h:45,s:80,l:50},{h:90,s:80,l:50},{h:135,s:80,l:50},{h:180,s:80,l:50},{h:225,s:80,l:50},{h:270,s:80,l:50},{h:315,s:80,l:50}]},
    {n:'PASTEL',colors:[{h:0,s:60,l:75},{h:45,s:60,l:75},{h:90,s:60,l:75},{h:135,s:60,l:75},{h:180,s:60,l:75},{h:225,s:60,l:75},{h:270,s:60,l:75},{h:315,s:60,l:75}]},
    {n:'NEON',colors:[{h:0,s:100,l:55},{h:45,s:100,l:55},{h:90,s:100,l:55},{h:135,s:100,l:55},{h:180,s:100,l:55},{h:225,s:100,l:55},{h:270,s:100,l:55},{h:315,s:100,l:55}]},
  ];
  const palette=[
    {h:0,s:80,l:50},{h:30,s:90,l:50},{h:60,s:85,l:50},{h:120,s:70,l:40},
    {h:180,s:75,l:45},{h:220,s:80,l:55},{h:270,s:75,l:55},{h:320,s:80,l:50},
    {h:0,s:0,l:20},{h:0,s:0,l:40},{h:0,s:0,l:60},{h:0,s:0,l:80},
  ];

  const render=()=>{
    const [r,g,b]=hslToRgb(h,s,l);
    const hex=toHex(r,g,b);
    const bg=`hsl(${h},${s}%,${l}%)`;
    const fg=l>55?'#000':'#fff';
    scr.innerHTML=`<div class="fi">
      <div class="sl h" style="text-align:center">■ COLOR PICKER</div>
      <div class="hr"></div>
      <div style="width:100%;height:36px;background:${bg};border-radius:4px;display:flex;align-items:center;justify-content:center;position:relative;z-index:2">
        <span style="font-family:var(--px);font-size:7px;color:${fg};text-shadow:0 1px 3px rgba(0,0,0,.3)">${hex}</span>
      </div>
      <div style="margin-top:4px;display:grid;grid-template-columns:repeat(4,1fr);gap:3px;position:relative;z-index:2">
        ${palette.map(p=>{const[pr,pg,pb]=hslToRgb(p.h,p.s,p.l);const ph=toHex(pr,pg,pb);return `<div onclick="window._pickColor(${p.h},${p.s},${p.l})" style="height:16px;background:hsl(${p.h},${p.s}%,${p.l}%);border-radius:2px;cursor:pointer;border:${p.h===h&&p.s===s&&p.l===l?'2px solid #fff':'1px solid rgba(0,0,0,.2)'}"></div>`}).join('')}
      </div>
      <div class="hr"></div>
      <div class="sl d">H:${h}° S:${s}% L:${l}%</div>
      <div class="sl d">RGB: ${r},${g},${b}</div>
    </div>`;
    window._pickColor=(ph,ps,pl)=>{h=ph;s=ps;l=pl;render()};
  };

  render();clearCtx();
  btn('H+',()=>{h=(h+15)%360;render()},'');
  btn('H-',()=>{h=(h-15+360)%360;render()},'');
  btn('S+',()=>{s=Math.min(100,s+10);render()},'cg');
  btn('S-',()=>{s=Math.max(0,s-10);render()},'');
  btn('L+',()=>{l=Math.min(95,l+10);render()},'co');
  btn('L-',()=>{l=Math.max(5,l-10);render()},'');
  btn('COPY HEX',()=>{const[r,g,b]=hslToRgb(h,s,l);navigator.clipboard?.writeText(toHex(r,g,b)).then(()=>T('HEX COPIED!'))},'cy');
  btn('RANDOM',()=>{h=rand(0,360);s=rand(40,100);l=rand(35,70);render();T('RANDOM!')},'cp');
  _H={
    lt:()=>{h=(h-15+360)%360;render()},
    rt:()=>{h=(h+15)%360;render()},
    up:()=>{l=Math.min(95,l+10);render()},
    dn:()=>{l=Math.max(5,l-10);render()},
    ok:()=>{const[r,g,b]=hslToRgb(h,s,l);navigator.clipboard?.writeText(toHex(r,g,b)).then(()=>T('HEX COPIED!'))}
  };
}

/* ── PWA ── */
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._pwaP=e});
window.closeModal=closeModal;window.openApp=openApp;
window.S=S;window.rBT=rBT;window.T=T;
