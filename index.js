// Importing All Necessary Packages
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const allowedNumbers = ['9717488830', '816 981 0219']; // Immune numbers
const warningCounts = {};

// Creating instances
const genAI = new GoogleGenerativeAI('AIzaSyBaOMYBvlQ5OLL9lFTdF7ywUbWNrzQHzV8');
const client = new Client({
    authStrategy: new LocalAuth(),
});

// Initializing GenAI model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Function to generate response from AI model and reply to user
async function generate(prompt, message) {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    await message.reply(text); // Reply to user
}

// Event listeners for client status
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('Client is authenticated!');
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('disconnected', () => {
    console.log('Client is disconnected!');
});

client.on('auth_failure', () => {
    console.log('Client authentication failed!');
});

client.on('message', async (message) => {
    const chat = await message.getChat();

    // Skip processing for immune numbers
    if (allowedNumbers.includes(message.from)) {
        return;
    } else {
        // Whitelisting certain links while deleting others
        const whitelistedLinks = [
            'https://www.cloudskillsboost.google/',
            'https://techno-arcade.vercel.app/',
            'https://www.youtube.com/@durgacharannayak3058/',
            'https://rsvp.withgoogle.com/events/arcade-facilitator/syllabus'
        ];

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundUrls = message.body.match(urlRegex);

        if (foundUrls) {
            for (const url of foundUrls) {
                const isWhitelisted = whitelistedLinks.some((link) => url === link);

                if (!isWhitelisted) {
                    await message.delete(true);
                    await chat.sendMessage(`Unwantend links not allowed here !!!`);
                    return;
                }
            }
        }

        // Deleting messages containing specific words with a warning
        const bannedWords = ['Quicklab', 'Quick lab', 'quicklab', 'btecky', 'Btecky', 'QuickGCP', 'quickgcp', 'quick gcp', 'quick lab'];
        if (bannedWords.some((word) => message.body.includes(word))) {
            warningCounts[message.from] = (warningCounts[message.from] || 0) + 1;

            if (warningCounts[message.from] > 3) {
                await chat.removeParticipants([message.from]);
            } else {
                await chat.sendMessage('⚠️Warning !!! Do not use banned words');
            }

            await message.delete(true);
            return;
        }

        // 'Tag all' functionality to mention all group members
        if (message.body === '.tagall' && chat.isGroup) {
            const mentions = chat.participants.map((participant) => participant.id._serialized);
            await chat.sendMessage(`@everyone`, { mentions });
        }

       
    }

    // AI response feature
    if (message.body.startsWith('.tao')) {
        const query = message.body.slice(4).trim() || 'Hi';
        generate(query, message);
    }
});

client.initialize();
