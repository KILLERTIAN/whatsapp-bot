const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load environment variables from .env file
dotenv.config();

// Validate API Key early
if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not defined in the .env file.');
    process.exit(1);
}

// Import Google Generative AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = fs.readFileSync('./systemInstructions.txt', 'utf-8');

// Create an instance of Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Initialize WhatsApp Client with LocalAuth
const client = new Client({
    authStrategy: new LocalAuth(),
});

// Resolve sticker paths for cross-platform compatibility
const stickerPath = './/assets/Hu Tao 1.webp';
const stickerPath1 = './/assets/Hu Tao 7.webp';
const stickerPath2 = './/assets/Hu Tao 1-1.webp';
const stickerPath3 = './/assets/Hu Tao 2-1.webp';

// AI Model Configuration
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemInstruction,
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
};

// Function to generate a response from the AI model and reply to the user
async function generateResponse(prompt, message) {
    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [{ text: "hello what is your name?" }],
                },
                {
                    role: "model",
                    parts: [{ text: "👋 Hey there! My name is Hu Tao, but you can call me Hu Tao! 👻 What's your name? 😄 I'm here to help you with the Google Arcade Facilitator Program. What can I do for you today?" }],
                },
                {
                    role: "user",
                    parts: [{ text: "can you help me with a lab?" }],
                },
                {
                    role: "model",
                    parts: [{ text: "Of course! I'm happy to help you with a lab! 🤩 Tell me which lab you're working on and what kind of trouble you're having. I'll do my best to guide you through it. Don't worry, we'll get it done together! 💪\n\nJust tell me the name of the lab or the badge you're trying to complete, and I'll see what I can do! 😊" }],
                },
                {
                    role: "user",
                    parts: [{ text: "I am not getting the progress for arcade base camp" }],
                },
                {
                    role: "model",
                    parts: [{ text: "Oh no! That's a bummer! 😥 Let's see if we can get that Arcade Base Camp progress moving! 💪\n\nFirst, can you tell me what you've already done in the lab? Have you completed any of the tasks?\n\nAlso, have you checked your Google Cloud Skills Boost profile to see if the progress is showing there?\n\nDon't worry, we'll figure this out together! 👻 Let's get that progress bar moving! 🚀" }],
                },
                {
                    role: "user",
                    parts: [{ text: "can you help me with lab Manage Kubernetes in Google Cloud" }],
                },
                {
                    role: "model",
                    parts: [{ text: "Of course! I'm ready to help you conquer that Kubernetes lab! 🦸‍♀️\n\nTell me, what part of the lab are you stuck on? Is it setting up the cluster, deploying an app, or something else?\n\nDon't worry, I've got your back! Just give me some details, and we'll get you back on track! 💪\n\nAnd remember, if you need a little extra motivation, you can always check out Durgacharan's YouTube channel for some helpful tips! 😉\n\nLet's get this lab done! 🚀" }],
                },
                {
                    role: "user",
                    parts: [{ text: "Manage Kubernetes in Google Cloud: Challenge Lab in this lab i cant complete task 3 pls help" }],
                },
                {
                    role: "model",
                    parts: [{ text: "Okay, let's tackle that Task 3 in the Kubernetes lab! 💪\n\nTell me, what's the specific issue you're facing in Task 3? Is it:\n\n* *Deploying the application?*\n* *Configuring the Ingress?*\n* *Accessing the application?*\n\nOnce you tell me the problem, I can guide you through the steps!\n\nDon't worry, we'll get you through this! 👻 Just remember to take a deep breath and focus on the steps. You've got this! 🚀" }],
                },
                {
                    role: "user",
                    parts: [{ text: "can you explain the point system?" }],
                },
                {
                    role: "model",
                    parts: [{ text: "Okay, let's break down the point system so you can become a point-earning pro! 🏆\n\nHere's the gist:\n\n* *Games:* Each game you complete earns you *1 Arcade Point*.\n* *Trivia:* Each trivia badge you complete earns you *1 Arcade Point*.\n* *Skill Badges:* For every *2 skill badges* you complete, you earn *1 Arcade Point*.\n\n*Bonus Points:* You also get bonus points for completing milestones!\n\n* *Milestone 1:* 2 Games + 2 Trivia + 8 Skill Badges = *10 Arcade Points* + *2 Bonus Points*\n* *Milestone 2:* 3 Games + 4 Trivia + 18 Skill Badges = *25 Arcade Points* + *9 Bonus Points*\n* *Milestone 3:* 5 Games + 6 Trivia + 28 Skill Badges = *40 Arcade Points* + *15 Bonus Points*\n* *Ultimate Milestone:* 6 Games + 8 Trivia + 42 Skill Badges = *60 Arcade Points* + *25 Bonus Points*\n\nSo, the more you learn and complete, the more points you earn! And with more points, you can redeem some awesome Google Cloud goodies! 🎉\n\nDoes that make sense? Let me know if you have any other questions about the point system! 😊" }],
                },
                {
                    role: "user",
                    parts: [{ text: "when can i calculate my arcade points?" }],
                },
                {
                    role: "model",
                    parts: [{ text: "You can calculate your Arcade Points anytime you want! 🥳\n\nYou can use the handy points calculator here: [https://techno-arcade.vercel.app](https://techno-arcade.vercel.app)\n\nJust enter the public profile and it will tell you your total Arcade Points!\n\nBut remember, the bonus points for milestones are only awarded when you actually reach those milestones!\n\nSo, keep on learning and completing those badges, and you'll be racking up those points in no time! 🚀" }],
                },
                {
                    role: "user",
                    parts: [{ text: "when will prize counter open?" }],
                },
                {
                    role: "model",
                    parts: [{ text: "You're eager to claim those prizes, huh? I get it! 🤩\n\nThe prize counter will open in **December 2024**.\n\nSo, keep working hard and earning those Arcade Points! You'll have a chance to redeem them for some awesome Google Cloud goodies soon! 🎉\n\nIn the meantime, you can check out the Arcade website for more information about the prize counter and the types of goodies you can get.\n\nGood luck with your learning journey! 🚀" }],
                },
                {
                    role: "user",
                    parts: [{ text: "what is the last days of form filling ?" }],
                },
                {
                    role: "model",
                    parts: [{ text: "The last day to fill out the form is April 10, 2025! ⏳ But keep in mind, dear learner, that if the seats fill up before then, the doors might close early. So, don't wait until the last moment! 🏃‍♀️💨" }],
                },
            ],
        });
        const result = await chatSession.sendMessage(prompt);
        const text = await result.response.text();
        await message.reply(text);
    } catch (error) {
        console.error('Error generating response:', error.message || error);
        await message.reply('Sorry, I encountered an error while processing your request.');
    }
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

// Allowed (immune) numbers
const allowedNumbers = ['9717488830', '8169810219'];
const warningCounts = {};
// Handling incoming messages
client.on('message', async (message) => {
    const chat = await message.getChat();

    // Get sender number without formatting
    if (!message.author) {
        console.error('message.author is undefined');
        return;
    }

    // Extract the sender's phone number from the message.author
    const senderNumber = message.author.replace(/[^0-9]/g, '');

    // Skip processing for immune numbers
    if (allowedNumbers.includes(senderNumber)) {
        return;
    }

    // Increment warning count for sender if necessary
    warningCounts[senderNumber] = warningCounts[senderNumber] || 0;
    // Remove or kick the user
    const messageContent = message.body.toLowerCase();

    // Check if the sender is an admin
    const isAdmin = chat.participants.find(participant => participant.id._serialized === message.author && participant.isAdmin);


    // Whitelist certain links while deleting others
    const whitelistedLinks = [
        'https://www.cloudskillsboost.google/',
        'https://techno-arcade.vercel.app/',
        'https://www.youtube.com/@durgacharannayak3058/',
        'https://rsvp.withgoogle.com/events/arcade-facilitator/syllabus'
    ];

    // Updated URL regex to match various types of URLs, including those starting with "www." and shortened URLs
    const urlRegex = /(?:https?:\/\/|www\.|bit\.ly|t\.co|tinyurl\.com|goo\.gl)[^\s]+/g;
    const foundUrls = message.body.match(urlRegex);


    // Deleting messages containing specific words with a warning
    const bannedWords = ['Quicklab', 'Quick lab', 'quicklab', 'btecky', 'Btecky', 'QuickGCP', 'quickgcp', 'quick gcp', 'quick lab'];

    if (isAdmin) {
        // Handle tag and kick command
        if (messageContent.includes('remove') || messageContent.includes('kick')) {
            const mentionedUser = message.mentionedIds[0];
            if (mentionedUser) {

                try {
                    await chat.removeParticipants([mentionedUser]);
                    await chat.sendMessage(`@${mentionedUser} has been removed from the group.`);

                } catch (error) {
                    console.error('Failed to remove participant:', error);
                    await chat.sendMessage('Failed to remove the user.');
                }
            } else {
                await chat.sendMessage('No user mentioned.');
            }
        }
    } else {
        if (messageContent.includes('remove') || messageContent.includes('kick')) {
            await chat.sendMessage('You are not authorized to perform this action.');

        }

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

    }


    // Handling .tao and .tagall commands if they appear anywhere in the message body
    if (message.body.includes('.tao') || message.body.includes('.tagall')) {
        const chat = await message.getChat();

        if (chat.isGroup) {
            const senderId = message.author;
            const senderParticipant = chat.participants.find(participant => participant.id._serialized === senderId);

            if (message.body.includes('.tao')) {
                const query = message.body.slice(message.body.indexOf('.tao') + 4).trim() || 'Hi';
                generateResponse(query, message);
            } else if (message.body.includes('.tagall')) {
                if (senderParticipant && senderParticipant.isAdmin) {
                    const groupSize = chat.participants.length;
                    const batchSize = 500;
                    const delay = 1000;
                    for (let i = 0; i < groupSize; i += batchSize) {
                        const batchMentions = chat.participants.slice(i, i + batchSize).map(participant => participant.id._serialized);
                        await chat.sendMessage('@everyone', { mentions: batchMentions });

                        // Adding delay between batches
                        if (i + batchSize < groupSize) {
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }
                } else {
                    await chat.sendMessage('The `.tagall` command can only be used by group admins.');
                }
            }
        }
    }

    if (messageContent === '!help') {
        const helpMessage = `
*Available Commands:*
    
\`!help\` — *Display this help message.*
\`.tao [query]\` — *Interact with the bot using the specified query.*
\`.tagall\` — *(Admin only)* *Mention all participants in the group.*
\`remove/kick [@user]\` — *(Admin only)* *Remove the mentioned user from the group.*
        `;
        await chat.sendMessage(helpMessage);
        return;
    }
    


});

// Start the WhatsApp client
client.initialize();

// app.post('/api/send-message', async (req, res) => {
//     const { number, message } = req.body;

//     try {
//         await client.sendMessage(`${number}`, message);
//         res.status(200).json({ status: 'Message sent successfully!' });
//     } catch (error) {
//         console.error('Error sending message:', error);
//         res.status(500).json({ status: 'Failed to send message', error });
//     }
// });

// const SERVICE_URL = 'https://whatsapp-bot-3ab8.onrender.com';

// const pingService = () => {
//     axios.get(SERVICE_URL)
//         .then(response => console.log('Service pinged successfully:', response.status))
//         .catch(error => console.error('Error pinging service:', error));
// };

// const setRandomInterval = (func, min, max) => {
//     const randomDelay = Math.floor(Math.random() * (max - min + 1)) + min;
//     setTimeout(() => {
//         func();
//         setRandomInterval(func, min, max);
//     }, randomDelay);
// };

// const MIN_INTERVAL = 3 * 60 * 1000; // 3 minutes in milliseconds
// const MAX_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// setRandomInterval(pingService, MIN_INTERVAL, MAX_INTERVAL);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
