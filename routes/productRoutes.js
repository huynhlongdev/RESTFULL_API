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

const { protected, allowedRole } = require("../middleware/authMiddleware");

// Create product
router.post("/", protected, allowedRole("admin", "manage"), createProduct);

// Get all product
router.get("/", getProducts);

// Get/Update/Delete product
router
  .route("/:id")
  .get(getProduct)
  .put(protected, allowedRole("admin", "manage"), updateProduct)
  .delete(protected, allowedRole("admin", "manage"), deleteProduct);

module.exports = router;
