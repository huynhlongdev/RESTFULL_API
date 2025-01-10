const { default: slugify } = require("slugify");
const Product = require("../models/ProductModel");

/* 
Create Product (Admin only)
@route POST /api/v1/products 
@access Private
*/
exports.createProduct = async (req, res) => {
  const { name, description, price, quantity, sold, brand, category } =
    req.body;

  try {
    const productExists = await Product.findOne({ name });

    // Check if product exists
    if (productExists) {
      return res
        .status(400)
        .json({ message: "Product already exits", success: false });
    }

    // Create slug
    const slug = slugify(name, { lower: true });

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      sold,
      brand,
      slug,
      category,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @Des Get Products List
// @route GET /api/v1/products
// @access Public
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, sort = "DESC" } = req.query;

    let query = {};
    let sortOption = {};

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Check if name query exists
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (sort) {
      const validSortValues = ["ASC", "DESC"];
      if (validSortValues.includes(sort.toUpperCase())) {
        sortOption.name = sort.toUpperCase() === "DESC" ? -1 : 1;
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid sort value. Use "ASC" or "DESC" only.`,
        });
      }
    }

    // Get total products
    const totalProducts = await Product.countDocuments(query);

    // Get products with pagination
    const products = await Product.find(query)
      .sort(sortOption) // Sort by name
      .limit(limitNumber) // limit number of products
      .skip((pageNumber - 1) * limitNumber); // Skip to the next page
    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.status(200).json({
      success: true,
      totalProducts,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @Des Get Product by ID
// @route GET /api/v1/products/:id
// @access Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: "reviews",
        select: "message rating user",
        populate: {
          path: "user", // Populate thông tin user
          select: "username email", // Chỉ lấy các trường cần thiết từ user
        },
      })
      .populate({
        path: "category",
        select: "name slug",
      });
    // Check if product exists
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product,
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
