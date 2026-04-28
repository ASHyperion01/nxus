'use strict';

// ── DOM refs ─────────────────────────────────────────────────────────────
const cvs      = document.getElementById('cvs');
const ctx      = cvs.getContext('2d');
const vid      = document.getElementById('vid');
const overlay  = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const errMsg   = document.getElementById('errMsg');
const statusEl = document.getElementById('status');
const slider   = document.getElementById('slider');
const valLabel = document.getElementById('valLabel');
const lagBadge = document.getElementById('lag-badge');
const bufInfo  = document.getElementById('bufInfo');
const fpsInfo  = document.getElementById('fpsInfo');
const camLabel = document.getElementById('camLabel');
const btnFlip   = document.getElementById('btnFlip');
const btnFreeze = document.getElementById('btnFreeze');
const btnHide   = document.getElementById('btnHide');
const panel     = document.getElementById('panel');
const hudTop    = document.getElementById('hud-top');
const brackets  = document.querySelectorAll('.brk');

// ── State ────────────────────────────────────────────────────────────────
let buffer   = [];      // { ts: number, bmp: ImageBitmap }[]
let delayMs  = 1000;
let useFront = false;
let frozen   = false;
let frozenBmp = null;
let running  = false;
let stream   = null;

// Hidden capture canvas
const cap    = document.createElement('canvas');
const capCtx = cap.getContext('2d');

// FPS tracking
let fpsCount = 0;
let lastFpsTs = 0;

// Capture throttle
let lastCapTs = 0;

// ── Helpers ───────────────────────────────────────────────────────────────
function sliderToMs(v) {
  return v * 100; // 100ms – 5000ms
}

function updateDelayLabel() {
  const label = delayMs < 1000
    ? delayMs + 'ms'
    : (delayMs / 1000).toFixed(1) + 's';
  valLabel.textContent = label;
  lagBadge.textContent = delayMs + 'ms';
}

function pruneBuffer() {
  const cutoff = Date.now() - delayMs - 600;
  while (buffer.length > 1 && buffer[0].ts < cutoff) {
    buffer[0].bmp.close();
    buffer.shift();
  }
}

// ── Slider ────────────────────────────────────────────────────────────────
slider.addEventListener('input', function () {
  delayMs = sliderToMs(+this.value);
  updateDelayLabel();
  pruneBuffer();
});

// ── Camera ────────────────────────────────────────────────────────────────
async function startCamera() {
  if (stream) {
    stream.getTracks().forEach(function (t) { t.stop(); });
    stream = null;
  }

  const constraints = {
    video: {
      facingMode: useFront ? 'user' : { ideal: 'environment' },
      width:  { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    vid.srcObject = stream;
    await vid.play();

    statusEl.textContent = 'LIVE';
    statusEl.className   = 'live';
    camLabel.textContent = useFront ? 'FRONT' : 'REAR';
    running = true;

    overlay.style.display = 'none';

    requestAnimationFrame(captureLoop);
    requestAnimationFrame(renderLoop);

  } catch (e) {
    statusEl.textContent = 'ERROR';
    statusEl.className   = 'err';
    errMsg.style.display = 'block';
    errMsg.textContent   = 'Camera denied: ' + (e.message || e.name);
    startBtn.textContent = '[ RETRY ]';
    console.error(e);
  }
}

// ── Capture loop — ~30 fps ────────────────────────────────────────────────
function captureLoop(ts) {
  if (!running) return;
  requestAnimationFrame(captureLoop);

  if (ts - lastCapTs < 33) return; // throttle to 30fps
  lastCapTs = ts;

  if (!vid.videoWidth || vid.readyState < 2) return;

  if (cap.width  !== vid.videoWidth)  cap.width  = vid.videoWidth;
  if (cap.height !== vid.videoHeight) cap.height = vid.videoHeight;

  capCtx.drawImage(vid, 0, 0);

  createImageBitmap(cap).then(function (bmp) {
    buffer.push({ ts: Date.now(), bmp: bmp });
    pruneBuffer();
  });
}

// ── Render loop — ~60 fps ─────────────────────────────────────────────────
function renderLoop(ts) {
  if (!running) return;
  requestAnimationFrame(renderLoop);

  // Resize canvas to match window
  if (cvs.width  !== window.innerWidth)  cvs.width  = window.innerWidth;
  if (cvs.height !== window.innerHeight) cvs.height = window.innerHeight;

  // FPS
  fpsCount++;
  var now = Date.now();
  if (now - lastFpsTs >= 1000) {
    fpsInfo.textContent = fpsCount;
    fpsCount  = 0;
    lastFpsTs = now;
  }

  // Buffer info (every ~20 frames to avoid DOM spam)
  if (fpsCount % 20 === 0) {
    bufInfo.textContent = buffer.length;
  }

  // Pick frame
  var bmp = null;

  if (frozen) {
    bmp = frozenBmp;
  } else {
    var target = now - delayMs;
    for (var i = buffer.length - 1; i >= 0; i--) {
      if (buffer[i].ts <= target) {
        bmp = buffer[i].bmp;
        break;
      }
    }
  }

  if (!bmp) return;

  // Center-cover draw
  var cw = cvs.width, ch = cvs.height;
  var bw = bmp.width,  bh = bmp.height;
  var scale = Math.max(cw / bw, ch / bh);
  var dw = bw * scale, dh = bh * scale;
  var dx = (cw - dw) / 2, dy = (ch - dh) / 2;

  ctx.save();
  if (useFront) {
    // Mirror front camera horizontally
    ctx.translate(cw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(bmp, cw - dx - dw, dy, dw, dh);
  } else {
    ctx.drawImage(bmp, dx, dy, dw, dh);
  }
  ctx.restore();
}

// ── Button handlers ───────────────────────────────────────────────────────
startBtn.addEventListener('click', startCamera);

btnFlip.addEventListener('click', function () {
  useFront = !useFront;
  btnFlip.classList.toggle('on', useFront);
  buffer.forEach(function (f) { f.bmp.close(); });
  buffer = [];
  if (running) startCamera();
});

btnFreeze.addEventListener('click', function () {
  frozen = !frozen;
  btnFreeze.classList.toggle('on', frozen);

  if (frozen) {
    var target = Date.now() - delayMs;
    for (var i = buffer.length - 1; i >= 0; i--) {
      if (buffer[i].ts <= target) {
        frozenBmp = buffer[i].bmp;
        break;
      }
    }
  }
});

btnHide.addEventListener('click', toggleUI);

// Tap canvas to restore UI when hidden
cvs.addEventListener('click', function () {
  if (panel.style.display === 'none') toggleUI();
});

function toggleUI() {
  var hidden = panel.style.display === 'none';
  panel.style.display   = hidden ? '' : 'none';
  hudTop.style.display  = hidden ? '' : 'none';
  brackets.forEach(function (b) { b.style.display = hidden ? '' : 'none'; });
  lagBadge.classList.toggle('hide', !hidden);
  btnHide.classList.toggle('on', !hidden);
}

// ── Resize ────────────────────────────────────────────────────────────────
window.addEventListener('resize', function () {
  cvs.width  = window.innerWidth;
  cvs.height = window.innerHeight;
});

// Init canvas size
cvs.width  = window.innerWidth;
cvs.height = window.innerHeight;
