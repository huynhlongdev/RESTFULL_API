const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
// const { protect, accept } = require("../middleware/authMiddleware");

// Create product
router.post("/", createProduct);

// Get all product
router.get("/", getProducts);

// Get/Update/Delete product
router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
