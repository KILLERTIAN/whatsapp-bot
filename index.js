// Importing All Necessary Packages
const express = require('express');
const bodyParser = require('body-parser');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Create an instance of Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Initialize WhatsApp Client with LocalAuth
const client = new Client({
    authStrategy: new LocalAuth(),
});

const stickerPath = './/assets/Hu Tao 1.webp';
const stickerPath1 = './/assets/Hu Tao 7.webp';
const stickerPath2 = './/assets/Hu Tao 1-1.webp';
const stickerPath3 = './/assets/Hu Tao 2-1.webp';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI('AIzaSyBaOMYBvlQ5OLL9lFTdF7ywUbWNrzQHzV8');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Allowed (immune) numbers
const allowedNumbers = ['9717488830', '8169810219'];
const warningCounts = {};

// Function to generate a response from the AI model and reply to the user
async function generate(prompt, message) {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    await message.reply(text); // Reply to the user
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

// Handling incoming messages
client.on('message', async (message) => {
    const chat = await message.getChat();

    // Get sender number without formatting
    const senderNumber = message.author.replace(/[^0-9]/g, '');

    // Skip processing for immune numbers
    if (allowedNumbers.includes(senderNumber)) {
        return;
    }

    // Increment warning count for sender if necessary
    warningCounts[senderNumber] = warningCounts[senderNumber] || 0;

    // Whitelist certain links while deleting others
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
                warningCounts[senderNumber]++;
                await message.delete(true);
                if (warningCounts[senderNumber] > 3) {
                    if (chat.isGroup) {
                        try {
                            // Attempt to remove the participant from the group
                            await chat.removeParticipants([message.author || message.from]);
                            await chat.sendMessage(`${message.author || message.from} has been removed from the group for repeated violations.`);
                            // Send sticker after removing
                            const stickerMedia = MessageMedia.fromFilePath(stickerPath);
                            await chat.sendMessage(stickerMedia, { sendMediaAsSticker: true });
                        } catch (error) {
                            console.error('Failed to remove participant:', error);
                        }
                    }
                } else {
                    await chat.sendMessage(`Unwanted links not allowed here !!! Warning Count: ${warningCounts[senderNumber]}`);
                    // Send sticker as a warning
                    const stickerMedia = MessageMedia.fromFilePath(stickerPath1);
                    await chat.sendMessage(stickerMedia, { sendMediaAsSticker: true });
                }
                return;
            }
        }
    }

    // Deleting messages containing specific words with a warning
    const bannedWords = ['Quicklab', 'Quick lab', 'quicklab', 'btecky', 'Btecky', 'QuickGCP', 'quickgcp', 'quick gcp', 'quick lab'];
    if (bannedWords.some((word) => message.body.includes(word))) {
        warningCounts[senderNumber]++;
        await message.delete(true);

        if (warningCounts[senderNumber] > 3) {
            if (chat.isGroup) {
                try {
                    // Attempt to remove the participant from the group
                    await chat.removeParticipants([message.author || message.from]);
                    await chat.sendMessage(`${message.author || message.from} has been removed from the group for repeated violations.`);
                    
                    const stickerMedia = MessageMedia.fromFilePath(stickerPath3);
                    await chat.sendMessage(stickerMedia, { sendMediaAsSticker: true });
                } catch (error) {
                    console.error('Failed to remove participant:', error);
                }
            }
        } else {

            await chat.sendMessage(`⚠️ Warning !!! Do not use banned words. Warning Count: ${warningCounts[senderNumber]}`);
            // Send sticker as a warning
            const stickerMedia = MessageMedia.fromFilePath(stickerPath2);
            await chat.sendMessage(stickerMedia, { sendMediaAsSticker: true });
        }

        return;
    }

    // 'Tag all' functionality to mention all group members
    if (message.body === '.tagall' && chat.isGroup) {
        const mentions = chat.participants.map((participant) => participant.id._serialized);
        await chat.sendMessage(`@everyone`, { mentions });
    }

    // AI response feature
    if (message.body.startsWith('.tao')) {
        const query = message.body.slice(4).trim() || 'Hi';
        generate(query, message);
    }
});

// Start the WhatsApp client
client.initialize();

// Define a simple API endpoint (optional, for additional functionality)
app.post('/api/send-message', async (req, res) => {
    const { number, message } = req.body;

    try {
        // Send a message using the WhatsApp bot
        await client.sendMessage(`${number}@c.us`, message);
        res.status(200).json({ status: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ status: 'Failed to send message', error });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
