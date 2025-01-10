const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      require: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    colors: [
      {
        type: String,
      },
    ],
    size: [
      {
        type: String,
      },
    ],
    brand: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    // subcategory: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: "SubCategory",
    // },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Count total number of reviews for the product
productSchema.virtual("totalReviews").get(function () {
  const product = this;
  return product?.reviews?.length;
});

// Virtual to count the total number of reviews for the product
productSchema.virtual("averageRating").get(function () {
  // Check if there are any reviews
  if (!this.reviews || this.reviews.length === 0) {
    return 0; // Return 0 if no reviews
  }

  // Calculate the total rating sum
  const ratingsTotal = this.reviews.reduce(
    (total, review) => total + (review?.rating || 0),
    0
  );

  // Calculate average rating
  const averageRating = (ratingsTotal / this.reviews.length).toFixed(1);

  return Number(averageRating); // Convert to number for consistency
});

// productSchema.virtual("reviews", {
//   ref: "Review",
//   localField: "_id",
//   foreignField: "product",
//   justOne: false,
// });

module.exports = mongoose.model("Product", productSchema);
