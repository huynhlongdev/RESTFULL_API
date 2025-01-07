const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generateAccessToken, verifyRefreshToken } = require("../utils/token");

// @des Register User
// @route POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if user is the first user
    const totalUsers = await User.countDocuments();

    // Create user
    const user = new User({
      username,
      email,
      password,
      role: totalUsers === 0 ? "admin" : "user", // Set role to admin if user is the first user
    });

    // Save user
    await user.save();

    // Remove password from user object
    delete user.password;

    res.status(201).json({
      message: "User registered successfully",
      user: user,
      success: true,
      token: generateAccessToken(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @des Login User
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    delete user.password;

    res.status(200).json({
      message: "Login successful",
      token: generateAccessToken(user),
      data: user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @des Protect routes
exports.protected = async (req, res, next) => {
  let token;

  if (
    req.herders.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.splits("")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRECT);
    console.log(">>> decoded", decoded);

    req.user = await User.findById(decoded.id);
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
  next();
};

// @des Allow for specific roles
exports.allowedRole = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  };
};
