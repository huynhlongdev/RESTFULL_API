const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategory,
  deleteCategory,
  updateCategory,
} = require("../controllers/categoryController");

const { protected, allowedRole } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protected, allowedRole("admin", "manage"), createCategory)
  .get(getCategories);

router
  .route("/:id")
  .get(getCategory)
  .put(protected, allowedRole("admin", "manage"), updateCategory)
  .delete(protected, allowedRole("admin", "manage"), deleteCategory);

module.exports = router;
