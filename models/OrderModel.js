const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        image: {
          type: String,
        },
        price: {
          type: Number,
        },
        products: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    payment: {
      type: String,
      enum: ["cash", "credit_card", "paypal", "bank_transfer"],
      default: "cash",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "progressing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    paidAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    shippingAddress: {
      type: Object,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
