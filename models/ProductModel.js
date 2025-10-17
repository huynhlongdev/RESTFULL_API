const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    original_price: { type: Number, min: 0 },
    inventory_status: {
      type: String,
      enum: ["available", "out_of_stock", "pre_order"],
      default: "available",
    },
    stock_quantity: { type: Number, default: 0, min: 0 },

    // 🔗 Map với attributes của product
    attributes: [
      {
        code: { type: String, required: true }, // ví dụ: color
        value: { type: String, required: true }, // ví dụ: black
        label: { type: String }, // ví dụ: Đen
      },
    ],

    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
  },
  { _id: true }
); // ✅ mỗi variant có _id riêng

const attributeSchema = new mongoose.Schema({
  code: { type: String, required: true }, // ví dụ: color
  name: { type: String, required: true }, // ví dụ: Màu sắc
  position: { type: Number, default: 0 },
  values: [
    {
      label: { type: String, required: true }, // ví dụ: Đen
      value: { type: String, required: true }, // ví dụ: black
    },
  ],
});

const specificationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ví dụ: Cấu hình chi tiết
  attributes: [
    {
      name: { type: String, required: true }, // ví dụ: Màn hình
      value: { type: String, required: true }, // ví dụ: OLED 6.7"
    },
  ],
});

const productSchema = new mongoose.Schema(
  {
    // ====== THÔNG TIN CƠ BẢN ======
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, unique: true },
    short_description: { type: String, trim: true, maxlength: 2000 },
    description: { type: String, trim: true },

    // ====== GIÁ & KHO ======
    price: { type: Number, required: true, min: 0 },
    original_price: { type: Number, min: 0 },
    discount_rate: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 0 },
    sold: { type: Number, default: 0, min: 0 },

    // ====== ATTRIBUTE - VARIANT ======
    attributes: [attributeSchema],
    variants: [variantSchema],
    specifications: [specificationSchema],

    // ====== ẢNH & DANH MỤC ======
    thumbnail: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
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

    // ====== THƯƠNG HIỆU & NGƯỜI BÁN ======
    brand: { type: String },

    // ====== REVIEW ======
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    // ====== TRẠNG THÁI & SEO ======
    status: {
      type: String,
      enum: ["draft", "pending", "public"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isFeatured: { type: Boolean, default: false },
    metaTitle: { type: String, trim: true, maxlength: 100 },
    metaDescription: { type: String, trim: true, maxlength: 300 },

    // ====== NGƯỜI TẠO ======
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
  if (!this.reviews || this.reviews.length === 0) return 0;

  // Calculate the total rating sum
  const ratingsTotal = this.reviews.reduce(
    (total, review) => total + (review?.rating || 0),
    0
  );

  // Calculate average rating
  const averageRating = (ratingsTotal / this.reviews.length).toFixed(1);

  return Number(averageRating);
});

// Giá cuối cùng (nếu không có variant)
productSchema.virtual("final_price").get(function () {
  if (this.discount_rate && this.original_price) {
    return (
      this.original_price - (this.original_price * this.discount_rate) / 100
    );
  }
  return this.price;
});

module.exports = mongoose.model("Product", productSchema);
