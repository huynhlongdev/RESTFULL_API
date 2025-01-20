const ReviewModel = require("../models/ReviewModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");

// @des Create new review with product
// @router POST /api/v1/review/
// @access Private
exports.createReview = async (req, res) => {
  try {
    const { rating, message } = req.body;
    const { productID } = req.params;
    const userId = req?.userId;

    if (!rating && !message && !userId && !productID) {
      return res.status(400).json({
        message: "The fields invalid",
        success: false,
      });
    }

    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.status(400).json({
        message: "User not found with id " + userFound.id,
        success: false,
      });
    }

    const productExists = await Product.findById(productID);

    if (!productExists) {
      return res.status(400).json({
        message: "Product not found with id " + productID,
        success: false,
      });
    }

    // // Create a new review
    req.body.product = productExists.id;
    req.body.user = userFound.id;

    console.log(req.body);

    const review = await ReviewModel.create(req.body);

    // // Push review id to product
    productExists.reviews.push(review._id);
    await productExists.save();

    return res.status(200).json({
      message: "Review created successfully",
      // data: review,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
