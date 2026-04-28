'use strict';

// ── DOM ──────────────────────────────────────────────────────────────────
var cvs        = document.getElementById('cvs');
var ctx        = cvs.getContext('2d');
var vid        = document.getElementById('vid');
var mjpegImg   = document.getElementById('mjpegImg');
var overlay    = document.getElementById('overlay');
var connectBtn = document.getElementById('connectBtn');
var urlInput   = document.getElementById('urlInput');
var typeSelect = document.getElementById('typeSelect');
var delaySelect= document.getElementById('delaySelect');
var statusEl   = document.getElementById('status');
var slider     = document.getElementById('slider');
var valLabel   = document.getElementById('valLabel');
var lagBadge   = document.getElementById('lag-badge');
var bufInfo    = document.getElementById('bufInfo');
var fpsInfo    = document.getElementById('fpsInfo');
var streamType = document.getElementById('streamType');
var errMsg     = document.getElementById('errMsg');
var btnFreeze  = document.getElementById('btnFreeze');
var btnHide    = document.getElementById('btnHide');
var btnConfig  = document.getElementById('btnConfig');
var panel      = document.getElementById('panel');
var hudTop     = document.getElementById('hud-top');
var brackets   = document.querySelectorAll('.brk');
var presetBtns = document.querySelectorAll('.preset-btn');

// ── State ────────────────────────────────────────────────────────────────
var buffer    = [];
var delayMs   = 1000;
var frozen    = false;
var frozenBmp = null;
var running   = false;
var hlsInst   = null;
var currentMode = '';

var cap    = document.createElement('canvas');
var capCtx = cap.getContext('2d');

var fpsCount  = 0;
var lastFpsTs = 0;
var lastCapTs = 0;

// ── Slider ────────────────────────────────────────────────────────────────
slider.addEventListener('input', function () {
  delayMs = +this.value * 100;
  var label = delayMs < 1000 ? delayMs + 'ms' : (delayMs / 1000).toFixed(1) + 's';
  valLabel.textContent = label;
  lagBadge.textContent = delayMs + 'ms';
  pruneBuffer();
});

function pruneBuffer() {
  var cutoff = Date.now() - delayMs - 600;
  while (buffer.length > 1 && buffer[0].ts < cutoff) {
    if (buffer[0].bmp && buffer[0].bmp.close) buffer[0].bmp.close();
    buffer.shift();
  }
}

// ── Auto-detect stream type from URL ─────────────────────────────────────
function detectType(url) {
  var u = url.toLowerCase();
  if (u.indexOf('.m3u8') !== -1) return 'hls';
  if (u.indexOf('.mjpg') !== -1 || u.indexOf('.mjpeg') !== -1 ||
      u.indexOf('mjpeg') !== -1 || u.indexOf('stream') !== -1 ||
      u.indexOf('/video') !== -1 || u.indexOf('?action=stream') !== -1) return 'mjpeg';
  if (u.indexOf('.mp4') !== -1 || u.indexOf('.webm') !== -1) return 'video';
  return 'mjpeg'; // default for IP cams
}

// ── Connect ───────────────────────────────────────────────────────────────
function connect() {
  var url  = urlInput.value.trim();
  var type = typeSelect.value;

  if (!url) {
    showErr('Enter a stream URL');
    return;
  }

  // Apply initial delay from select
  delayMs = +delaySelect.value;
  slider.value = delayMs / 100;
  var label = delayMs < 1000 ? delayMs + 'ms' : (delayMs / 1000).toFixed(1) + 's';
  valLabel.textContent = label;
  lagBadge.textContent = delayMs + 'ms';

  if (type === 'auto') type = detectType(url);

  stopCurrent();
  errMsg.style.display = 'none';
  setStatus('connecting', 'CONNECTING...');

  if (type === 'mjpeg')      connectMjpeg(url);
  else if (type === 'hls')   connectHls(url);
  else                        connectVideo(url);
}

// ── MJPEG via <img> ───────────────────────────────────────────────────────
// Works for cameras that serve multipart/x-mixed-replace streams
function connectMjpeg(url) {
  currentMode = 'MJPEG';
  streamType.textContent = 'MJPEG';

  mjpegImg.onload = function () {
    setStatus('live', 'LIVE');
    overlay.style.display = 'none';
    running = true;
    captureLoop(0);
    renderLoop(0);
  };

  mjpegImg.onerror = function () {
    setStatus('err', 'ERROR');
    showErr('Cannot load MJPEG stream.\nCheck URL, CORS, and network.');
  };

  // Force reload (cache-bust)
  mjpegImg.src = url + (url.indexOf('?') === -1 ? '?' : '&') + '_t=' + Date.now();
}

// ── HLS via hls.js ────────────────────────────────────────────────────────
function connectHls(url) {
  currentMode = 'HLS';
  streamType.textContent = 'HLS';

  if (typeof Hls === 'undefined') {
    showErr('HLS.js failed to load. Check internet connection.');
    return;
  }

  if (Hls.isSupported()) {
    hlsInst = new Hls({ lowLatencyMode: true });
    hlsInst.loadSource(url);
    hlsInst.attachMedia(vid);
    hlsInst.on(Hls.Events.MANIFEST_PARSED, function () {
      vid.play();
    });
    hlsInst.on(Hls.Events.ERROR, function (e, data) {
      if (data.fatal) showErr('HLS error: ' + data.type);
    });
  } else if (vid.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari native HLS
    vid.src = url;
    vid.play();
  } else {
    showErr('HLS not supported in this browser.');
    return;
  }

  vid.onplaying = function () {
    setStatus('live', 'LIVE');
    overlay.style.display = 'none';
    running = true;
    captureLoop(0);
    renderLoop(0);
  };

  vid.onerror = function () {
    setStatus('err', 'ERROR');
    showErr('Cannot load HLS stream.');
  };
}

// ── Direct video (MP4/WEBM) ───────────────────────────────────────────────
function connectVideo(url) {
  currentMode = 'VIDEO';
  streamType.textContent = 'MP4';

  vid.src = url;
  vid.loop = true;
  vid.play().then(function () {
    setStatus('live', 'LIVE');
    overlay.style.display = 'none';
    running = true;
    captureLoop(0);
    renderLoop(0);
  }).catch(function (e) {
    setStatus('err', 'ERROR');
    showErr('Cannot play video: ' + e.message);
  });
}

// ── Stop current stream ───────────────────────────────────────────────────
function stopCurrent() {
  running = false;
  buffer.forEach(function (f) { if (f.bmp && f.bmp.close) f.bmp.close(); });
  buffer = [];

  if (hlsInst) { hlsInst.destroy(); hlsInst = null; }

  mjpegImg.onload  = null;
  mjpegImg.onerror = null;
  mjpegImg.src     = '';

  vid.pause();
  vid.removeAttribute('src');
  vid.onplaying = null;
  vid.onerror   = null;
  vid.load();
}

// ── Capture loop — 30fps ──────────────────────────────────────────────────
function captureLoop(ts) {
  if (!running) return;
  requestAnimationFrame(captureLoop);

  if (ts - lastCapTs < 33) return;
  lastCapTs = ts;

  var source = (currentMode === 'MJPEG') ? mjpegImg : vid;

  var w = (currentMode === 'MJPEG') ? mjpegImg.naturalWidth  : vid.videoWidth;
  var h = (currentMode === 'MJPEG') ? mjpegImg.naturalHeight : vid.videoHeight;

  if (!w || !h) return;

  if (cap.width  !== w) cap.width  = w;
  if (cap.height !== h) cap.height = h;

  try {
    capCtx.drawImage(source, 0, 0);
  } catch (e) {
    return; // CORS taint — can't read pixels
  }

  createImageBitmap(cap).then(function (bmp) {
    buffer.push({ ts: Date.now(), bmp: bmp });
    pruneBuffer();
  });
}

// ── Render loop — 60fps ───────────────────────────────────────────────────
function renderLoop(ts) {
  if (!running) return;
  requestAnimationFrame(renderLoop);

  if (cvs.width  !== window.innerWidth)  cvs.width  = window.innerWidth;
  if (cvs.height !== window.innerHeight) cvs.height = window.innerHeight;

  fpsCount++;
  var now = Date.now();
  if (now - lastFpsTs >= 1000) {
    fpsInfo.textContent = fpsCount;
    fpsCount  = 0;
    lastFpsTs = now;
  }
  if (fpsCount % 20 === 0) bufInfo.textContent = buffer.length;

  var bmp = null;

  if (frozen) {
    bmp = frozenBmp;
  } else {
    var target = now - delayMs;
    for (var i = buffer.length - 1; i >= 0; i--) {
      if (buffer[i].ts <= target) { bmp = buffer[i].bmp; break; }
    }
  }

  if (!bmp) return;

  var cw = cvs.width, ch = cvs.height;
  var bw = bmp.width,  bh = bmp.height;
  var scale = Math.max(cw / bw, ch / bh);
  var dw = bw * scale, dh = bh * scale;
  var dx = (cw - dw) / 2, dy = (ch - dh) / 2;

  ctx.drawImage(bmp, dx, dy, dw, dh);
}

// ── UI helpers ────────────────────────────────────────────────────────────
function setStatus(cls, txt) {
  statusEl.className   = cls;
  statusEl.textContent = txt;
}

function showErr(msg) {
  errMsg.style.display = 'block';
  errMsg.textContent   = msg;
  connectBtn.textContent = '[ RETRY ]';
}

// ── Buttons ───────────────────────────────────────────────────────────────
connectBtn.addEventListener('click', connect);

urlInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') connect();
});

presetBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    urlInput.value         = btn.dataset.url;
    typeSelect.value       = btn.dataset.type || 'auto';
  });
});

btnFreeze.addEventListener('click', function () {
  frozen = !frozen;
  btnFreeze.classList.toggle('on', frozen);

  if (frozen) {
    var target = Date.now() - delayMs;
    for (var i = buffer.length - 1; i >= 0; i--) {
      if (buffer[i].ts <= target) { frozenBmp = buffer[i].bmp; break; }
    }
  }
});

btnConfig.addEventListener('click', function () {
  stopCurrent();
  setStatus('', 'OFFLINE');
  overlay.style.display = 'flex';
  errMsg.style.display  = 'none';
  connectBtn.textContent = '[ CONNECT ]';
  // Show UI if hidden
  panel.style.display  = '';
  hudTop.style.display = '';
  brackets.forEach(function (b) { b.style.display = ''; });
  lagBadge.classList.remove('hide');
  btnHide.classList.remove('on');
});

btnHide.addEventListener('click', toggleUI);
cvs.addEventListener('click', function () {
  if (panel.style.display === 'none') toggleUI();
});

function toggleUI() {
  var hidden = panel.style.display === 'none';
  panel.style.display  = hidden ? '' : 'none';
  hudTop.style.display = hidden ? '' : 'none';
  brackets.forEach(function (b) { b.style.display = hidden ? '' : 'none'; });
  lagBadge.classList.toggle('hide', !hidden);
  btnHide.classList.toggle('on', !hidden);
}

// ── Resize ────────────────────────────────────────────────────────────────
window.addEventListener('resize', function () {
  cvs.width  = window.innerWidth;
  cvs.height = window.innerHeight;
});

cvs.width  = window.innerWidth;
cvs.height = window.innerHeight;
