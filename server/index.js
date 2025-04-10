import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, "../client")));

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

//store all connected clients
const clients = new Map(); // Changed from Set to Map to store client info
let userCounter = 0; // Counter for assigning user IDs

wss.on("connection", (ws) => {
  // Assign a user number to this connection
  userCounter++;
  const userId = userCounter;

  console.log(`Client ${userId}connected`);

  // Store client with its ID
  clients.set(ws, {
    id: userId,
    name: `User ${userId}`,
  });
  // Send a welcome message to the new client
  ws.send(
    JSON.stringify({
      type: "system",
      message: "Welcome to the chat! you are User " + userId,
    })
  );
  // Broadcast to all clients that someone joined
  broadcastMessage({
    type: "system",
    message: `User ${userId} has joined the chat`,
  });

  ws.on("message", (data) => {
    console.log(`Received from user ${userId} %s`, data);
    // ws.send("from server dhanyabad");
    try {
      // Parse the incoming data if it's JSON
      // If it's plain text, just use it as is
      const messageContent = data.toString();

      // Broadcast the message to all connected clients
      broadcastMessage({
        type: "chat",
        userId: userId,
        userName: `User ${userId}`,
        message: messageContent,
      });
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    const userData = clients.get(ws);
    console.log(`Client ${userData.id} disconnected`);
    // Remove the client from our set
    clients.delete(ws);

    // Broadcast to all clients that someone left
    broadcastMessage({
      type: "system",
      message: `user ${userData.id} has left the chat`,
    });
  });
  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clients.delete(ws);
  });
});
// Function to broadcast a message to all connected clients
function broadcastMessage(message) {
  const messageString = JSON.stringify(message);
  clients.forEach((userData, client) => {
    // Check if the client connection is still open
    if (client.readyState === client.OPEN) {
      client.send(messageString);
    }
  });
}
