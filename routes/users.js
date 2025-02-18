const express = require("express");
const User = require("../models/User");
const requireAuth = require("../Middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Verwaltung von Benutzern
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Eigene Benutzerdaten abrufen
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Erfolgreiche Antwort mit den Benutzerdaten
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *                 username: { type: string }
 *                 email: { type: string }
 *       401: { description: Nicht autorisiert }
 *       404: { description: Benutzer nicht gefunden }
 *       500: { description: Serverfehler }
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id, { password: 0 });
    if (!user) return res.status(404).json({ message: "Benutzer nicht gefunden" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen des Users", error: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
      const { username } = req.query;

      if (!username) {
          return res.status(400).json({ message: "⚠️ Kein Benutzername angegeben" });
      }

      // Suche Benutzer, die dem eingegebenen Namen entsprechen
      const users = await User.find({ username: { $regex: new RegExp(username, "i") } });

      if (users.length === 0) {
          return res.status(404).json({ message: "❌ Kein Benutzer gefunden" });
      }

      res.json(users);
  } catch (error) {
      console.error("❌ Fehler bei der Benutzersuche:", error);
      res.status(500).json({ message: "Serverfehler" });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Alle Benutzer abrufen
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Erfolgreiche Antwort mit der Benutzerliste
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   username: { type: string }
 *                   email: { type: string }
 *       500: { description: Serverfehler }
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen der User", error: err.message });
  }
});

module.exports = router;
