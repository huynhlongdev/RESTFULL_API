const jwt = require("jsonwebtoken");

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
  );
};

// Verify token
module.exports = {
  generateAccessToken,
  // verifyToken,
};
