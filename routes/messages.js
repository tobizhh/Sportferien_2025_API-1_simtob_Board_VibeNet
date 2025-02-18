const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Message = require("../models/Message");

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Verwaltung von Nachrichten in Kanälen
 */

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Nachricht senden
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string, example: "Hello, world!" }
 *               channel: { type: string, example: "60d0fe4f5311236168a109ca" }
 *               author: { type: string, example: "60d0fe4f5311236168a109cb" }
 *     responses:
 *       201:
 *         description: Nachricht erfolgreich gesendet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Message sent" }
 *                 messageData:
 *                   type: object
 *                   properties:
 *                     _id: { type: string }
 *                     content: { type: string }
 *                     channel: { type: string }
 *                     author: { type: string }
 *       400: { description: Fehlende Inhalte }
 *       500: { description: Serverfehler }
 */
router.post("/", async (req, res) => {
  try {
    const { content, channel, author } = req.body;
    if (!content || !channel || !author) return res.status(400).json({ message: "Content, channel, and author are required" });

    const newMessage = new Message({ content, channel, author });
    await newMessage.save();

    res.status(201).json({ message: "Message sent", messageData: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

module.exports = router;
