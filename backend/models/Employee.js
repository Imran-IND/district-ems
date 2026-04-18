const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({

  // Basic Info
  name: {
    type: String,
    required: true,
    match: [/^[A-Za-z\s]+$/, "Name should not contain symbols"]
  },

  designation: {
    type: String,
    required: true,
    match: [/^[A-Za-z\s]+$/, "Designation should not contain symbols"]
  },

  gender: {
  type: String,
  enum: ["Male", "Female", "Other"],
  required: true
},

  // Office Link
  officeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Office",
    required: true
  },

  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null
},

  // Auto-filled fields (from office)
  officeName: String,
  officeAddress: String,
  officeLac: String,

  // Dates
  dateOfJoining: String,
  dateOfRetirement: String,
  dateOfBirth: String,

  // Age
  age: {
    type: Number,
    required: true
  },

  // Contact
  mobile: {
    type: String,
    required: true,
    unique: true
  },

  whatsapp: {
    type: String,
    required: true
  },

  email: String,

  // LAC
  homeLac: {
    type: String,
    required: true
  },

  residentLac: {
    type: String,
    required: true
  },

  // Salary
  basicSalary: Number,

  // EPIC
  epicNumber: String,

  // Remarks
  remarks: String,
  

  //post status
  postStatus: {
  type: String,
  enum: ["Permanent", "Government Contractual", "Third-Party Contractual"],
  required: true
},

  // Status
  presentStatus: {
    type: String,
    enum: ["Presently working", "Transferred", "Retired"],
    required: true
  },

  // Photo (optional)
  photo: {
    type: String // will store file path later
  },
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);