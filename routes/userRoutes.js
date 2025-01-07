const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUser,
  deleteUser,
  getUsers,
} = require("../controllers/userController");
const { authenticateToken } = require("../utils/token");
const { allowedRole, protected } = require("../controllers/authController");

router.route("/").get(getUsers);

// User Routes
// router.get("/profile", authenticateToken, getUserProfile);
router
  .route("/:id")
  .put(allowedRole(["admin"]), updateUser)
  .delete(deleteUser);

module.exports = router;
