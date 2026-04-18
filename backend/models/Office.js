const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema({

  // Organization Type
  organizationType: {
    type: String,
    enum: [
      "LPS/MES",
      "High School/HS School",
      "College",
      "University",
      "Central Institute",
      "NIT",
      "Central Government Office",
      "State Government Office",
      "Bank/PSU",
      "State Government Institute",
      "Central Government Institute"
    ],
    required: true
  },

  // Only for LPS/MES
  underBEEO: {
    type: String,
    default: null
  },

  // Name
  name: {
    type: String,
    required: true
  },

  // Address
  address: {
    type: String,
    required: true
  },

  // HOD / HOI Details
  hodName: {
    type: String,
    required: true
  },

  hodDesignation: {
    type: String,
    required: true
  },

  // Contact Numbers
  hodContact: {
    type: String,
    required: true
  },

  secondContact: {
    type: String
  },

  // Email
  email: {
    type: String
  },

  // LAC
  lac: {
    type: String,
    required: true
  },

  // Created By
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Office", officeSchema);