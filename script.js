/* ═══════════════════════════════════════════
   FLIPPER REMOTE — script.js
   Features: IR Remote, Bluetooth (real API),
   NFC (real API), Sub-GHz, WiFi, Bad USB,
   GPS, Frequency Analyzer, Device Log, System
═══════════════════════════════════════════ */

'use strict';

/* ─── STATE ─── */
const S = {
  app:       'menu',
  menuIdx:   0,
  // TV
  tvOn:      true,
  volume:    12,
  maxVol:    20,
  muted:     false,
  channel:   0,
  inputSrc:  'TV',
  sleepTimer: null,
  // BT
  btDevices: [],
  btScanning: false,
  // NFC
  nfcActive: false,
  nfcTag:    null,
  // Sub-GHz
  subFreqIdx: 1,
  subSignals: [],
  subScanning: false,
  subScanInt:  null,
  // WiFi
  wifiNets:   [],
  wifiSelIdx: 0,
  wifiScanning: false,
  // Bad USB
  payloadIdx: 0,
  // GPS
  gpsData:   null,
  gpsWatchId: null,
  // Freq
  audioCtx:  null,
  analyser:  null,
  vizAnim:   null,
  // Log
  log:       [],
  logOffset: 0,
  // Battery
  battery:   null,
};

/* ─── CONSTANTS ─── */
const CHANNELS = [
  { n:'LRT TELEVIZIJA', c:'#003388' }, { n:'LNK',         c:'#880000' },
  { n:'TV3',            c:'#005500' }, { n:'BTV',         c:'#440088' },
  { n:'TV6',            c:'#885500' }, { n:'TV8',         c:'#005566' },
  { n:'INFO TV',        c:'#1a3355' }, { n:'VIASAT SPORT', c:'#770033' },
  { n:'DISCOVERY',      c:'#004455' }, { n:'MTV',         c:'#553300' },
];

const SUBFREQS = [315.00, 433.92, 868.35, 915.00];

const FAKEWIFI = [
  { s:'TP-Link_AC1900',   b:'D8:47:32:AF:01', ch:6,  sig:-41, e:'WPA2' },
  { s:'Tele2_Fiber_5G',   b:'C0:4A:00:12:34', ch:36, sig:-55, e:'WPA3' },
  { s:'ASUS_RT-AX88U',    b:'2C:FD:A1:BB:CC', ch:1,  sig:-38, e:'WPA2' },
  { s:'AndroidHotspot',   b:'4E:9F:23:01:EF', ch:6,  sig:-72, e:'WPA2' },
  { s:'Mikrotik_Office',  b:'E4:8D:8C:12:AB', ch:11, sig:-63, e:'WPA2' },
  { s:'iPhone_Mantas',    b:'3A:BC:EF:00:11', ch:6,  sig:-68, e:'WPA2' },
  { s:'NETGEAR58',        b:'9C:D3:6D:AA:BB', ch:44, sig:-49, e:'WPA3' },
  { s:'[HIDDEN SSID]',    b:'00:00:00:00:00', ch:11, sig:-81, e:'WPA2' },
];

const PAYLOADS = [
  { n:'SYSINFO',    d:'Collect system info', code:'DELAY 500\nGUI r\nDELAY 500\nSTRING cmd\nENTER\nSTRING systeminfo\nENTER' },
  { n:'WIFI CREDS', d:'Export saved networks', code:'DELAY 500\nGUI r\nDELAY 500\nSTRING powershell\nENTER\nSTRING netsh wlan show profiles\nENTER' },
  { n:'RICKROLL',   d:'Never gonna give up', code:'GUI r\nDELAY 500\nSTRING start https://youtu.be/dQw4w9WgXcQ\nENTER' },
  { n:'LOCK SCREEN',d:'Lock the machine',    code:'GUI l' },
  { n:'HELLO WORLD',d:'Open notepad & type', code:'DELAY 500\nGUI r\nDELAY 500\nSTRING notepad\nENTER\nDELAY 1000\nSTRING Hello from FlipperRemote!\nENTER' },
];

const MENU = [
  { id:'ir',      ic:'◈', n:'IR REMOTE'      },
  { id:'bt',      ic:'⬡', n:'BLUETOOTH'      },
  { id:'nfc',     ic:'○', n:'NFC READER'     },
  { id:'subghz',  ic:'~', n:'SUB-GHz'        },
  { id:'wifi',    ic:'◉', n:'WIFI SCANNER'   },
  { id:'badusb',  ic:'⌨', n:'BAD USB'        },
  { id:'gps',     ic:'◎', n:'GPS TRACKER'    },
  { id:'freq',    ic:'♪', n:'FREQ ANALYZER'  },
  { id:'log',     ic:'▤', n:'DEVICE LOG'     },
  { id:'system',  ic:'⚙', n:'SYSTEM INFO'    },
];

/* ─── DOM SHORTCUTS ─── */
const g  = id => document.getElementById(id);
const scrBody   = g('scrBody');
const hTitle    = g('hTitle');
const xbtns     = g('xbtns');
const irDot     = g('irDot');
const toast     = g('toast');

/* ─── APP HANDLERS (set per-app) ─── */
let H = {};

/* ════════════════════════════════════
   INIT
════════════════════════════════════ */
window.addEventListener('load', () => {
  initBattery();
  bindButtons();
  renderMenu();
  log('System', 'Boot OK');
});

/* ─── BATTERY ─── */
async function initBattery() {
  try {
    if (navigator.getBattery) {
      const b = await navigator.getBattery();
      S.battery = b;
      updateHBat();
      b.addEventListener('levelchange', updateHBat);
      b.addEventListener('chargingchange', updateHBat);
    }
  } catch(e) {}
}
function updateHBat() {
  if (!S.battery) return;
  const pct = Math.round(S.battery.level * 100);
  const chr = S.battery.charging ? '⚡' : '';
  g('hBat').textContent = chr + pct + '%';
}

/* ─── VIBRATE ─── */
function vib(p = 12) { try { navigator.vibrate(p); } catch(e){} }

/* ─── IR FLASH ─── */
function flashIR() {
  irDot.classList.add('flash');
  ledOn('O');
  setTimeout(() => { irDot.classList.remove('flash'); ledOff('O'); }, 280);
}

/* ─── LEDs ─── */
function ledOn(c)  { g('led' + c)?.classList.add('on-' + c.toLowerCase()); }
function ledOff(c) { g('led' + c)?.classList.remove('on-' + c.toLowerCase()); }
function ledPulse(c, ms=400) { ledOn(c); setTimeout(() => ledOff(c), ms); }

/* ─── TOAST ─── */
let _tt;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => toast.classList.remove('show'), 2000);
}

/* ─── LOG ─── */
function log(cat, msg) {
  const ts = new Date().toTimeString().slice(0,8);
  S.log.unshift({ ts, cat, msg });
  if (S.log.length > 120) S.log.pop();
}

/* ─── HEADER ─── */
function setHeader(t) { hTitle.textContent = t; }

/* ─── CLEAR EXTRA BUTTONS ─── */
function clearX() { xbtns.innerHTML = ''; }

/* ─── ADD EXTRA BUTTON ─── */
function addXBtn(label, fn, cls = '') {
  const b = document.createElement('button');
  b.className = 'xbtn ' + cls;
  b.textContent = label;
  b.addEventListener('click', () => { vib(); fn(); });
  xbtns.appendChild(b);
  return b;
}

/* ─── STOP CURRENT APP ─── */
function stopApp() {
  // BT
  S.btScanning = false;
  // NFC
  S.nfcActive = false;
  // Sub-GHz
  S.subScanning = false;
  if (S.subScanInt) { clearInterval(S.subScanInt); S.subScanInt = null; }
  // WiFi
  S.wifiScanning = false;
  // GPS
  if (S.gpsWatchId) { navigator.geolocation.clearWatch(S.gpsWatchId); S.gpsWatchId = null; }
  // Freq
  if (S.vizAnim) { cancelAnimationFrame(S.vizAnim); S.vizAnim = null; }
  if (S.audioCtx) { S.audioCtx.close(); S.audioCtx = null; }
  // Sleep
  if (S.sleepTimer) { clearTimeout(S.sleepTimer); S.sleepTimer = null; }
  H = {};
}

/* ─── BUTTON BINDINGS ─── */
function bindButtons() {
  g('dpUp').onclick    = () => { vib(); H.up    ? H.up()    : menuNav(-1); };
  g('dpDown').onclick  = () => { vib(); H.down  ? H.down()  : menuNav(1);  };
  g('dpLeft').onclick  = () => { vib(); H.left  ? H.left()  : null;        };
  g('dpRight').onclick = () => { vib(); H.right ? H.right() : null;        };
  g('dpOk').onclick    = () => { vib(20); H.ok  ? H.ok()   : menuOK();    };
  g('btnBack').onclick = () => { vib(); goBack(); };
  g('sideUp').onclick  = () => { vib(); H.sideUp   ? H.sideUp()   : menuNav(-1); };
  g('sideDown').onclick= () => { vib(); H.sideDown ? H.sideDown() : menuNav(1);  };

  document.addEventListener('keydown', e => {
    switch(e.key) {
      case 'ArrowUp':    e.preventDefault(); g('dpUp').onclick();    break;
      case 'ArrowDown':  e.preventDefault(); g('dpDown').onclick();  break;
      case 'ArrowLeft':  e.preventDefault(); g('dpLeft').onclick();  break;
      case 'ArrowRight': e.preventDefault(); g('dpRight').onclick(); break;
      case 'Enter':      g('dpOk').onclick();    break;
      case 'Escape':     g('btnBack').onclick(); break;
    }
  });
}

/* ─── BACK ─── */
function goBack() {
  stopApp();
  S.app = 'menu';
  renderMenu();
}

/* ─── OPEN APP ─── */
function openApp(id) {
  stopApp();
  S.app = id;
  const meta = MENU.find(m => m.id === id);
  setHeader(meta ? meta.n : id.toUpperCase());
  switch(id) {
    case 'ir':     appIR();     break;
    case 'bt':     appBT();     break;
    case 'nfc':    appNFC();    break;
    case 'subghz': appSubGHz(); break;
    case 'wifi':   appWifi();   break;
    case 'badusb': appBadUSB(); break;
    case 'gps':    appGPS();    break;
    case 'freq':   appFreq();   break;
    case 'log':    appLog();    break;
    case 'system': appSystem(); break;
  }
}

/* ════════════════════════════════════
   MENU
════════════════════════════════════ */
function menuNav(d) {
  S.menuIdx = (S.menuIdx + d + MENU.length) % MENU.length;
  renderMenu();
}
function menuOK() { openApp(MENU[S.menuIdx].id); }

function renderMenu() {
  stopApp();
  setHeader('FLIPPER REMOTE');
  clearX();
  H = {
    up:   () => menuNav(-1),
    down: () => menuNav(1),
    ok:   menuOK,
  };

  const vis = 7;
  let start = Math.max(0, Math.min(S.menuIdx - 3, MENU.length - vis));
  let html = '<div class="fadein slist">';
  for (let i = start; i < Math.min(start + vis, MENU.length); i++) {
    const m = MENU[i];
    const sel = i === S.menuIdx;
    html += `<div class="mitem ${sel ? 'sel' : ''}" onclick="openApp('${m.id}')">
      <span class="ic">${m.ic}</span>
      <span style="margin-left:4px">${m.n}</span>
      <span class="ar">${sel ? '▶' : '›'}</span>
    </div>`;
  }
  html += '</div>';
  scrBody.innerHTML = html;
}

/* ════════════════════════════════════
   IR REMOTE
════════════════════════════════════ */
function appIR() {
  renderIR();
  clearX();
  addXBtn('PWR',  tvPower,          'bad');
  addXBtn('MUTE', tvMute,           '');
  addXBtn('CH+',  () => tvCh(1),    '');
  addXBtn('CH-',  () => tvCh(-1),   '');
  addXBtn('VOL+', () => tvVol(1),   'ok');
  addXBtn('VOL-', () => tvVol(-1),  '');
  addXBtn('SLEEP',tvSleep,          'hi');
  addXBtn('INFO', tvInfo,           '');

  H = {
    up:       () => tvVol(1),
    down:     () => tvVol(-1),
    left:     () => tvCh(-1),
    right:    () => tvCh(1),
    ok:       tvPower,
    sideUp:   () => tvVol(1),
    sideDown: () => tvVol(-1),
  };
}

function renderIR() {
  const ch  = CHANNELS[S.channel];
  const vol = S.muted ? 0 : S.volume;
  const bars = Array.from({length: 10}, (_,i) =>
    `<span style="height:${(i+1)*2+3}px;opacity:${i < Math.ceil(vol/2) ? 1 : .15}"></span>`
  ).join('');

  const sleepTxt = S.sleepTimer ? '<span class="blink"> ZZZ</span>' : '';

  scrBody.innerHTML = `<div class="fadein">
    <div class="sline hi">TV: ${S.tvOn ? '● ON' : '○ OFF'}${sleepTxt}</div>
    <div class="sline">${ch.n}</div>
    <div class="sline dim">CH ${String(S.channel+1).padStart(2,'0')}  SRC:${S.inputSrc}</div>
    <div class="hr"></div>
    <div class="sline">VOL ${S.muted ? '🔇 MUTE' : String(vol).padStart(3,' ')}</div>
    <div class="sigbars">${bars}</div>
    <div class="hr"></div>
    <div class="sline dim">↑↓ VOL  ←→ CH  OK=PWR</div>
  </div>`;
}

let _tvAnimating = false;
function tvPower() {
  if (_tvAnimating) return;
  flashIR(); vib(30);
  S.tvOn = !S.tvOn;
  log('IR', `TV ${S.tvOn ? 'ON' : 'OFF'}`);
  showToast(S.tvOn ? '📺 TV ON' : '📺 TV OFF');
  _tvAnimating = true;
  scrBody.style.opacity = '0';
  setTimeout(() => {
    scrBody.style.opacity = '1';
    _tvAnimating = false;
    renderIR();
  }, 250);
  ledPulse(S.tvOn ? 'G' : 'R', 500);
}

function tvCh(d) {
  if (!S.tvOn) { showToast('TV IS OFF'); return; }
  flashIR();
  S.channel = (S.channel + d + CHANNELS.length) % CHANNELS.length;
  log('IR', `CH ${S.channel+1}`);
  renderIR();
}

function tvVol(d) {
  if (!S.tvOn) { showToast('TV IS OFF'); return; }
  flashIR();
  S.volume = Math.max(0, Math.min(S.maxVol, S.volume + d));
  if (d > 0 && S.muted) S.muted = false;
  log('IR', `VOL ${S.volume}`);
  renderIR();
}

function tvMute() {
  if (!S.tvOn) { showToast('TV IS OFF'); return; }
  flashIR();
  S.muted = !S.muted;
  log('IR', `MUTE ${S.muted}`);
  showToast(S.muted ? '🔇 MUTED' : '🔊 UNMUTED');
  renderIR();
}

function tvSleep() {
  if (S.sleepTimer) {
    clearTimeout(S.sleepTimer);
    S.sleepTimer = null;
    showToast('SLEEP CANCELLED');
  } else {
    S.sleepTimer = setTimeout(() => {
      if (S.tvOn) tvPower();
      S.sleepTimer = null;
    }, 30 * 60 * 1000);
    showToast('SLEEP: 30 MIN');
  }
  log('IR', 'Sleep ' + (S.sleepTimer ? 'ON' : 'OFF'));
  renderIR();
}

function tvInfo() {
  const ch = CHANNELS[S.channel];
  showToast(`${ch.n} | VOL ${S.volume}`);
  log('IR', 'Info');
}

/* ════════════════════════════════════
   BLUETOOTH
════════════════════════════════════ */
function appBT() {
  S.btDevices = [];
  S.btScanning = false;
  renderBT();
  clearX();
  addXBtn('SCAN',  btScan,    'ok');
  addXBtn('STOP',  btStop,    '');
  addXBtn('CLEAR', btClear,   '');
  addXBtn('FAKE',  btFakeScan,'hi');

  H = {
    up:   () => { btSelUp();   renderBT(); },
    down: () => { btSelDown(); renderBT(); },
    ok:   btScan,
  };
}

let btSelIdx = 0;
function btSelUp()   { btSelIdx = Math.max(0, btSelIdx-1); }
function btSelDown() { btSelIdx = Math.min(S.btDevices.length-1, btSelIdx+1); }

function renderBT() {
  const status = S.btScanning
    ? '<span class="blink">⬡ SCANNING...</span>'
    : `○ IDLE  ${S.btDevices.length} FOUND`;

  let devHtml = S.btDevices.length === 0
    ? '<div class="sline dim">No devices yet</div>'
    : S.btDevices.slice(0, 6).map((d, i) =>
        `<div class="mitem ${i === btSelIdx ? 'sel' : ''}">
          <span class="ic">${d.real ? '⬡' : '◌'}</span>
          <span style="flex:1;overflow:hidden">${d.name.slice(0,14)}</span>
          <span style="opacity:.6">${d.rssi}</span>
        </div>`
      ).join('');

  scrBody.innerHTML = `<div class="fadein">
    <div class="sline">${status}</div>
    <div class="hr"></div>
    ${devHtml}
  </div>`;

  g('hBT').style.color      = S.btScanning ? 'var(--screen-hi)' : '';
  g('hBT').style.textShadow = S.btScanning ? '0 0 6px #5f0' : '';
}

async function btScan() {
  if (!navigator.bluetooth) {
    showToast('NO BT API - USE FAKE');
    return;
  }
  try {
    S.btScanning = true;
    renderBT();
    log('BT', 'Real scan start');
    const dev = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
    if (!S.btDevices.find(d => d.id === dev.id)) {
      S.btDevices.unshift({ id:dev.id, name:dev.name||'Unknown', rssi:'--', real:true });
      log('BT', 'Found: ' + (dev.name||'Unknown'));
      showToast('DEVICE FOUND!');
      vib([40,20,40]);
      ledPulse('G', 600);
    }
  } catch(e) {
    if (e.name !== 'NotFoundError') showToast('BT: ' + e.message.slice(0,12));
  }
  S.btScanning = false;
  renderBT();
}

function btFakeScan() {
  const names = [
    'iPhone 15 Pro','Galaxy S24','AirPods Pro 2','JBL Charge 5',
    'Mi Smart Band 8','Xbox Controller','Polar H10','Jabra Elite',
    'Bose QC45','Anker Soundcore','MacBook Pro','iPad mini',
  ];
  S.btScanning = true; btSelIdx = 0;
  renderBT();
  log('BT', 'Fake scan');
  let i = 0;
  const t = setInterval(() => {
    if (!S.btScanning || i >= 5) { S.btScanning = false; clearInterval(t); renderBT(); return; }
    const name = names[Math.floor(Math.random()*names.length)];
    if (!S.btDevices.find(d => d.name === name)) {
      S.btDevices.push({ name, rssi: '-'+(40+Math.floor(Math.random()*55)), real:false });
      vib(8); ledPulse('O', 150);
    }
    i++; renderBT();
  }, 700);
}

function btStop()  { S.btScanning = false; renderBT(); }
function btClear() { S.btDevices = []; btSelIdx = 0; renderBT(); }

/* ════════════════════════════════════
   NFC
════════════════════════════════════ */
function appNFC() {
  S.nfcTag = null;
  renderNFC();
  clearX();
  addXBtn('READ',    nfcRead,    'ok');
  addXBtn('STOP',    nfcStop,    '');
  addXBtn('EMULATE', nfcEmulate, 'hi');
  addXBtn('SIM TAG', nfcSim,     '');

  H = { ok: nfcRead };
}

function renderNFC() {
  const st = S.nfcActive
    ? '<span class="blink">◈ SCANNING...</span>'
    : '○ READY';

  let tagHtml = S.nfcTag
    ? `<div class="hr"></div>
       <div class="sline hi">▶ TAG DETECTED</div>
       <div class="sline">UID: ${S.nfcTag.uid}</div>
       <div class="sline">TYPE: ${S.nfcTag.type}</div>
       <div class="sline dim">DATA: ${S.nfcTag.data.slice(0,18)}</div>`
    : `<div class="hr"></div>
       <div class="sline dim">Hold NFC tag near</div>
       <div class="sline dim">the device...</div>
       <div class="spacer"></div>
       <div class="sline dim">[Android Chrome only]</div>`;

  scrBody.innerHTML = `<div class="fadein">
    <div class="sline">${st}</div>
    ${tagHtml}
  </div>`;

  g('hNFC').style.color      = S.nfcActive ? 'var(--screen-hi)' : '';
  g('hNFC').style.textShadow = S.nfcActive ? '0 0 6px #5f0' : '';
}

async function nfcRead() {
  if (!('NDEFReader' in window)) { showToast('NO NFC API - USE SIM'); return; }
  try {
    S.nfcActive = true; renderNFC();
    log('NFC', 'Read start');
    const r = new NDEFReader();
    await r.scan();
    r.addEventListener('reading', ({ message, serialNumber }) => {
      let data = '';
      for (const rec of message.records) {
        if (['text','url'].includes(rec.recordType)) {
          data = new TextDecoder(rec.encoding || 'utf-8').decode(rec.data);
        }
      }
      S.nfcTag = { uid: serialNumber, type: 'NDEF', data: data || 'No data' };
      S.nfcActive = false;
      log('NFC', 'Tag: ' + serialNumber);
      showToast('NFC TAG READ!');
      vib([60,30,60]);
      ledPulse('G', 600);
      renderNFC();
    });
  } catch(e) {
    S.nfcActive = false;
    showToast('NFC ERR: ' + e.message.slice(0,12));
    renderNFC();
  }
}

function nfcSim() {
  S.nfcActive = true; renderNFC();
  log('NFC', 'Simulate');
  setTimeout(() => {
    const tags = [
      { uid:'04:A3:F2:1B:C8', type:'MIFARE Classic 1K', data:'Hello World' },
      { uid:'E1:FF:20:C3:44', type:'NTAG213',            data:'https://flipper.net' },
      { uid:'AB:12:CD:34:EF', type:'ISO 14443-A',        data:'ID:EMP-00123' },
    ];
    S.nfcTag = tags[Math.floor(Math.random()*tags.length)];
    S.nfcActive = false;
    log('NFC', 'Sim tag: ' + S.nfcTag.uid);
    showToast('TAG SIMULATED');
    vib([60,30,60]);
    ledPulse('G', 500);
    renderNFC();
  }, 1800);
}

function nfcStop()    { S.nfcActive = false; renderNFC(); }
function nfcEmulate() { showToast('EMULATING TAG...'); log('NFC','Emulate'); }

/* ════════════════════════════════════
   SUB-GHz
════════════════════════════════════ */
function appSubGHz() {
  S.subSignals = [];
  S.subScanning = false;
  renderSubGHz();
  clearX();
  addXBtn('SCAN',   subScan,   'ok');
  addXBtn('STOP',   subStop,   '');
  addXBtn('REPLAY', subReplay, 'hi');
  addXBtn('◄ FREQ', () => subFreqShift(-1), '');
  addXBtn('FREQ ►', () => subFreqShift(1),  '');

  H = {
    left:  () => subFreqShift(-1),
    right: () => subFreqShift(1),
    ok:    subScan,
  };
}

function subFreqShift(d) {
  S.subFreqIdx = (S.subFreqIdx + d + SUBFREQS.length) % SUBFREQS.length;
  renderSubGHz();
}

function renderSubGHz() {
  const freq = SUBFREQS[S.subFreqIdx].toFixed(2);
  const status = S.subScanning
    ? '<span class="blink">▶ RX ACTIVE</span>'
    : '○ IDLE';

  const recent = S.subSignals.slice(-5).reverse().map(s =>
    `<div class="sline dim" style="font-size:5.5px">${s.freq}MHz RSSI:${s.rssi}dBm</div>`
  ).join('');

  scrBody.innerHTML = `<div class="fadein">
    <div class="sline hi">${freq} MHz</div>
    <div class="sline dim">◄ 315 · 433 · 868 · 915 ►</div>
    <div class="sline">${status}</div>
    <div class="hr"></div>
    ${recent || '<div class="sline dim">No signals captured</div>'}
    <div class="sline dim">${S.subSignals.length} total captured</div>
  </div>`;

  g('hSig').style.color = S.subScanning ? 'var(--screen-hi)' : '';
}

function subScan() {
  if (S.subScanning) return;
  S.subScanning = true; S.subSignals = [];
  log('Sub-GHz', `Scan ${SUBFREQS[S.subFreqIdx]}MHz`);
  renderSubGHz();
  S.subScanInt = setInterval(() => {
    if (!S.subScanning) return;
    if (Math.random() > 0.45) {
      S.subSignals.push({
        freq: SUBFREQS[S.subFreqIdx].toFixed(2),
        rssi: -(25 + Math.floor(Math.random()*70)),
      });
      vib(5);
      ledPulse('O', 100);
    }
    renderSubGHz();
  }, 700);
}

function subStop() {
  S.subScanning = false;
  if (S.subScanInt) { clearInterval(S.subScanInt); S.subScanInt = null; }
  renderSubGHz();
}

function subReplay() {
  if (S.subSignals.length === 0) { showToast('NOTHING TO REPLAY'); return; }
  showToast('REPLAYING...');
  log('Sub-GHz','Replay');
  for (let i=0; i<6; i++) setTimeout(() => { flashIR(); vib(8); }, i*120);
}

/* ════════════════════════════════════
   WIFI
════════════════════════════════════ */
function appWifi() {
  S.wifiNets = [];
  S.wifiSelIdx = 0;
  S.wifiScanning = false;
  renderWifi();
  clearX();
  addXBtn('SCAN',   wifiScan, 'ok');
  addXBtn('STOP',   wifiStop, '');
  addXBtn('INFO',   wifiInfo, '');
  addXBtn('CHAN',   wifiChan, '');

  H = {
    up:   () => { S.wifiSelIdx = Math.max(0, S.wifiSelIdx-1); renderWifi(); },
    down: () => { S.wifiSelIdx = Math.min(S.wifiNets.length-1, S.wifiSelIdx+1); renderWifi(); },
    ok:   wifiScan,
  };
}

function renderWifi() {
  const status = S.wifiScanning
    ? '<span class="blink">◉ SCANNING...</span>'
    : `○ IDLE  ${S.wifiNets.length} NETS`;

  let netsHtml = S.wifiNets.length === 0
    ? '<div class="sline dim">Press SCAN</div>'
    : S.wifiNets.slice(0, 6).map((n, i) => {
        const pct  = Math.max(0, 100 + n.sig);
        const bars = Math.min(5, Math.round(pct/18));
        const bar  = '▂▄▆▉█'.slice(0, bars) + '░'.repeat(5-bars);
        return `<div class="mitem ${i===S.wifiSelIdx?'sel':''}">
          <span style="font-size:5px;margin-right:3px">${bar}</span>
          <span style="flex:1;overflow:hidden">${n.s.slice(0,13)}</span>
          <span style="font-size:5px">${n.e}</span>
        </div>`;
      }).join('');

  scrBody.innerHTML = `<div class="fadein">
    <div class="sline">${status}</div>
    <div class="hr"></div>
    ${netsHtml}
  </div>`;
}

function wifiScan() {
  S.wifiScanning = true; S.wifiNets = []; S.wifiSelIdx = 0;
  renderWifi(); log('WiFi','Scan');
  const shuf = [...FAKEWIFI].sort(() => Math.random()-.5);
  let i = 0;
  const t = setInterval(() => {
    if (!S.wifiScanning || i >= shuf.length) {
      S.wifiScanning = false; clearInterval(t);
      showToast(`${S.wifiNets.length} NETWORKS`);
      renderWifi(); return;
    }
    S.wifiNets.push(shuf[i++]);
    vib(5); renderWifi();
  }, 450);
}

function wifiStop() { S.wifiScanning = false; renderWifi(); }

function wifiInfo() {
  const n = S.wifiNets[S.wifiSelIdx];
  if (!n) { showToast('SELECT A NETWORK'); return; }
  showToast(`CH:${n.ch} ${n.b}`);
  log('WiFi','Info: '+n.s);
}

function wifiChan() {
  const n = S.wifiNets[S.wifiSelIdx];
  if (!n) return;
  showToast(`CHANNEL: ${n.ch}  SIG: ${n.sig}dBm`);
}

/* ════════════════════════════════════
   BAD USB
════════════════════════════════════ */
function appBadUSB() {
  S.payloadIdx = 0;
  renderBadUSB();
  clearX();
  addXBtn('RUN',    badRun,  'bad');
  addXBtn('VIEW',   badView, '');
  addXBtn('SAVE',   badSave, 'hi');

  H = {
    up:   () => { S.payloadIdx = Math.max(0, S.payloadIdx-1); renderBadUSB(); },
    down: () => { S.payloadIdx = Math.min(PAYLOADS.length-1, S.payloadIdx+1); renderBadUSB(); },
    ok:   badRun,
  };
}

function renderBadUSB() {
  let html = '<div class="fadein">';
  html += '<div class="sline dim">SELECT PAYLOAD</div><div class="hr"></div>';
  PAYLOADS.forEach((p, i) => {
    html += `<div class="mitem ${i===S.payloadIdx?'sel':''}">
      <span class="ic">⌨</span>
      <span style="flex:1">${p.n}</span>
    </div>`;
  });
  html += `<div class="hr"></div><div class="sline dim">${PAYLOADS[S.payloadIdx].d}</div>`;
  html += '</div>';
  scrBody.innerHTML = html;
}

function badRun() {
  const p = PAYLOADS[S.payloadIdx];
  log('BadUSB','Run: '+p.n);
  showToast('INJECTING...');
  vib([100,50,100]);
  ledPulse('R', 3000);

  let lines = p.code.split('\n');
  let lineIdx = 0;
  scrBody.innerHTML = `<div class="fadein">
    <div class="sline red">▶ RUNNING: ${p.n}</div>
    <div class="hr"></div>
    <div id="codeLines"></div>
    <div class="sline blink">█</div>
  </div>`;

  const t = setInterval(() => {
    const el = document.getElementById('codeLines');
    if (!el || lineIdx >= lines.length) {
      clearInterval(t);
      showToast('DONE!');
      setTimeout(renderBadUSB, 1500);
      return;
    }
    el.innerHTML += `<div class="sline dim" style="font-size:5.5px">${lines[lineIdx]}</div>`;
    lineIdx++; vib(5);
  }, 400);
}

function badView() {
  const p = PAYLOADS[S.payloadIdx];
  scrBody.innerHTML = `<div class="fadein">
    <div class="sline hi">${p.n}</div>
    <div class="hr"></div>
    ${p.code.split('\n').map(l => `<div class="sline dim" style="font-size:5.5px">${l}</div>`).join('')}
  </div>`;
}

function badSave() {
  const p = PAYLOADS[S.payloadIdx];
  const blob = new Blob([p.code], { type:'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = p.n.replace(/ /g,'_') + '.txt';
  a.click();
  showToast('SAVED!');
}

/* ════════════════════════════════════
   GPS TRACKER
════════════════════════════════════ */
function appGPS() {
  S.gpsData = null;
  renderGPS();
  clearX();
  addXBtn('START',  gpsStart, 'ok');
  addXBtn('STOP',   gpsStop,  '');
  addXBtn('SHARE',  gpsShare, 'hi');

  H = { ok: gpsStart };
}

function renderGPS() {
  const d = S.gpsData;
  const watching = S.gpsWatchId !== null;

  scrBody.innerHTML = `<div class="fadein">
    <div class="sline">${watching ? '<span class="blink">◎ TRACKING...</span>' : '○ IDLE'}</div>
    <div class="hr"></div>
    ${d ? `
    <div class="sline hi">LAT: ${d.lat.toFixed(6)}</div>
    <div class="sline hi">LON: ${d.lon.toFixed(6)}</div>
    <div class="sline">ACC: ±${Math.round(d.acc)}m</div>
    <div class="sline dim">ALT: ${d.alt != null ? d.alt.toFixed(1)+'m' : 'N/A'}</div>
    <div class="sline dim">SPD: ${d.spd != null ? (d.spd*3.6).toFixed(1)+' km/h' : 'N/A'}</div>
    ` : '<div class="sline dim">Acquiring GPS signal...</div>'}
  </div>`;
}

function gpsStart() {
  if (!navigator.geolocation) { showToast('GPS NOT SUPPORTED'); return; }
  if (S.gpsWatchId) { gpsStop(); return; }
  showToast('ACQUIRING...');
  log('GPS','Start');
  S.gpsWatchId = navigator.geolocation.watchPosition(
    pos => {
      S.gpsData = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        acc: pos.coords.accuracy,
        alt: pos.coords.altitude,
        spd: pos.coords.speed,
      };
      ledPulse('G', 200);
      renderGPS();
    },
    err => { showToast('GPS: '+err.message.slice(0,12)); S.gpsWatchId = null; renderGPS(); },
    { enableHighAccuracy:true, maximumAge:0 }
  );
  renderGPS();
}

function gpsStop() {
  if (S.gpsWatchId) { navigator.geolocation.clearWatch(S.gpsWatchId); S.gpsWatchId = null; }
  log('GPS','Stop'); renderGPS();
}

function gpsShare() {
  if (!S.gpsData) { showToast('NO GPS DATA'); return; }
  const url = `https://maps.google.com/?q=${S.gpsData.lat},${S.gpsData.lon}`;
  navigator.clipboard?.writeText(url).then(() => showToast('COORDS COPIED!')).catch(() => {
    window.open(url, '_blank');
  });
}

/* ════════════════════════════════════
   FREQUENCY ANALYZER
════════════════════════════════════ */
function appFreq() {
  renderFreqIdle();
  clearX();
  addXBtn('MIC',  freqStartMic, 'ok');
  addXBtn('SIM',  freqSim,      'hi');
  addXBtn('STOP', freqStop,     '');

  H = { ok: freqStartMic };
}

function renderFreqIdle() {
  scrBody.innerHTML = `<div class="fadein">
    <div class="sline">${S.audioCtx ? '<span class="blink">♪ ANALYZING...</span>' : '○ READY'}</div>
    <div class="hr"></div>
    <canvas id="fCanvas" class="viz"></canvas>
    <div class="hr"></div>
    <div class="sline dim">0Hz ──────────── 8kHz</div>
  </div>`;
}

async function freqStartMic() {
  if (S.audioCtx) { freqStop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    S.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = S.audioCtx.createMediaStreamSource(stream);
    S.analyser = S.audioCtx.createAnalyser();
    S.analyser.fftSize = 256;
    src.connect(S.analyser);
    log('Freq','Mic start');
    renderFreqIdle();
    freqDraw(S.analyser);
  } catch(e) {
    showToast('MIC DENIED');
    freqSim();
  }
}

function freqDraw(an) {
  const loop = () => {
    if (!S.audioCtx) return;
    S.vizAnim = requestAnimationFrame(loop);
    const c = document.getElementById('fCanvas');
    if (!c) return;
    const cx = c.getContext('2d');
    const W = c.width = c.offsetWidth;
    const H = c.height = 50;
    const buf = new Uint8Array(an.frequencyBinCount);
    an.getByteFrequencyData(buf);
    cx.fillStyle = '#060f06';
    cx.fillRect(0,0,W,H);
    const bw = W / buf.length;
    for (let i=0; i<buf.length; i++) {
      const v = buf[i]/255;
      cx.fillStyle = `rgb(${Math.floor(v*60)},${Math.floor(v*255)},${Math.floor(v*10)})`;
      cx.fillRect(i*bw, H*(1-v), bw-1, H*v);
    }
  };
  loop();
}

function freqSim() {
  if (S.vizAnim) return;
  log('Freq','Simulate');
  renderFreqIdle();
  let t = 0;
  const loop = () => {
    S.vizAnim = requestAnimationFrame(loop);
    const c = document.getElementById('fCanvas');
    if (!c) return;
    const cx = c.getContext('2d');
    const W = c.width = c.offsetWidth;
    const H = c.height = 50;
    cx.fillStyle = '#060f06';
    cx.fillRect(0,0,W,H);
    const N = 64;
    for (let i=0; i<N; i++) {
      const v = Math.max(0.02,
        (Math.sin(t*0.04+i*0.25)*0.3 +
         Math.sin(t*0.015+i*0.12)*0.35 +
         Math.random()*0.08) * 0.55 + 0.1
      );
      const bw = W/N;
      cx.fillStyle = `rgba(95,255,0,${v*0.9})`;
      cx.fillRect(i*bw, H*(1-v), bw-1, H*v);
    }
    t++;
  };
  loop();
}

function freqStop() {
  if (S.vizAnim) { cancelAnimationFrame(S.vizAnim); S.vizAnim = null; }
  if (S.audioCtx) { S.audioCtx.close(); S.audioCtx = null; }
  renderFreqIdle();
}

/* ════════════════════════════════════
   DEVICE LOG
════════════════════════════════════ */
function appLog() {
  S.logOffset = 0;
  renderLogView();
  clearX();
  addXBtn('CLEAR', () => { S.log=[]; S.logOffset=0; renderLogView(); showToast('LOG CLEARED'); }, 'bad');
  addXBtn('COPY',  logCopy, 'hi');
  addXBtn('TOP',   () => { S.logOffset=0; renderLogView(); }, '');

  H = {
    up:   () => { S.logOffset = Math.max(0, S.logOffset-1); renderLogView(); },
    down: () => { S.logOffset = Math.min(Math.max(0, S.log.length-7), S.logOffset+1); renderLogView(); },
  };
}

function renderLogView() {
  const vis = S.log.slice(S.logOffset, S.logOffset + 7);
  scrBody.innerHTML = `<div class="fadein">
    <div class="sline dim">${S.log.length} ENTRIES</div>
    <div class="hr"></div>
    ${vis.length === 0
      ? '<div class="sline dim">Log is empty</div>'
      : vis.map(e => `<div class="srow" style="gap:2px;line-height:1.65">
          <span class="sline dim" style="font-size:5px;flex-shrink:0">${e.ts}</span>
          <span class="sline hi"  style="font-size:5px;flex-shrink:0">[${e.cat}]</span>
          <span class="sline"     style="font-size:5px;overflow:hidden">${e.msg}</span>
        </div>`).join('')
    }
  </div>`;
}

function logCopy() {
  const txt = S.log.map(e => `${e.ts} [${e.cat}] ${e.msg}`).join('\n');
  navigator.clipboard?.writeText(txt)
    .then(()  => showToast('LOG COPIED!'))
    .catch(()  => showToast('COPY FAILED'));
}

/* ════════════════════════════════════
   SYSTEM INFO
════════════════════════════════════ */
function appSystem() {
  renderSystem();
  clearX();
  addXBtn('REFRESH', renderSystem, 'ok');
  addXBtn('INSTALL', sysInstall,   'hi');
  H = { ok: renderSystem };
}

function renderSystem() {
  const bat  = S.battery ? Math.round(S.battery.level*100)+'%' + (S.battery.charging?' ⚡':'') : 'N/A';
  const conn = navigator.connection;
  const net  = conn ? `${conn.effectiveType||'?'} ${(conn.downlink||'?')}Mbps` : 'N/A';
  const mem  = performance.memory ? Math.round(performance.memory.usedJSHeapSize/1048576)+'MB' : 'N/A';
  const lang = navigator.language || 'N/A';
  const plat = navigator.platform || 'N/A';
  const online = navigator.onLine ? '● ONLINE' : '○ OFFLINE';

  scrBody.innerHTML = `<div class="fadein">
    <div class="sline hi">FLIPPER REMOTE v1.0</div>
    <div class="sline dim">by FlipperRemote.dev</div>
    <div class="hr"></div>
    <div class="sline">BAT: ${bat}</div>
    <div class="sline">NET: ${net}</div>
    <div class="sline">MEM: ${mem}</div>
    <div class="sline">${online}</div>
    <div class="sline dim">LANG: ${lang}</div>
    <div class="sline dim">OS: ${plat.slice(0,14)}</div>
    <div class="hr"></div>
    <div class="sline dim">LOG: ${S.log.length} entries</div>
    <div class="sline dim">TV CH: ${S.channel+1} | VOL: ${S.volume}</div>
  </div>`;
}

function sysInstall() {
  // PWA install prompt
  if (window._pwaPrompt) {
    window._pwaPrompt.prompt();
  } else {
    showToast('ADD TO HOME SCREEN');
    // show instructions
    scrBody.innerHTML = `<div class="fadein">
      <div class="sline hi">INSTALL AS APP</div>
      <div class="hr"></div>
      <div class="sline dim">iOS: Share ▶ Add to</div>
      <div class="sline dim">     Home Screen</div>
      <div class="hr"></div>
      <div class="sline dim">Android: Menu ▶</div>
      <div class="sline dim">Add to Home Screen</div>
    </div>`;
  }
}

// Catch PWA install prompt
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window._pwaPrompt = e;
});
