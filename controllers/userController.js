const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");

// @desc Get all users (with pagination)
// @route GET /api/v1/users
// @assess Private
exports.getUsers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Default limit: 10
  const page = parseInt(req.query.page) || 0; // Default page: 0 (first page)

  // const totalUsers = await User.countDocuments();

  // const user = await User.find()
  //   .limit(limit)
  //   .skip(page * limit)
  //   .select("-password -wishlist");

  const [users, totalUsers] = await Promise.all([
    User.find()
      .select("-password -wishlist")
      .limit(limit)
      .skip(page * limit),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      totalUsers,
      total: totalUsers.length,
      limit,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    },
  });
});

// @desc Get current user profile
// @route GET /api/v1/users/profile
// @access Private
exports.getUserProfile = async (req, res) => {
  const { userId } = req;

  const checkUserId = mongoose.Types.ObjectId.isValid(userId);
  const user = await User.findById(userId).select("-password");

  if (!checkUserId && !user) {
    res.status(400).json({
      message: "Permission denied",
      success: false,
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

// @desc Update current user profile
// @route PUT /api/v1/users/profile
// @access Privete
exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  const { username, email } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { username, email },
    { new: true, runValidators: true, select: "-password -wishlist" }
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

// @desc Update user by id
// @route PUT/ PATCH /api/v1/users/:id
// @access Privete
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { username: req.body.username, active: req.body.active },
    { new: true, runValidators: true, select: "-password -wishlist" }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// @desc Delete user
// @route DELETE /api/v1/users/:id
// @access Private
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    message: "User deleted successfully",
    success: true,
  });
});
