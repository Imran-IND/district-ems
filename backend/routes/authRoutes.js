const express = require("express");
const router = express.Router();



// Controllers
const {
  register,
  login,
  changeUserRole,
  changePassword,
  adminResetPassword,
  getAllUsers,
  resetPassword
} = require("../controllers/authController");

// Middleware
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");


// ======================
// 🔐 PUBLIC ROUTES
// ======================

// Register (Admin creates users)
router.post(
  "/register",
  verifyToken,
  authorizeRoles("super_admin", "admin"),
  register
);

// Login (User + Employee)
router.post("/login", login);



router.put(
  "/change-role/:id",
  verifyToken,
  authorizeRoles("super_admin"),
  changeUserRole
);


// ======================
// 🔐 PROTECTED ROUTES
// ======================

// Change Password (All logged-in users)
router.put("/change-password", verifyToken, changePassword);

// Admin Reset Password (Only admin / super_admin)
router.post(
  "/admin-reset-password",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  adminResetPassword
);

router.get(
  "/users",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getAllUsers
);

router.put(
  "/reset-password/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  resetPassword
);


// ✅ Get user by officeId
router.get(
  "/user-by-office/:officeId",
  verifyToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const user = await require("../models/User").findOne({
        officeId: req.params.officeId
      });

      res.json(user); // can be null if not found
    } catch (err) {
      res.status(500).json({ message: "Error fetching user" });
    }
  }
);

router.delete(
  "/users/:id",
  verifyToken,
  authorizeRoles("super_admin"),
  async (req, res) => {
    try {
      const User = require("../models/User");

      const userToDelete = await User.findById(req.params.id);

      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }

      // ❌ BLOCK deleting own account
      if (req.user.id === req.params.id) {
        return res.status(403).json({
          message: "You cannot delete your own account"
        });
      }

      // ✅ ALLOW deleting ANY role (including super_admin)
      await userToDelete.deleteOne();

      res.json({ message: "User deleted successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting user" });
    }
  }
);
module.exports = router;