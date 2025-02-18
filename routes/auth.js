const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const router = express.Router();

function generateCode() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendEmail(to, subject, text) {
  try {
    await sgMail.send({ to, from: process.env.EMAIL_FROM, subject, text });
  } catch (error) {
    console.error("❌ Fehler beim Senden der E-Mail:", error);
  }
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Benutzer registrieren
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string, example: "JohnDoe" }
 *               email: { type: string, example: "johndoe@example.com" }
 *               password: { type: string, example: "securePassword123" }
 *               enableTwoFactor: { type: boolean, example: true }
 *     responses:
 *       201: { description: Benutzer erfolgreich registriert }
 *       400: { description: Fehlerhafte Eingabe oder Benutzer existiert }
 *       500: { description: Serverfehler }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, enableTwoFactor } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "Alle Felder sind erforderlich" });

    if (await User.findOne({ email })) return res.status(400).json({ message: "Benutzer existiert bereits" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, email, password: hashedPassword, twoFactorEnabled: enableTwoFactor }).save();
    res.status(201).json({ message: "Benutzer erfolgreich registriert" });
  } catch (error) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Benutzer einloggen
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "johndoe@example.com" }
 *               password: { type: string, example: "securePassword123" }
 *     responses:
 *       200: { description: Login erfolgreich, evtl. 2FA erforderlich }
 *       400: { description: Falsche Zugangsdaten }
 *       500: { description: Serverfehler }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Falsche Zugangsdaten" });

    if (user.twoFactorEnabled) {
      user.twoFactorCode = generateCode();
      user.twoFactorExpires = Date.now() + 300000;
      await user.save();
      await sendEmail(user.email, "Ihr 2FA-Code", `Ihr 2FA-Code lautet: ${user.twoFactorCode}`);
      return res.json({ requireTwoFactor: true });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

/**
 * @swagger
 * /auth/two-factor:
 *   post:
 *     summary: 2FA-Code prüfen
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "johndoe@example.com" }
 *               twoFactorCode: { type: string, example: "123456" }
 *     responses:
 *       200: { description: 2FA erfolgreich, JWT zurückgegeben }
 *       400: { description: Ungültiger oder abgelaufener Code }
 *       404: { description: Benutzer nicht gefunden }
 *       500: { description: Serverfehler }
 */
router.post("/two-factor", async (req, res) => {
  try {
    const { email, twoFactorCode } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.twoFactorCode || Date.now() > user.twoFactorExpires || user.twoFactorCode !== twoFactorCode)
      return res.status(400).json({ message: "Ungültiger oder abgelaufener 2FA-Code" });

    user.twoFactorCode = null;
    user.twoFactorExpires = null;
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

/**
 * @swagger
 * /auth/friends/request:
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
 *       500: { description: Serverfehler }
 */
router.post("/friends/request", async (req, res) => {
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
 * /auth/friends/accept:
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
 *       500: { description: Serverfehler }
 */
router.post("/friends/accept", async (req, res) => {
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

module.exports = router;
