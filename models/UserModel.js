const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      minlength: [3, "Minimum 3 characters"],
      maxlength: [20, "Maximun 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email address"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    phone: String,
    bio: String,
    avatar: String,
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next("Password not modified");

  // Generate salt
  const salt = await bcrypt.genSalt(parseInt(process.env.SALT));

  // Hash password
  this.password = await bcrypt.hash(this.password, 10);

  next();
});

module.exports = mongoose.model("User", userSchema);
