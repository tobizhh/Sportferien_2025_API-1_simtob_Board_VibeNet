require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./routes/users");
const serverRoutes = require("./routes/servers");
const channelRoutes = require("./routes/channels");
const messageRoutes = require("./routes/messages");
const authRoutes = require("./routes/auth");

const app = express();
app.use(express.json());
app.use(cors());

// Verbindung zu MongoDB
mongoose
  .connect("mongodb+srv://tobi:Saitob06@vibenet.ncfjd.mongodb.net/?retryWrites=true&w=majority&appName=VibeNet")
  .then(() => console.log("✅ Verbindung zu MongoDB erfolgreich!"))
  .catch((err) => console.error("❌ Fehler bei der Verbindung zu MongoDB:", err));

// API-Routen registrieren
app.use("/api/users", userRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("VibeChat Backend läuft 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌍 Server läuft auf Port ${PORT}`));
