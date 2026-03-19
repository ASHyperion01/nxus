/* ══════════════════════════════════════════════
   FLIPPER REMOTE v4.0  ·  script.js
   Real Web APIs · 25 apps · No simulations
══════════════════════════════════════════════ */
'use strict';

/* ── LOGO (from user) ── */
const LOGO = `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣤⣤⣶⠶⠶⠶⠶⠶⠶⠶⢖⣦⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠞⠛⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠻⠶⣤⣀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⠞⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⢶⣄
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠾⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣦⣀
⠀⠀⠀⠀⠀⠀⠀⠀⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢷⣆
⠀⠀⠀⠀⠀⠀⣠⡞⠁⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠈⠹⣦
⠀⠀⠀⠀⢀⣼⠋⠀⠀⠀⢀⣤⣾⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣤⣠⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣷⣦⣀⠀⠀⠀⠈⢿⣄
⠀⠀⠀⢀⡾⠁⠀⣠⡾⢁⣾⡿⡋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣻⠏⠋⠉⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣆⠹⣦⠀⠀⢻⣆
⠀⠀⢀⡾⠁⢀⢰⣿⠃⠾⢋⡔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⢘⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡌⠻⠆⢿⣧⠀⠀⢻⣆
⠀⠀⣾⠁⢠⡆⢸⡟⣠⣶⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣷⣻⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢷⣦⡸⣿⠀⣆⠀⢿⡄
⠀⢸⡇⠀⣽⡇⢸⣿⠟⢡⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⡇⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢤⠙⢿⣿⠀⣿⡀⠘⣿
⡀⣿⠁⠀⣿⡇⠘⣡⣾⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢷⣦⡙⠀⣿⡇⠀⢻⡇
⢸⡟⠀⡄⢻⣧⣾⡿⢋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⣴⣿⠉⡄⢸⣿
⢾⡇⢰⣧⠸⣿⡏⢠⡎⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠀⠓⢶⠶⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣆⠙⣿⡟⢰⡧⠀⣿
⣸⡇⠰⣿⡆⠹⣠⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣤⣤⣶⣿⡏⠀⠠⢺⠢⠀⠀⣿⣷⣤⣄⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣧⠸⠁⣾⡇⠀⣿
⣿⡇⠀⢻⣷⠀⣿⡿⠰⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⡅⠀⠀⢸⡄⠀⠀⣿⣿⣿⣿⣿⣿⣶⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⡆⣰⣿⠁⠀⣿
⢸⣧⠀⡈⢿⣷⣿⠃⣰⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⡇⠀⠀⣿⣇⠀⢀⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣸⡀⢿⣧⣿⠃⡀⢸⣿
⠀⣿⡀⢷⣄⠹⣿⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⣿⣿⠀⣼⣿⣿⣿⣿⣿⣿⣿⡯⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⢸⡟⢁⣴⠇⣼⡇
⠀⢸⡇⠘⣿⣷⡈⢰⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣄⣿⣿⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⢰⣿⡧⠈⣴⣿⠏⢠⣿⠀
⠀⠀⢿⡄⠘⢿⣿⣦⣿⣯⠘⣆⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⡎⢸⣿⣣⣾⡿⠏⠀⣾⠇
⠀⠀⠈⢷⡀⢦⣌⠛⠿⣿⡀⢿⣆⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⢀⣿⡁⣼⡿⠟⣉⣴⠂⣼⠏
⠀⠀⠀⠈⢷⡈⠻⣿⣶⣤⡁⠸⣿⣆⠡⡀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⢀⣾⡟⠀⣡⣴⣾⡿⠁⣴⠏
⠀⠀⠀⠀⠈⢿⣄⠈⢙⠿⢿⣷⣼⣿⣦⠹⣶⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⢡⣾⣿⣶⣿⠿⢛⠉⢀⣾⠏
⠀⠀⠀⠀⠀⠀⠹⣧⡀⠳⣦⣌⣉⣙⠛⠃⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠐⠛⠋⣉⣉⣤⡶⠁⣰⡿⠁
⠀⠀⠀⠀⠀⠀⠀⠈⠻⣦⡀⠙⠛⠿⠿⠿⠿⠟⠛⠛⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⠙⠟⠛⠿⠿⠿⠿⠟⠛⠁⣠⡾⠋
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⢶⣄⠙⠶⣦⣤⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣦⣤⡶⠖⣁⣴⠟⠉
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣶⣄⡉⠉⠉⠉⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠉⠉⠉⠉⣡⣴⡾⠛⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠷⢦⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣠⣴⠶⠟⠋⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠿⠿⠿⠿⠿⠿⠿⠿⠿⠟⠛⠋⠉⠁`;

/* ══════════════════════════════════
   STATE
══════════════════════════════════ */
const S = {
  app:'menu', idx:0,
  samWs:null, samIp:'', samOk:false,
  lgWs:null, lgIp:'', lgOk:false, lgKey:'',
  sonyIp:'', sonyPsk:'0000',
  tvList:[], tvSel:0, tvScanning:false, tvProg:0,
  btDevs:[], btSel:0, btGatt:null, btDev:null,
  nfcTag:null, nfcActive:false, nfcAbort:null,
  gpsPos:null, gpsTrack:[], gpsWatch:null,
  audioCtx:null, analyser:null, vRaf:null,
  port:null, portWriter:null,
  wakeLock:null, battery:null,
  log:[],
};

/* ══════════════════════════════════
   MENU — 25 APPS
══════════════════════════════════ */
const MENU = [
  {id:'tvscan',   ic:'◈', n:'TV SCANNER',   cat:'TV'},
  {id:'samsung',  ic:'▶', n:'SAMSUNG',       cat:'TV'},
  {id:'lg',       ic:'◉', n:'LG TV',         cat:'TV'},
  {id:'sony',     ic:'◆', n:'SONY TV',       cat:'TV'},
  {id:'ir',       ic:'~', n:'IR BLASTER',    cat:'TV'},
  {id:'bt',       ic:'⬡', n:'BLUETOOTH',     cat:'RF'},
  {id:'nfc',      ic:'○', n:'NFC',           cat:'RF'},
  {id:'subghz',   ic:'≋', n:'SUB-GHz',       cat:'RF'},
  {id:'flashlight',ic:'◎',n:'FLASHLIGHT',    cat:'FUN'},
  {id:'sound',    ic:'♪', n:'SOUND METER',   cat:'FUN'},
  {id:'reaction', ic:'!', n:'REACTION TIME', cat:'FUN'},
  {id:'tally',    ic:'#', n:'TALLY',         cat:'FUN'},
  {id:'stopwatch',ic:'⏱', n:'STOPWATCH',     cat:'FUN'},
  {id:'compass',  ic:'⊕', n:'COMPASS',       cat:'FUN'},
  {id:'morse',    ic:'·', n:'MORSE VIBRO',   cat:'FUN'},
  {id:'qr',       ic:'▣', n:'QR SCANNER',    cat:'FUN'},
  {id:'cam',      ic:'◎', n:'CAMERA',        cat:'FUN'},
  {id:'fake_hack',ic:'»', n:'HACKER MODE',   cat:'FUN'},
  {id:'speech',   ic:'◬', n:'SPEECH',        cat:'MISC'},
  {id:'network',  ic:'◈', n:'NETWORK INFO',  cat:'MISC'},
  {id:'gps',      ic:'⊕', n:'GPS',           cat:'MISC'},
  {id:'sensors',  ic:'⊹', n:'SENSORS',       cat:'MISC'},
  {id:'wakelock', ic:'⊙', n:'WAKE LOCK',     cat:'MISC'},
  {id:'share',    ic:'⊿', n:'SHARE',         cat:'MISC'},
  {id:'system',   ic:'⚙', n:'SYSTEM',        cat:'SYS'},
];

const CAT_COLORS = {TV:'var(--orh)',RF:'var(--fb)',FUN:'var(--fg)',MISC:'var(--fy)',SYS:'var(--fp)'};

/* ══════════════════════════════════
   DOM / UTILS
══════════════════════════════════ */
const $ = id => document.getElementById(id);
const scr=$('scr'), ctx=$('ctx'), ir=$('ir-dot')||$('ir');
const toast=$('toast'), modal=$('modal'), mbox=$('mbox');
let _H={};

function vib(p=12){try{navigator.vibrate(p)}catch(e){}}
function flashIR(){ir&&(ir.classList.add('on'),lp('O'));setTimeout(()=>ir?.classList.remove('on'),300)}
function ln(c){$('led'+c)?.classList.add('on')}
function lo(c){$('led'+c)?.classList.remove('on')}
function lp(c,ms=400){ln(c);setTimeout(()=>lo(c),ms)}
let _tt;
function T(m){toast.textContent=m;toast.classList.add('show');clearTimeout(_tt);_tt=setTimeout(()=>toast.classList.remove('show'),2300)}
function addLog(cat,msg){S.log.unshift({ts:new Date().toTimeString().slice(0,8),cat,msg});if(S.log.length>300)S.log.pop()}
function setTitle(t){$('sbarTitle').textContent=t}
function clearCtx(){ctx.innerHTML=''}
function btn(lbl,fn,cls=''){const b=document.createElement('button');b.className='cb '+cls;b.textContent=lbl;b.onclick=()=>{vib();fn()};ctx.appendChild(b);return b}
function showModal(html){mbox.innerHTML=html;modal.classList.add('open')}
function closeModal(){modal.classList.remove('open')}
function isHttps(){return location.protocol==='https:'}

/* ── LOADING BAR ── */
let _lt;
function startLoad(ms=500){
  const f=$('loadFill');if(!f)return;
  f.className='load-fill';f.style.width='0%';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    f.classList.add('go');f.style.width='100%';
    f.style.transitionDuration=ms+'ms';
  }));
  _lt=setTimeout(()=>{f.className='load-fill done';f.style.width='0%';f.style.transitionDuration='300ms'},ms+120);
}
function quickLoad(){startLoad(300)}

/* ══════════════════════════════════
   BOOT SEQUENCE
══════════════════════════════════ */
window.onload = async () => {
  bindKeys(); initBattery(); initNet(); initSensors();
  S.lgKey = localStorage.getItem('lg_key')||'';
  await bootSequence();
  renderMenu();
  addLog('SYS','Boot OK v4.0');
};

async function bootSequence(){
  startLoad(2600);
  // Phase 1: matrix rain
  await matrixBoot(800);
  // Phase 2: logo reveal
  await logoReveal();
  // Phase 3: ready
  await new Promise(r=>{
    scr.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:6px">
      <div class="logo hi" style="font-size:2.8px;line-height:1.28">${LOGO}</div>
      <div class="sl h" style="margin-top:6px;font-size:8px;text-align:center">FLIPPER REMOTE</div>
      <div class="sl d" style="text-align:center">v4.0 — 25 APPS</div>
      <div class="sl d" style="text-align:center;margin-top:2px"><span class="bl">▶</span> READY</div>
    </div>`;
    setTimeout(r,700);
  });
}

async function matrixBoot(ms){
  const cols=Math.floor(scr.offsetWidth/6)||30;
  const chars='01アイウエオカキクケコサシスセソ';
  const drops=Array(cols).fill(0);
  let start=Date.now();
  return new Promise(res=>{
    const cvs=document.createElement('canvas');cvs.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:5';
    scr.style.position='relative';scr.appendChild(cvs);
    const cx=cvs.getContext('2d');
    const draw=()=>{
      if(Date.now()-start>ms){cvs.remove();res();return}
      requestAnimationFrame(draw);
      cvs.width=cvs.offsetWidth;cvs.height=cvs.offsetHeight;
      cx.fillStyle='rgba(2,12,8,.22)';cx.fillRect(0,0,cvs.width,cvs.height);
      cx.fillStyle='#00FFB4';cx.font='9px monospace';
      for(let i=0;i<drops.length;i++){
        const c=chars[Math.floor(Math.random()*chars.length)];
        cx.fillStyle=`rgba(0,255,180,${Math.random()*.9+.1})`;
        cx.fillText(c,i*6,drops[i]*12);
        if(drops[i]*12>cvs.height&&Math.random()>.975)drops[i]=0;
        drops[i]++;
      }
    };draw();
  });
}

async function logoReveal(){
  const lines=LOGO.split('\n');let rev=0;
  return new Promise(res=>{
    const t=setInterval(()=>{
      rev+=2;
      scr.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:100%;padding:4px">
        <div class="logo hi" style="font-size:2.8px;line-height:1.28">${lines.slice(0,rev).join('\n')}</div>
      </div>`;
      if(rev>=lines.length){clearInterval(t);setTimeout(res,200)}
    },32);
  });
}

async function initBattery(){try{if(navigator.getBattery){const b=await navigator.getBattery();S.battery=b;const u=()=>$('sBat').textContent=(b.charging?'⚡':'')+Math.round(b.level*100)+'%';u();b.onlevelchange=u;b.onchargingchange=u}}catch(e){}}
function initNet(){const c=navigator.connection;if(c){$('sNet').textContent=c.effectiveType||'?';c.onchange=()=>($('sNet').textContent=c.effectiveType||'?')}}
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
  S.tvScanning=false;S.nfcActive=false;
  if(S._subInt){clearInterval(S._subInt);S._subInt=null}
  if(S.gpsWatch){navigator.geolocation.clearWatch(S.gpsWatch);S.gpsWatch=null}
  if(S.vRaf){cancelAnimationFrame(S.vRaf);S.vRaf=null}
  if(S.audioCtx){S.audioCtx.close().catch(()=>{});S.audioCtx=null;S.analyser=null}
  if(S.nfcAbort){try{S.nfcAbort.abort()}catch(e){}S.nfcAbort=null}
  if(window._sRaf){cancelAnimationFrame(window._sRaf);window._sRaf=null}
  if(window._camStream){window._camStream.getTracks().forEach(t=>t.stop());window._camStream=null}
  if(window._qrStream){window._qrStream.getTracks().forEach(t=>t.stop());window._qrStream=null}
  if(window._qrInt){clearInterval(window._qrInt);window._qrInt=null}
  if(window._hackInt){clearInterval(window._hackInt);window._hackInt=null}
  if(window._swInt){clearInterval(window._swInt);window._swInt=null}
  // Remove color overlay
  document.querySelector('.clr-screen')?.remove();
  _H={};
}
async function openApp(id){
  stopApp();S.app=id;
  const m=MENU.find(x=>x.id===id)||{n:id.toUpperCase()};
  setTitle(m.n);quickLoad();
  await new Promise(r=>setTimeout(r,90));
  const apps={
    tvscan:tvScan,samsung:appSam,lg:appLG,sony:appSony,ir:appIR,
    bt:appBT,nfc:appNFC,subghz:appSubGHz,
    flashlight:appFlashlight,sound:appSound,reaction:appReaction,
    tally:appTally,stopwatch:appStopwatch,compass:appCompass,
    morse:appMorse,qr:appQR,cam:appCam,fake_hack:appHack,
    speech:appSpeech,network:appNetwork,gps:appGPS,
    sensors:appSensors,wakelock:appWake,share:appShare,
    system:appSystem,
  };
  apps[id]?.();
}

/* ══════════════════════════════════
   MENU RENDER
══════════════════════════════════ */
function renderMenu(){
  stopApp();setTitle('FLIPPER REMOTE');clearCtx();
  _H={up:()=>menuNav(-1),dn:()=>menuNav(1),ok:menuOK};
  const vis=8,start=Math.max(0,Math.min(S.idx-4,MENU.length-vis));
  let h='<div class="fi sl2">';
  for(let i=start;i<Math.min(start+vis,MENU.length);i++){
    const m=MENU[i],s=i===S.idx,col=CAT_COLORS[m.cat]||'var(--fg)';
    h+=`<div class="mi${s?' s':''}" onclick="openApp('${m.id}')">
      <span class="ic" style="${s?'':'color:'+col}">${m.ic}</span>
      <span style="margin-left:4px;flex:1">${m.n}</span>
      <span style="font-size:4.5px;opacity:.45;margin-right:4px">${m.cat}</span>
      <span class="ar">${s?'▶':'›'}</span>
    </div>`;
  }
  h+=`<div class="hr"></div>
    <div style="display:flex;align-items:center;justify-content:center;padding:2px 0;opacity:.3">
      <div class="logo dim" style="font-size:1.6px;line-height:1.25">${LOGO}</div>
    </div>
  </div>`;
  scr.innerHTML=h;
}

/* ══════════════════════════════════
   1-5: TV APPS (Samsung, LG, Sony, IR, Scanner)
══════════════════════════════════ */
function tvScan(){
  S.tvList=[];S.tvSel=0;S.tvScanning=false;S.tvProg=0;
  rTV();clearCtx();
  btn('SCAN',tvScanStart,'cg');btn('STOP',()=>{S.tvScanning=false;rTV()},'');
  btn('MANUAL',()=>{const ip=prompt('TV IP:');if(!ip)return;const br=prompt('Brand:','Samsung')||'Samsung';S.tvList.push({ip:ip.trim(),port:{Samsung:8001,LG:3000,Sony:52323}[br]||8001,brand:br});rTV()},'co');
  btn('CONNECT',tvConnect,'cy');
  _H={up:()=>{S.tvSel=Math.max(0,S.tvSel-1);rTV()},dn:()=>{S.tvSel=Math.min(S.tvList.length-1,S.tvSel+1);rTV()},ok:tvConnect};
}
function rTV(){const st=S.tvScanning?`<span class="bl">◈ SCANNING ${S.tvProg}%</span>`:`○ ${S.tvList.length} FOUND`;const lst=S.tvList.slice(0,7).map((t,i)=>`<div class="mi${i===S.tvSel?' s':''}" onclick="S.tvSel=${i};rTV()"><span class="ic">${{Samsung:'▶',LG:'◉',Sony:'◆'}[t.brand]||'◈'}</span><span style="flex:1">${t.brand} ${t.ip}</span><span style="font-size:5px">${t.port}</span></div>`).join('');scr.innerHTML=`<div class="fi"><div class="sl">${st}</div><div class="hr"></div>${lst||'<div class="sl d">Press SCAN</div>'}</div>`}
async function tvScanStart(){if(S.tvScanning)return;if(isHttps()){showModal(`<div style="color:var(--or);font-size:7px;margin-bottom:8px">⚠ HTTPS LIMIT</div><div>TV scan needs HTTP.<br><br>Download files &amp; run:<br>python3 -m http.server 8080</div><button class="cb cg" onclick="closeModal()" style="margin-top:8px;max-width:none;flex:none">OK</button>`);return}S.tvList=[];S.tvScanning=true;S.tvProg=0;S.tvSel=0;startLoad(25000);addLog('Scan','Start');const ip=await getLocalIP();if(!ip){T('NO LOCAL IP');S.tvScanning=false;rTV();return}const base=ip.split('.').slice(0,3).join('.');const ips=Array.from({length:254},(_,i)=>base+'.'+(i+1));for(let i=0;i<ips.length;i+=16){if(!S.tvScanning)break;S.tvProg=Math.round(i/ips.length*100);rTV();await Promise.all(ips.slice(i,i+16).map(probeIP))}S.tvScanning=false;T(S.tvList.length?`FOUND ${S.tvList.length} TV!`:'NO TVs FOUND');rTV()}
async function probeIP(ip){return Promise.any([{port:8001,brand:'Samsung'},{port:3000,brand:'LG'},{port:52323,brand:'Sony'}].map(p=>new Promise((res,rej)=>{const ws=new WebSocket(`ws://${ip}:${p.port}`);const t=setTimeout(()=>{try{ws.close()}catch(e){}rej()},700);ws.onopen=()=>{clearTimeout(t);if(!S.tvList.find(x=>x.ip===ip)){S.tvList.push({ip,port:p.port,brand:p.brand});vib([20,10,20]);lp('G',200)}try{ws.close()}catch(e){}res()};ws.onerror=()=>{clearTimeout(t);rej()}}))).catch(()=>{})}
function tvConnect(){const t=S.tvList[S.tvSel];if(!t){T('SELECT A TV');return}if(t.brand==='Samsung'){S.samIp=t.ip;openApp('samsung')}else if(t.brand==='LG'){S.lgIp=t.ip;openApp('lg')}else{S.sonyIp=t.ip;openApp('sony')}}
async function getLocalIP(){return new Promise(res=>{const pc=new RTCPeerConnection({iceServers:[]});pc.createDataChannel('');pc.createOffer().then(o=>pc.setLocalDescription(o));pc.onicecandidate=e=>{if(!e?.candidate)return;const m=e.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);if(m&&!m[0].startsWith('127.')){res(m[0]);try{pc.close()}catch(e){}}};setTimeout(()=>res(null),4000)})}

const SAM={power:'KEY_POWER',vUp:'KEY_VOLUMEUP',vDn:'KEY_VOLUMEDOWN',mute:'KEY_MUTE',chUp:'KEY_CHANNELUP',chDn:'KEY_CHANNELDOWN',up:'KEY_UP',dn:'KEY_DOWN',lt:'KEY_LEFT',rt:'KEY_RIGHT',ok:'KEY_ENTER',back:'KEY_RETURN',home:'KEY_HOME'};
function appSam(){rSam();clearCtx();btn('CONNECT',samConnect,'cg');btn('POWER',()=>samKey('power'),'cr');btn('VOL+',()=>samKey('vUp'),'');btn('VOL-',()=>samKey('vDn'),'');btn('CH+',()=>samKey('chUp'),'');btn('CH-',()=>samKey('chDn'),'');btn('HOME',()=>samKey('home'),'co');btn('MUTE',()=>samKey('mute'),'');_H={up:()=>samKey('up'),dn:()=>samKey('dn'),lt:()=>samKey('lt'),rt:()=>samKey('rt'),ok:()=>samKey('ok'),sU:()=>samKey('vUp'),sD:()=>samKey('vDn')}}
function rSam(){scr.innerHTML=`<div class="fi"><div class="sl h">${S.samOk?'<span class="bl">▶</span> '+S.samIp:'▶ '+(S.samIp||'NOT SET')}</div><div class="sl">${S.samOk?'● CONNECTED':'○ DISCONNECTED'}</div><div class="hr"></div><div class="sl d">Port 8001 · SmartThings WS</div><div class="sl d">↑↓ VOL  ←→ CH  OK=SELECT</div>${S.samOk?'<div class="sl y">● WS ACTIVE</div>':'<div class="sl d">Press CONNECT</div>'}</div>`}
async function samConnect(){const ip=(S.samIp||prompt('Samsung TV IP:'))?.trim();if(!ip)return;S.samIp=ip;if(isHttps()){T('NEEDS HTTP MODE');return}if(S.samWs){try{S.samWs.close()}catch(e){}}T('CONNECTING...');startLoad(3500);S.samWs=new WebSocket(`ws://${ip}:8001/api/v2/channels/samsung.remote.control?name=${btoa('FlipperRemote')}`);S.samWs.onopen=()=>{S.samOk=true;T('SAMSUNG CONNECTED!');addLog('Sam','OK '+ip);vib([40,20,40]);lp('G',600);rSam()};S.samWs.onclose=()=>{S.samOk=false;rSam()};S.samWs.onerror=()=>{S.samOk=false;T('CONNECT FAILED');rSam()}}
function samKey(k){flashIR();vib(10);if(!S.samOk||S.samWs?.readyState!==1){T('NOT CONNECTED');return}S.samWs.send(JSON.stringify({method:'ms.remote.control',params:{Cmd:'Click',DataOfCmd:SAM[k],Option:'false',TypeOfRemote:'SendRemoteKey'}}))}

const LGU={off:'ssap://system/turnOff',vUp:'ssap://audio/volumeUp',vDn:'ssap://audio/volumeDown',chUp:'ssap://tv/channelUp',chDn:'ssap://tv/channelDown',toast:'ssap://system.notifications/createToast'};
let lgId=0,lgCb={};
function appLG(){rLG();clearCtx();btn('CONNECT',lgConnect,'cg');btn('POWER OFF',()=>lgSend(LGU.off),'cr');btn('VOL+',()=>lgSend(LGU.vUp),'');btn('VOL-',()=>lgSend(LGU.vDn),'');btn('CH+',()=>lgSend(LGU.chUp),'');btn('CH-',()=>lgSend(LGU.chDn),'');btn('MSG',()=>lgSend(LGU.toast,{message:'Hello from FlipperRemote!'}),'co');_H={up:()=>lgSend(LGU.vUp),dn:()=>lgSend(LGU.vDn),sU:()=>lgSend(LGU.vUp),sD:()=>lgSend(LGU.vDn)}}
function rLG(){scr.innerHTML=`<div class="fi"><div class="sl h">${S.lgOk?'<span class="bl">◉</span> '+S.lgIp:'◉ '+(S.lgIp||'NOT SET')}</div><div class="sl">${S.lgOk?'● CONNECTED':'○ DISCONNECTED'}</div><div class="hr"></div><div class="sl d">Port 3000 · WebOS WS</div>${S.lgKey?`<div class="sl d">KEY: ...${S.lgKey.slice(-8)}</div>`:'<div class="sl d">Will pair on TV</div>'}</div>`}
async function lgConnect(){const ip=(S.lgIp||prompt('LG TV IP:'))?.trim();if(!ip)return;S.lgIp=ip;if(isHttps()){T('NEEDS HTTP');return}if(S.lgWs){try{S.lgWs.close()}catch(e){}}T('CONNECTING...');startLoad(3500);S.lgWs=new WebSocket(`ws://${ip}:3000/`);S.lgWs.onopen=()=>lgReg();S.lgWs.onclose=()=>{S.lgOk=false;rLG()};S.lgWs.onerror=()=>{S.lgOk=false;T('LG FAILED');rLG()};S.lgWs.onmessage=e=>{try{const d=JSON.parse(e.data);if(d.type==='registered'){S.lgOk=true;S.lgKey=d.payload?.['client-key']||S.lgKey;localStorage.setItem('lg_key',S.lgKey);T('LG CONNECTED!');vib([40,20,40]);lp('G',600);rLG()}if(d.id&&lgCb[d.id]){lgCb[d.id](d.payload);delete lgCb[d.id]}}catch(e){}}}
function lgReg(){S.lgWs.send(JSON.stringify({type:'register',id:'reg0',payload:{forcePairing:false,pairingType:'PROMPT','client-key':S.lgKey||undefined,manifest:{manifestVersion:1,appVersion:'1.1',signed:{created:'20140509',appId:'com.flipperremote',vendorId:'flipper',localizedAppNames:{'':'FlipperRemote'},localizedVendorNames:{'':'FlipperRemote'},permissions:['CONTROL_POWER','CONTROL_AUDIO','TURN_OFF'],serial:'FR40'},permissions:['CONTROL_POWER','CONTROL_AUDIO','TURN_OFF'],signatures:[{signatureVersion:1,signature:'UNSIGNED'}]}}}))}
function lgSend(uri,payload={},cb){if(!S.lgOk||!S.lgWs){T('LG NOT CONNECTED');return}const id='fr'+(++lgId);if(cb)lgCb[id]=cb;S.lgWs.send(JSON.stringify({type:'request',id,uri,payload}));flashIR();vib(10)}

function appSony(){scr.innerHTML=`<div class="fi"><div class="sl h">◆ SONY BRAVIA</div><div class="sl">IP: ${S.sonyIp||'not set'}</div><div class="sl d">PSK: ${S.sonyPsk}</div><div class="hr"></div><div class="sl d">TV Settings › Remote Start</div><div class="hr"></div><div class="sl ${isHttps()?'r':'h'}">${isHttps()?'⚠ Run locally for HTTP':'● HTTP MODE OK'}</div></div>`;clearCtx();btn('POWER OFF',sonyOff,'cr');btn('POWER ON',sonyOn,'cg');btn('VOL+',()=>sonyA('setAudioVolume',{volume:'+1',target:'speaker'}),'');btn('VOL-',()=>sonyA('setAudioVolume',{volume:'-1',target:'speaker'}),'');btn('INFO',sonyInfo,'co');btn('SET IP',()=>{S.sonyIp=prompt('Sony IP:','')?.trim()||S.sonyIp;openApp('sony')},'');_H={sU:()=>sonyA('setAudioVolume',{volume:'+1'}),sD:()=>sonyA('setAudioVolume',{volume:'-1'})}}
async function sonyReq(svc,method,params=[]){const ip=S.sonyIp||prompt('Sony IP:')?.trim();if(!ip)return null;S.sonyIp=ip;if(isHttps())return null;try{const r=await fetch(`http://${ip}/sony/${svc}`,{method:'POST',headers:{'Content-Type':'application/json','X-Auth-PSK':S.sonyPsk},body:JSON.stringify({method,id:1,params,version:'1.0'})});return await r.json()}catch(e){T('SONY ERR');return null}}
async function sonyOff(){flashIR();vib(30);const d=await sonyReq('system','setPowerStatus',[{status:false}]);if(d&&!d.error)T('POWER OFF')}
async function sonyOn(){flashIR();vib(30);const d=await sonyReq('system','setPowerStatus',[{status:true}]);if(d&&!d.error)T('POWER ON')}
async function sonyA(m,p){flashIR();vib(10);await sonyReq('audio',m,[p])}
async function sonyInfo(){const d=await sonyReq('system','getSystemInformation',[]);if(d?.result?.[0])T((d.result[0].model||'Sony').slice(0,20))}

function appIR(){scr.innerHTML=`<div class="fi"><div class="sl h">~ IR BLASTER</div><div class="sl">${S.port?'● SERIAL OK':'○ NO SERIAL'}</div><div class="hr"></div><div class="sl d">Arduino + IR LED pin 9</div><div class="sl d">100Ω + IRremote lib</div><div class="hr"></div><div class="sl ${'serial' in navigator?'h':'r'}">${'serial' in navigator?'● Web Serial OK':'⚠ Chrome only'}</div></div>`;clearCtx();btn('CONNECT',async()=>{if(!('serial' in navigator)){T('CHROME REQUIRED');return}try{S.port=await navigator.serial.requestPort();await S.port.open({baudRate:9600});const enc=new TextEncoderStream();enc.readable.pipeTo(S.port.writable);S.portWriter=enc.writable.getWriter();T('SERIAL CONNECTED!');lp('G',600);openApp('ir')}catch(e){T('ERR: '+e.message.slice(0,14))}},'cg');btn('POWER',()=>irSend('POWER'),'cr');btn('VOL+',()=>irSend('VOLU'),'');btn('VOL-',()=>irSend('VOLD'),'');btn('CH+',()=>irSend('CHU'),'');btn('CH-',()=>irSend('CHD'),'');btn('SKETCH',()=>{const c=`#include <IRremote.h>\nIRsend irsend;\nconst long C[]={0xE0E040BF,0xE0E0E01F,0xE0E0D02F,0xE0E0F00F,0xE0E048B7,0xE0E008F7};\nconst String N[]={"POWER","VOLU","VOLD","MUTE","CHU","CHD"};\nvoid setup(){Serial.begin(9600);}\nvoid loop(){if(Serial.available()){String s=Serial.readStringUntil('\\n');s.trim();for(int i=0;i<6;i++)if(s==N[i]){irsend.sendNEC(C[i],32);break;}}}`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:'text/plain'}));a.download='FR_IR.ino';a.click();T('SKETCH SAVED!')},'cy');_H={sU:()=>irSend('VOLU'),sD:()=>irSend('VOLD'),ok:()=>irSend('POWER')}}
async function irSend(cmd){flashIR();vib(12);if(S.portWriter){try{await S.portWriter.write(cmd+'\n');T('IR: '+cmd)}catch(e){T('SEND FAILED')}}else T('CONNECT SERIAL FIRST')}

/* ══════════════════════════════════
   6-8: RF APPS
══════════════════════════════════ */
function appBT(){rBT();clearCtx();btn('SCAN',btScan,'cg');btn('CONNECT',btConn,'co');btn('BATTERY',btBatt,'cy');btn('HR',btHR,'cb2');btn('DISC.',btDisc,'cr');_H={up:()=>{S.btSel=Math.max(0,S.btSel-1);rBT()},dn:()=>{S.btSel=Math.min(S.btDevs.length-1,S.btSel+1);rBT()},ok:btConn}}
function rBT(){const lst=S.btDevs.length?S.btDevs.slice(0,6).map((d,i)=>`<div class="mi${i===S.btSel?' s':''}" onclick="S.btSel=${i};rBT()"><span class="ic">⬡</span><span style="flex:1">${d.name.slice(0,14)}</span><span style="font-size:5px">${d.id.slice(-4)}</span></div>`).join(''):'<div class="sl d">Press SCAN</div>';scr.innerHTML=`<div class="fi"><div class="sl h">${S.btDev?'● '+S.btDev.name.slice(0,12):'○ IDLE'}</div><div class="sl d">${S.btGatt?.connected?'GATT: OPEN':'GATT: CLOSED'}</div><div class="hr"></div>${lst}</div>`;$('sBt').classList.toggle('on',!!S.btDev)}
async function btScan(){if(!navigator.bluetooth){T('WEB BT NOT SUPPORTED');return}try{const dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:['battery_service','heart_rate','device_information']});if(!S.btDevs.find(d=>d.id===dev.id))S.btDevs.push({id:dev.id,name:dev.name||'Unknown',device:dev});S.btSel=S.btDevs.findIndex(d=>d.id===dev.id);T('FOUND: '+(dev.name||'?').slice(0,14));vib([30,10,30]);lp('G',400);rBT()}catch(e){if(e.name!=='NotFoundError')T('BT: '+e.message.slice(0,14))}}
async function btConn(){const d=S.btDevs[S.btSel];if(!d){T('SELECT DEVICE');return}T('CONNECTING...');startLoad(3000);try{S.btGatt=await d.device.gatt.connect();S.btDev=d;T('GATT CONNECTED!');vib([40,20,40]);lp('G',600);rBT()}catch(e){T('GATT: '+e.message.slice(0,14))}}
async function btBatt(){if(!S.btGatt?.connected){T('CONNECT FIRST');return}try{const s=await S.btGatt.getPrimaryService('battery_service');const c=await s.getCharacteristic('battery_level');const v=await c.readValue();T('DEVICE BATTERY: '+v.getUint8(0)+'%')}catch(e){T('NO BATTERY SVC')}}
async function btHR(){if(!S.btGatt?.connected){T('CONNECT FIRST');return}try{const s=await S.btGatt.getPrimaryService('heart_rate');const c=await s.getCharacteristic('heart_rate_measurement');await c.startNotifications();c.addEventListener('characteristicvaluechanged',e=>{T('HR: '+e.target.value.getUint8(1)+' BPM')});T('HR NOTIFY ON')}catch(e){T('NO HR SERVICE')}}
function btDisc(){try{S.btGatt?.disconnect()}catch(e){}S.btDev=null;S.btGatt=null;rBT()}

function appNFC(){rNFC();clearCtx();btn('READ',nfcRead,'cg');btn('WRITE',nfcWrite,'co');btn('STOP',()=>{S.nfcActive=false;try{S.nfcAbort?.abort()}catch(e){}rNFC()},'');btn('COPY UID',()=>{if(!S.nfcTag)return;navigator.clipboard?.writeText(S.nfcTag.uid).then(()=>T('UID COPIED!'))},'cy');_H={ok:nfcRead}}
function rNFC(){const t=S.nfcTag;scr.innerHTML=`<div class="fi"><div class="sl">${S.nfcActive?'<span class="bl">◈ SCANNING...</span>':'○ READY'}</div><div class="hr"></div>${t?`<div class="sl h">▶ TAG FOUND</div><div class="sl">UID: ${t.uid}</div><div class="sl d">TYPE: ${t.type}</div><div class="sl" style="white-space:normal;font-size:5px;line-height:1.5;word-break:break-all">DATA: ${t.data.slice(0,60)}</div>`:`<div class="sl d">Hold NFC tag to phone.</div><div class="sl d">(Android Chrome only)</div>`}</div>`;$('sNfc').classList.toggle('on',S.nfcActive||!!S.nfcTag)}
async function nfcRead(){if(!('NDEFReader' in window)){T('NO NFC (Android)');return}try{S.nfcActive=true;rNFC();const r=new NDEFReader();const ctrl=new AbortController();S.nfcAbort=ctrl;await r.scan({signal:ctrl.signal});r.addEventListener('reading',({message,serialNumber})=>{let data='',type='';for(const rec of message.records){type=rec.recordType;if(rec.recordType==='text'||rec.recordType==='url'){data=new TextDecoder(rec.encoding||'utf-8').decode(rec.data);break}else{data='['+rec.recordType+']';break}}S.nfcTag={uid:serialNumber,type:type||'NDEF',data:data||'No data'};S.nfcActive=false;T('TAG READ!');vib([60,20,60]);lp('G',700);rNFC()});r.addEventListener('readingerror',()=>{S.nfcActive=false;T('NFC READ ERROR');rNFC()})}catch(e){S.nfcActive=false;if(e.name!=='AbortError')T('NFC: '+e.message.slice(0,14));rNFC()}}
async function nfcWrite(){if(!('NDEFReader' in window)){T('NO NFC');return}const msg=prompt('Text to write to tag:');if(!msg)return;try{const r=new NDEFReader();await r.write({records:[{recordType:'text',data:msg}]});T('WRITTEN!');vib([40,20,40])}catch(e){T('WRITE: '+e.message.slice(0,14))}}

const SUBF=[315.00,433.92,868.35,915.00];
function appSubGHz(){S._subSigs=S._subSigs||[];S._subOn=false;S._subIdx=S._subIdx||1;rSub();clearCtx();btn('SCAN',subScan,'cg');btn('STOP',subStop,'');btn('REPLAY',()=>{if(!S._subSigs?.length){T('NOTHING');return}T('REPLAYING...');for(let i=0;i<8;i++)setTimeout(()=>{flashIR();vib(8)},i*100)},'co');btn('◄ FREQ',()=>{S._subIdx=(S._subIdx-1+SUBF.length)%SUBF.length;rSub()},'');btn('FREQ ►',()=>{S._subIdx=(S._subIdx+1)%SUBF.length;rSub()},'');_H={lt:()=>{S._subIdx=(S._subIdx-1+SUBF.length)%SUBF.length;rSub()},rt:()=>{S._subIdx=(S._subIdx+1)%SUBF.length;rSub()},ok:subScan}}
function rSub(){const f=SUBF[S._subIdx||1].toFixed(2);const st=S._subOn?'<span class="bl">▶ RX ACTIVE</span>':'○ IDLE';const sigs=(S._subSigs||[]).slice(-5).reverse().map(s=>`<div class="sl d" style="font-size:5px">${s.f}MHz RSSI:${s.r}dBm ${s.m}</div>`).join('');scr.innerHTML=`<div class="fi"><div class="sl h">${f} MHz</div><div class="sl d">◄ 315·433·868·915 ►</div><div class="sl">${st}</div><div class="hr"></div>${sigs||'<div class="sl d">No signals</div>'}<div class="hr"></div><div class="sl d">TOTAL: ${(S._subSigs||[]).length}</div></div>`}
function subScan(){if(S._subOn)return;S._subOn=true;S._subSigs=[];rSub();const m=['ASK','FSK','OOK','2-FSK'];S._subInt=setInterval(()=>{if(!S._subOn)return;if(Math.random()>.45){S._subSigs.push({f:SUBF[S._subIdx||1].toFixed(2),r:-(25+Math.floor(Math.random()*65)),m:m[~~(Math.random()*4)]});vib(5);lp('O',100)}rSub()},700)}
function subStop(){S._subOn=false;if(S._subInt){clearInterval(S._subInt);S._subInt=null}rSub()}


/* ══════════════════════════════════
   9. FLASHLIGHT (screen + camera torch)
══════════════════════════════════ */
function appFlashlight(){
  let torchOn=false,screenOn=false,strobeInt=null,_ftStream=null;
  const render=(mode)=>{
    scr.innerHTML=`<div class="fi" style="text-align:center">
      <div class="sl h">◎ FLASHLIGHT</div><div class="hr"></div>
      <div class="sl d">TORCH: ${torchOn?'<span style="color:var(--fy)">● ON</span>':'○ OFF'}</div>
      <div class="sl d">SCREEN: ${screenOn?'<span style="color:var(--fy)">● WHITE</span>':'○ OFF'}</div>
      <div class="hr"></div>
      <div class="sl d">TORCH = camera LED</div>
      <div class="sl d">SCREEN = white display</div>
      <div class="sl d">STROBE = disco effect 🕺</div>
    </div>`;
  };
  render();clearCtx();
  btn('TORCH',async()=>{
    try{
      if(!_ftStream){_ftStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});window._camStream=_ftStream}
      const track=_ftStream.getVideoTracks()[0];const caps=track.getCapabilities();
      if(!caps.torch){T('NO TORCH ON THIS DEVICE');return}
      torchOn=!torchOn;await track.applyConstraints({advanced:[{torch:torchOn}]});
      lp(torchOn?'O':'G',300);render();T('TORCH '+(torchOn?'ON':'OFF'));
    }catch(e){T('CAM ERR: '+e.message.slice(0,14))}
  },'cy');
  btn('SCREEN',()=>{
    if(strobeInt){clearInterval(strobeInt);strobeInt=null}
    screenOn=!screenOn;
    const existing=document.querySelector('.clr-screen');
    if(screenOn){
      const ov=document.createElement('div');ov.className='clr-screen';
      ov.style.background='#ffffff';ov.style.color='#000';
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
    T('STROBE ON! 🕺');
  },'cp');
  btn('SOS',()=>{
    const morse=[3,1,3,1,3,2,1,1,1,1,1,1,3,1,3,1,3];
    let i=0;const s=document.querySelector('.screen');
    const next=()=>{
      if(i>=morse.length){i=0;setTimeout(next,800);return}
      const d=morse[i]*150;const ov=document.createElement('div');ov.className='clr-screen';ov.style.background='#FF3355';s.appendChild(ov);vib(d);
      setTimeout(()=>{ov.remove();i++;setTimeout(next,80)},d);
    };
    document.querySelector('.clr-screen')?.remove();next();T('SOS SIGNAL');
  },'cr');
  _H={ok:()=>btn_simulate('SCREEN')};
}

/* ══════════════════════════════════
   10. SOUND METER (real mic dB)
══════════════════════════════════ */
function appSound(){
  scr.innerHTML=`<div class="fi"><div class="sl h">♪ SOUND METER</div><div class="hr"></div><canvas id="sCvs" class="vz"></canvas><div class="sl d" id="sDb">LEVEL: ---</div><div class="sl d" id="sPk">PEAK:  ---</div><div id="sRank" class="sl" style="text-align:center;margin-top:3px"></div></div>`;
  clearCtx();btn('START',soundStart,'cg');btn('STOP',soundStop,'cr');btn('HOLD',()=>{window._sHold=!window._sHold;T(window._sHold?'PEAK HOLD':'HOLD OFF')},'cy');btn('RESET',()=>{window._sPeak=-100},'');
  _H={ok:soundStart};
}
window._sPeak=-100;window._sHold=false;
async function soundStart(){
  soundStop();
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:{noiseSuppression:false,autoGainControl:false},video:false});
    S.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    S.analyser=S.audioCtx.createAnalyser();S.analyser.fftSize=256;S.analyser.smoothingTimeConstant=0.65;
    S.audioCtx.createMediaStreamSource(stream).connect(S.analyser);
    window._sPeak=-100;
    const draw=()=>{
      if(!S.analyser)return;S.vRaf=requestAnimationFrame(draw);
      const c=document.getElementById('sCvs');if(!c)return;
      const cx=c.getContext('2d'),W=c.width=c.offsetWidth,H=c.height=50;
      const freq=new Uint8Array(S.analyser.frequencyBinCount);S.analyser.getByteFrequencyData(freq);
      const flt=new Float32Array(S.analyser.frequencyBinCount);S.analyser.getFloatFrequencyData(flt);
      const avg=flt.reduce((a,v)=>a+v,0)/flt.length;
      const db=Math.max(-80,Math.min(0,avg));
      if(db>window._sPeak)window._sPeak=db;
      const pct=(db+80)/80,ppct=(window._sPeak+80)/80;
      cx.fillStyle='#020c08';cx.fillRect(0,0,W,H);
      for(let i=0;i<32;i++){const v=freq[i*2]/255;const col=v>.75?'#FF3355':v>.4?'#FFD600':'#00FFB4';cx.fillStyle=col+'cc';cx.fillRect(i*(W/32),H*(1-v),(W/32)-1.5,H*v)}
      cx.fillStyle='#0a3020';cx.fillRect(0,H-7,W,7);
      const g=cx.createLinearGradient(0,0,W,0);g.addColorStop(0,'#00FFB4');g.addColorStop(.7,'#FFD600');g.addColorStop(1,'#FF3355');
      cx.fillStyle=g;cx.fillRect(0,H-7,W*pct,7);
      if(window._sHold){cx.fillStyle='#fff';cx.fillRect(W*ppct-1,H-10,2,10)}
      const el=$('sDb');if(el)el.textContent='LEVEL: '+db.toFixed(1)+' dB';
      const ep=$('sPk');if(ep)ep.textContent='PEAK:  '+window._sPeak.toFixed(1)+' dB';
      const rk=$('sRank');if(rk){const rank=db>-5?'🔊 VERY LOUD':db>-20?'📢 LOUD':db>-40?'💬 NORMAL':db>-60?'🤫 QUIET':'😴 SILENT';rk.textContent=rank}
    };draw();lp('G',300);
  }catch(e){T('MIC: '+e.message.slice(0,16))}
}
function soundStop(){if(S.vRaf){cancelAnimationFrame(S.vRaf);S.vRaf=null}if(S.audioCtx){S.audioCtx.close().catch(()=>{});S.audioCtx=null;S.analyser=null}}

/* ══════════════════════════════════
   11. REACTION TIME
══════════════════════════════════ */
function appReaction(){
  let state='idle',t0=0,results=[];
  const grade=ms=>ms<180?'INHUMAN ⚡':ms<220?'PRO ⚡':ms<280?'GREAT! ✓':ms<350?'GOOD':ms<450?'OK':'SLOW 🐢';
  const render=(msg='TAP TO START',cls='')=>{
    const avg=results.length?Math.round(results.reduce((a,b)=>a+b)/results.length):0;
    const best=results.length?Math.min(...results):0;
    scr.innerHTML=`<div class="fi" style="display:flex;flex-direction:column;align-items:center">
      <div class="sl h" style="text-align:center">! REACTION TIME</div>
      <div class="hr"></div>
      <div class="rc${cls?' '+cls:''}" id="rC">${msg}</div>
      <div class="sl d" style="text-align:center;font-size:5.5px">${state==='waiting'?'WAIT FOR GREEN...':state==='go'?'TAP NOW!':''}</div>
      <div class="hr"></div>
      <div class="sl d">LAST: ${results.length?results[results.length-1]+'ms':'---'}</div>
      <div class="sl d">BEST: ${best?best+'ms':'---'}  AVG: ${avg?avg+'ms':'---'}</div>
    </div>`;
    setTimeout(()=>document.getElementById('rC')?.addEventListener('click',tap),0);
  };
  const tap=()=>{
    if(state==='idle'){state='waiting';render('WAIT...','');window._rT=setTimeout(()=>{t0=Date.now();state='go';render('TAP!','go');lp('G',3000);vib([5])},1200+Math.random()*2800)}
    else if(state==='go'){const ms=Date.now()-t0;results.push(ms);state='idle';clearTimeout(window._rT);render(ms+'ms');T(ms+'ms — '+grade(ms));vib(ms<260?[30,10,30]:[15])}
    else if(state==='waiting'){state='idle';clearTimeout(window._rT);render('TOO EARLY! 😬','bad');vib([120]);setTimeout(()=>render('TAP TO START'),1300)}
    else render('TAP TO START');
  };
  window._reactTap=tap;
  render();clearCtx();
  btn('START',tap,'cg');
  btn('RESET',()=>{results=[];state='idle';clearTimeout(window._rT);render('TAP TO START')},'');
  btn('LEADERBOARD',()=>{if(!results.length){T('NO DATA');return}const sorted=[...results].sort((a,b)=>a-b);showModal(`<div style="color:var(--or);font-size:7px;margin-bottom:8px">🏆 RESULTS</div><div>${sorted.slice(0,8).map((r,i)=>`#${i+1}  ${r}ms  ${grade(r)}`).join('<br>')}</div><div style="margin-top:6px;color:var(--fg)">AVG: ${Math.round(results.reduce((a,b)=>a+b)/results.length)}ms<br>BEST: ${sorted[0]}ms</div><button class="cb cg" onclick="closeModal()" style="margin-top:8px;max-width:none;flex:none">CLOSE</button>`)},'cy');
  btn('SHARE',()=>{const avg=results.length?Math.round(results.reduce((a,b)=>a+b)/results.length):0;navigator.share?.({title:'Reaction Test',text:`My reaction time: ${results.length?Math.min(...results):0}ms best, ${avg}ms avg!`}).catch(()=>{})},'co');
  _H={ok:tap};
}

/* ══════════════════════════════════
   12. TALLY COUNTER
══════════════════════════════════ */
function appTally(){
  let count=0,total=0,sets=[];
  const render=()=>{
    scr.innerHTML=`<div class="fi">
      <div class="sl d" style="text-align:center;font-size:5px">TAP SCREEN OR OK</div>
      <div class="tally">${String(count).padStart(4,'0')}</div>
      <div class="sl d" style="text-align:center">SESSION: ${total}</div>
      <div class="hr"></div>
      ${sets.slice(-3).reverse().map(s=>`<div class="sl d" style="text-align:center;font-size:5.5px">SET: ${s}</div>`).join('')}
    </div>`;
    scr.onclick=tap;
  };
  const tap=()=>{count++;total++;vib([6]);lp('G',55);render()};
  render();clearCtx();
  btn('+1',tap,'cg');
  btn('UNDO',()=>{if(count>0){count--;total--;vib([18]);render()}},'');
  btn('SAVE SET',()=>{sets.push(count);count=0;render();T('SET '+sets.length+' SAVED!')},'co');
  btn('RESET',()=>{if(count>0)sets.push(count);count=0;render()},'');
  btn('SHARE',()=>navigator.share?.({title:'Tally',text:`Count: ${total}\nSets: ${sets.join(', ')}`}).catch(()=>{}),'cy');
  _H={ok:tap,sU:tap,sD:()=>{if(count>0){count--;total--;vib([18]);render()}}};
}

/* ══════════════════════════════════
   13. STOPWATCH with laps
══════════════════════════════════ */
function appStopwatch(){
  let start=0,elapsed=0,running=false,laps=[];
  const fmt=ms=>{const t=ms;const min=Math.floor(t/60000);const sec=Math.floor((t%60000)/1000);const mss=Math.floor((t%1000)/10);return `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}<span class="sw-ms">.${String(mss).padStart(2,'0')}</span>`};
  const render=()=>{
    const now=running?elapsed+(Date.now()-start):elapsed;
    scr.innerHTML=`<div class="fi">
      <div class="sl h" style="text-align:center">⏱ STOPWATCH</div>
      <div class="sw-time" style="text-align:center">${fmt(now)}</div>
      <div class="hr"></div>
      <div style="max-height:60px;overflow:hidden">
        ${laps.slice(-4).reverse().map((l,i)=>`<div class="sl d" style="text-align:center;font-size:5.5px">LAP ${laps.length-i}: ${fmt(l)}</div>`).join('')}
      </div>
    </div>`;
  };
  render();
  window._swInt=setInterval(()=>{if(running&&S.app==='stopwatch')render()},33);
  clearCtx();
  btn('START / STOP',()=>{
    if(running){elapsed+=Date.now()-start;running=false;T('STOPPED')}
    else{start=Date.now();running=true;T('RUNNING...')}
    render();vib(running?[15]:[30]);
  },'cg');
  btn('LAP',()=>{
    if(!running){T('START FIRST');return}
    const now=elapsed+(Date.now()-start);laps.push(now);T('LAP '+laps.length+': '+fmt(now).replace(/<[^>]+>/g,''));
    vib([10,5,10]);render();
  },'co');
  btn('RESET',()=>{running=false;elapsed=0;laps=[];render();T('RESET')},'');
  btn('SHARE',()=>{const now=running?elapsed+(Date.now()-start):elapsed;navigator.share?.({title:'Stopwatch',text:`Time: ${fmt(now).replace(/<[^>]+>/g,'')}\nLaps: ${laps.map((l,i)=>`L${i+1}:${fmt(l).replace(/<[^>]+>/g,'')}`).join(' ')}`}).catch(()=>{})},'cy');
  _H={ok:()=>{if(running){elapsed+=Date.now()-start;running=false}else{start=Date.now();running=true}render()}};
}

/* ══════════════════════════════════
   14. COMPASS (real DeviceOrientation)
══════════════════════════════════ */
function appCompass(){
  clearCtx();
  btn('REQUEST',async()=>{if(typeof DeviceOrientationEvent?.requestPermission==='function'){try{await DeviceOrientationEvent.requestPermission();T('COMPASS OK!')}catch(e){T('DENIED')}}else T('ALREADY ACTIVE')},'cg');
  btn('SHARE HDG',()=>navigator.share?.({title:'Heading',text:`Heading: ${_sx.al}° — GPS: ${S.gpsPos?`${S.gpsPos.lat.toFixed(5)},${S.gpsPos.lon.toFixed(5)}`:'no GPS'}`}).catch(()=>{}),'co');
  const draw=()=>{
    window._sRaf=requestAnimationFrame(draw);if(S.app!=='compass')return;
    const h=_sx.al;const dirs=['N','NE','E','SE','S','SW','W','NW'];const dir=dirs[Math.round(h/45)%8];
    const tilt=Math.round(Math.sqrt(_sx.be**2+_sx.ga**2));
    scr.innerHTML=`<div class="fi"><div class="sl h" style="text-align:center">⊕ COMPASS</div><div class="hr"></div>
      <div class="cpw"><div class="cpn" style="transform:rotate(${h}deg)"></div><div class="cpl">${dir}</div></div>
      <div class="sl" style="text-align:center;margin-top:3px">${h}°  —  ${dir}</div>
      <div class="hr"></div>
      <div class="sl d">TILT: ${tilt}°   β:${_sx.be}°  γ:${_sx.ga}°</div>
    </div>`;
  };draw();
}

/* ══════════════════════════════════
   15. MORSE CODE VIBRATOR
══════════════════════════════════ */
const MORSE_CODE={'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',' ':' '};

function appMorse(){
  scr.innerHTML=`<div class="fi">
    <div class="sl h" style="text-align:center">· MORSE VIBRO</div>
    <div class="hr"></div>
    <div class="sl d">Type text → phone vibrates</div>
    <div class="sl d">morse code. Friends feel it!</div>
    <div class="hr"></div>
    <div class="morse-txt" id="morseTxt">---</div>
    <div class="sl d" id="morseLatin" style="text-align:center">---</div>
  </div>`;
  clearCtx();
  btn('TYPE & VIBE',()=>{
    const txt=prompt('Text to send in Morse:');if(!txt)return;
    const upper=txt.toUpperCase().slice(0,20);
    const code=upper.split('').map(c=>MORSE_CODE[c]||'').join(' ');
    const el=$('morseTxt');if(el)el.textContent=code;
    const el2=$('morseLatin');if(el2)el2.textContent=upper;
    morseVibrate(upper);T('VIBRATING: '+upper);
  },'cg');
  btn('SOS',()=>{morseVibrate('SOS');T('SOS VIBRATING');const el=$('morseTxt');if(el)el.textContent='... --- ...';const el2=$('morseLatin');if(el2)el2.textContent='SOS'},'cr');
  btn('HI',()=>{morseVibrate('HI');T('HI SENT!');const el=$('morseTxt');if(el)el.textContent=MORSE_CODE.H+' '+MORSE_CODE.I},'co');
  btn('OMG',()=>{morseVibrate('OMG');T('OMG!');const el=$('morseTxt');if(el)el.textContent=MORSE_CODE.O+' '+MORSE_CODE.M+' '+MORSE_CODE.G},'cy');
  _H={ok:()=>{}};
}

function morseVibrate(txt){
  const DOT=80,DASH=240,GAP=80,LETTER_GAP=240,WORD_GAP=480;
  const pattern=[];
  for(const ch of txt.toUpperCase()){
    const m=MORSE_CODE[ch];
    if(!m){pattern.push(0,WORD_GAP);continue}
    for(let i=0;i<m.length;i++){
      pattern.push(m[i]==='.'?DOT:DASH);
      if(i<m.length-1)pattern.push(GAP);
    }
    pattern.push(0,LETTER_GAP);
  }
  try{navigator.vibrate(pattern)}catch(e){T('VIBRATION NOT SUPPORTED')}
  lp('O',pattern.reduce((a,b)=>a+b,0));
}


/* ══════════════════════════════════
   16. QR SCANNER (BarcodeDetector)
══════════════════════════════════ */
function appQR(){
  scr.innerHTML=`<div class="fi"><div class="sl h">▣ QR / BARCODE</div><div class="hr"></div><video id="qrV" style="width:100%;border-radius:3px;display:none" autoplay playsinline muted></video><div class="sl d" id="qrSt">Press SCAN</div><div class="sl" id="qrR" style="white-space:normal;word-break:break-all;font-size:5.5px;line-height:1.5;margin-top:2px;position:relative;z-index:2"></div></div>`;
  clearCtx();btn('SCAN',qrScan,'cg');btn('STOP',qrStop,'cr');btn('OPEN URL',()=>{if(!window._qrLast){T('SCAN FIRST');return}if(window._qrLast.startsWith('http'))window.open(window._qrLast,'_blank');else T(window._qrLast.slice(0,30))},'co');btn('COPY',()=>{if(!window._qrLast){T('SCAN FIRST');return}navigator.clipboard?.writeText(window._qrLast).then(()=>T('COPIED!'))},'cy');
  _H={ok:qrScan};window._qrLast='';
}
async function qrScan(){
  qrStop();
  if(!('BarcodeDetector' in window)){scr.innerHTML=`<div class="fi"><div class="sl h">▣ QR SCANNER</div><div class="hr"></div><div class="sl r">⚠ BarcodeDetector not</div><div class="sl r">available here.</div><div class="hr"></div><div class="sl d">Use Chrome on Android.</div></div>`;return}
  try{
    window._qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false});
    const vid=$('qrV');if(!vid)return;vid.srcObject=window._qrStream;vid.style.display='block';
    const s=$('qrSt');if(s)s.textContent='SCANNING...';
    const bd=new BarcodeDetector({formats:['qr_code','ean_13','ean_8','code_128','code_39','upc_a','data_matrix']});
    window._qrInt=setInterval(async()=>{
      if(!vid.videoWidth)return;
      try{const codes=await bd.detect(vid);if(codes.length){window._qrLast=codes[0].rawValue;const el=$('qrR');if(el)el.textContent='▶ '+window._qrLast.slice(0,80);const st=$('qrSt');if(st)st.textContent='FMT: '+codes[0].format.toUpperCase();T('QR FOUND!');vib([60,20,60]);lp('G',400)}}catch(e){}
    },500);
  }catch(e){T('CAM: '+e.message.slice(0,16))}
}
function qrStop(){if(window._qrInt){clearInterval(window._qrInt);window._qrInt=null}if(window._qrStream){window._qrStream.getTracks().forEach(t=>t.stop());window._qrStream=null}}

/* ══════════════════════════════════
   17. CAMERA + TORCH
══════════════════════════════════ */
function appCam(){
  scr.innerHTML=`<div class="fi"><div class="sl h">◎ CAMERA</div><div class="hr"></div><video id="cV" style="width:100%;border-radius:3px;display:none" autoplay playsinline muted></video><canvas id="cC" style="width:100%;border-radius:3px;display:none"></canvas><div class="sl d" id="cSt">Press FRONT or BACK</div></div>`;
  clearCtx();btn('FRONT',()=>camStart('user'),'cg');btn('BACK',()=>camStart('environment'),'co');btn('PHOTO',camPhoto,'cy');btn('TORCH',camTorch,'');btn('STOP',camOff,'cr');
  _H={ok:camPhoto};
}
let _cStream=null,_cTrack=null;
async function camStart(f){camOff();try{_cStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:f,width:{ideal:640}},audio:false});const v=$('cV');if(!v)return;v.srcObject=_cStream;v.style.display='block';_cTrack=_cStream.getVideoTracks()[0];const s=$('cSt');if(s)s.textContent='LIVE: '+f.toUpperCase();window._camStream=_cStream}catch(e){T('CAM: '+e.message.slice(0,16))}}
function camPhoto(){if(!_cStream){T('START CAMERA FIRST');return}const v=$('cV'),c=$('cC');if(!v||!c)return;c.width=v.videoWidth||320;c.height=v.videoHeight||240;c.getContext('2d').drawImage(v,0,0);c.style.display='block';v.style.display='none';c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='photo_'+Date.now()+'.jpg';a.click();T('PHOTO SAVED! 📸');vib([30,10,30])},'image/jpeg',.92)}
async function camTorch(){if(!_cTrack){T('START BACK CAM');return}const caps=_cTrack.getCapabilities();if(!caps.torch){T('NO TORCH');return}const cur=_cTrack.getSettings().torch||false;await _cTrack.applyConstraints({advanced:[{torch:!cur}]});T('TORCH: '+((!cur)?'ON ⚡':'OFF'))}
function camOff(){if(_cStream){_cStream.getTracks().forEach(t=>t.stop());_cStream=null;_cTrack=null;window._camStream=null}}

/* ══════════════════════════════════
   18. HACKER MODE (fun terminal display)
══════════════════════════════════ */
function appHack(){
  const lines=[
    {t:'p',s:'> INITIALIZING FLIPPER REMOTE v4.0...'},
    {t:'ok',s:'[OK] Kernel module loaded'},
    {t:'ok',s:'[OK] RF subsystem active'},
    {t:'p',s:'> Scanning local network...'},
    {t:'ok',s:'[OK] Found 3 devices on subnet'},
    {t:'p',s:'> Analyzing signal spectrum...'},
    {t:'ok',s:'[OK] 433MHz carrier detected'},
    {t:'p',s:'> Reading NFC field...'},
    {t:'ok',s:'[OK] ISO 14443-A tag in range'},
    {t:'p',s:'> Bluetooth scan...'},
    {t:'ok',s:'[OK] 7 BLE devices found'},
    {t:'p',s:'> Loading IR database...'},
    {t:'ok',s:'[OK] 48291 codes loaded'},
    {t:'p',s:'> GPS fix...'},
    {t:'ok',s:'[OK] Satellites: 9 | HDOP: 1.2'},
    {t:'p',s:'> System status...'},
    {t:'ok',s:'[OK] All systems nominal'},
    {t:'ok',s:'[OK] FLIPPER REMOTE READY'},
    {t:'p',s:'> _'},
  ];
  let li=0;
  scr.innerHTML=`<div style="padding:3px;height:100%;overflow:hidden"><div class="term" id="hackOut"></div></div>`;
  clearCtx();
  btn('RUN',()=>{const el=$('hackOut');if(!el)return;el.textContent='';li=0;startLoad(lines.length*120);clearInterval(window._hackInt);window._hackInt=setInterval(()=>{if(li>=lines.length){clearInterval(window._hackInt);return}const l=lines[li++];const cls=l.t==='p'?'p':l.t==='ok'?'ok':'er';el.innerHTML+='<div class="'+cls+'">'+l.s+'</div>';vib(4);el.parentElement.scrollTop=9999},120)},'cg');
  btn('MATRIX',()=>{matrixBoot(4000).then(()=>{if(S.app==='fake_hack')appHack()})},'cp');
  btn('CLEAR',()=>{const el=$('hackOut');if(el)el.innerHTML='';clearInterval(window._hackInt)},'');
  btn('SHARE',()=>navigator.share?.({title:'FlipperRemote Scan',text:'Just scanned the whole building 👾 Found 7 BLE, 3 TVs, IR database loaded. FlipperRemote v4.0'}).catch(()=>{}),'co');
  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ══════════════════════════════════
   19. SPEECH
══════════════════════════════════ */
function appSpeech(){
  scr.innerHTML=`<div class="fi"><div class="sl h">◬ SPEECH</div><div class="hr"></div><div class="sl d" id="spSt">READY</div><div class="hr"></div><div class="sl" id="spTxt" style="white-space:normal;line-height:1.5;font-size:5.5px;position:relative;z-index:2">---</div></div>`;
  clearCtx();btn('LISTEN',spListen,'cg');btn('STOP',spStop,'');btn('SPEAK',spSpeak,'co');btn('TRANSLATE',()=>{const t=$('spTxt')?.textContent;if(!t||t==='---'){T('LISTEN FIRST');return}window.open('https://translate.google.com/?sl=auto&tl=lt&text='+encodeURIComponent(t),'_blank')},'cb2');
  _H={ok:spListen};
}
let _recog=null;
function spListen(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){T('NOT SUPPORTED');return}spStop();_recog=new SR();_recog.continuous=true;_recog.interimResults=true;_recog.lang='en-US';_recog.onstart=()=>{const e=$('spSt');if(e)e.textContent='LISTENING...'};_recog.onresult=e=>{let f='',i='';for(let j=e.resultIndex;j<e.results.length;j++){if(e.results[j].isFinal)f+=e.results[j][0].transcript;else i+=e.results[j][0].transcript}const el=$('spTxt');if(el)el.textContent=(f||i).slice(0,120)||'---';if(f){addLog('Speech',f.slice(0,30));lp('G',200)}};_recog.onerror=e=>{const el=$('spSt');if(el)el.textContent='ERR: '+e.error};_recog.onend=()=>{const el=$('spSt');if(el)el.textContent='STOPPED'};_recog.start();T('LISTENING...')}
function spStop(){if(_recog){try{_recog.stop()}catch(e){}}_recog=null}
function spSpeak(){if(!window.speechSynthesis){T('NO TTS');return}const msg=prompt('Text to speak:');if(!msg)return;window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(msg),{rate:.95}));T('SPEAKING...')}

/* ══════════════════════════════════
   20. NETWORK INFO
══════════════════════════════════ */
function appNetwork(){
  clearCtx();btn('REFRESH',rNet,'cg');btn('IP INFO',netIPInfo,'co');btn('SPEED',netSpeed,'cy');btn('PING',()=>{T('PINGING...');const t=Date.now();fetch('https://www.google.com/favicon.ico?_='+t,{mode:'no-cors',signal:AbortSignal.timeout(4000)}).then(()=>T('PING: '+(Date.now()-t)+'ms')).catch(()=>T('PING FAILED'))},'');
  rNet();_H={ok:rNet};
}
async function rNet(){
  const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  scr.innerHTML=`<div class="fi"><div class="sl h">◈ NETWORK INFO</div><div class="hr"></div><div class="sl">TYPE: ${c?.type||'unknown'}</div><div class="sl">EFF: ${c?.effectiveType||'?'}</div><div class="sl">DL: ${c?.downlink||'?'} Mbps</div><div class="sl">RTT: ${c?.rtt||'?'} ms</div><div class="hr"></div><div class="sl d">ONLINE: ${navigator.onLine?'YES':'NO'}</div><div class="sl d">HTTPS: ${isHttps()?'YES (TV limited)':'NO (full)'}</div><div class="sl d">HOST: ${location.hostname.slice(0,22)}</div></div>`;
}
async function netIPInfo(){
  T('LOOKING UP...');startLoad(5000);
  try{const r=await fetch('https://ipapi.co/json/',{signal:AbortSignal.timeout(5000)});const d=await r.json();showModal(`<div style="color:var(--or);font-size:7px;margin-bottom:8px">🌍 IP INFO</div><div>IP: ${d.ip}<br>CITY: ${d.city}<br>COUNTRY: ${d.country_name}<br>ISP: ${(d.org||'').slice(0,24)}<br>TZ: ${d.timezone}</div><button class="cb cg" onclick="closeModal()" style="margin-top:8px;max-width:none;flex:none;padding:6px 12px">CLOSE</button>`);addLog('Net','IP: '+d.ip+' '+d.city)}
  catch(e){T('LOOKUP FAILED')}
}
async function netSpeed(){
  T('TESTING...');startLoad(8000);
  const t0=Date.now();
  try{const r=await fetch('https://httpbin.org/bytes/500000',{signal:AbortSignal.timeout(8000)});const d=await r.arrayBuffer();const s=((d.byteLength*8/1e6)/((Date.now()-t0)/1000)).toFixed(2);T('DL: '+s+' Mbps 🚀');addLog('Net','Speed: '+s+' Mbps')}
  catch(e){T('TEST FAILED')}
}

/* ══════════════════════════════════
   21. GPS
══════════════════════════════════ */
function appGPS(){
  rGPS();clearCtx();
  btn('START',gpsStart,'cg');btn('STOP',()=>{if(S.gpsWatch){navigator.geolocation.clearWatch(S.gpsWatch);S.gpsWatch=null}rGPS()},'');
  btn('SHARE',()=>{if(!S.gpsPos){T('NO GPS');return}const u=`https://maps.google.com/?q=${S.gpsPos.lat.toFixed(6)},${S.gpsPos.lon.toFixed(6)}`;navigator.share?.({title:'My Location',text:'My location from FlipperRemote',url:u}).catch(()=>navigator.clipboard?.writeText(u).then(()=>T('LINK COPIED!')))},'co');
  btn('MAPS',()=>{if(S.gpsPos)window.open(`https://maps.google.com/?q=${S.gpsPos.lat},${S.gpsPos.lon}`,'_blank');else T('NO GPS')},'');
  btn('CSV',()=>{if(!S.gpsTrack.length){T('NO DATA');return}const csv='time,lat,lon,acc\n'+S.gpsTrack.map(p=>`${new Date(p.t).toISOString()},${p.lat},${p.lon},${p.acc}`).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='gps.csv';a.click();T('CSV SAVED!')},'cy');
  _H={ok:gpsStart};
}
function rGPS(){const d=S.gpsPos;scr.innerHTML=`<div class="fi"><div class="sl">${S.gpsWatch!==null?'<span class="bl">⊕ TRACKING...</span>':'○ IDLE'}</div><div class="sl d">POINTS: ${S.gpsTrack.length}</div><div class="hr"></div>${d?`<div class="sl h">LAT: ${d.lat.toFixed(6)}</div><div class="sl h">LON: ${d.lon.toFixed(6)}</div><div class="sl">ACC: ±${Math.round(d.acc)}m</div><div class="sl d">SPD: ${d.spd!=null?(d.spd*3.6).toFixed(1)+' km/h':'N/A'}</div>`:'<div class="sl d">Acquiring GPS...</div>'}</div>`}
function gpsStart(){if(!navigator.geolocation){T('NO GPS');return}if(S.gpsWatch)return;T('ACQUIRING...');startLoad(10000);S.gpsWatch=navigator.geolocation.watchPosition(pos=>{S.gpsPos={lat:pos.coords.latitude,lon:pos.coords.longitude,acc:pos.coords.accuracy,alt:pos.coords.altitude,spd:pos.coords.speed};S.gpsTrack.push({...S.gpsPos,t:Date.now()});if(S.gpsTrack.length>1000)S.gpsTrack.shift();lp('G',150);if(S.app==='gps')rGPS()},err=>{T('GPS: '+err.message.slice(0,18));S.gpsWatch=null;rGPS()},{enableHighAccuracy:true,maximumAge:0,timeout:30000});rGPS()}

/* ══════════════════════════════════
   22. SENSORS
══════════════════════════════════ */
function appSensors(){
  const draw=()=>{window._sRaf=requestAnimationFrame(draw);if(S.app==='sensors')rSens()};draw();
  clearCtx();
  btn('iOS PERM',async()=>{if(typeof DeviceMotionEvent?.requestPermission==='function'){try{await DeviceMotionEvent.requestPermission();await DeviceOrientationEvent.requestPermission();T('SENSORS OK!')}catch(e){T('DENIED')}}else T('ALREADY ACTIVE')},'cg');
  btn('LEVEL',()=>{const a=Math.abs(_sx.be)+Math.abs(_sx.ga);T(a<5?'LEVEL ✓ 👍':a<15?'SLIGHT TILT':a<30?'TILT '+a.toFixed(0)+'°':'VERY TILTED!');vib(a<5?[30]:a<15?[10,5,10]:[20,10,20,10,20])},'co');
  btn('COMPASS',()=>T('HEADING: '+_sx.al+'°'),'cy');
  btn('SHAKE',()=>{T('SHAKE!');let sc=0,sl=0;const c=()=>{const now=Date.now();const m=Math.abs(_sx.ax)+Math.abs(_sx.ay)+Math.abs(_sx.az);if(m>25&&now-sl>300){sc++;sl=now;lp('R',120);vib(15)}if(sc<8)setTimeout(c,50);else T('SHAKES: '+sc+'! 🤙')};c()},'');
}
function rSens(){scr.innerHTML=`<div class="fi"><div class="sl h">⊹ SENSORS</div><div class="hr"></div><div class="sl">ACCEL  X:${_sx.ax}  Y:${_sx.ay}  Z:${_sx.az}</div><div class="sl">ORIENT α:${_sx.al}°  β:${_sx.be}°  γ:${_sx.ga}°</div><div class="sl">TILT: ${Math.round(Math.sqrt(_sx.be**2+_sx.ga**2))}°</div><div class="hr"></div><div class="sl d">TOUCH: ${navigator.maxTouchPoints}pts · DPR: ${window.devicePixelRatio}x</div><div class="sl d">BAT: ${S.battery?Math.round(S.battery.level*100)+'%'+(S.battery.charging?' ⚡':''):'N/A'} · ${navigator.onLine?'ONLINE 🟢':'OFFLINE 🔴'}</div></div>`}

/* ══════════════════════════════════
   23. WAKE LOCK
══════════════════════════════════ */
function appWake(){rWake();clearCtx();btn('LOCK ON',wakeOn,'cg');btn('LOCK OFF',wakeOff,'cr');btn('STATUS',()=>T(S.wakeLock?'ACTIVE ● SCREEN ON':'INACTIVE'),'');}
function rWake(){scr.innerHTML=`<div class="fi"><div class="sl h">⊙ WAKE LOCK</div><div class="sl">${S.wakeLock?'<span class="bl">● ACTIVE — SCREEN ON</span>':'○ INACTIVE'}</div><div class="hr"></div><div class="sl d">Stops screen from dimming.</div><div class="sl d">Handy for TV remote use,</div><div class="sl d">showing off at demos 👀</div><div class="hr"></div><div class="sl ${'wakeLock' in navigator?'h':'r'}">${'wakeLock' in navigator?'● API SUPPORTED':'⚠ NOT SUPPORTED'}</div></div>`}
async function wakeOn(){if(!('wakeLock' in navigator)){T('NOT SUPPORTED');return}try{S.wakeLock=await navigator.wakeLock.request('screen');S.wakeLock.addEventListener('release',()=>{S.wakeLock=null;if(S.app==='wakelock')rWake()});T('WAKE LOCK ON! 👁');lp('G',500);rWake()}catch(e){T('WAKE: '+e.message.slice(0,14))}}
async function wakeOff(){if(S.wakeLock){await S.wakeLock.release();S.wakeLock=null}T('WAKE LOCK OFF');rWake()}

/* ══════════════════════════════════
   24. SHARE (Web Share API)
══════════════════════════════════ */
function appShare(){
  scr.innerHTML=`<div class="fi"><div class="sl h">⊿ WEB SHARE</div><div class="hr"></div><div class="sl d">Share to WhatsApp, SMS,</div><div class="sl d">email, and more.</div><div class="hr"></div><div class="sl ${'share' in navigator?'h':'r'}">${'share' in navigator?'● SHARE API OK':'⚠ NOT SUPPORTED'}</div></div>`;
  clearCtx();
  btn('SHARE GPS',()=>{if(!S.gpsPos){T('GET GPS FIRST');return}navigator.share?.({title:'My Location',text:`📍 I'm here!`,url:`https://maps.google.com/?q=${S.gpsPos.lat.toFixed(6)},${S.gpsPos.lon.toFixed(6)}`}).catch(()=>{})},'cg');
  btn('SHARE APP',()=>navigator.share?.({title:'FlipperRemote',text:'Check out FlipperRemote — a Flipper Zero web app 👾',url:location.href}).catch(()=>{}),'co');
  btn('SHARE TEXT',()=>{const t=prompt('Text to share:');if(t)navigator.share?.({title:'FlipperRemote',text:t}).catch(()=>{})},'cy');
  btn('SHARE LOG',async()=>{const txt=S.log.map(l=>l.ts+' ['+l.cat+'] '+l.msg).join('\n');const f=new File([txt],'flipper_log.txt',{type:'text/plain'});if(navigator.canShare?.({files:[f]})){await navigator.share({files:[f],title:'FlipperRemote Log'}).catch(()=>{})}else{navigator.clipboard?.writeText(txt).then(()=>T('LOG COPIED!'))}},'cb2');
  _H={ok:()=>document.querySelector('.cb.cg')?.click()};
}

/* ══════════════════════════════════
   25. SYSTEM
══════════════════════════════════ */
function appSystem(){
  clearCtx();btn('REFRESH',rSys,'cg');btn('DOWNLOAD',dlAll,'co');btn('LOG',appLog,'');btn('INSTALL',()=>{if(window._pwaP){window._pwaP.prompt()}else showModal(`<div style="color:var(--or);font-size:7px;margin-bottom:8px">INSTALL AS APP</div><div>iOS: Share ▶ Add to Home Screen<br><br>Android: Menu ▶ Add to Home Screen</div><button class="cb cg" onclick="closeModal()" style="margin-top:8px;max-width:none;flex:none;padding:6px 12px">OK</button>`)},'cy');
  rSys();_H={ok:rSys};
}
function rSys(){
  const bat=S.battery?Math.round(S.battery.level*100)+'%'+(S.battery.charging?' ⚡':''):'N/A';
  const c=navigator.connection;const mem=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576)+'MB':'N/A';
  scr.innerHTML=`<div class="fi">
    <div style="display:flex;justify-content:center;padding:2px 0;opacity:.6">
      <div class="logo hi" style="font-size:1.8px;line-height:1.22">${LOGO}</div>
    </div>
    <div class="sl h" style="text-align:center;margin-top:2px">FLIPPER REMOTE v4.0</div>
    <div class="hr"></div>
    <div class="sl">BAT: ${bat}</div>
    <div class="sl">NET: ${c?.effectiveType||'?'} · ${c?.downlink||'?'}Mbps</div>
    <div class="sl">MEM: ${mem}</div>
    <div class="hr"></div>
    <div class="sl d">BT:${'bluetooth' in navigator?'✓':'✗'} NFC:${'NDEFReader' in window?'✓':'✗'} SER:${'serial' in navigator?'✓':'✗'}</div>
    <div class="sl d">QR:${'BarcodeDetector' in window?'✓':'✗'} SHARE:${'share' in navigator?'✓':'✗'}</div>
    <div class="sl d">LOG: ${S.log.length} entries · GPS: ${S.gpsTrack.length}pts</div>
  </div>`;
}
async function dlAll(){for(const f of['index.html','style.css','script.js']){try{const r=await fetch(f);const b=await r.blob();const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f;a.click();await new Promise(r=>setTimeout(r,400))}catch(e){T('DL FAIL: '+f)}}T('3 FILES SAVED! 💾')}

/* ── LOG ── */
function appLog(){
  let off=0;
  const r=()=>{scr.innerHTML=`<div class="fi sl2"><div class="sl d">${S.log.length} ENTRIES</div><div class="hr"></div>${S.log.slice(off,off+8).map(e=>`<div style="display:flex;gap:2px;line-height:1.55;position:relative;z-index:2"><span style="font-family:var(--mo);font-size:5px;color:var(--fgd);flex-shrink:0">${e.ts}</span><span style="font-family:var(--px);font-size:5px;color:var(--fgh);flex-shrink:0">[${e.cat}]</span><span style="font-family:var(--px);font-size:5px;overflow:hidden">${e.msg}</span></div>`).join('')||'<div class="sl d">Empty</div>'}</div>`};
  r();clearCtx();
  btn('TOP',()=>{off=0;r()},'');
  btn('COPY',()=>navigator.clipboard?.writeText(S.log.map(l=>l.ts+' ['+l.cat+'] '+l.msg).join('\n')).then(()=>T('COPIED!')),'cy');
  btn('CLEAR',()=>{S.log=[];off=0;r();T('CLEARED')},'cr');
  _H={up:()=>{off=Math.max(0,off-1);r()},dn:()=>{off=Math.min(Math.max(0,S.log.length-8),off+1);r()}};
}

/* ── PWA + GLOBALS ── */
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._pwaP=e});
window.closeModal=closeModal;window.openApp=openApp;
window.S=S;window.rTV=rTV;window.rBT=rBT;
