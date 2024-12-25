const Product = require("../models/Product");

// Create Product (Admin only)
exports.createProduct = async (req, res) => {
  const { name, description, price, category, tags, attributes } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      category,
      tags,
      attributes,
    });
    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("tags", "name");
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
