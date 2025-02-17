const express = require("express");
const Channel = require("../models/Channel");
const Server = require("../models/Server");

const router = express.Router();

const mongoose = require("mongoose");


router.get("/:serverId", async (req, res) => {
  try {
    let { serverId } = req.params;

    // Falls eine ungültige ObjectId übergeben wird, prüfen ob es ein Server-Name ist
    if (!mongoose.Types.ObjectId.isValid(serverId)) {
      const server = await Server.findOne({ name: serverId }); // Sucht nach dem Server mit diesem Namen
      if (!server) {
        return res.status(404).json({ message: "Server nicht gefunden" });
      }
      serverId = server._id; // Setzt die gefundene ObjectId als `serverId`
    }

    const channels = await Channel.find({ server: serverId });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen der Channels", error: err.message });
  }
});



router.post("/", async (req, res) => {
  try {
    const { name, type, server } = req.body;
    const serverExists = await Server.findById(server);
    if (!serverExists) return res.status(404).json({ message: "Server nicht gefunden" });

    const channel = new Channel({ name, type, server });
    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Erstellen des Channels", error: err.message });
  }
});

module.exports = router;
