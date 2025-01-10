const mongoose = require("mongoose");
const slugify = require("slugify");
const CategoryModel = require("../models/CategoryModel");
const { handleSlug } = require("../utils/slug");

// @des Create category
// @route POST / api.v1/categories
// @access Private / Admin/ Manager
exports.createCategory = async (req, res) => {
  const { name, descriptions } = req.body;
  try {
    const categoryExists = await CategoryModel.findOne({ name });

    // check if category exists
    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const slug = handleSlug(name);

    // Create category
    const category = await CategoryModel.create({
      name,
      descriptions,
      slug,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @des Get all category
// @route GET / api.v1/categories
// @access Public
exports.getCategories = async (req, res) => {
  try {
    const {
      ids,
      showProduct = 0,
      page = 1,
      limit = 10,
      sort = "DESC",
    } = req.query;

    let query = {};

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Check if exist list ids
    if (ids) {
      const idList = ids
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (idList.length > 0) {
        query._id = { $in: idList };
      } else {
        return res.status(400).json({
          success: false,
          message: "No valid category IDs provided",
        });
      }
    }

    // Query data
    // Limit data
    // Skip data
    // Sort data
    let categoriesQuery = CategoryModel.find(query)
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .sort({ createdAt: sort === "ASC" ? 1 : -1 });

    // Check if show product == 1
    if (parseInt(showProduct) === 1) {
      categoriesQuery = categoriesQuery.populate("products");
    }

    // Calculate total pages
    const totalCategories = await CategoryModel.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / limitNumber);

    // Execute query
    const categories = await categoriesQuery;

    return res.status(200).json({
      success: true,
      totalCategories,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// @des Get category
// @route GET / api.v1/categories/:id
// @access Public
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { showProduct = 0 } = req.query;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { slug: id };

    // Build query
    let categoryQuery = CategoryModel.findOne(query);

    // Populate products if requested
    if (parseInt(showProduct) === 1) {
      categoryQuery = categoryQuery.populate("products");
    }

    const category = await categoryQuery;

    if (!category) {
      // Check if category exists
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// @des Update category
// @route PUT /api/v1/categories/:id
// @access Private Admin/ Manager
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const categoryExists = await CategoryModel.findById(id);
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found" });
    }

    const slug = handleSlug(nareq.body?.name);

    //
    const duplicateCategory = await CategoryModel.findOne({
      _id: { $ne: id },
      $or: [{ name: name }, { slug: slug }],
    });

    // Check if category exist
    if (duplicateCategory) {
      return res.status(400).json({
        success: false,
        message: "Category name or slug already exists",
      });
    }

    // Add slug to req body
    req.body.slug = slug;

    // Update category
    const category = await CategoryModel.findByIdAndUpdate(
      categoryExists.id,
      req.body,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @des Delete category
// @route DELETE /api/v1/categories/:id
// @access Private Admin/ Manager
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryExists = await CategoryModel.findById(id);
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found" });
    }
    await CategoryModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
