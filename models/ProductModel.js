const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, trim: true },
  attributes: { type: Map, of: String }, // linh hoạt key:value
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  thumbnail: { type: String },
});

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  values: [{ type: String }],
});

const specificationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên nhóm: "Màn hình"
  attributes: [
    {
      name: { type: String, required: true }, // Tên thông số: "Công nghệ màn hình"
      value: { type: String, required: true }, // Giá trị: "AMOLED"
    },
  ],
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      required: [true, "Please enter a product name"],
    },
    slug: {
      type: String,
      require: true,
      lowercase: true,
      unique: true,
    },
    short_description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    description: {
      type: String,
      trim: true,
      // maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, "Sold cannot be negative"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be greater than or equal to 0"],
    },
    attributes: [attributeSchema],
    variants: [variantSchema],
    specifications: [specificationSchema],
    brand: {
      type: String,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media",
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [100, "Meta title too long"],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Meta description too long"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Count total number of reviews for the product
productSchema.virtual("totalReviews").get(function () {
  return this?.reviews?.length || 0;
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

// productSchema.index({ name: "text", description: "text", brand: "text" });

// productSchema.virtual("reviews", {
//   ref: "Review",
//   localField: "_id",
//   foreignField: "product",
//   justOne: false,
// });

module.exports = mongoose.model("Product", productSchema);
