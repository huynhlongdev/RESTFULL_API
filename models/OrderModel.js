const mongosee = require("mongoose");

const orderSchema = new mongosee.Schema(
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
          type: mongosee.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    payment: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "progressing", "shipped", "delivery"],
    },
    user: {
      type: mongosee.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paidAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongosee.model("Order", orderSchema);
