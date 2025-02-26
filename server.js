/**
 * @ Author: Tobias Simon
 * @ Date: 26.02.2025
 * @ Description: 
 * VibeNet ist eine Echtzeit-Chat-Anwendung mit Benutzerregistrierung, 
 * Authentifizierung und Freundesverwaltung. Nachrichten werden über 
 * WebSockets (Socket.io) in Echtzeit ausgetauscht und in einer MongoDB 
 * Datenbank gespeichert.
 */
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const { createServer } = require("http")
const { Server } = require("socket.io")
const Message = require("./models/Message")
console.log("📂 Loading routes...") //debug codes

const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

app.set("io", io)
app.use(express.json())
app.use(cors())

// connect to mongodb
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("📊 Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// route Imports
const authRoutes = require("./routes/auth")
const messageRoutes = require("./routes/messages")
const userRoutes = require("./routes/users")

// register API Routes
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/users", userRoutes)

app.get("/", (req, res) => res.send("🔥 Chat API is running"))

// debugging routes
console.log("🛠 Checking registered routes...")
app._router.stack.forEach((r) => {
  if (r.route) {
    console.log(`✅ Route registered: ${r.route.path}`)
  } else if (r.name === "router" && r.handle.stack) {
    r.handle.stack.forEach((s) => {
      if (s.route) {
        console.log(`✅ Nested route registered: ${s.route.path}`)
      }
    })
  }
})

// socket.io connections
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
//get messages
  socket.on("sendMessage", async (message) => {
    console.log("📨 New message received:", message);
    try {
      const newMessage = new Message({
        content: message.content,
        author: message.author, 
      });

      await newMessage.save();
      await newMessage.populate("author", "username");

      io.emit("receiveMessage", newMessage);
      console.log("✅ Message saved & broadcasted via Socket.io");
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});



const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
