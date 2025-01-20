const User = require("../models/UserModel");
const mongoose = require("mongoose");

// @desc Get all users
// @route GET /api/v1/users
// @assess Private
exports.getUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default limit: 10
    const page = parseInt(req.query.page) || 0; // Default page: 0 (first page)

    const totalUsers = await User.countDocuments();

    const user = await User.find()
      .limit(limit)
      .skip(page * limit)
      .select("-password");

    res.status(200).json({
      data: user,
      success: true,
      total: user.length,
      limit,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {}
};

// @desc Get user profile
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

// @desc Update profile
// @route PUT /api/v1/users/profile
// @access Privete
exports.updateProfile = async (req, res) => {
  try {
    const { user } = req;
  } catch (error) {
    res.status(500).json({
      message: "Error" + error,
    });
  }
};

// @desc Update user by id
// @route PUT/ PATCH /api/v1/users/:id
// @access Privete
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userExists = await User.findById(id);

    console.log(req.body);

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { username: req.body.username },
      { new: true }
    );

    delete user.password;

    res.status(200).json({
      message: "User updated successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "error",
    });
  }
};

// @desc Delete user
// @route DELETE /api/v1/users/:id
// @access Private
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userExists = await User.findById(id);

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "error",
    });
  }
};
