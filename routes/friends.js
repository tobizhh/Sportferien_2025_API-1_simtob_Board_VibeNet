const express = require("express");
const User = require("../models/User");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Verwaltung von Freundschaften
 */

/**
 * @swagger
 * /friends/request:
 *   post:
 *     summary: Freundschaftsanfrage senden
 *     tags: [Friends]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId: { type: string, example: "60d0fe4f5311236168a109ca" }
 *               receiverId: { type: string, example: "60d0fe4f5311236168a109cb" }
 *     responses:
 *       200: { description: Freundschaftsanfrage gesendet }
 *       400: { description: Anfrage bereits gesendet oder Benutzer bereits Freund }
 *       404: { description: Benutzer nicht gefunden }
 *       500: { description: Serverfehler }
 */
router.post("/request", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: "User not found" });

    if (receiver.friendRequests.includes(senderId) || receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: "Friend request already sent or user is already a friend" });
    }

    receiver.friendRequests.push(senderId);
    await receiver.save();
    res.json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

/**
 * @swagger
 * /friends/accept:
 *   post:
 *     summary: Freundschaftsanfrage akzeptieren
 *     tags: [Friends]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string, example: "60d0fe4f5311236168a109ca" }
 *               senderId: { type: string, example: "60d0fe4f5311236168a109cb" }
 *     responses:
 *       200: { description: Freundschaftsanfrage akzeptiert }
 *       400: { description: Keine Anfrage gefunden }
 *       404: { description: Benutzer nicht gefunden }
 *       500: { description: Serverfehler }
 */
router.post("/accept", async (req, res) => {
  try {
    const { userId, senderId } = req.body;
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);
    if (!user || !sender) return res.status(404).json({ message: "User not found" });

    if (!user.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "No friend request found" });
    }

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    user.friends.push(senderId);
    sender.friends.push(userId);

    await user.save();
    await sender.save();
    res.json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

/**
 * @swagger
 * /friends/{userId}:
 *   get:
 *     summary: Freundesliste abrufen
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200: 
 *         description: Erfolgreiche Antwort mit Freundesliste
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 friends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       username: { type: string }
 *       404: { description: Benutzer nicht gefunden }
 *       500: { description: Serverfehler }
 */
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("friends", "username email");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

/**
 * @swagger
 * /friends/friend-requests/{userId}:
 *   get:
 *     summary: Offene Freundschaftsanfragen abrufen
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Erfolgreiche Antwort mit ausstehenden Anfragen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       username: { type: string }
 *       404: { description: Benutzer nicht gefunden }
 *       500: { description: Serverfehler }
 */
router.get("/friend-requests/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("friendRequests", "username");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ requests: user.friendRequests });
  } catch (error) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

module.exports = router;
