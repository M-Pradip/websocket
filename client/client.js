const socket = new WebSocket("ws://localhost:3000");

const messagesList = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

//connection opened event
socket.addEventListener("open", (event) => {
  console.log("Connected to server");
});

// Listen for messages from the server
socket.addEventListener("message", (event) => {
  try {
    const data = JSON.parse(event.data);

    if (data.type === "system") {
      // System messages (user joined/left)
      addMessage(data.message, "system");
    } else if (data.type === "chat") {
      // Regular chat messages
      addMessage(data.message, "chat");
    }
  } catch (error) {
    // If it's not JSON, just display the raw message
    addMessage(event.data, "chat");
  }
});

//connection closed event
socket.addEventListener("close", (event) => {
  addMessage("Disconnected from server", "system");
});

//error event
socket.addEventListener("error", (event) => {
  addMessage("Error occurred: ", "system");
  console.error(event);
});

//send message to server when button is clicked
function sendMessage() {
  const message = messageInput.value.trim();

  if (message && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    messageInput.value = ""; // Clear the input field

    // Focus back on the input field
    messageInput.focus();
  }
}

//add message to the messages UI
function addMessage(message) {
  const li = document.createElement("li");
  li.textContent = message;
  messagesList.appendChild(li);
  // Auto-scroll to the bottom
  messagesList.scrollTop = messagesList.scrollHeight;
}

//add event listener to send button
sendButton.addEventListener("click", sendMessage);

//add event listener to message input for enter key
messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
