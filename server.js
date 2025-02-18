require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const userRoutes = require("./routes/users");
const serverRoutes = require("./routes/servers");
const channelRoutes = require("./routes/channels");
const messageRoutes = require("./routes/messages");
const authRoutes = require("./routes/auth");
const friendsRoutes = require("./routes/friends");
const path = require("path");




const app = express();
app.use(express.json());
app.use(cors());

// Verbindung zu MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Verbindung zu MongoDB erfolgreich!"))
  .catch((err) => console.error("❌ Fehler bei der Verbindung zu MongoDB:", err));

// API-Routen registrieren
app.use("/api/users", userRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendsRoutes);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VibeChat API",
      version: "1.0.0",
      description: "API-Dokumentation für VibeChat",
    },
    servers: [{ url: "http://localhost:10000" }],
  },
  apis: ["./routes/*.js"], // ⬅️ Pfad zu deinen API-Routen (anpassen, falls nötig)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/", (req, res) => {
  res.send("VibeChat Backend läuft 🚀");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("🌍 Server läuft auf Port ${PORT}"));
