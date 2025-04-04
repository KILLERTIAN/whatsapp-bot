const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const cheerio = require('cheerio');

// Load environment variables
dotenv.config();

// Validate API Key
if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not defined in the .env file.');
    process.exit(1);
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuration
const YUGALI_PROFILE = 'https://www.googlecloudcommunity.com/gc/user/viewprofilepage/user-id/279786';
const CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
const POST_HISTORY_FILE = 'yugali_posts.json';

// System instruction file
const systemInstruction = require('fs').readFileSync('./systemInstructions.txt', 'utf-8');

// Chat History File (read-only)
const HISTORY_FILE = 'chat_history.json';

// Create an Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Initialize WhatsApp Client with LocalAuth
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Define paths for stickers
const stickerPaths = {
    warning1: path.join(__dirname, 'assets', 'Hu Tao 1.webp'),
    warning2: path.join(__dirname, 'assets', 'Hu Tao 7.webp'),
    remove1: path.join(__dirname, 'assets', 'Hu Tao 1-1.webp'),
    remove2: path.join(__dirname, 'assets', 'Hu Tao 2-1.webp'),
    welcome: path.join(__dirname, 'assets', 'Hu Tao 2.png')
};

// AI Model Configuration
const textModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemInstruction,
});

const visionModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
};

// Improved file handling functions
async function ensureFileExists(filePath, defaultContent = '[]') {
    try {
        await fs.access(filePath);
    } catch {
        await fs.writeFile(filePath, defaultContent);
    }
}

// Load Chat History from File (read-only)
async function loadChatHistory() {
    try {
        const data = await fs.readFile(HISTORY_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading chat history:', error);
        return [];
    }
}

// Function to analyze image with specific prompt
async function analyzeImage(imageBuffer, prompt, message) {
    try {
        const base64Image = imageBuffer.toString('base64');
        const result = await visionModel.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
        ]);
        let text = (await result.response).text();
        text = formatForWhatsApp(text);
        return text;
    } catch (error) {
        console.error('Image analysis error:', error);
        return "_Sorry, I couldn't analyze the image._";
    }
}

// Format text for WhatsApp (clean markdown)
function formatForWhatsApp(text) {
    // Replace multiple asterisks with single ones for bold
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '*$1*');
    text = text.replace(/\*\*(.*?)\*\*/g, '*$1*');

    // Replace underscores with single ones for italics
    text = text.replace(/\_\_(.*?)\_\_/g, '_$1_');

    // Handle bold-italic combinations
    text = text.replace(/\*\*\_(\*?)(.*?)(\*?)\_\*\*/g, '_*$2*_');
    text = text.replace(/\_\*\*(\_?)(.*?)(\_?)\*\*\_/g, '*_$2_*');

    // Fix code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`([^`]+)`/g, '$1');

    // Fix links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2');

    // Remove excessive line breaks
    text = text.replace(/\n{3,}/g, '\n\n');

    // Clean up any remaining markdown artifacts
    text = text.replace(/\\\*/g, '*');
    text = text.replace(/\\_/g, '_');

    return text;
}

// Generate response function
async function generateResponse(prompt, message, isImage = false, imageBuffer = null) {
    try {
        const history = await loadChatHistory();

        if (isImage && imageBuffer) {
            const analysisResult = await analyzeImage(imageBuffer, prompt, message);
            await message.reply(analysisResult);
            return;
        }

        const chatSession = textModel.startChat({
            generationConfig,
            history: history,
        });

        const result = await chatSession.sendMessage(prompt);
        let text = (await result.response).text();
        text = formatForWhatsApp(text);
        await message.reply(text);
    } catch (error) {
        console.error('Error generating response:', error);
        await message.reply('_Sorry, I encountered an error while processing your request._');
    }
}

// Yugali Post Monitoring Functions
async function fetchLatestPost() {
    try {
        const response = await axios.get(YUGALI_PROFILE, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);

        const posts = [];
        $('.lia-message-body-content').each((i, el) => {
            const content = $(el).text().trim();
            // const date = $(el).closest('.lia-message').find('.local-date').text().trim();
            posts.push({ content });
        });

        return posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error('Error fetching Yugali posts:', error);
        return null;
    }
}

async function processPostContent(content) {
    try {
        const chatSession = textModel.startChat({ generationConfig });
        const result = await chatSession.sendMessage(`
            Transform this Cloud Community post into a WhatsApp-friendly update:
            - Keep under 500 characters
            - Add relevant emojis
            - Format with markdown
            - Include key points only
            - Make it engaging and fun
            
            ${content}
        `);
        return formatForWhatsApp((await result.response).text());
    } catch (error) {
        console.error('Error processing post:', error);
        return null;
    }
}

async function checkForUpdates(chat, isManualCheck = false) {
    try {
        await ensureFileExists(POST_HISTORY_FILE, '[]');

        const latestPost = await fetchLatestPost();

        if (!latestPost) {
            if (isManualCheck) {
                await chat.sendMessage('_Could not fetch latest posts_');
            }
            return;
        }

        let previousPosts = [];
        try {
            const fileContent = await fs.readFile(POST_HISTORY_FILE, 'utf8');
            previousPosts = JSON.parse(fileContent);
        } catch (error) {
            console.error('Error reading post history:', error);
        }

        const postExists = previousPosts.some(post =>
            post.identifier === latestPost.identifier
        );

        if (!postExists) {
            const processedUpdate = await processPostContent(latestPost.content);
            if (processedUpdate) {
                latestPost.lastChecked = new Date().toLocaleString();

                await chat.sendMessage(
                    `*New Community Update* 📢\n\n${processedUpdate}`
                );

                const updatedPosts = [latestPost, ...previousPosts].slice(0, 50);
                await fs.writeFile(POST_HISTORY_FILE, JSON.stringify(updatedPosts, null, 2));
            } else if (isManualCheck) {
                await chat.sendMessage('_Found new post but couldn\'t process it_');
            }
        } else if (isManualCheck) {
            const processedLastPost = await processPostContent(latestPost.content);
            await chat.sendMessage(
                `*Last Community Update* 📌\n\n${processedLastPost}\n\n` +
                `_No new updates available_`
            );
        }
    } catch (error) {
        console.error('Error in checkForUpdates:', error);
        if (isManualCheck) {
            await chat.sendMessage('_Error checking updates_');
        }
    }
}

// Event listeners for client status
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('Client is authenticated!');
});

client.on('ready', async () => {
    console.log('Client is ready!');

    // Initialize all required files
    await Promise.all([
        ensureFileExists(HISTORY_FILE),
        ensureFileExists(POST_HISTORY_FILE)
    ]);

    // Start monitoring
    const monitorInterval = setInterval(async () => {
        try {
            const chats = await client.getChats();
            const groups = chats.filter(chat => chat.isGroup);
            if (groups.length > 0) {
                await checkForUpdates(groups[0]);
            }
        } catch (error) {
            console.error('Monitoring error:', error);
        }
    }, CHECK_INTERVAL);

    // Initial check
    try {
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        if (groups.length > 0) {
            await checkForUpdates(groups[0]);
        }
    } catch (error) {
        console.error('Initial update check error:', error);
    }
});

client.on('disconnected', () => {
    console.log('Client is disconnected!');
});

client.on('auth_failure', (msg) => {
    console.log('Client authentication failed!', msg);
});

// Allowed (immune) numbers
const allowedNumbers = ['9717488830', '8169810219'];
const warningCounts = {};

// Handling incoming messages
client.on('message', async (message) => {
    try {
        const chat = await message.getChat();

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

        const isAdmin = chat.participants.find(participant =>
            participant.id._serialized === message.author && participant.isAdmin
        );

        const whitelistedLinks = [
            'https://www.cloudskillsboost.google/',
            'https://techno-arcade.vercel.app/',
            'https://www.youtube.com/@durgacharannayak3058/',
            'https://rsvp.withgoogle.com/events/arcade-facilitator/syllabus'
        ];

        const urlRegex = /(?:https?:\/\/|www\.|bit\.ly|t\.co|tinyurl\.com|goo\.gl)[^\s]+/g;
        const foundUrls = message.body.match(urlRegex);

        const bannedWords = ['Quicklab', 'Quick lab', 'quicklab', 'btecky', 'Btecky', 'QuickGCP', 'quickgcp', 'quick gcp', 'quick lab'];

        if (isAdmin) {
            if (messageContent.includes('remove') || messageContent.includes('kick')) {
                const mentionedUser  = message.mentionedIds[0];
                if (mentionedUser ) {
                    try {
                        await chat.removeParticipants([mentionedUser ]);
                        await chat.sendMessage(`*@${mentionedUser }* has been removed from the group.`);
                    } catch (error) {
                        console.error('Failed to remove participant:', error);
                        await chat.sendMessage('_Failed to remove the user._');
                    }
                } else {
                    await chat.sendMessage('_No user mentioned._');
                }
            }
        } else {
            if (messageContent.includes('remove') || messageContent.includes('kick')) {
                await chat.sendMessage('_You are not authorized to perform this action._');
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
                                    await chat.removeParticipants([message.author || message.from]);
                                    await chat.sendMessage(`*${message.author || message.from}* has been removed from the group for repeated violations.`);
                                    const stickerMedia = MessageMedia.fromFilePath(stickerPaths.warning1);
                                    await chat.sendMessage(stickerMedia, { sendMediaAsSticker: true });
                                } catch (error) {
                                    console.error('Failed to remove participant:', error);
                                }
                            }
                        } else {
                            await chat.sendMessage(`*Unwanted links not allowed here!* Warning Count: ${warningCounts[senderNumber]}`);
                            const stickerMedia = MessageMedia.fromFilePath(stickerPaths.warning2);
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
                            await chat.removeParticipants([message.author || message.from]);
                            await chat.sendMessage(`*${message.author || message.from}* has been removed from the group for repeated violations.`);
                            const stickerMedia = MessageMedia.fromFilePath(stickerPaths.remove1);
                            await chat.sendMessage(stickerMedia, { sendMediaAsSticker: true });
                        } catch (error) {
                            console.error('Failed to remove participant:', error);
                        }
                    }
                } else {
                    await chat.sendMessage(`*⚠️ Warning!* Do not use banned words. Warning Count: ${warningCounts[senderNumber]}`);
                    const stickerMedia = MessageMedia.fromFilePath(stickerPaths.remove2);
                    await chat.sendMessage(stickerMedia, { sendMediaAsSticker: true });
                }
                return;
            }
        }

        // Handle image messages
        if (message.hasMedia && message.body.toLowerCase().startsWith('.tao')) {
            try {
                const media = await message.downloadMedia();
                if (media.mimetype.startsWith('image/')) {
                    const imageBuffer = Buffer.from(media.data, 'base64');
                    const prompt = message.body.slice(4).trim();
                    if (!prompt) {
                        await message.reply("_Please provide a question with the .tao command when sending an image._");
                        return;
                    }
                    const response = await analyzeImage(imageBuffer, prompt, message);
                    await message.reply(response);
                    return;
                }
            } catch (error) {
                console.error('Error processing image:', error);
                await message.reply('_Sorry, I encountered an error while processing the image._');
                return;
            }
        }

        // Handle quoted messages with .tao
        if (message.body.includes('.tao') && message.hasQuotedMsg) {
            const quotedMessage = await message.getQuotedMessage();
            const quotedContent = quotedMessage.body;
            const prompt = message.body.slice(message.body.indexOf('.tao') + 4).trim() || quotedContent;

            if (quotedMessage.hasMedia) {
                const media = await quotedMessage.downloadMedia();
                if (media.mimetype.startsWith('image/')) {
                    const imageBuffer = Buffer.from(media.data, 'base64');
                    const response = await analyzeImage(imageBuffer, prompt, message);
                    await message.reply(response);
                    return;
                }
            }

            generateResponse(prompt, message);
            return;
        }

        // Handle replies to bot messages
        if (message.hasQuotedMsg) {
            const quotedMessage = await message.getQuotedMessage();
            if (quotedMessage.from === client.info.wid._serialized) {
                const prompt = message.body.trim() || "Hi"; // Default prompt if no text is provided
                generateResponse(prompt, message);
                return;
            }
        }

        // Handle text commands
        if (message.body.includes('.tao') || message.body.includes('.tagall') || message.body === '.updates') {
            if (chat.isGroup) {
                const senderId = message.author;
                const senderParticipant = chat.participants.find(participant =>
                    participant.id._serialized === senderId
                );

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

                            if (i + batchSize < groupSize) {
                                await new Promise(resolve => setTimeout(resolve, delay));
                            }
                        }
                    } else {
                        await chat.sendMessage('_The .tagall command can only be used by group admins._');
                    }
                } else if (message.body === '.updates') {
                    if (senderParticipant && senderParticipant.isAdmin) {
                        await message.reply('*Checking for community updates...* 🔄');
                        await checkForUpdates(chat, true); // true indicates manual check
                    } else {
                        await message.reply('_This command is only available to admins_');
                    }
                }
            }
        }

        if (messageContent === '!help') {
            const helpMessage = `
*Available Commands:*
    
\`!help\` — Display this help message.
\`.tao [query]\` — Interact with the bot using the specified query (can include images).
\`.tagall\` — (Admin only) Mention all participants in the group.
\`.updates\` — (Admin only) Check for community updates.
\`remove/kick [@user]\` — (Admin only) Remove the mentioned user from the group.
            `;
            await chat.sendMessage(helpMessage);
            return;
        }
    } catch (error) {
        console.error('Error in message handler:', error);
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});

// Handle process termination gracefully
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    try {
        await client.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});