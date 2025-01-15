const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generateAccessToken, verifyToken } = require("../utils/token");

/**
 * Description: Register user
 * Route: /api/v1/auth/register
 * Method: POST
 * Body: {username, email, password}
 * Access: Public
 */
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // valid field
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Required fields" });
    }

    // Check if user is the first user
    const totalUsers = await User.countDocuments();

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: totalUsers === 0 ? "admin" : "user", // Set role to admin if user is the first user
    });

    // Remove password from user object
    delete user.password;

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      token: generateAccessToken(user),
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Description: Login User
 * Route: /api/v1/auth/login
 * Method: POST
 * Body: {email, password}
 * Access: Public
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Remove password from user object
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      message: "Login successful",
      success: true,
      token: generateAccessToken(user),
      user: userObject,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
