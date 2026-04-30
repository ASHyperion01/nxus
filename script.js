/* ============================================================
   Network Scanner — script.js
   Windows XP style, no emoji, SVG icons
   ============================================================ */

// ── SVG Icon library ─────────────────────────────────────────────
const ICONS = {
  wifi: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 8.5A13 13 0 0121 8.5" stroke="#316AC5" stroke-width="1.8" stroke-linecap="round"/><path d="M6.5 12a8 8 0 0111 0" stroke="#316AC5" stroke-width="1.8" stroke-linecap="round"/><path d="M10 15.5a3 3 0 014 0" stroke="#316AC5" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="19" r="1.2" fill="#316AC5"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="16" height="12" rx="2" stroke="#316AC5" stroke-width="1.5"/><path d="M18 10l4-2v8l-4-2V10z" stroke="#316AC5" stroke-width="1.5" stroke-linejoin="round"/><circle cx="10" cy="13" r="3" stroke="#316AC5" stroke-width="1.5"/></svg>`,
  computer: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="#316AC5" stroke-width="1.5"/><path d="M8 21h8M12 17v4" stroke="#316AC5" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  printer: `<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="2" width="12" height="7" rx="1" stroke="#316AC5" stroke-width="1.5"/><rect x="3" y="9" width="18" height="10" rx="2" stroke="#316AC5" stroke-width="1.5"/><rect x="7" y="15" width="10" height="6" rx="1" stroke="#316AC5" stroke-width="1.5"/><circle cx="18" cy="13" r="1" fill="#316AC5"/></svg>`,
  nas: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="5" rx="1" stroke="#316AC5" stroke-width="1.5"/><rect x="2" y="11" width="20" height="5" rx="1" stroke="#316AC5" stroke-width="1.5"/><circle cx="18" cy="6.5" r="1" fill="#316AC5"/><circle cx="18" cy="13.5" r="1" fill="#316AC5"/></svg>`,
  router: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="14" width="20" height="7" rx="2" stroke="#316AC5" stroke-width="1.5"/><path d="M8 14V10M12 14V8M16 14V10" stroke="#316AC5" stroke-width="1.5" stroke-linecap="round"/><circle cx="18" cy="17.5" r="1" fill="#316AC5"/></svg>`,
  iot: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#316AC5" stroke-width="1.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1" stroke="#316AC5" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none"><rect x="7" y="2" width="10" height="20" rx="2" stroke="#316AC5" stroke-width="1.5"/><circle cx="12" cy="18" r="1" fill="#316AC5"/><path d="M10 5h4" stroke="#316AC5" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  tv: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="14" rx="2" stroke="#316AC5" stroke-width="1.5"/><path d="M8 22h8M12 18v4" stroke="#316AC5" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  voip: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-1z" stroke="#316AC5" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  switch: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="9" width="20" height="6" rx="1" stroke="#316AC5" stroke-width="1.5"/><path d="M6 9V6M9 9V6M12 9V6M15 9V6M18 9V6" stroke="#316AC5" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  server: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="5" rx="1" stroke="#316AC5" stroke-width="1.5"/><rect x="2" y="10" width="20" height="5" rx="1" stroke="#316AC5" stroke-width="1.5"/><rect x="2" y="17" width="20" height="4" rx="1" stroke="#316AC5" stroke-width="1.5"/><circle cx="18" cy="5.5" r="1" fill="#316AC5"/><circle cx="18" cy="12.5" r="1" fill="#316AC5"/></svg>`,
  dvr: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="2" stroke="#316AC5" stroke-width="1.5"/><circle cx="8" cy="12" r="2.5" stroke="#316AC5" stroke-width="1.5"/><path d="M14 10h5M14 14h3" stroke="#316AC5" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  game: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="10" rx="3" stroke="#316AC5" stroke-width="1.5"/><path d="M8 13v-2M7 12h2M15 12h2M17 11v2" stroke="#316AC5" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  ups: `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#316AC5" stroke-width="1.5"/><path d="M12 8v4l3 3" stroke="#316AC5" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  industrial: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="1" stroke="#316AC5" stroke-width="1.5"/><path d="M3 10h18M8 10v9M15 10v9" stroke="#316AC5" stroke-width="1.5"/><circle cx="5.5" cy="7.5" r="1" fill="#316AC5"/></svg>`,
  medical: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2" stroke="#316AC5" stroke-width="1.5"/><path d="M12 10v5M9.5 12.5h5" stroke="#316AC5" stroke-width="2" stroke-linecap="round"/><path d="M8 6V4M16 6V4" stroke="#316AC5" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  other: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="#316AC5" stroke-width="1.5"/><path d="M3 10h18" stroke="#316AC5" stroke-width="1.5"/><circle cx="7" cy="8" r="1" fill="#316AC5"/><circle cx="11" cy="8" r="1" fill="#316AC5"/></svg>`,
};

// ── Data pools ────────────────────────────────────────────────────
const CATEGORIES = {
  wifi: {
    label: "WiFi Networks", icon: "wifi",
    items: [
      "TELIA-3F8A","Linksys_Home","NETGEAR-5G","TP-LINK_2.4G","Telecom-Home","Zilvinas_Home",
      "Office-WiFi","FiberNET_Auto","WIFI-Apartment","Rytas_2G","iPhone Tomas","Eduroam",
      "Bite_Lithuania","Omnitel Guest","Telia_5G_Plus","NordVPN_AP","MikroTik-789A","HUAWEI-B525",
      "Zyxel_Guest","FRITZ!Box 7530","HomeNet_Plus","SEB_Office","FreeWifi_Public","eduroam",
      "Startup Hub","UPC WiFi","Hidden Network","AndroidAP","Galaxy S23 Hotspot","Xiaomi_6F22",
      "IPTV_Service","Belkin.setup","WifiExtender","NETIS_123","ASUS_RT-AX88U","GL.iNet",
      "Ubiquiti-Corp","Cisco-Guest","HomeAssistant_AP","OfficeNet_Backup"
    ],
    badges: ["WPA2","WPA2","WPA2","WPA3","WEP","Open"],
    details: n => ({
      "Type": "IEEE 802.11 Wireless Network",
      "Frequency": randItem(["2.4 GHz","5 GHz","6 GHz"]),
      "Channel": String(randInt(1, 13)),
      "Security": n.badge,
      "BSSID": randMac(),
      "Signal Level": `${randInt(-80,-40)} dBm`,
      "Network Width": randItem(["20 MHz","40 MHz","80 MHz","160 MHz"]),
    })
  },
  camera: {
    label: "IP Cameras / CCTV", icon: "camera",
    items: [
      "Hikvision DS-2CD2143","Dahua IPC-HDW2431","TP-Link Tapo C200","EZVIZ C3W Pro",
      "Reolink RLC-810A","Axis P3245-V","Hanwha QNV-8080R","Bosch FLEXIDOME 5100i",
      "Vivotek FD9389-EHV","Amcrest IP8M-2496","Uniview IPC3614SB","Wisenet XNV-8080R",
      "Pelco Sarix IBE330","Milesight MS-C5375","Geovision GV-EBD4704","FLIR FC-S",
      "Lorex E893AB","Nest Cam Indoor","Arlo Pro 4","Ring Spotlight Cam","Wyze Cam v3",
      "Xiaomi Mi Home Security","Eufy Indoor Cam 2K","Blink Outdoor","Swann ALERTCAM",
    ],
    badges: ["RTSP","ONVIF","MJPEG","H.264","H.265"],
    details: n => ({
      "Type": "IP Camera (CCTV / Surveillance)",
      "Protocol": n.badge,
      "Resolution": randItem(["1080p Full HD","4 MP","5 MP","8 MP (4K)"]),
      "Port": randItem(["80","8080","554","443"]),
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Web Interface": "HTTP / HTTPS",
      "Note": "Access requires valid credentials",
    })
  },
  computer: {
    label: "Computers / PCs", icon: "computer",
    items: [
      "DESKTOP-K7F2M","LAPTOP-JONAS","WIN-SERVER-01","Ubuntu-NAS","MacBook-Petras",
      "WORKSTATION-HR","fileserver.local","dev-machine","raspberrypi","homeassistant.local",
      "RECEPTION-PC","MANAGER-LAPTOP","IT-WORKSTATION","THIN-CLIENT-01","BUILD-SERVER",
    ],
    badges: ["Windows 11","Windows 10","Linux","macOS","Raspberry Pi OS"],
    details: n => ({
      "Type": "Computer / Workstation / Server",
      "OS": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Open Ports": String(randInt(1, 8)),
      "Hostname (DNS)": n.name + ".local",
      "Last Seen": "Active now",
    })
  },
  router: {
    label: "Routers / Access Points", icon: "router",
    items: [
      "MikroTik hEX S","Ubiquiti UniFi AP AC Pro","ASUS RT-AX88U","TP-Link Archer AX73",
      "FRITZ!Box 7590","Netgear Nighthawk AX12","GL.iNet GL-AXT1800","Cisco RV340",
      "Linksys Velop MX10","Eero Pro 6E","Teltonika RUT956","Ubiquiti EdgeRouter X",
    ],
    badges: ["802.11ax (WiFi 6)","802.11ac (WiFi 5)","802.11n","LTE Failover"],
    details: n => ({
      "Type": "Router / Access Point / Gateway",
      "Standard": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Firmware": `v${randInt(1,5)}.${randInt(0,9)}.${randInt(0,99)}`,
      "Bands": randItem(["2.4 GHz + 5 GHz","2.4 + 5 + 6 GHz (Tri-band)"]),
      "DHCP Server": "Enabled",
    })
  },
  nas: {
    label: "NAS / Storage", icon: "nas",
    items: [
      "Synology DS920+","QNAP TS-453D","Western Digital My Cloud","Asustor AS5304T",
      "Buffalo TeraStation 5410DN","Netgear ReadyNAS 214","Terramaster F4-422",
    ],
    badges: ["SMB/CIFS","NFS","FTP","WebDAV"],
    details: n => ({
      "Type": "Network Attached Storage (NAS)",
      "Protocol": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Capacity": randItem(["4 TB","8 TB","16 TB","32 TB"]),
      "OS": randItem(["DSM 7.2","QTS 5.1","WD OS 5","ADM 4.2"]),
      "Shared Folders": String(randInt(2, 12)),
    })
  },
  printer: {
    label: "Printers / MFP", icon: "printer",
    items: [
      "HP LaserJet Pro M404dn","Canon PIXMA G3420","Epson EcoTank ET-2850",
      "Brother MFC-L2750DW","Samsung Xpress M2070W","Xerox B210","Kyocera ECOSYS M2040dn",
      "Ricoh SP 3710SF","OKI C332dn","Lexmark MB2236adw",
    ],
    badges: ["IPP","LPD","SMB","AirPrint"],
    details: n => ({
      "Type": "Network Printer / MFP",
      "Protocol": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Print Queue": "Empty",
      "Status": "Ready",
      "Paper": randItem(["A4","Letter","A3"]),
    })
  },
  iot: {
    label: "Smart Home / IoT", icon: "iot",
    items: [
      "Philips Hue Bridge","IKEA Tradfri Gateway","Xiaomi Mi Hub","Amazon Echo Dot (4th Gen)",
      "Google Nest Hub","Apple HomePod mini","Shelly 1PM","Sonoff Basic R3",
      "Tuya Smart Plug","TP-Link Kasa EP25","Fibaro Home Center 3","Homey Pro",
      "Ring Video Doorbell","Arlo Video Doorbell","Netatmo Welcome","Eufy Video Doorbell",
      "Roomba i7+","Ecovacs Deebot N8","Dyson 360 Heurist","Nuki Smart Lock 3.0",
    ],
    badges: ["Zigbee","Z-Wave","Wi-Fi","Bluetooth","Matter"],
    details: n => ({
      "Type": "IoT / Smart Home Device",
      "Protocol": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Manufacturer": n.name.split(" ")[0],
      "Status": "Online / Active",
      "Last Update": randItem(["Today","Yesterday","3 days ago"]),
    })
  },
  phone: {
    label: "Phones / Tablets", icon: "phone",
    items: [
      "iPhone 15 Pro","Galaxy S24 Ultra","OnePlus 12","Xiaomi 14 Pro",
      "iPad Pro 12.9","Galaxy Tab S9 Ultra","Huawei MatePad Pro","Pixel 8 Pro",
      "iPhone 14","Samsung A55","Realme 12 Pro","Nothing Phone 2",
    ],
    badges: ["iOS 17","Android 14","iPadOS 17","HarmonyOS"],
    details: n => ({
      "Type": "Mobile Device / Tablet",
      "OS": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac() + " (private)",
      "Connected via": "WiFi",
      "Last Active": "Active now",
    })
  },
  tv: {
    label: "TVs / Media Players", icon: "tv",
    items: [
      "Samsung Smart TV (Living Room)","LG OLED C3 (Bedroom)","Sony Bravia XR (Office)",
      "Apple TV 4K (3rd Gen)","Chromecast with Google TV","Nvidia Shield TV Pro",
      "Amazon Fire TV Cube","Philips 65OLED908","TCL 65C845","Hisense U8K",
    ],
    badges: ["DLNA","AirPlay","Chromecast","HDMI CEC"],
    details: n => ({
      "Type": "Smart TV / Media Player",
      "Protocol": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Display Resolution": randItem(["Full HD 1080p","4K UHD","8K"]),
      "Platform": randItem(["Tizen","WebOS","Android TV","tvOS","Fire OS"]),
    })
  },
  voip: {
    label: "VoIP / IP Phones", icon: "voip",
    items: [
      "Yealink T46U","Grandstream GXP2170","Polycom VVX 411","Cisco SPA504G",
      "Snom D735","Fanvil X4U","AVM FRITZ!Fon C6","Panasonic KX-TGP600",
    ],
    badges: ["SIP","H.323","WebRTC"],
    details: n => ({
      "Type": "VoIP / IP Phone",
      "Protocol": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "SIP Server": "pbx.company.local",
      "Extension": String(randInt(100, 999)),
    })
  },
  switch: {
    label: "Switches / Hubs", icon: "switch",
    items: [
      "Cisco SG350-28","Netgear GS308E","TP-Link TL-SG1024","HP 1920S 24G",
      "Ubiquiti UniFi USW-24","D-Link DGS-1210-28","Mikrotik CRS354",
    ],
    badges: ["Managed","Unmanaged","PoE","Smart"],
    details: n => ({
      "Type": "Network Switch / Hub",
      "Switch Type": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Port Count": randItem(["8","16","24","48"]),
      "PoE Budget": randItem(["N/A","30W","65W","370W","740W"]),
    })
  },
  server: {
    label: "Servers", icon: "server",
    items: [
      "DC-01.domain.local","EXCHANGE-SRV","WEB-SERVER-01","DB-SERVER-PROD",
      "BACKUP-SRV","PROXMOX-01","ESXi-HOST-02","DOCKER-NODE-01",
    ],
    badges: ["Windows Server 2022","Proxmox VE","Ubuntu Server","VMware ESXi","Debian"],
    details: n => ({
      "Type": "Server / Virtualization Host",
      "OS": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Open Ports": String(randInt(3, 20)),
      "Uptime": `${randInt(1, 365)} days`,
      "CPU Cores": randItem(["8","16","32","64"]),
    })
  },
  dvr: {
    label: "DVR / NVR", icon: "dvr",
    items: [
      "Hikvision DS-7608NI-K2","Dahua NVR5216-16P-4KS2E","Uniview NVR304-32E",
      "Reolink RLN36","QNAP VS-4116U","Genetec Security Center","Milestone XProtect",
    ],
    badges: ["ONVIF","Proprietary","NVR","DVR"],
    details: n => ({
      "Type": "Digital / Network Video Recorder",
      "Protocol": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Channels": randItem(["4","8","16","32"]),
      "Storage": randItem(["2 TB","4 TB","8 TB","16 TB"]),
      "Recording Mode": randItem(["24/7","Motion","Schedule"]),
    })
  },
  game: {
    label: "Game Consoles", icon: "game",
    items: [
      "PlayStation 5","Xbox Series X","Nintendo Switch (OLED)","Steam Deck",
      "PlayStation 4 Pro","Xbox One X","Nintendo Switch Lite",
    ],
    badges: ["PSN","Xbox Live","Nintendo Online","Steam"],
    details: n => ({
      "Type": "Game Console",
      "Network": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "NAT Type": randItem(["Type 1 (Open)","Type 2 (Moderate)","Type 3 (Strict)"]),
      "Connected via": randItem(["WiFi","Ethernet"]),
    })
  },
  ups: {
    label: "UPS / Power", icon: "ups",
    items: [
      "APC Smart-UPS 1500VA","Eaton 5PX 1500","CyberPower PR1500ELCD",
      "Vertiv Liebert PSI5","Riello iDialog 1200",
    ],
    badges: ["SNMP","USB","Network Card","Modbus"],
    details: n => ({
      "Type": "Uninterruptible Power Supply (UPS)",
      "Management": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Battery Status": randItem(["100%","87%","94%","76%"]),
      "Load": `${randInt(15, 70)}%`,
      "Runtime": `${randInt(10, 90)} min`,
    })
  },
  industrial: {
    label: "Industrial / PLC", icon: "industrial",
    items: [
      "Siemens S7-1200","Allen-Bradley MicroLogix","Schneider Modicon M340",
      "Beckhoff CX5120","Omron NX1P2","Mitsubishi MELSEC iQ-R",
    ],
    badges: ["Modbus TCP","EtherNet/IP","PROFINET","BACnet"],
    details: n => ({
      "Type": "Industrial Controller / PLC",
      "Protocol": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Firmware": `v${randInt(1,4)}.${randInt(0,9)}`,
      "Status": "Running",
    })
  },
  medical: {
    label: "Medical Devices", icon: "medical",
    items: [
      "Philips IntelliVue MX800","GE Healthcare CARESCAPE","Dräger Evita 800",
      "Spacelabs Medical UNILINK","Nihon Kohden CNS-9701",
    ],
    badges: ["HL7","DICOM","MQTT","REST API"],
    details: n => ({
      "Type": "Medical / Healthcare Device",
      "Protocol": n.badge,
      "IP Address": randIP(),
      "MAC Address": randMac(),
      "Status": "Active",
      "Note": "Restricted access — authorized personnel only",
    })
  },
};

// ── Helpers ───────────────────────────────────────────────────────
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randItem(a) { return a[Math.floor(Math.random() * a.length)]; }
function randMac() {
  return Array.from({length:6}, () => randInt(0,255).toString(16).padStart(2,'0').toUpperCase()).join(':');
}
function randIP() { return `192.168.${randInt(0,3)}.${randInt(2,254)}`; }
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── State ─────────────────────────────────────────────────────────
let allDevices = [];
let filteredDevices = [];
let selectedDevice = null;
let activeFilter = 'all';
let scanning = false;
let searchQuery = '';
let collapsedCats = {};

// ── Device generation ─────────────────────────────────────────────
function generateDevices() {
  const devs = [];
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    const maxTake = catKey === 'wifi' ? randInt(22, 36) : randInt(2, Math.min(cat.items.length, catKey === 'camera' ? 8 : 5));
    const shuffled = [...cat.items].sort(() => Math.random() - .5).slice(0, maxTake);
    shuffled.forEach(name => {
      const badge = randItem(cat.badges);
      const ping = randItem(['ok','ok','ok','warn','off']);
      const ip = catKey === 'wifi' ? null : randIP();
      const signalBars = catKey === 'wifi' ? randInt(1, 4) : null;
      devs.push({
        catKey,
        catLabel: cat.label,
        catIcon: cat.icon,
        name,
        badge,
        ping,
        ip,
        signalBars,
        details: cat.details({ name, badge, ip })
      });
    });
  }
  return devs;
}

// ── Ping HTML ─────────────────────────────────────────────────────
function pingHtml(p) {
  if (p === 'ok')   return `<span class="ping-cell ping-ok">${randInt(1,25)} ms</span>`;
  if (p === 'warn') return `<span class="ping-cell ping-warn">${randInt(80,300)} ms</span>`;
  return `<span class="ping-cell ping-off">Offline</span>`;
}

// ── Signal bars HTML ──────────────────────────────────────────────
function signalBarsHtml(bars) {
  if (bars === null) return '';
  const heights = [5, 9, 13, 17];
  let html = '<div class="sig-bars">';
  for (let i = 0; i < 4; i++) {
    const on = i < bars ? ' on' : '';
    html += `<span style="height:${heights[i]}px" class="${on}"></span>`;
  }
  html += '</div>';
  return html;
}

// ── Icon HTML ─────────────────────────────────────────────────────
function iconHtml(key) {
  return ICONS[key] || ICONS.other;
}

// ── Apply filter + search ─────────────────────────────────────────
function applyFilterAndSearch() {
  let devs = [...allDevices];

  if (activeFilter !== 'all') {
    const catMap = {
      wifi: ['wifi'],
      camera: ['camera'],
      computer: ['computer','server'],
      iot: ['iot','smart'],
      other: ['printer','nas','router','phone','tv','voip','switch','dvr','game','ups','industrial','medical'],
      router: ['router'],
      nas: ['nas'],
      printer: ['printer'],
      phone: ['phone'],
      tv: ['tv'],
      voip: ['voip'],
      switch: ['switch'],
      server: ['server'],
      dvr: ['dvr'],
      game: ['game'],
      ups: ['ups'],
      industrial: ['industrial'],
      medical: ['medical'],
    };
    const allowed = catMap[activeFilter] || [activeFilter];
    devs = devs.filter(d => allowed.includes(d.catKey));
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    devs = devs.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.badge.toLowerCase().includes(q) ||
      d.catLabel.toLowerCase().includes(q) ||
      (d.ip && d.ip.includes(q))
    );
  }

  filteredDevices = devs;

  const header = document.getElementById('devHeader');
  const count  = document.getElementById('devCount');
  const total = filteredDevices.length;
  const suffix = activeFilter !== 'all' || searchQuery ? ' (filtered)' : '';
  header.textContent = total
    ? `${total} device${total !== 1 ? 's' : ''} found${suffix}`
    : `No devices match current filter`;
  count.textContent = `Devices: ${total}`;

  renderList(filteredDevices);
  closeInfo();
}

// ── Render device list ────────────────────────────────────────────
function renderList(devs) {
  const list = document.getElementById('deviceList');

  if (!devs.length) {
    list.innerHTML = '<div class="empty-msg">No devices match the current filter or search.</div>';
    return;
  }

  // Group by category
  const groups = {};
  const groupOrder = [];
  devs.forEach(d => {
    if (!groups[d.catKey]) {
      groups[d.catKey] = { label: d.catLabel, icon: d.catIcon, items: [] };
      groupOrder.push(d.catKey);
    }
    groups[d.catKey].items.push(d);
  });

  let html = '';
  for (const catKey of groupOrder) {
    const g = groups[catKey];
    const collapsed = !!collapsedCats[catKey];
    html += `<div class="cat-header" onclick="toggleCat('${catKey}')">
      <div style="width:18px;height:18px;flex-shrink:0">${iconHtml(g.icon)}</div>
      ${escHtml(g.label)}
      <span class="cat-count">(${g.items.length})</span>
      <span class="cat-toggle">${collapsed ? '[+]' : '[-]'}</span>
    </div>`;
    html += `<div id="cat-group-${catKey}" style="${collapsed ? 'display:none' : ''}">`;
    g.items.forEach((d, i) => {
      const uid = escHtml(d.catKey + '-' + i);
      const isSelected = selectedDevice && selectedDevice === d;
      html += `<div class="device-item${isSelected ? ' selected' : ''}${d.ping === 'off' ? ' offline' : ''}" id="dev-${uid}" onclick="selectDev('${uid}')">
        <div class="dev-icon-wrap">${iconHtml(d.catIcon)}</div>
        <div class="dev-body">
          <div class="dev-name">${escHtml(d.name)}</div>
          <div class="dev-sub">
            <span class="badge">${escHtml(d.badge)}</span>
            ${d.ip ? `<span>${escHtml(d.ip)}</span>` : ''}
          </div>
        </div>
        ${d.signalBars !== null ? signalBarsHtml(d.signalBars) : ''}
        ${pingHtml(d.ping)}
      </div>`;
    });
    html += '</div>';
  }

  list.innerHTML = html;

  // Build UID → device map
  window._devMap = {};
  for (const catKey of groupOrder) {
    groups[catKey].items.forEach((d, i) => {
      window._devMap[d.catKey + '-' + i] = d;
    });
  }
}

// ── Toggle category collapse ──────────────────────────────────────
function toggleCat(key) {
  collapsedCats[key] = !collapsedCats[key];
  const el = document.getElementById('cat-group-' + key);
  if (el) el.style.display = collapsedCats[key] ? 'none' : '';
  // update toggle text
  const headers = document.querySelectorAll('.cat-header');
  headers.forEach(h => {
    if (h.getAttribute('onclick') === `toggleCat('${key}')`) {
      const tog = h.querySelector('.cat-toggle');
      if (tog) tog.textContent = collapsedCats[key] ? '[+]' : '[-]';
    }
  });
}

// ── Select device ─────────────────────────────────────────────────
function selectDev(uid) {
  document.querySelectorAll('.device-item').forEach(e => e.classList.remove('selected'));
  const el = document.getElementById('dev-' + uid);
  if (el) el.classList.add('selected');

  const d = window._devMap ? window._devMap[uid] : null;
  if (!d) return;
  selectedDevice = d;

  // Show info panel
  document.getElementById('infoPanelTitle').textContent = d.name;
  const grid = document.getElementById('infoGrid');
  let html = '';
  for (const [k, v] of Object.entries(d.details)) {
    html += `<div class="ig-label">${escHtml(k)}:</div><div class="ig-val">${escHtml(String(v))}</div>`;
    // pad to pairs (grid is 4-col)
  }
  grid.innerHTML = html;
  document.getElementById('infoPanel').classList.add('visible');
  if (el) el.scrollIntoView({ block: 'nearest' });

  // Update details tab
  updateDetailsTab(d);
}

function closeInfo() {
  document.getElementById('infoPanel').classList.remove('visible');
  document.querySelectorAll('.device-item').forEach(e => e.classList.remove('selected'));
  selectedDevice = null;
}

// ── Details Tab ───────────────────────────────────────────────────
function updateDetailsTab(d) {
  const view = document.getElementById('detailsView');
  if (!d) {
    view.innerHTML = '<div class="empty-msg">Select a device from the list to view details.</div>';
    return;
  }
  let rows = '';
  for (const [k, v] of Object.entries(d.details)) {
    rows += `<tr><td>${escHtml(k)}</td><td>${escHtml(String(v))}</td></tr>`;
  }
  view.innerHTML = `<table>
    <tr><th>Property</th><th>Value</th></tr>
    <tr><td>Device Name</td><td>${escHtml(d.name)}</td></tr>
    <tr><td>Category</td><td>${escHtml(d.catLabel)}</td></tr>
    <tr><td>Status</td><td>${d.ping === 'ok' ? 'Online' : d.ping === 'warn' ? 'High Latency' : 'Offline'}</td></tr>
    ${rows}
  </table>`;
}

// ── Statistics Tab ────────────────────────────────────────────────
function updateStatsTab() {
  const view = document.getElementById('statsView');
  if (!allDevices.length) {
    view.innerHTML = '<div class="empty-msg">Run a scan to view statistics.</div>';
    return;
  }

  // Count by category
  const catCounts = {};
  let online = 0, offline = 0, warn = 0;
  allDevices.forEach(d => {
    catCounts[d.catLabel] = (catCounts[d.catLabel] || 0) + 1;
    if (d.ping === 'ok') online++;
    else if (d.ping === 'warn') warn++;
    else offline++;
  });

  const total = allDevices.length;
  let html = `<div style="margin-bottom:8px">
    <div class="stat-box"><span class="stat-num">${total}</span><span class="stat-lbl">Total Devices</span></div>
    <div class="stat-box"><span class="stat-num" style="color:#1A7A10">${online}</span><span class="stat-lbl">Online</span></div>
    <div class="stat-box"><span class="stat-num" style="color:#856404">${warn}</span><span class="stat-lbl">High Latency</span></div>
    <div class="stat-box"><span class="stat-num" style="color:#8B0000">${offline}</span><span class="stat-lbl">Offline</span></div>
  </div>
  <div style="font-weight:bold;font-size:11px;margin:6px 0 4px;color:#333">Devices by Category</div>`;

  const sorted = Object.entries(catCounts).sort((a,b) => b[1]-a[1]);
  sorted.forEach(([label, count]) => {
    const pct = Math.round((count / total) * 100);
    html += `<div class="stat-bar-row">
      <div class="stat-bar-label" title="${escHtml(label)}">${escHtml(label)}</div>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
      <div class="stat-bar-val">${count}</div>
    </div>`;
  });

  // Security breakdown for WiFi
  const wifiDevs = allDevices.filter(d => d.catKey === 'wifi');
  if (wifiDevs.length) {
    const secCounts = {};
    wifiDevs.forEach(d => { secCounts[d.badge] = (secCounts[d.badge]||0)+1; });
    html += `<div style="font-weight:bold;font-size:11px;margin:8px 0 4px;color:#333">WiFi Security Types</div>`;
    Object.entries(secCounts).sort((a,b)=>b[1]-a[1]).forEach(([sec, cnt]) => {
      const pct = Math.round((cnt / wifiDevs.length) * 100);
      html += `<div class="stat-bar-row">
        <div class="stat-bar-label">${escHtml(sec)}</div>
        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
        <div class="stat-bar-val">${cnt}</div>
      </div>`;
    });
  }

  view.innerHTML = html;
}

// ── Tab switching ─────────────────────────────────────────────────
function switchTab(t) {
  ['list','details','stats'].forEach(id => {
    document.getElementById('tab-' + id).classList.toggle('active', id === t);
    document.getElementById('view-' + id).style.display = id === t ? '' : 'none';
  });
  if (t === 'stats') updateStatsTab();
  if (t === 'details' && selectedDevice) updateDetailsTab(selectedDevice);
}

// ── Filter buttons ────────────────────────────────────────────────
function setFilter(f) {
  activeFilter = f;
  document.querySelectorAll('.tool-btn[id^="filter-"]').forEach(btn => {
    btn.classList.remove('active-filter');
  });
  const btn = document.getElementById('filter-' + f);
  if (btn) btn.classList.add('active-filter');
  applyFilterAndSearch();
}

// ── Search ────────────────────────────────────────────────────────
function applySearch() {
  searchQuery = document.getElementById('searchInput').value.trim();
  applyFilterAndSearch();
}

// ── Export CSV ────────────────────────────────────────────────────
function exportCSV() {
  if (!allDevices.length) return;
  const rows = [['Name','Category','IP Address','Badge/Protocol','Ping Status']];
  allDevices.forEach(d => {
    rows.push([
      d.name,
      d.catLabel,
      d.ip || 'N/A',
      d.badge,
      d.ping === 'ok' ? 'Online' : d.ping === 'warn' ? 'High Latency' : 'Offline'
    ]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'network_scan_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Scan ──────────────────────────────────────────────────────────
function startScan() {
  if (scanning) return;
  scanning = true;
  allDevices = [];
  filteredDevices = [];
  collapsedCats = {};
  closeInfo();

  // UI: scanning state
  document.getElementById('deviceList').innerHTML =
    '<div class="empty-msg scanning-msg">Scanning network... please wait.</div>';
  setStatus('Scanning network for all devices...', 'scanning');
  document.getElementById('ledDot').className = 'led yellow';
  document.getElementById('ledLabel').textContent = 'Scanning...';
  document.getElementById('devHeader').textContent = 'Scanning...';
  document.getElementById('devCount').textContent = 'Devices: ...';
  document.getElementById('progressBar').style.display = '';
  document.getElementById('progressFill').style.width = '30%';
  document.getElementById('stopBtn').style.opacity = '1';
  document.getElementById('stopBtn').style.pointerEvents = 'auto';
  document.getElementById('scanPhase').textContent = 'Initializing scan...';

  // Progressive phase messages
  const phases = [
    [500,  'Discovering WiFi networks...', 20],
    [1000, 'Scanning for IP cameras...', 35],
    [1500, 'Finding computers and servers...', 50],
    [2000, 'Detecting IoT / smart devices...', 65],
    [2400, 'Checking printers and NAS...', 78],
    [2800, 'Scanning remaining devices...', 90],
  ];
  phases.forEach(([t, msg, pct]) => {
    setTimeout(() => {
      if (!scanning) return;
      setStatus(msg, 'scanning');
      document.getElementById('progressFill').style.width = pct + '%';
      document.getElementById('scanPhase').textContent = msg;
    }, t);
  });

  setTimeout(() => {
    if (!scanning) return;
    allDevices = generateDevices();
    activeFilter = 'all';
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.tool-btn[id^="filter-"]').forEach(b => b.classList.remove('active-filter'));
    const allBtn = document.getElementById('filter-all');
    if (allBtn) allBtn.classList.add('active-filter');
    applyFilterAndSearch();
    updateStatsTab();

    const total = allDevices.length;
    setStatus(`Scan complete. Found ${total} devices on the network.`, 'done');
    document.getElementById('ledDot').className = 'led green';
    document.getElementById('ledLabel').textContent = `Active — ${total} devices`;
    document.getElementById('progressBar').style.display = 'none';
    document.getElementById('stopBtn').style.opacity = '.4';
    document.getElementById('stopBtn').style.pointerEvents = 'none';
    document.getElementById('scanPhase').textContent = `Scan completed at ${new Date().toLocaleTimeString()}`;
    scanning = false;
  }, 3200);
}

function stopScan() {
  if (!scanning) return;
  scanning = false;
  setStatus('Scan stopped by user.', 'idle');
  document.getElementById('ledDot').className = 'led red';
  document.getElementById('ledLabel').textContent = 'Scan stopped';
  document.getElementById('progressBar').style.display = 'none';
  document.getElementById('stopBtn').style.opacity = '.4';
  document.getElementById('stopBtn').style.pointerEvents = 'none';
  document.getElementById('scanPhase').textContent = 'Scan was cancelled';
  document.getElementById('deviceList').innerHTML = '<div class="empty-msg">Scan was stopped. Press Scan to try again.</div>';
}

// ── Status message ────────────────────────────────────────────────
function setStatus(msg, state) {
  document.getElementById('statusText').innerHTML = msg;
  const icon = document.getElementById('statusIcon');
  if (state === 'scanning') {
    icon.innerHTML = `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#CC9900" stroke-width="1.5"/><path d="M10 6v4l2.5 2.5" stroke="#CC9900" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  } else if (state === 'done') {
    icon.innerHTML = `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#1A7A10" stroke-width="1.5"/><path d="M6 10l3 3 5-5" stroke="#1A7A10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else {
    icon.innerHTML = `<svg viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="18" height="18" rx="2" stroke="#1452A8" stroke-width="1.5"/><circle cx="10" cy="10" r="4" stroke="#1452A8" stroke-width="1.5"/><path d="M10 6v4l2.5 2.5" stroke="#1452A8" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }
}

// ── Boot ──────────────────────────────────────────────────────────
window.onload = () => {
  // Show list tab by default
  switchTab('list');
  setTimeout(startScan, 400);
};
