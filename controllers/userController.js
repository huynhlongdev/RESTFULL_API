const User = require("../models/User");

// Example: Get user profile
exports.getUserProfile = (req, res) => {
  const { user } = req;
  res
    .status(200)
    .json({ message: "User profile retrieved successfully", user });
};
