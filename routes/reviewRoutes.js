const express = require("express");
const router = express.Router();

// const { protect, accept } = require("../middleware/authMiddleware");
const { createReview } = require("../controllers/reviewController");

// Create product
router.post("/:productID", createReview);

module.exports = router;
