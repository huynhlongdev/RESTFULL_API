const User = require("../models/UserModel");

// @des Get all users
// @route GET /api/v1/users
// @assess Private
exports.getUsers = async (req, res) => {
  try {
    // Set default limit and page values
    const limit = parseInt(req.query.limit) || 10; // Default limit: 10
    const page = parseInt(req.query.page) || 0; // Default page: 0 (first page)

    const totalUsers = await User.countDocuments();

    const user = await User.find()
      .limit(limit)
      .skip(page * limit);
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

// @des Get user profile
// @route GET /api/v1/users/profile
// @access Private
exports.getUserProfile = (req, res) => {
  const { user } = req;
  res
    .status(200)
    .json({ message: "User profile retrieved successfully", user });
};

// @des Update profile
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

// @des Update user by id
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

// @des Delete user
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
