const express = require("express");
const router = express.Router();

const { protected, allowedRole } = require("../middleware/authMiddleware");
const { createReview } = require("../controllers/reviewController");

// Create product
router.post("/:productID", protected, createReview);

module.exports = router;
