const mongoose = require("mongoose");

const officeRequestSchema = new mongoose.Schema({
  organizationType: String,
  underBEEO: String,
  name: String,
  address: String,
  hodName: String,
  hodDesignation: String,
  hodContact: String,
  email: String,
  lac: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },


rejectionReason: {
  type: String,
  default: ""
},
}, { timestamps: true });




module.exports = mongoose.model("OfficeRequest", officeRequestSchema);