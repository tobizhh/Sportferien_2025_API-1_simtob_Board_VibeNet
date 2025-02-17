const express = require("express");
const User = require("../models/User");
const requireAuth = require("../Middleware/authMiddleware");

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id, { password: 0 });
    if (!user) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen des Users", error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen der User", error: err.message });
  }
});

module.exports = router;
