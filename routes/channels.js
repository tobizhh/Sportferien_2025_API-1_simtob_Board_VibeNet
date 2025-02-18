const express = require("express");
const Channel = require("../models/Channel");
const Server = require("../models/Server");
const mongoose = require("mongoose");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Channels
 *   description: Verwaltung von Kanälen innerhalb eines Servers
 */

/**
 * @swagger
 * /channels/{serverId}:
 *   get:
 *     summary: Channels eines Servers abrufen
 *     tags: [Channels]
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *         example: "60d0fe4f5311236168a109ca"
 *         description: Die ID oder der Name des Servers
 *     responses:
 *       200:
 *         description: Erfolgreiche Antwort mit den Kanälen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   name: { type: string }
 *                   type: { type: string }
 *                   server: { type: string }
 *       404: { description: Server nicht gefunden }
 *       500: { description: Serverfehler }
 */
router.get("/:serverId", async (req, res) => {
  try {
    let { serverId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serverId)) {
      const server = await Server.findOne({ name: serverId });
      if (!server) return res.status(404).json({ message: "Server nicht gefunden" });
      serverId = server._id;
    }

    const channels = await Channel.find({ server: serverId });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen der Channels", error: err.message });
  }
});

/**
 * @swagger
 * /channels:
 *   post:
 *     summary: Neuen Channel erstellen
 *     tags: [Channels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "general" }
 *               type: { type: string, example: "text" }
 *               server: { type: string, example: "60d0fe4f5311236168a109ca" }
 *     responses:
 *       201:
 *         description: Channel erfolgreich erstellt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *                 name: { type: string }
 *                 type: { type: string }
 *                 server: { type: string }
 *       404: { description: Server nicht gefunden }
 *       500: { description: Serverfehler }
 */
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

/**
 * @swagger
 * /channels/name/{channelName}:
 *   get:
 *     summary: Channel-ID anhand des Namens abrufen
 *     tags: [Channels]
 *     parameters:
 *       - in: path
 *         name: channelName
 *         required: true
 *         schema:
 *           type: string
 *         example: "general"
 *         description: Der Name des Channels
 *     responses:
 *       200:
 *         description: Erfolgreiche Antwort mit der Channel-ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *       404: { description: Channel nicht gefunden }
 *       500: { description: Serverfehler }
 */
router.get("/name/:channelName", async (req, res) => {
  try {
    const channel = await Channel.findOne({ name: req.params.channelName });
    if (!channel) return res.status(404).json({ message: "Channel nicht gefunden" });

    res.json({ _id: channel._id });
  } catch (error) {
    res.status(500).json({ message: "Serverfehler", error: error.message });
  }
});

module.exports = router;
