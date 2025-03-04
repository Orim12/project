import fetch from 'node-fetch';
import readline from 'readline';

const API_URL = 'https://chating-with-friends.netlify.app/api/messages';
let messages = [];
let currentInput = '';

async function getMessages() {
    const response = await fetch(API_URL);
    messages = await response.json();
    displayMessages();
}

function displayMessages() {
    console.clear();
    console.log('Messages:');
    messages.forEach((message) => {
        console.log(`[${new Date(message.timestamp).toLocaleTimeString()}] ${message.user}: ${message.text}`);
    });
    console.log('\nType your message below (type "exit" to quit):');
    process.stdout.write(currentInput);
}

async function postMessage(user, text) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, text })
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

startChat();
