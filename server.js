import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

// Serve the terminal client for download
app.get('/terminal-client.js', (req, res) => {
  res.setHeader('Content-Type', 'text/javascript');
  res.setHeader('Content-Disposition', 'attachment; filename="terminal-client.js"');
  res.sendFile(join(__dirname, 'terminal-client.js'));
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Ensure all routes not handled by API are sent to the React app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Store messages in memory
const messages = [];

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Send existing messages to the client
  socket.emit('message-history', messages);
  
  // Listen for new messages
  socket.on('send-message', (message) => {
    const messageWithId = {
      id: Date.now(),
      text: message.text,
      sender: message.sender,
      timestamp: new Date().toISOString()
    };
    
    messages.push(messageWithId);
    io.emit('new-message', messageWithId);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API endpoint to get all messages
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// API endpoint to send a message
app.post('/api/messages', (req, res) => {
  const { text, sender } = req.body;
  
  if (!text || !sender) {
    return res.status(400).json({ error: 'Message text and sender are required' });
  }
  
  const message = {
    id: Date.now(),
    text,
    sender,
    timestamp: new Date().toISOString()
  };
  
  messages.push(message);
  io.emit('new-message', message);
  
  res.status(201).json(message);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Web client: http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/api/messages`);
  console.log(`  POST http://localhost:${PORT}/api/messages`);
});