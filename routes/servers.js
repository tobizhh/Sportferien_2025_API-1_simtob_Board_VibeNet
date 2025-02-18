const express = require("express");
const Server = require("../models/Server");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Servers
 *   description: Verwaltung von Servern
 */

/**
 * @swagger
 * /servers:
 *   get:
 *     summary: Alle Server abrufen
 *     tags: [Servers]
 *     responses:
 *       200:
 *         description: Erfolgreiche Antwort mit der Liste der Server
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   name: { type: string }
 *       500: { description: Serverfehler }
 */
router.get("/", async (req, res) => {
  try {
    const servers = await Server.find();
    res.json(servers);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen der Server", error: err.message });
  }
});

module.exports = router;
