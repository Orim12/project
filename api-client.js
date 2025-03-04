import fetch from 'node-fetch';
import readline from 'readline';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'https://chating-with-friends.netlify.app/api/messages'; // Updated API URL
const GITHUB_REPO_URL = 'https://raw.githubusercontent.com/Orim12/project/refs/heads/terminal-download/api-client.js'; // Updated GitHub repo URL
let messages = [];
let currentInput = '';

async function checkForUpdates() {
    const response = await fetch(GITHUB_REPO_URL);
    const latestScript = await response.text();
    const currentScript = await fs.readFile(__filename, 'utf-8');

    if (latestScript !== currentScript) {
        console.log('A new version is available. Updating...');
        await fs.writeFile(__filename, latestScript);
        console.log('Update complete. Please restart the application.');
        process.exit(0);
    } else {
        console.log('You are using the latest version.');
    }
}

async function getMessages() {
    const response = await fetch(API_URL);
    messages = await response.json();
    displayMessages();
}

function displayMessages() {
    console.clear();
    console.log('Messages:');
    messages.forEach((message) => {
        if (message) { // Check if message is not null
            console.log(`[${new Date(message.timestamp).toLocaleTimeString()}] ${message.sender}: ${message.text}`);
        }
    });
    console.log('\nType your message below (use ctrl+c to exit):');
    process.stdout.write(currentInput);
}

async function postMessage(user, text) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: user, text }) // Updated property names
    });
    const newMessage = await response.json();
    messages.push(newMessage);
    displayMessages();
}

function startChat() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter your username: ', (user) => {
        console.log(`Welcome ${user}! Type your messages below (use ctrl+c to exit):`);

        setInterval(getMessages, 1000); // Fetch messages every 1 second

        rl.on('line', async (text) => {
                await postMessage(user, text);
                currentInput = ''; // Clear current input after posting a message
        });

        rl.on('SIGINT', () => {
            rl.close();
        });

        rl.input.on('data', (data) => {
            currentInput += data.toString();
        });

        rl.input.on('keypress', (char, key) => {
            if (key && key.name === 'backspace') {
                currentInput = currentInput.slice(0, -1);
            }
        });
    });
}

(async () => {
    await checkForUpdates();
    startChat();
})();
