const jwt = require("jsonwebtoken");

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
  );
};

/**
 * Get token from header Authorization
 * @param {Object} req - Express request
 * @returns {String|null} token or null
 */
const getTokenFromHeader = (req) => {
  const authHeader = req?.headers?.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new Error("Token invalid/expires");
  }
};

// Export
module.exports = {
  generateAccessToken,
  verifyToken,
  getTokenFromHeader,
};
