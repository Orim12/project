import axios from 'axios';
import readline from 'readline';

// Use a configurable API URL with a default that works in most cases
const API_URL = process.env.API_URL || 'http://localhost:3000/api/messages';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for username
rl.question('Enter your username: ', (username) => {
  console.log(`Welcome, ${username}! Type your messages below. Type 'exit' to quit.`);
  
  // Function to fetch and display messages
  const fetchMessages = async () => {
    try {
      const response = await axios.get(API_URL);
      console.log('\n--- Message History ---');
      
      if (response.data.length === 0) {
        console.log('No messages yet.');
      } else {
        response.data.forEach(message => {
          const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          console.log(`[${time}] ${message.sender}: ${message.text}`);
        });
      }
      
      console.log('----------------------\n');
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    }
  };

  // Fetch messages initially
  fetchMessages();

  // Listen for user input
  rl.on('line', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      rl.close();
      process.exit(0);
    } else if (input.toLowerCase() === 'refresh') {
      await fetchMessages();
    } else {
      // Send message
      try {
        await axios.post(API_URL, {
          text: input,
          sender: username
        });
        console.log('Message sent!');
      } catch (error) {
        console.error('Error sending message:', error.message);
      }
    }
  });
});

console.log('Terminal Chat Client');
console.log('Commands:');
console.log('  - Type a message to send it');
console.log('  - Type "refresh" to see new messages');
console.log('  - Type "exit" to quit');