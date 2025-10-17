const mongoose = require("mongoose");
const { handleSlug } = require("../utils/slug");
const Product = require("../models/ProductModel");
const asyncHandler = require("express-async-handler");
const { shortContent } = require("../utils/shortContent");

/* 
Create Product (Admin only)
@route POST /api/v1/products 
@access Private
*/
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req?.userId;
  const productName = name?.trim();

  if (!productName) {
    return res.status(400).json({
      success: false,
      message: "Invalid product name.",
    });
  }

  // Create slug
  const slug = await handleSlug(productName, Product);

  // Trim and limit description to 120 words
  description && (req.body.short_description = shortContent(description, 40));
  req.body.user = userId;
  req.body.slug = slug;
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// @Des Get Products List
// @route GET /api/v1/products
// @access Public
exports.getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, sort = "DESC", status = 1 } = req.query;

  let query = {};
  let sortOption = {};

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Check if name query exists
  if (search) {
    // query.name = { $regex: search, $options: "i" };

    const words = search
      .trim()
      .split(/\s+/) // tách theo khoảng trắng
      .filter(Boolean);

    // tạo mảng regex cho từng từ (ví dụ: /oppo/i, /reno/i)
    const regexList = words.map((word) => new RegExp(word, "i"));

    // tạo query tìm các sản phẩm chứa tất cả từ khóa trong name, description hoặc brand
    query.$or = regexList.map((regex) => ({
      $or: [{ name: regex }, { description: regex }, { brand: regex }],
    }));
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

  if (parseInt(status) === 0) {
    query.isActive = true;
  }

  // Get total products
  const totalProducts = await Product.countDocuments(query);

  // Get products with pagination
  // const products = await Product.find(query)
  //   .sort(sortOption) // Sort by name
  //   .limit(limitNumber) // limit number of products
  //   .skip((pageNumber - 1) * limitNumber)
  //   .select("-metaTitle -metaDescription -reviews -category"); // Skip to the next page

  const products = await Product.aggregate([
    { $match: query },
    { $sort: sortOption },
    { $skip: (pageNumber - 1) * limitNumber },
    { $limit: limitNumber },
    {
      $lookup: {
        from: "reviews", // tên collection review (chữ thường + số nhiều)
        localField: "_id",
        foreignField: "product",
        as: "reviews",
      },
    },
    {
      $addFields: {
        totalReviews: { $size: "$reviews" },
        averageRating: {
          $cond: [
            { $gt: [{ $size: "$reviews" }, 0] },
            { $avg: "$reviews.rating" },
            0,
          ],
        },
      },
    },
    {
      $project: {
        metaTitle: 0,
        metaDescription: 0,
        reviews: 0, // ẩn toàn bộ danh sách review, chỉ giữ thống kê
        category: 0,
        user: 0,
        attributes: 0,
        description: 0,
        short_description: 0,
        variants: 0,
        specifications: 0,
      },
    },
  ]);

  // Calculate total pages
  const totalPages = Math.ceil(totalProducts / limitNumber);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      totalProducts,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
  });
});

// @Des Get Product by ID
// @route GET /api/v1/products/:id
// @access Public
exports.getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { variant } = req.query;

  // Validate ID or slug
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id }
    : { slug: id };

  const product = await Product.findOne(query)
    .populate({
      path: "reviews",
      select: "message rating user",
      populate: {
        path: "user",
        select: "username",
      },
    })
    .populate({
      path: "category",
      select: "name slug",
    });

  // Check if product exists
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // ✅ Lấy variant được chọn (nếu có)
  let selectedVariant = null;
  if (variant && mongoose.Types.ObjectId.isValid(variant)) {
    selectedVariant = product.variants.find(
      (v) => v._id.toString() === variant
    );
  }

  const variants = (product.variants || []).map((v) => ({
    id: v._id,
    sku: v.sku,
    name: `${product.name} ` + v.attributes.map((a) => a.value).join(" "),
    option1: v.attributes[0]?.value || null,
    option2: v.attributes[1]?.value || null,
    option3: v.attributes[2]?.value || null,
    price: v.price,
    original_price: v.original_price,
    inventory_status: v.inventory_status,
    images: v.images,
    selected: selectedVariant ? selectedVariant._id.equals(v._id) : false,
  }));

  // Xử lý attributes
  const attributes = product.attributes?.map((attr) => ({
    code: attr.code,
    name: attr.name,
    position: attr.position,
    values: attr.values.map((v) => ({
      label: v.label,
      value: v.value,
    })),
  }));

  // Xử lý specifications (chia nhóm như Tiki)
  const specifications = product.specifications?.map((spec) => ({
    name: spec.name,
    attributes: spec.attributes.map((a) => ({
      name: a.name,
      value: a.value,
    })),
  }));

  const response = {
    id: product._id,
    name: product.name,
    slug: product.slug,
    short_description: product.short_description,
    description: product.description,
    category: product.category,
    brand: product.brand,
    images: product.images?.map((img) => img.url) || [],
    thumbnail: product.thumbnail?.url || null,
    price: selectedVariant ? selectedVariant.price : product.price,
    original_price: selectedVariant
      ? selectedVariant.original_price
      : product.original_price,
    inventory_status: selectedVariant
      ? selectedVariant.inventory_status
      : product.quantity > 0
      ? "available"
      : "out_of_stock",
    stock_quantity: selectedVariant
      ? selectedVariant.stock_quantity
      : product.quantity,
    sold: product.sold,
    quantity: product.quantity,
    reviews: product.reviews,
    totalReviews: product.totalReviews,
    averageRating: product.averageRating,
    attributes,
    selected_variant: selectedVariant || null,
    variants,
    specifications,
    meta: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.short_description || "",
    },
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };

  console.log(product);

  res.status(200).json({
    success: true,
    data: response,
  });
});

// Update Product by ID
// route PUT/PATCH /api/v1/products/:id
// @access Private
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID format",
    });
  }

  const updateData = { ...req.body };

  // if (updateData.slug) {
  //   updateData.slug = await handleSlug(
  //     updateData.slug || updateData.name,
  //     Product
  //   );
  // }

  const updateProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updateProduct) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updateProduct,
  });
});

// Delete Product by ID
// route DELETE /api/v1/products/:id
// @access Private
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID format",
    });
  }

  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: `Product "${deletedProduct.name}" deleted successfully`,
  });
});
