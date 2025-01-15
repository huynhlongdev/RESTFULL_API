const ReviewModel = require("../models/ReviewModel");
const Product = require("../models/ProductModel");

// @des Create new review with product
// @router POST /api/v1/review/
// @access Private
exports.createReview = async (req, res) => {
  try {
    const { rating, message, user } = req.body;
    const { productID } = req.params;

    req.body.product = productID;

    const productExists = await Product.findById(productID);

    if (!productExists) {
      return res.status(400).json({
        message: "Product not found with id " + productID,
        success: false,
      });
    }

    // Create a new review
    const review = await ReviewModel.create(req.body);

    // Push review id to product
    productExists.reviews.push(review._id);
    await productExists.save();

    return res.status(200).json({
      message: "Review created successfully",
      data: review,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
