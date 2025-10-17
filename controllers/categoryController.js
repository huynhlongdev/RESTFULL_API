const mongoose = require("mongoose");
const Category = require("../models/CategoryModel");
const { handleSlug } = require("../utils/slug");
const asyncHandler = require("express-async-handler");

// @des Create category
// @route POST / api.v1/categories
// @access Private / Admin/ Manager
exports.createCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    image,
    parentCategory,
    metaTitle,
    metaDescription,
  } = req.body;

  const userId = req?.userId;

  // Validate input
  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Category name is required and must be at least 2 characters.",
    });
  }

  const slug = await handleSlug(name, Category);

  // Check for duplicate category (by name or slug)
  const categoryExists = await Category.findOne({
    $or: [{ name: name?.trim() }, { slug }],
  });

  // check if category exists
  if (categoryExists) {
    return res.status(400).json({
      message: "Category already exists",
      success: false,
    });
  }

  // ✅ Validate parentCategory if provided
  let parent = null;
  if (parentCategory) {
    parent = await Category.findById(parentCategory);
    if (!parent) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent category ID.",
      });
    }
  }

  // Create category
  const category = await Category.create({
    name: name.trim(),
    description: description?.trim() || "",
    slug,
    image,
    parentCategory: parent ? parent._id : null,
    metaTitle: metaTitle?.trim() || name,
    metaDescription: metaDescription?.trim() || description || "",
    user: userId,
  });

  return res.status(201).json({
    success: true,
    message: "Category created successfully.",
    data: category,
  });
});

// @des Get all category
// @route GET / api.v1/categories
// @access Public
exports.getCategories = asyncHandler(async (req, res) => {
  const {
    ids,
    parentId,
    includeChildren = 0,
    showProduct = 0,
    page = 1,
    limit = 10,
    sort = "DESC",
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const sortOrder = sort.toUpperCase() === "ASC" ? 1 : -1;

  let query = {};

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

  // If parentId provided -> query children of that parent
  if (parentId) {
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid parentId" });
    }
    query.parentCategory = parentId;
  } else {
    query.parentCategory = null;
  }

  const doPopulateChildren = parseInt(includeChildren, 10) === 1;

  const populateFields = [
    { path: "image", select: "url -_id" }, // always populate image
  ];

  // Execute queries in parallel
  const [categories, total] = await Promise.all([
    Category.find(query)
      .populate(populateFields)
      .sort({ createdAt: sortOrder })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean(),
    Category.countDocuments(query),
  ]);

  // If includeChildren requested but schema doesn't have virtual 'children',
  // you can populate manually here (additional query).
  if (doPopulateChildren && categories.length > 0) {
    // Try virtual populate first (works if schema.virtual('children', ...) exists)
    try {
      // reload categories with children populated
      const ids = categories.map((c) => c._id);
      const categoriesWithChildren = await Category.find({ _id: { $in: ids } })
        .populate(populateFields)
        .populate({ path: "children" }) // virtual must be defined in schema
        .sort({ createdAt: sortOrder })
        .lean();
      // replace result
      // maintain pagination slice by mapping
      const mapById = new Map(
        categoriesWithChildren.map((c) => [String(c._id), c])
      );
      for (let i = 0; i < categories.length; i++) {
        const key = String(categories[i]._id);
        if (mapById.has(key))
          categories[i].children = mapById.get(key).children || [];
      }
    } catch (err) {
      // fallback: manual children lookup per category (still safe)
      await Promise.all(
        categories.map(async (cat) => {
          const children = await Category.find({
            parentCategory: cat._id,
          }).lean();
          cat.children = children;
        })
      );
    }
  }

  return res.status(200).json({
    success: true,
    data: categories,
    pagination: {
      totalCategories: total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      limit: limitNumber,
    },
  });
});

// @des Get category
// @route GET / api.v1/categories/:id
// @access Public
exports.getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { showProduct = 1, children } = req.query;

  // Determine query condition: support both ObjectId and slug
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { _id: id } : { slug: id };

  // Build base query
  const populateFields = [{ path: "image", select: "url -_id" }];

  if (parseInt(showProduct) === 1) {
    populateFields.push({ path: "products" });
  }

  if (parseInt(children) === 1) {
    populateFields.push({
      path: "children",
      select: "-metaTitle -description -metaDescription ",
      populate: { path: "image", select: "url -_id" },
    });
  }

  const category = await Category.findOne(query).populate(populateFields);

  // Check if the category exists.
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: category,
  });
});

// @des Update category
// @route PUT /api/v1/categories/:id
// @access Private Admin/ Manager
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const categoryExists = await Category.findById(id);
    if (!categoryExists) {
      return res.status(400).json({
        message: "Category not found",
        success: false,
      });
    }

    console.log(categoryExists);

    const slug = await handleSlug(req.body?.name, Category);

    //
    const duplicateCategory = await Category.findOne({
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
    const category = await Category.findByIdAndUpdate(
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
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// @des Delete category
// @route DELETE /api/v1/categories/:id
// @access Private Admin/ Manager
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID format",
    });
  }

  const category = await Category.findById(id).lean();

  if (!category) {
    return res.status(404).json({
      message: "Category not found",
      success: false,
    });
  }

  await Category.deleteOne({ _id: id });
  return res.status(200).json({
    success: true,
    message: `Category '${category.name}' deleted successfully`,
    data: {
      id,
      name: category.name,
      deletedAt: new Date(),
    },
  });
});
