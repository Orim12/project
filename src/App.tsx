import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, MessageSquare, Download, Terminal } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get the current host from window.location
    const host = window.location.origin;
    
    // Connect to the socket server using the current host
    const socketConnection = io(host, {
      path: "/socket.io"
    });
    
    setSocket(socketConnection);

    // Listen for message history
    socketConnection.on('message-history', (messageHistory: Message[]) => {
      setMessages(messageHistory);
    });

    // Listen for new messages
    socketConnection.on('new-message', (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Cleanup on component unmount
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('send-message', {
        text: newMessage,
        sender: username
      });
      setNewMessage('');
    }
  };

  const handleSetUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isUsernameSet) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <MessageSquare className="h-8 w-8 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Chat App</h1>
          </div>
          <form onSubmit={handleSetUsername} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Enter your username to start chatting
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Username"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
            >
              <User className="h-5 w-5 mr-2" />
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">Chat App</h1>
          </div>
          <div className="flex items-center">
            <User className="h-5 w-5 mr-1" />
            <span className="font-medium">{username}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col max-w-4xl">
        <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                      message.sender === username 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.sender !== username && (
                      <div className="font-bold text-xs mb-1">{message.sender}</div>
                    )}
                    <p>{message.text}</p>
                    <div 
                      className={`text-xs mt-1 text-right ${
                        message.sender === username ? 'text-indigo-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your message..."
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
        
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Terminal Client</h3>
          <p className="text-gray-600 mb-3">
            Want to chat from your terminal? Download our terminal client and connect to this chat from the command line.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="/terminal-client.js" 
              download="terminal-client.js"
              className="flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Terminal Client
            </a>
            <div className="flex items-center justify-center bg-gray-100 text-gray-800 py-2 px-4 rounded-md">
              <Terminal className="h-5 w-5 mr-2" />
              <code>node terminal-client.js</code>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          <p>Chat Application with API Access - {new Date().getFullYear()}</p>
          <p className="mt-1">
            API Endpoints: 
            <code className="bg-gray-100 px-2 py-1 rounded ml-2">GET /api/messages</code>
            <code className="bg-gray-100 px-2 py-1 rounded ml-2">POST /api/messages</code>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;