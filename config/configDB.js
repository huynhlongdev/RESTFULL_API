// Import the mongoose module
const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log("Failed to connect to MongoDB", err);
    });
};

// Export the connectDB function
module.exports = connectDB;
