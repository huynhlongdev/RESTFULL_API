const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    message: {
      type: String,
      required: [true, "Please provide comment"],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please login"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
