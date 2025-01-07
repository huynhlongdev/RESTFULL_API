const Product = require("../models/ProductModel");

/* 
Create Product (Admin only)
@route POST /api/v1/products 
@access Private
*/
exports.createProduct = async (req, res) => {
  const { name, description, price, quantity, sold, brand } = req.body;

  try {
    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      sold,
      brand,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Products List
// @route GET /api/v1/products
// @access Public
exports.getProducts = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const products = await Product.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("category", "name");

    res.status(200).json({
      success: true,
      totalProduct: products.length,
      curentPage: page,
      limit: limit,
      // curentPage: Math.ceil(products.length / limit) || 1,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Product by ID
// @route GET /api/v1/products/:id
// @access Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    res.status(200).json({
      data: product,
      total: product.length,
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Product by ID
// route PUT/PATCH /api/v1/products/:id
// @access Private
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    const updateProduct = await Product.findByIdAndUpdate(req.params);
    res.status(200).json({
      message: "Product updated successfully",
      data: updateProduct,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Product by ID
// route DELETE /api/v1/products/:id
// @access Private
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    await Product.findByIdAndDelete(id);
    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
