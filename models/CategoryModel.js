const mongoose = require("mongoose");

// Define Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a category name"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Please enter a category slug"],
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
    },
    desctions: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
