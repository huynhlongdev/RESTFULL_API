const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0, // Minimum discount value
      max: 100, // Maximum discount value (if it's a percentage)
    },
    usageLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// couponSchema.virtual("status").get(function () {
//   const now = new Date(); // Lấy thời gian hiện tại
//   if (this.usedCount >= this.usageLimit) {
//     return "expired"; // Hết hạn do đạt giới hạn sử dụng
//   } else if (now < this.startDate) {
//     return "not_started"; // Chưa bắt đầu
//   } else if (now > this.endDate) {
//     return "expired"; // Hết hạn do quá thời gian
//   } else {
//     return "active"; // Coupon còn hiệu lực
//   }
// });

module.exports = mongoose.model("Coupon", couponSchema);
