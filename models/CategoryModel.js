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
    descriptions: {
      type: String,
      trim: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("products", {
  ref: "Product", // Model
  localField: "_id", // Field
  foreignField: "category", // Field
});

module.exports = mongoose.model("Category", categorySchema);
