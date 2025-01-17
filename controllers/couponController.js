const mongoose = require("mongoose");
const couponModel = require("../models/CouponModel");

function isValidDate(date) {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

// Function to check the validity of startDate and endDate
function validateCouponDates(startDate, endDate) {
  // Check if both startDate and endDate are provided and valid
  if (!startDate || !endDate) {
    throw new Error("Both startDate and endDate are required.");
  }

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    throw new Error("Invalid date format for startDate or endDate.");
  }

  // Convert strings to Date objects if they are valid
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if endDate is later than startDate
  if (start >= end) {
    throw new Error("endDate must be later than startDate.");
  }

  return { start, end }; // Return the parsed Date objects if valid
}

exports.createCoupon = async (req, res, next) => {
  try {
    const { code, startDate, endDate, discount, usageLimit, usedCount } =
      req.body;

    if (!code || !startDate || !endDate || !discount) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: code, startDate, endDate, or discount.",
      });
    }

    const { start, end } = validateCouponDates(startDate, endDate);
    // const startDateInput = new Date(`${startDate}T00:00:00`);
    // const endDateInput = new Date(`${endDate}T23:59:59`);

    // console.log(startDateInput, endDateInput);

    const couponFound = await couponModel.findOne({
      code: code,
    });

    if (couponFound) {
      return res.status(400).json({
        success: false,
        message: "Coupon already exists.",
      });
    }

    const coupon = await couponModel.create({
      code,
      startDate: start,
      endDate: end,
      discount,
      usageLimit,
      usedCount,
    });

    return res.status(200).json({
      message: "Create successfully",
      success: true,
      data: coupon,
    });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the coupon.",
      error: error.message,
    });
  }
};

exports.getAllCoupon = async (req, res, next) => {
  try {
    const coupon = await couponModel.find();

    return res.status(200).json({
      data: coupon,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCoupon = async (req, res, next) => {
  try {
    const { code } = req.params;
    const coupon = await couponModel.findOne({
      code: code,
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon not exists.",
      });
    }

    return res.status(200).json({
      data: coupon,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @Desc Update coupon
// @router PUT /api/v1/coupon/:code
// @access Private Admin/ Manage
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await couponModel.findOne({
      code: req.params.code,
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon not exists.",
      });
    }

    const { start, end } = validateCouponDates(
      req.body?.startDate,
      req.body?.endDate
    );

    req.body.startDate = start;
    req.body.endDate = end;

    const updateCoupon = await couponModel.findByIdAndUpdate(
      coupon.id,
      req.body,
      { new: true }
    );

    return res.status(200).json({
      message: "Coupon updated successfully",
      success: true,
      data: updateCoupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @Desc Delete coupon
// @router DELETE /api/v1/coupon/:code
// @access Private Admin/ Manage
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { code } = req.params;
    const coupon = await couponModel.findOne({
      code: code,
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon not exists.",
      });
    }

    await couponModel.findOneAndDelete({
      code: code,
    });

    return res.status(200).json({
      message: "Coupon deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
