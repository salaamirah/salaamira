const socket = io();

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === "") return;

    // Append message locally
    const message = document.createElement("div");
    message.classList.add("message", "sent");
    message.textContent = messageText;
    chatBody.appendChild(message);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Clear input and send message to the server
    messageInput.value = "";
    socket.emit("message", messageText);
}

// Listen for messages from the server
socket.on("message", (messageText) => {
    const message = document.createElement("div");
    message.classList.add("message", "received");
    message.textContent = messageText;
    chatBody.appendChild(message);
    chatBody.scrollTop = chatBody.scrollHeight;
});