const mongoose = require("mongoose");

const mediaSchema = mongoose.Schema(
  {
    url: {
      type: String,
      require: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", mediaSchema);
