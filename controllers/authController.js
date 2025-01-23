const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/token");
const { handleEmail } = require("../utils/handleEmail");

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
      return res
        .status(400)
        .json({ message: "User already exists", success: false });

      // throw new Error("User already exists");
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

    const token = generateAccessToken(user);

    // Create a URL to reset password
    const resetUrl = `${link}/?token=${token}`;

    const emailStatus = await handleEmail("reset", user.email, resetUrl);
    // check sent mail success
    if (!emailStatus.success) {
      return res.status(500).json({
        message: "Failed to send email",
      });
    }

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      token,
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
      return res.status(400).json({ message: "Incorrect password" });

    // Remove password from user object
    const userObject = user.toObject();
    delete userObject.password;

    const token = generateAccessToken(user);

    res.cookie("accessToken", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 6 * 1000),
    });

    res.status(200).json({
      message: "Login successfully",
      success: true,
      token,
      user: userObject,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Forgot the password
// @router POST /api/v1/auth/forgot-password
// @access public
exports.forgotPassword = async (req, res) => {
  try {
    const { email, link } = req.body;

    const userFound = await User.findOne({ email });

    // Check user exist
    if (!userFound) {
      // return res.json({ message: "User not found", success: false });
      throw new Error("User not found");
    }

    // Create a token to reset, expires in 10 minutes
    const resetToken = jwt.sign(
      { id: userFound._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10m",
      }
    );

    // Save token & Expire time
    userFound.resetPasswordToken = resetToken;
    userFound.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10m
    await userFound.save();

    // Create a URL to reset password
    const resetUrl = `${link}/?token=${resetToken}`;

    const emailStatus = await handleEmail("reset", userFound.email, resetUrl);
    // check sent mail success
    if (!emailStatus.success) {
      return res.status(500).json({
        message: "Failed to send email",
      });
    }

    res.status(200).json({
      message: "Send mail successfully",
      resetUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const userFound = await User.findOne({
      _id: decodedToken.id,
      resetPasswordToken: token,
    });

    // Check user exist
    if (!userFound) {
      return res
        .status(401)
        .json({ error: "Invalid or expired password reset token" });
    }

    const resetPasswordExpire = new Date(userFound.resetPasswordExpire);

    if (resetPasswordExpire.getTime() < Date.now()) {
      return res.status(400).json({
        message: "Reset token has expired",
      });
    }

    // update user
    userFound.password = req.body.password;
    userFound.resetPasswordToken = undefined;
    userFound.resetPasswordExpire = undefined;

    await userFound.save();

    return res
      .status(200)
      .json({ message: "Update the password successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.activeUser = async (req, res, next) => {
  try {
    const { link } = req.body;
    // const resetUrl = `${link}/?token=${resetToken}`;
  } catch (error) {}
};
