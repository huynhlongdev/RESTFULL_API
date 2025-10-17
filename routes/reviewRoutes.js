const express = require("express");
const router = express.Router();

const { protected, allowedRole } = require("../middleware/authMiddleware");
const {
  createReview,
  deleteReview,
} = require("../controllers/reviewController");

// Create product
router
  .post("/:id", protected, createReview)
  .delete("/:id", protected, deleteReview);

module.exports = router;
