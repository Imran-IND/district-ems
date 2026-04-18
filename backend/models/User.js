const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

email: {
  type: String,
  unique: true,
  sparse: true,
  lowercase: true,
  trim: true
},

  mobile: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["super_admin", "admin", "office", "employee"],
    default: "employee",
  },

  officeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Office",
    default: null
  },

  // 🔁 FORCE PASSWORD CHANGE (VERY IMPORTANT)
  mustChangePassword: {
    type: Boolean,
    default: true
  },

  // 🔒 OPTIONAL STATUS CONTROL
  isActive: {
    type: Boolean,
    default: true
  },

  isRoot: {
  type: Boolean,
  default: false
},

  // FUTURE OTP SUPPORT
  otp: String,
  otpExpiry: Date,

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);