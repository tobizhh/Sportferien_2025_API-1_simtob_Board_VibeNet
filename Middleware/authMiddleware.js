const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Kein Token, Zugriff verweigert" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("_id username"); // Benutzer abrufen

    if (!req.user) return res.status(401).json({ message: "Ungültiges Token" });

    next();
  } catch (error) {
    res.status(401).json({ message: "Token ist ungültig" });
  }
};

module.exports = requireAuth;
