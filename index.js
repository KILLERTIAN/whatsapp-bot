const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');

// Load environment variables from .env file
dotenv.config();
const {
    GoogleGenerativeAI } = require("@google/generative-ai");

const systemInstruction = fs.readFileSync('./systemInstructions.txt', 'utf-8');
// console.log(systemInstruction);

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

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction
});

const generationConfig = {
    temperature: 0.4,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 2000,
};



// Function to generate a response from the AI model and reply to the user
async function generate(prompt, message) {
    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                        { text: "hello what is your name?" },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "👋 Hey there!  My name is Hu Tao, but you can call me Hu Tao! 👻  What's your name? 😄  I'm here to help you with the Google Arcade Facilitator Program.  What can I do for you today?" },
                    ],
                },
                {
                    role: "user",
                    parts: [
                        { text: "can you help me with a lab?" },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "Of course! I'm happy to help you with a lab! 🤩  Tell me which lab you're working on and what kind of trouble you're having.  I'll do my best to guide you through it.  Don't worry, we'll get it done together! 💪  \n\nJust tell me the name of the lab or the badge you're trying to complete, and I'll see what I can do!  😊" },
                    ],
                },
                {
                    role: "user",
                    parts: [
                        { text: "I am not getting the progress for arcade base camp" },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "Oh no!  That's a bummer! 😥  Let's see if we can get that Arcade Base Camp progress moving!  💪  \n\nFirst, can you tell me what you've already done in the lab?  Have you completed any of the tasks?  \n\nAlso, have you checked your Google Cloud Skills Boost profile to see if the progress is showing there?  \n\nDon't worry, we'll figure this out together!  👻  Let's get that progress bar moving!  🚀" },
                    ],
                },
                {
                    role: "user",
                    parts: [
                        { text: "can you help me with lab Manage Kubernetes in Google Cloud" },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "Of course! I'm ready to help you conquer that Kubernetes lab! 🦸‍♀️  \n\nTell me, what part of the lab are you stuck on?  Is it setting up the cluster, deploying an app, or something else?  \n\nDon't worry, I've got your back!  Just give me some details, and we'll get you back on track!  💪  \n\nAnd remember, if you need a little extra motivation, you can always check out Durgacharan's YouTube channel for some helpful tips!  😉  \n\nLet's get this lab done! 🚀" },
                    ],
                },
                {
                    role: "user",
                    parts: [
                        { text: "Manage Kubernetes in Google Cloud: Challenge Lab in this lab i cant coplete task 3 pls help" },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "Okay, let's tackle that Task 3 in the Kubernetes lab! 💪  \n\nTell me, what's the specific issue you're facing in Task 3?  Is it:\n\n* *Deploying the application?* \n* *Configuring the Ingress?* \n* *Accessing the application?* \n\nOnce you tell me the problem, I can guide you through the steps!  \n\nDon't worry, we'll get you through this!  👻  Just remember to take a deep breath and focus on the steps.  You've got this!  🚀" },
                    ],
                },
                {
                    role: "user",
                    parts: [
                        { text: "can you explain the point system?\n" },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        {
                            text: "Okay, let's break down the point system so you can become a point-earning pro! 🏆\n\nHere's the gist:\n\n* *Games:*  Each game you complete earns you *1 Arcade Point*.  \n* *Trivia:*  Each trivia badge you complete earns you *1 Arcade Point*.\n* *Skill Badges:*  For every *2 skill badges* you complete, you earn *1 Arcade Point*.\n\n*Bonus Points:*  You also get bonus points for completing milestones!  \n\n* *Milestone 1:*  2 Games + 2 Trivia + 8 Skill Badges = *10 Arcade Points* + *2 Bonus Points*\n* *Milestone 2:*  3 Games + 4 Trivia + 18 Skill Badges = *25 Arcade Points* + *9 Bonus Points*\n* *Milestone 3:*  5 Games + 6 Trivia + 28 Skill Badges = *40 Arcade Points* + *15 Bonus Points*\n* *Ultimate Milestone:*  6 Games + 8 Trivia + 42 Skill Badges = *60 Arcade Points* + *25 Bonus Points*\n\nSo, the more you learn and complete, the more points you earn!  And with more points, you can redeem some awesome Google Cloud goodies!  🎉\n\nDoes that make sense?  Let me know if you have any other questions about the point system!  😊"
                        },
                    ],
                },
                {
                    role: "user",
                    parts: [
                        { text: "when can i calculate my arcade points?" },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        {
                            text: "You can calculate your Arcade Points anytime you want!  🥳  \n\nYou can use the handy points calculator here:  [https://techno-arcade.vercel.app](https://techno-arcade.vercel.app) \n\nJust enter the public profile and it will tell you your total Arcade Points!  \n\nBut remember, the bonus points for milestones are only awarded when you actually reach those milestones!  \n\nSo, keep on learning and completing those badges, and you'll be racking up those points in no time!  🚀"
                        },
                    ],
                },
                {
                    role: "user",
                    parts: [
                        { text: "when will prize counter open?\n" },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "You're eager to claim those prizes, huh?  I get it!  🤩  \n\nThe prize counter will open in **December 2024**.  \n\nSo, keep working hard and earning those Arcade Points!  You'll have a chance to redeem them for some awesome Google Cloud goodies soon!  🎉  \n\nIn the meantime, you can check out the Arcade website for more information about the prize counter and the types of goodies you can get.  \n\nGood luck with your learning journey!  🚀" },
                    ],
                },
                {
                    role: "user",
                    parts: [
                        { text: "Who is your Husband?\n" },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "Om is my dear husband" },
                    ],
                },
            ],
        });
        const result = await chatSession.sendMessage(prompt);
        const text = await result.response.text();
        await message.reply(text);
    } catch (error) {
        console.error('Error generating response:', error);
        console.error('Error details:', error.response ? error.response.data : error.message);
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
const validLanguages = ['english', 'spanish', 'french', 'german', 'italian', 'chinese', 'swedish', 'japanese', 'hindi', 'hinglish'];
const whitelistedLinks = [
    'https://www.cloudskillsboost.google/',
    'https://techno-arcade.vercel.app/',
    'https://www.youtube.com/@durgacharannayak3058/',
    'https://rsvp.withgoogle.com/events/arcade-facilitator/syllabus'
];

const urlRegex = /(?:https?:\/\/|www\.|bit\.ly|t\.co|tinyurl\.com|goo\.gl)[^\s]+/g;

client.on('message', async (message) => {
    const chat = await message.getChat();

    if (!chat || !chat.participants) {
        console.error('Chat or participants data is unavailable.');
        return;
    }

    if (!message.author) {
        console.error('message.author is undefined');
        return;
    }

    const senderNumber = message.author.replace(/[^0-9]/g, '');
    if (allowedNumbers.includes(senderNumber)) {
        return;
    }

    warningCounts[senderNumber] = warningCounts[senderNumber] || 0;
    const messageContent = message.body.toLowerCase();

    // Check if the sender is an admin
    const isAdmin = chat.participants.find(participant => participant.id._serialized === message.author && participant.isAdmin);

    if (isAdmin) {
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

        const foundUrls = message.body.match(urlRegex);
        if (foundUrls) {
            for (const url of foundUrls) {
                const isWhitelisted = whitelistedLinks.includes(url);
                if (!isWhitelisted) {
                    warningCounts[senderNumber]++;
                    await message.delete(true);
                    if (warningCounts[senderNumber] > 3) {
                        try {
                            await chat.removeParticipants([message.author || message.from]);
                            await chat.sendMessage(`${message.author || message.from} has been removed from the group for repeated violations.`);
                            const stickerMedia = MessageMedia.fromFilePath(stickerPath);
                            await chat.sendMessage(stickerMedia, { sendMediaAsSticker: true });
                        } catch (error) {
                            console.error('Failed to remove participant:', error);
                        }
                    } else {
                        await chat.sendMessage(`Unwanted links not allowed here! Warning Count: ${warningCounts[senderNumber]}`);
                        const stickerMedia = MessageMedia.fromFilePath(stickerPath1);
                        await chat.sendMessage(stickerMedia, { sendMediaAsSticker: true });
                    }
                    return;
                }
            }
        }
    }

    // Message reactions based on content
const emojiReactions = {
    'hello': '👋',           // Wave
    'hi': '👋',              // Wave
    'hey': '👋',             // Wave
    'lol': '😂',             // Laughing
    'haha': '😂',            // Laughing
    'hahaha': '😂',          // Laughing
    'sad': '😢',             // Sad face
    'angry': '😡',           // Angry face
    'envy': '😒',            // Envy
    'wow': '😮',             // Surprised
    'love': '❤️',            // Heart
    'like': '❤️',            // Like
    'cool': '😎',            // Cool sunglasses
    'cry': '😭',             // Crying
    'fire': '🔥',            // Fire emoji
    'clap': '👏',            // Clapping
    'mindblown': '🤯',       // Mind blown
    'sleep': '😴',           // Sleeping
    'party': '🎉',           // Party popper
    'think': '🤔',           // Thinking
    'shock': '😱',           // Shocked
    'confused': '😕',        // Confused
    'ok': '👌',              // OK hand
    'thumbsup': '👍',        // Thumbs up
    'facepalm': '🤦',        // Facepalm
    'wink': '😉',            // Wink
    'great': '👍',           // Great
    'nice': '😊',            // Nice
    'yes': '✅',             // Yes
    'no': '❌',              // No
    'sorry': '😞',           // Sorry
    'cheers': '🥂',          // Cheers
    'bored': '😩',           // Bored
    'busy': '🏃',            // Busy
    'welcome': '🌟',         // Welcome
    'miss you': '🥺',        // Miss you
    'bravo': '👏',           // Bravo
    'dance': '💃',           // Dance
    'happy': '😁',           // Happy
    'good morning': '☀️',    // Good morning
    'good night': '🌙',      // Good night
    'thank you': '🙏',       // Thank you
    'please': '🙏',          // Please
    'oops': '😬',            // Oops
    'congratulations': '🎊', // Congratulations
    'well done': '👏',       // Well done
    'love you': '❤️',       // Love you
    'silly': '😜',           // Silly
    'funny': '😂',           // Funny
    'wow': '😲',             // Wow
    'yummy': '🤤',           // Yummy
    'peace': '✌️',           // Peace
    'good luck': '🍀',       // Good luck
    'money': '💰',           // Money
    'help': '🆘',            // Help
    'gamer': '🎮',           // Gamer
    'arcade': '🕹️',         // Arcade
    'play': '🎮',            // Play
    'score': '🏆',           // Score
    'level up': '⬆️',       // Level up
    'bonus': '🎁',           // Bonus
    'challenge': '🎮',       // Challenge
    'victory': '🏆',         // Victory
    'game on': '🕹️',        // Game on
    'winner': '🏅',          // Winner
    'let’s play': '🎮',      // Let’s play
    'fun time': '🎉',        // Fun time
    'awesome': '🌟',         // Awesome
    'let’s go': '🏃‍♂️',      // Let's go
    'hurry up': '🏃‍♂️',      // Hurry up
    'score high': '📈',      // Score high
    'lucky': '🍀',           // Lucky
    'out of order': '🚫',    // Out of order
    'game over': '💀',       // Game over
    'try again': '🔄',       // Try again
    'cheat': '🧐',           // Cheat
    'next level': '🚀',      // Next level
    'restart': '🔄',         // Restart
    'glitch': '⚠️',          // Glitch
    'new game': '🆕',        // New game
    'legend': '🌟',          // Legend
    'epic win': '🏆',        // Epic win
    'squad up': '👯‍♂️',      // Squad up
    'double trouble': '🔄',  // Double trouble
    'multiplayer': '🎮',     // Multiplayer
    'teamwork': '🤝',        // Teamwork
    'challenge accepted': '💪', // Challenge accepted
    'let’s team': '🤝',      // Let’s team
    'co-op': '👯‍♂️',        // Co-op
    'good game': '👍',       // Good game
    'fun': '🎉',             // Fun
    'nostalgic': '😌',       // Nostalgic
    'game night': '🌜',      // Game night
    'family fun': '👨‍👩‍👧‍👦', // Family fun
    'skill': '🏆',           // Skill
    'adventure': '🌍',       // Adventure
    'succeed': '🎉',         // Succeed
    'beast mode': '🐾',      // Beast mode
    'training': '🏋️‍♂️',     // Training
    'challenge mode': '💪',  // Challenge mode
    'let’s win': '🏆',       // Let's win
    'quick match': '⚡',      // Quick match
    'boss battle': '👹',     // Boss battle
    'gaming life': '🎮',     // Gaming life
    'perfect': '👌',         // Perfect
    'lets go crazy': '🤪',  // Let's go crazy
    'join us': '🤝',         // Join us
};

for (const [triggerWord, emoji] of Object.entries(emojiReactions)) {
    if (messageContent.includes(triggerWord)) {
        await message.react(emoji); // React with the corresponding emoji
        break; // Only react to the first matching keyword
    }
}


    // Handling .tao, .tagall, and translation commands in message replies
    if (message.body.toLowerCase().includes('.tao') || message.body.toLowerCase().includes('.tagall') || message.body.toLowerCase().includes('translate')) {
        if (chat.isGroup) {
            const messageBodyLower = message.body.toLowerCase();

            // Handle the .tao command
            if (messageBodyLower.includes('.tao')) {
                const query = message.body.trim() || 'Hi';
                generate(query, message);
            }

            // Handle replies to a .tao message or bot's messages
            const replyMessage = await message.getQuotedMessage();
            if (replyMessage) {
                const replyContentLower = replyMessage.body.toLowerCase();

                // If the quoted message includes '.tao', respond accordingly
                if (replyContentLower.includes('.tao')) {
                    const query = replyMessage.body.trim() || 'Hi';
                    generate(query, message); // Reply to the quoted tao message
                }

                // Check if the quoted message was sent by the bot itself
                if (replyMessage.fromMe) {
                    const query = message.body.trim() || 'Hi'; // Use the new message content for generating response
                    generate(query, message); // Respond to the reply made to the bot's message
                }
            }

            // Handle the .tagall command
            if (messageBodyLower.includes('.tagall')) {
                const groupSize = chat.participants.length;
                const batchSize = 500;
                const delay = 1000;
                for (let i = 0; i < groupSize; i += batchSize) {
                    const batchMentions = chat.participants.slice(i, i + batchSize).map((participant) => participant.id._serialized);
                    await chat.sendMessage('@everyone', { mentions: batchMentions });
                    if (i + batchSize < groupSize) {
                        await new Promise((resolve) => setTimeout(resolve, delay));
                    }
                }
            }

            // Handle the translation command
            if (messageBodyLower.includes('translate')) {
                let textToTranslate = '';
                const replyMessage = await message.getQuotedMessage();
                if (replyMessage) {
                    textToTranslate = replyMessage.body;
                } else {
                    const [_, targetLanguage] = messageBodyLower.split('translate to');
                    textToTranslate = message.body.replace(`translate to ${targetLanguage}`, '').trim();
                }
                let targetLanguage = 'english';
                if (messageBodyLower.includes('translate to')) {
                    targetLanguage = messageBodyLower.split('translate to')[1].trim().toLowerCase();
                }
                if (validLanguages.includes(targetLanguage)) {
                    await generate(textToTranslate, message, targetLanguage);
                } else {
                    await message.reply('Sorry, the target language is not supported.');
                }
            }
        }
    }
});


client.initialize();
app.post('/api/send-message', async (req, res) => {
    const { number, message } = req.body;

    try {
        await client.sendMessage(`${number}`, message);
        res.status(200).json({ status: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ status: 'Failed to send message', error });
    }
});

const SERVICE_URL = 'https://whatsapp-bot-3ab8.onrender.com';
const pingService = () => {
    axios.get(SERVICE_URL)
        .then(response => console.log('Service pinged successfully:', response.status))
        .catch(response => console.log('Service pinged successfully'));
};

// Function to set a random interval between 5 and 10 minutes
const setRandomInterval = (func, min, max) => {
    const randomDelay = Math.floor(Math.random() * (max - min + 1) + min);
    setTimeout(() => {
        func();
        setRandomInterval(func, min, max);
    }, randomDelay);
};

setRandomInterval(pingService, 1 * 60 * 1000, 5 * 60 * 1000);
// Constants for the ping intervals and restricted time period
// const MIN_INTERVAL = 3 * 60 * 1000; // 3 minutes in milliseconds
// const MAX_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
// const RESTRICTED_START_HOUR = 1;
// const RESTRICTED_START_MINUTE = 30;
// const RESTRICTED_END_HOUR = 8;
// const RESTRICTED_END_MINUTE = 0;

// // Function to check if the current time is within the restricted period
// const isWithinRestrictedPeriod = () => {
//     const now = new Date();
//     const istOffset = 5.5 * 60 * 60 * 1000; // IST offset from UTC in milliseconds
//     const istNow = new Date(now.getTime() + istOffset);

//     const start = new Date(istNow);
//     start.setHours(RESTRICTED_START_HOUR, RESTRICTED_START_MINUTE, 0, 0);

//     const end = new Date(istNow);
//     end.setHours(RESTRICTED_END_HOUR, RESTRICTED_END_MINUTE, 0, 0);

//     return istNow >= start && istNow <= end;
// };

// // Function to set a random interval between min and max, considering the restricted period
// const setRandomInterval = (func, min, max) => {
//     if (isWithinRestrictedPeriod()) {
//         // Skip execution during the restricted period and wait until the end of the period
//         const now = new Date();
//         const istOffset = 5.5 * 60 * 60 * 1000; // IST offset from UTC in milliseconds
//         const istNow = new Date(now.getTime() + istOffset);

//         const nextAllowedTime = new Date(istNow);
//         nextAllowedTime.setHours(RESTRICTED_END_HOUR, RESTRICTED_END_MINUTE, 0, 0);

//         const delay = nextAllowedTime - istNow;

//         setTimeout(() => {
//             setRandomInterval(func, min, max); // Recalculate the interval after the restricted period
//         }, delay);
//     } else {
//         // Execute at a random interval between the given range
//         const delay = Math.floor(Math.random() * (max - min + 1)) + min;

//         setTimeout(() => {
//             func();
//             setRandomInterval(func, min, max); // Recursively set the next random interval
//         }, delay);
//     }
// };

// // Start pinging the service at random intervals between 3 and 8 minutes, with a restricted period from 1:30 AM to 8:00 AM IST
// setRandomInterval(pingService, MIN_INTERVAL, MAX_INTERVAL);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
