const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, admin, createProduct);
router.get("/", getProducts);

module.exports = router;
