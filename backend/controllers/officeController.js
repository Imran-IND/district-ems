const Office = require("../models/Office");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const OfficeRequest = require("../models/OfficeRequest");
const sendEmail = require("../utils/sendEmail");


// office apply of its own
exports.applyOffice = async (req, res) => {
  try {
    const request = await OfficeRequest.create(req.body);
    res.json({ message: "Request submitted", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.approveOffice = async (req, res) => {
  try {
    const request = await OfficeRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: "Not found" });

    // 1. Create Office
    const office = await Office.create(request.toObject());

    // 2. Create Login
    const defaultPassword = "123456";   // ✅ FIXED
    const hashed = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create({
      name: office.name,
      email: request.email,
     mobile: request.hodContact || request.contact || "0000000000",
      password: hashed,
      role: "office",
      officeId: office._id,
      mustChangePassword: true   // ✅ IMPORTANT
    });

    // ✅ FIXED EMAIL (using correct variable)
    await sendEmail(
      user.email,
      "Your EMS Account Created",
      `
        <h3>Welcome to EMS</h3>
        <p>Your account has been created.</p>

        <p><b>Email:</b> ${user.email}</p>
        <p><b>Temporary Password:</b> ${defaultPassword}</p>

        <p style="color:red;">
          Please login and change your password immediately.
        </p>

        <p>Login: https://district-ems.vercel.app</p>
      `
    );

    request.status = "approved";
    await request.save();

    res.json({ message: "Approved", login: { email: user.email, password: defaultPassword } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ======================
// CREATE OFFICE + LOGIN
// ======================
exports.createOffice = async (req, res) => {
  try {
    const { name, email, hodContact } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Office email is required" });
    }

    const existingOffice = await Office.findOne({ name });
    if (existingOffice) {
      return res.status(400).json({ message: "Office already exists" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile: hodContact }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email/mobile already exists"
      });
    }

    const office = await Office.create(req.body);

    const defaultPassword = "123456";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create({
      name: office.name,
      email: email,
      mobile: hodContact,
      password: hashedPassword,
      role: "office",
      officeId: office._id,
      mustChangePassword: true
    });

    // ✅ OPTIONAL (recommended: send email here also)
    await sendEmail(
      user.email,
      "Your EMS Account Created",
      `
        <h3>Welcome to EMS</h3>

        <p><b>Email:</b> ${user.email}</p>
        <p><b>Password:</b> ${defaultPassword}</p>

        <p style="color:red;">
          Please login and change your password immediately.
        </p>

        <p>Login: https://district-ems.vercel.app</p>
      `
    );

    res.status(201).json({
      message: "Office created successfully",
      office,
      login: {
        email: user.email,
        password: defaultPassword
      }
    });

  } catch (error) {
    console.log("CREATE OFFICE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// ======================
// GET OFFICES
// ======================
exports.getOffices = async (req, res) => {
  try {
    const offices = await Office.find();
    res.json(offices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ======================
// DELETE OFFICE
// ======================
exports.deleteOffice = async (req, res) => {
  try {
    const office = await Office.findByIdAndDelete(req.params.id);

    if (!office) {
      return res.status(404).json({ message: "Office not found" });
    }

    // 🔥 ALSO DELETE USER LOGIN
    await User.deleteOne({ officeId: req.params.id });

    res.json({ message: "Office deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ======================
// UPDATE OFFICE
// ======================
exports.updateOffice = async (req, res) => {
  try {
    const updated = await Office.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};


// ======================
// GET PENDING REQUESTS
// ======================
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await OfficeRequest.find({ status: "pending" });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ======================
// REJECT OFFICE REQUEST
// ======================
exports.rejectOffice = async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await OfficeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    request.rejectionReason = reason;
    await request.save();

    // 📧 SEND EMAIL
    await sendEmail(
      request.email,
      "Your EMS Request Rejected",
      `
        <h3>Request Rejected</h3>
        <p>Your office registration request has been rejected.</p>

        <p><b>Reason:</b> ${reason}</p> 
        <p> Please Contact Admin for more Clarification.</p>
      `
    );

    res.json({ message: "Rejected successfully" });

  } catch (error) {
    console.log("REJECT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
