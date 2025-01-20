const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.protected = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token)
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.userId = decoded?.id;
      next();
    } catch (error) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// @desc Allow for specific roles
exports.allowedRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req?.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          message: "Permission denied",
          success: false,
        });
      }

      if (!user.active) {
        return res.status(403).json({
          message: "This account is not activated.",
          success: false,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        message: "Server error",
        success: false,
      });
    }
  };
};
