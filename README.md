# Chat Application with API Access

This is a real-time chat application with both a web interface and API endpoints that can be accessed via terminal.

## Features

- Real-time chat using Socket.IO
- Web interface built with React
- RESTful API endpoints for terminal access
- Terminal client for command-line chatting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```
npm install
```

2. Build the application:
```
npm run build
```

3. Start the server:
```
npm run server
```

The server will start on port 3000 by default.

## Usage

### Web Interface

Open your browser and navigate to:
```
http://localhost:3000
```

Enter your username and start chatting!

### Terminal Client

In a separate terminal window, run:
```
node terminal-client.js
```

Follow the prompts to enter your username and start chatting from the terminal.

### API Endpoints

The following API endpoints are available:

- `GET /api/messages` - Get all messages
- `POST /api/messages` - Send a new message (requires `text` and `sender` in the request body)

Example using curl:
```
# Get all messages
curl http://localhost:3000/api/messages

# Send a message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from curl!", "sender": "Terminal User"}'
```

## Development

To run the application in development mode:

1. Start the Vite development server:
```
npm run dev
```

2. In a separate terminal, start the backend server:
```
npm run server
```

The Vite dev server will proxy API requests to the backend server.