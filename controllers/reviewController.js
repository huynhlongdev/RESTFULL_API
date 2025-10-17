const mongoose = require("mongoose");
const Review = require("../models/ReviewModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const Order = require("../models/OrderModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

// @des Create new review with product
// @router POST /api/v1/review/
// @access Private
exports.createReview = asyncHandler(async (req, res) => {
  const { rating, message } = req.body;
  const { id } = req.params;
  const userId = req?.userId;

  if (!rating && !message && !userId && !id) {
    return res.status(400).json({
      message: "The fields invalid",
      success: false,
    });
  }

  // 3️⃣ Tìm user và product
  const [user, product] = await Promise.all([
    User.findById(userId),
    Product.findById(id),
  ]);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  console.log(user);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // 4️⃣ Kiểm tra user có đơn hàng chứa sản phẩm này không
  const hasPurchased = await Order.exists({
    user: userId,
    "items.product": id,
    status: { $in: ["completed", "delivered"] },
  });

  // if (!hasPurchased && user.role != "admin") {
  if (!hasPurchased) {
    // return res.status(403).json({
    //   success: false,
    //   message: "You can only review products you have purchased",
    // });
    // throw new Error("You can only review products you have purchased");
    throw new ApiError(403, "You can only review products you have purchased");
  }

  // Kiểm tra user đã review sản phẩm này chưa (chỉ cho 1 review)
  const existingReview = await Review.findOne({
    product: id,
    user: userId,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this product",
    });
  }

  // Create a new review
  const review = await Review.create({
    product: product._id,
    user: user._id,
    rating,
    message,
  });

  // Push review id to product
  product.reviews.push(review._id);
  await product.save();

  // Cập nhật lại average rating
  const reviews = await Review.find({ product: id });
  const avgRating =
    reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

  product.averageRating = Number(avgRating.toFixed(1));
  await product.save();

  return res.status(200).json({
    message: "Review created successfully",
    success: true,
    data: {
      review,
      averageRating: product.averageRating,
    },
  });
});

// @des Delete review
// @route DELETE /api/v1/reviews/:id
// @access Private Admin/ Manager
exports.deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req?.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid review ID format",
    });
  }

  const review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  console.log(review.user.toString(), userId.toString());

  if (review.user.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this review",
    });
  }

  await review.deleteOne();

  return res.status(200).json({
    success: true,
    message: `Review deleted successfully`,
  });
});
