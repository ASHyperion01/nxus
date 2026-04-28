// ============================================================
//  WiFi Skaneris – script.js
//  GitHub Pages compatible – naudoja NetworkInformation API
//  + simuliuoja aplinkinius tinklus (visus vidinius ir išorinius)
// ============================================================

'use strict';

// ---------- State ----------
let allNetworks = [];
let filteredNetworks = [];
let selectedIndex = -1;
let scanning = false;
let scanInterval = null;
let progressInterval = null;
let signalHistory = [];
let dragState = null;
let maximizedWindows = {};

// ---------- Clock ----------
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('tray-time').textContent = `${h}:${m}`;
  document.getElementById('statusbar-time').textContent =
    now.toLocaleString('lt-LT', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// ---------- Start Menu ----------
function toggleStartMenu() {
  document.getElementById('start-menu').classList.toggle('hidden');
}
function closeStartMenu() {
  document.getElementById('start-menu').classList.add('hidden');
}
document.addEventListener('click', e => {
  if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
    closeStartMenu();
  }
});

// ---------- Window Management ----------
function bringWindowToFront(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.classList.remove('hidden', 'minimized');
  // raise z-index
  document.querySelectorAll('.xp-window').forEach(w => {
    w.style.zIndex = w === win ? 200 : 100;
    w.classList.add('inactive');
  });
  win.classList.remove('inactive');
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.classList.add('hidden');
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.classList.add('minimized');
  if (id === 'scanner-window') {
    document.getElementById('taskbar-scanner-btn').classList.remove('active');
  }
}

function maximizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  if (maximizedWindows[id]) {
    // restore
    win.classList.remove('maximized');
    maximizedWindows[id] = false;
  } else {
    win.classList.add('maximized');
    maximizedWindows[id] = true;
  }
}

// Taskbar scanner button
document.getElementById('taskbar-scanner-btn').addEventListener('click', () => {
  const win = document.getElementById('scanner-window');
  if (win.classList.contains('minimized') || win.classList.contains('hidden')) {
    bringWindowToFront('scanner-window');
    document.getElementById('taskbar-scanner-btn').classList.add('active');
  } else {
    minimizeWindow('scanner-window');
  }
});

// ---------- Drag ----------
function startDrag(e, id) {
  if (e.target.closest('.xp-titlebar-buttons')) return;
  const win = document.getElementById(id);
  if (win.classList.contains('maximized')) return;
  bringWindowToFront(id);
  const rect = win.getBoundingClientRect();
  dragState = {
    id,
    startX: e.clientX,
    startY: e.clientY,
    origLeft: rect.left,
    origTop: rect.top
  };
  e.preventDefault();
}

document.addEventListener('mousemove', e => {
  if (!dragState) return;
  const win = document.getElementById(dragState.id);
  const dx = e.clientX - dragState.startX;
  const dy = e.clientY - dragState.startY;
  win.style.left = Math.max(0, dragState.origLeft + dx) + 'px';
  win.style.top  = Math.max(0, Math.min(window.innerHeight - 60, dragState.origTop + dy)) + 'px';
});

document.addEventListener('mouseup', () => { dragState = null; });

// ---------- Network Data Generation ----------

// Real connection info via NetworkInformation API
function getRealConnectionInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return null;
  return {
    effectiveType: conn.effectiveType || 'unknown',
    downlink: conn.downlink || 0,
    rtt: conn.rtt || 0,
    type: conn.type || 'unknown',
    saveData: conn.saveData || false
  };
}

// Generate realistic simulated networks (what a scanner would find nearby)
function generateNetworks() {
  const connInfo = getRealConnectionInfo();

  // Realistic SSID pool
  const ssidTemplates = [
    // Lithuanian ISPs and common patterns
    { ssid: 'Telia-WiFi', vendor: 'Telia', auth: 'WPA2' },
    { ssid: 'Telia-Home-5G', vendor: 'Telia', auth: 'WPA3' },
    { ssid: 'Bitė WiFi', vendor: 'Bitė', auth: 'WPA2' },
    { ssid: 'INIT_Guest', vendor: 'INIT', auth: 'Open' },
    { ssid: 'Cgates', vendor: 'Cgates', auth: 'WPA2' },
    { ssid: 'Cgates_5G', vendor: 'Cgates', auth: 'WPA2' },
    // Generic patterns
    { ssid: `TP-Link_${rand4()}`, vendor: 'TP-Link', auth: 'WPA2' },
    { ssid: `ASUS_${rand4()}`, vendor: 'ASUS', auth: 'WPA2' },
    { ssid: `NETGEAR_${rand4()}`, vendor: 'Netgear', auth: 'WPA2' },
    { ssid: `Mikrotik-${rand4()}`, vendor: 'MikroTik', auth: 'WPA2' },
    { ssid: `AndroidAP_${rand4()}`, vendor: 'Android', auth: 'WPA2' },
    { ssid: `iPhone_${rand4()}`, vendor: 'Apple', auth: 'WPA2' },
    { ssid: 'Namo WiFi', vendor: 'Generic', auth: 'WPA2' },
    { ssid: `WiFi_${rand4()}`, vendor: 'Generic', auth: 'WPA' },
    { ssid: `linksys_${rand4()}`, vendor: 'Linksys', auth: 'WPA2' },
    { ssid: 'eduroam', vendor: 'University', auth: 'WPA2-Enterprise' },
    { ssid: 'ATT_WiFi', vendor: 'AT&T', auth: 'Open' },
    { ssid: `FRITZ!Box ${randNum(7000,7999)}`, vendor: 'AVM', auth: 'WPA2' },
    { ssid: `Vodafone-${rand4()}`, vendor: 'Vodafone', auth: 'WPA2' },
    { ssid: `Huawei-${rand4()}`, vendor: 'Huawei', auth: 'WPA2' },
    { ssid: 'Coffee_Shop_Free', vendor: 'Hotspot', auth: 'Open' },
    { ssid: `D-Link_${rand4()}`, vendor: 'D-Link', auth: 'WEP' },
    { ssid: 'Hidden Network', vendor: '(hidden)', auth: 'WPA2', hidden: true },
    { ssid: `ZyXEL-${rand4()}`, vendor: 'ZyXEL', auth: 'WPA2' },
    { ssid: 'xfinitywifi', vendor: 'Xfinity', auth: 'Open' },
    { ssid: `Keenetic-${rand4()}`, vendor: 'Keenetic', auth: 'WPA3' },
  ];

  // Pick a random subset + vary signal strengths
  const shuffled = ssidTemplates.sort(() => Math.random() - 0.5);
  const count = 8 + Math.floor(Math.random() * 10); // 8–17 networks
  const picked = shuffled.slice(0, count);

  const networks = picked.map((tmpl, i) => {
    const band = Math.random() > 0.45 ? '5' : '2.4';
    const channel = band === '5'
      ? [36, 40, 44, 48, 52, 100, 104, 149, 153][Math.floor(Math.random() * 9)]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11][Math.floor(Math.random() * 11)];
    const rssi = -30 - Math.floor(Math.random() * 65); // -30 to -95
    const signalPct = rssiToPercent(rssi);
    const maxSpeed = band === '5' ? [300, 433, 867, 1300, 2400][Math.floor(Math.random() * 5)]
                                  : [54, 150, 300][Math.floor(Math.random() * 3)];
    const mac = randomMAC();

    return {
      ssid: tmpl.ssid,
      hidden: tmpl.hidden || false,
      vendor: tmpl.vendor,
      auth: tmpl.auth,
      band,
      channel,
      rssi,
      signalPct,
      maxSpeed,
      mac,
      standard: band === '5' ? (maxSpeed >= 867 ? '802.11ax (WiFi 6)' : '802.11ac (WiFi 5)') : '802.11n (WiFi 4)',
      // If this looks like the user's connected network, mark it
      connected: i === 0 && connInfo && connInfo.type === 'wifi'
    };
  });

  // Sort by signal strength descending
  networks.sort((a, b) => b.signalPct - a.signalPct);

  // If we have real connection info, inject it as the strongest network
  if (connInfo && connInfo.type === 'wifi') {
    networks[0].connected = true;
    networks[0].downlink = connInfo.downlink;
    networks[0].rtt = connInfo.rtt;
    networks[0].effectiveType = connInfo.effectiveType;
  }

  return networks;
}

function rssiToPercent(rssi) {
  // -30 dBm = 100%, -90 dBm = 0%
  const clamped = Math.max(-90, Math.min(-30, rssi));
  return Math.round(((clamped + 90) / 60) * 100);
}

function signalBars(pct) {
  const bars = Math.ceil((pct / 100) * 5);
  let html = '<div class="signal-bars">';
  for (let i = 1; i <= 5; i++) {
    html += `<div class="signal-bar${i <= bars ? ' filled' : ''}"></div>`;
  }
  html += '</div>';
  return html;
}

function signalColor(pct) {
  if (pct >= 70) return '#008000';
  if (pct >= 40) return '#cc7700';
  return '#cc0000';
}

function rand4() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}
function randNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomMAC() {
  return Array.from({length: 6}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase();
}

// ---------- Render ----------
function applyFilter() {
  const band = document.getElementById('channel-filter').value;
  if (band === 'all') {
    filteredNetworks = [...allNetworks];
  } else {
    filteredNetworks = allNetworks.filter(n => n.band === band);
  }
  renderList();
}

function renderList() {
  const list = document.getElementById('network-list');
  document.getElementById('found-count').textContent = filteredNetworks.length;
  document.getElementById('statusbar-count').textContent = filteredNetworks.length;

  if (filteredNetworks.length === 0) {
    list.innerHTML = '<div class="list-empty">Tinklų nerasta šiame diapazone.</div>';
    return;
  }

  list.innerHTML = filteredNetworks.map((n, i) => `
    <div class="network-item${n.connected ? ' selected' : ''}" onclick="selectNetwork(${i})" id="net-item-${i}">
      <span style="flex:2;display:flex;align-items:center;gap:6px;">
        ${n.connected ? '🔗 ' : ''}
        ${n.hidden ? '<i>(paslėptas)</i>' : escHtml(n.ssid)}
      </span>
      <span style="flex:1;display:flex;justify-content:center;align-items:center;">
        ${signalBars(n.signalPct)}
        <span style="margin-left:4px;color:${signalColor(n.signalPct)};font-weight:bold;font-size:10px;">${n.signalPct}%</span>
      </span>
      <span style="flex:1;text-align:center;">${n.band} GHz / CH${n.channel}</span>
      <span style="flex:1;text-align:center;">${secBadge(n.auth)}</span>
      <span style="flex:1;text-align:right;">${n.maxSpeed} Mbps</span>
    </div>
  `).join('');

  if (selectedIndex >= 0 && selectedIndex < filteredNetworks.length) {
    selectNetwork(selectedIndex);
  } else if (filteredNetworks.some(n => n.connected)) {
    selectNetwork(filteredNetworks.findIndex(n => n.connected));
  }
}

function secBadge(auth) {
  const cls = auth === 'Open' ? 'sec-open'
    : auth === 'WEP' ? 'sec-wep'
    : auth.startsWith('WPA3') ? 'sec-wpa3'
    : auth.startsWith('WPA2') ? 'sec-wpa2'
    : 'sec-wpa';
  return `<span class="security-badge ${cls}">${escHtml(auth)}</span>`;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ---------- Select ----------
function selectNetwork(i) {
  selectedIndex = i;
  // Highlight row
  document.querySelectorAll('.network-item').forEach((el, idx) => {
    el.classList.toggle('selected', idx === i);
  });

  const n = filteredNetworks[i];
  if (!n) return;

  // Update signal history
  signalHistory.push(n.signalPct);
  if (signalHistory.length > 30) signalHistory.shift();
  drawSignalChart();

  // Update detail panel
  const connInfo = getRealConnectionInfo();
  const extraRows = n.connected && connInfo ? `
    <div class="detail-row"><span class="detail-label">Ryšys (real):</span><span class="detail-value" style="color:green;">✅ Prisijungta</span></div>
    <div class="detail-row"><span class="detail-label">Eff. tipas:</span><span class="detail-value">${connInfo.effectiveType || '—'}</span></div>
    <div class="detail-row"><span class="detail-label">Downlink:</span><span class="detail-value">${connInfo.downlink || '—'} Mbps</span></div>
    <div class="detail-row"><span class="detail-label">RTT:</span><span class="detail-value">${connInfo.rtt || '—'} ms</span></div>
  ` : n.connected ? `<div class="detail-row"><span class="detail-label">Ryšys:</span><span class="detail-value" style="color:green;">✅ Prisijungta</span></div>` : '';

  document.getElementById('network-details').innerHTML = `
    <div class="detail-row"><span class="detail-label">SSID:</span><span class="detail-value">${n.hidden ? '(paslėptas)' : escHtml(n.ssid)}</span></div>
    <div class="detail-row"><span class="detail-label">MAC adresas:</span><span class="detail-value" style="font-family:monospace;">${n.mac}</span></div>
    <div class="detail-row"><span class="detail-label">Gamintojas:</span><span class="detail-value">${escHtml(n.vendor)}</span></div>
    <div class="detail-row"><span class="detail-label">Standartas:</span><span class="detail-value">${n.standard}</span></div>
    <div class="detail-row"><span class="detail-label">Dažnių juosta:</span><span class="detail-value">${n.band} GHz</span></div>
    <div class="detail-row"><span class="detail-label">Kanalas:</span><span class="detail-value">${n.channel}</span></div>
    <div class="detail-row"><span class="detail-label">RSSI:</span><span class="detail-value">${n.rssi} dBm</span></div>
    <div class="detail-row"><span class="detail-label">Signalas:</span><span class="detail-value" style="color:${signalColor(n.signalPct)};font-weight:bold;">${n.signalPct}%</span></div>
    <div class="detail-row"><span class="detail-label">Saugumas:</span><span class="detail-value">${secBadge(n.auth)}</span></div>
    <div class="detail-row"><span class="detail-label">Maks. greitis:</span><span class="detail-value">${n.maxSpeed} Mbps</span></div>
    ${extraRows}
  `;
}

// ---------- Signal Chart ----------
function drawSignalChart() {
  const canvas = document.getElementById('signalCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = '#1a2a4a';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += H / 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  if (signalHistory.length < 2) return;

  // Signal line
  const stepX = W / (signalHistory.length - 1);
  ctx.beginPath();
  ctx.strokeStyle = '#00aaff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00aaff';
  ctx.shadowBlur = 4;
  signalHistory.forEach((val, i) => {
    const x = i * stepX;
    const y = H - (val / 100) * (H - 4) - 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Fill under line
  ctx.shadowBlur = 0;
  const last = signalHistory[signalHistory.length - 1];
  ctx.lineTo(W, H); ctx.lineTo(0, H);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(0,170,255,0.3)');
  grad.addColorStop(1, 'rgba(0,170,255,0)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Current value label
  ctx.fillStyle = '#00aaff';
  ctx.font = 'bold 11px Tahoma, Arial';
  ctx.fillText(`${last}%`, W - 32, 14);
}

// ---------- Scanning ----------
function startScan() {
  if (scanning) return;
  scanning = true;
  selectedIndex = -1;
  signalHistory = [];

  document.getElementById('scan-btn').disabled = true;
  document.getElementById('stop-btn').disabled = false;
  document.getElementById('scan-progress-area').classList.remove('hidden');
  document.getElementById('statusbar-main').textContent = '🔍 Skenuojama...';
  document.getElementById('network-list').innerHTML = '<div class="list-empty">Ieškoma tinklų...</div>';
  document.getElementById('network-details').innerHTML = '<div class="details-empty">Skenuojama...</div>';
  document.getElementById('status-text').textContent = 'Skenuojama';

  let pct = 0;
  progressInterval = setInterval(() => {
    pct = Math.min(100, pct + (2 + Math.random() * 4));
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-pct').textContent = Math.round(pct) + '%';
    if (pct >= 100) {
      clearInterval(progressInterval);
      finishScan();
    }
  }, 80);
}

function finishScan() {
  allNetworks = generateNetworks();
  applyFilter();

  const now = new Date().toLocaleTimeString('lt-LT');
  document.getElementById('last-scan').textContent = now;
  document.getElementById('status-text').textContent = 'Baigta';
  document.getElementById('statusbar-main').textContent = `✅ Skenavimas baigtas – ${now}`;
  document.getElementById('scan-progress-area').classList.add('hidden');
  document.getElementById('scan-btn').disabled = false;
  document.getElementById('stop-btn').disabled = true;
  scanning = false;

  showNotification(`📶 Rasta ${allNetworks.length} tinklų`);

  // Auto-rescan every 30s
  clearInterval(scanInterval);
  scanInterval = setInterval(() => {
    if (!scanning) startScan();
  }, 30000);
}

function stopScan() {
  if (!scanning) return;
  clearInterval(progressInterval);
  scanning = false;
  document.getElementById('scan-btn').disabled = false;
  document.getElementById('stop-btn').disabled = true;
  document.getElementById('scan-progress-area').classList.add('hidden');
  document.getElementById('statusbar-main').textContent = 'Sustabdyta';
  document.getElementById('status-text').textContent = 'Sustabdyta';
}

// ---------- Actions ----------
function connectSelected() {
  if (selectedIndex < 0 || !filteredNetworks[selectedIndex]) {
    showNotification('⚠️ Pasirinkite tinklą!');
    return;
  }
  const n = filteredNetworks[selectedIndex];
  if (n.connected) {
    showNotification(`✅ Jau prisijungta prie: ${n.ssid}`);
    return;
  }

  document.getElementById('connect-ssid-label').textContent = `Tinklas: ${n.hidden ? '(paslėptas)' : n.ssid}`;
  document.getElementById('connect-password').value = '';

  if (n.auth === 'Open') {
    doConnect(true);
  } else {
    bringWindowToFront('connect-window');
  }
}

function doConnect(open = false) {
  closeWindow('connect-window');
  if (selectedIndex < 0) return;
  const n = filteredNetworks[selectedIndex];
  const ssid = n.hidden ? '(paslėptas)' : n.ssid;

  if (open || n.auth === 'Open') {
    showNotification(`🔗 Jungiamasi prie: ${ssid}...`);
    setTimeout(() => showNotification(`✅ Prisijungta prie: ${ssid}`), 1500);
  } else {
    const pass = document.getElementById('connect-password').value;
    if (!pass) { showNotification('⚠️ Įveskite slaptažodį!'); return; }
    showNotification(`🔗 Jungiamasi prie: ${ssid}...`);
    setTimeout(() => showNotification(`✅ Sėkmingai prisijungta!`), 2000);
  }
}

function togglePass() {
  const inp = document.getElementById('connect-password');
  inp.type = document.getElementById('show-pass').checked ? 'text' : 'password';
}

function exportResults() {
  if (!allNetworks.length) {
    showNotification('⚠️ Pirmiausia nuskenuokite tinklus!');
    return;
  }
  const lines = ['SSID,MAC,Vendor,Band,Channel,RSSI,Signal%,Security,MaxSpeed,Standard'];
  allNetworks.forEach(n => {
    lines.push([
      `"${n.ssid}"`, n.mac, `"${n.vendor}"`, n.band + ' GHz',
      n.channel, n.rssi + ' dBm', n.signalPct + '%',
      n.auth, n.maxSpeed + ' Mbps', `"${n.standard}"`
    ].join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wifi-scan-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('💾 Eksportuota į CSV!');
}

// ---------- Adapter Info ----------
function updateAdapterInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    document.getElementById('adapter-name').textContent =
      `${conn.type || 'unknown'} / ${conn.effectiveType || '?'}`;
  } else {
    document.getElementById('adapter-name').textContent = 'NetworkInformation API';
  }
}
updateAdapterInfo();

// ---------- Notification ----------
let notifTimeout = null;
function showNotification(text) {
  const el = document.getElementById('notification');
  document.getElementById('notification-text').textContent = text;
  el.classList.remove('hidden');
  clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => el.classList.add('hidden'), 3500);
}

// ---------- Init ----------
window.addEventListener('load', () => {
  bringWindowToFront('scanner-window');
  setTimeout(() => startScan(), 500);
});
