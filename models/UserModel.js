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
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      // select: false,
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      match: [/^\+?[0-9]{7,15}$/, "Invalid phone number format"],
    },
    addresses: [
      {
        fullName: {
          type: String,
          required: [true, "Please provide a recipient name"],
          trim: true,
        },
        phone: {
          type: String,
          required: [true, "Please provide a phone number"],
          match: [/^\+?[0-9]{7,15}$/, "Invalid phone number format"],
        },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        country: { type: String, required: true },
        postalCode: { type: String },
        note: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    bio: {
      type: String,
      maxlength: [160, "Bio cannot exceed 160 characters"],
      default: "",
    },
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true, minimize: true }
);

// Hash password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
    // Hash password
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.validatePassword = async function (password) {
  // return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", function (next) {
  // Nếu có nhiều địa chỉ default, chỉ giữ lại 1
  if (this.addresses && this.addresses.length > 0) {
    let defaultFound = false;
    this.addresses = this.addresses.map((addr) => {
      if (addr.isDefault) {
        if (defaultFound) addr.isDefault = false;
        defaultFound = true;
      }
      return addr;
    });

    // Nếu không có địa chỉ default nào → chọn địa chỉ đầu tiên
    if (!defaultFound) {
      this.addresses[0].isDefault = true;
    }
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
