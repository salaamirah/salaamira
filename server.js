const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the frontend files
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for messages from the client
    socket.on("message", (data) => {
        console.log("Message received: ", data);
        // Broadcast the message to other users
        socket.broadcast.emit("message", data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
