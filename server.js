const WebSocket = require('ws');

// Create a WebSocket server instance
const server = new WebSocket.Server({ port: 8080 });

// Event listener for new WebSocket connections
server.on('connection', (socket) => {
  console.log('Client connected');

  // Send "Hi" to the client
  socket.send('Hi');

  // Event listener for incoming messages from the client
  socket.on('message', (message) => {
    console.log('Received message:', message);

    // Reply to the client with another message
    socket.send('Hello, client!');
  });

  // Event listener for WebSocket connection close
  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on port 8080');
