const express = require("express");
const Server = require("../models/Server");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const servers = await Server.find();
    res.json(servers);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen der Server", error: err.message });
  }
});

module.exports = router;
