/**
 * @ Author: Tobias Simon
 * @ Date: 26.02.2025
 * @ Description: 
 * VibeNet ist eine Echtzeit-Chat-Anwendung mit Benutzerregistrierung, 
 * Authentifizierung und Freundesverwaltung. Nachrichten werden über 
 * WebSockets (Socket.io) in Echtzeit ausgetauscht und in einer MongoDB 
 * Datenbank gespeichert.
 */
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
