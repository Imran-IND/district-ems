const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ======================
// 🔐 REGISTER (Admin creates users)
// ======================
exports.register = async (req, res) => {
  try {
    const { name, mobile, password, role, officeId, email } = req.body;

    if (!name || !mobile || !password || !role || !email) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔍 Check email uniqueness
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
  name,
  mobile,
  email,
  password: hashedPassword,
  role,
  officeId: officeId || null   // ✅ FIXED
});

    res.status(201).json({ message: "User created", user });

  } catch (err) {
    console.log("🔥 REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// ======================
// 🔐 LOGIN (User + Employee)
// ======================
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    let user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    });

    let roleType = "user";

    // 🔍 If not found in User → check Employee
    if (!user) {
      user = await Employee.findOne({
        $or: [{ email: identifier }, { mobile: identifier }]
      });
      roleType = "employee";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🚫 OFFICE USER → ONLY EMAIL LOGIN
    if (user.role === "office_user" && user.email !== identifier) {
      return res.status(403).json({
        message: "Office users must login using Email"
      });
    }

    // 🔐 PASSWORD CHECK
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔑 TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        officeId: user.officeId,
        type: roleType
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        officeId: user.officeId,   // ✅ IMPORTANT
        mustChangePassword: user.mustChangePassword || false
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ======================
// 🔄 CHANGE PASSWORD (First Login / Manual)
// ======================
exports.changePassword = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old and new password required"
      });
    }

    let user = await User.findById(userId);

    if (!user) {
      user = await Employee.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔴 ADD THIS FIX
    if (!user.password) {
      return res.status(400).json({
        message: "Password not set for this user"
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = false;

    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    console.log("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// 🔧 ADMIN RESET PASSWORD
// ======================
exports.adminResetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    let user = await User.findById(userId);

    // 🔍 If not found in User → check Employee
    if (!user) {
      user = await Employee.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 ROLE RESTRICTIONS

    // ❌ Office user cannot reset anyone
    if (req.user.role === "office_user") {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ❌ Admin cannot reset super_admin
    if (req.user.role === "admin" && user.role === "super_admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔐 RESET PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = true; // 🔥 FORCE RESET

    await user.save();

    res.json({ message: "Password reset successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//role creation
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ BLOCK ROOT MODIFICATION
    if (user.isRoot) {
      return res.status(403).json({
        message: "Root account cannot be modified"
      });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "Role updated successfully",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating role" });
  }
};
// usermanagement
// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isRoot: { $ne: true } }) // ✅ hide root
  .populate("officeId", "name") // ✅ show office name
  .select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.findByIdAndUpdate(id, {
      password: hashedPassword,
      mustChangePassword: true
    });

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};