const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUser,
  deleteUser,
  getUsers,
} = require("../controllers/userController");

const { protected, allowedRole } = require("../middleware/authMiddleware");

router.route("/").get(protected, getUsers);

router.route("/profile").get(protected, getUserProfile);

router
  .route("/:id")
  .put(protected, allowedRole("admin", "manage"), updateUser)
  .delete(protected, allowedRole("admin", "manage"), deleteUser);

module.exports = router;
