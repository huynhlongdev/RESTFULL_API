const express = require("express");
const router = express.Router();
const { getUserProfile } = require("../controllers/userController");
const { authenticateToken } = require("../utils/token");

// User Routes
router.get("/profile", authenticateToken, getUserProfile);

module.exports = router;
