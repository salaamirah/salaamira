const chatBody = document.getElementById("chatBody");
const messageInput = document.getElementById("messageInput");

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === "") return;

    // Create and append a new message
    const message = document.createElement("div");
    message.classList.add("message", "sent");
    message.textContent = messageText;
    chatBody.appendChild(message);

    // Scroll to the bottom of the chat
    chatBody.scrollTop = chatBody.scrollHeight;

    // Clear the input field
    messageInput.value = "";

    // Simulate a response
    setTimeout(() => {
        const response = document.createElement("div");
        response.classList.add("message", "received");
        response.textContent = "This is a response.";
        chatBody.appendChild(response);

        // Scroll to the bottom of the chat
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
}

// Send message on Enter key press
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});