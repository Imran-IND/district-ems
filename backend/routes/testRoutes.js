const express = require("express");
const router = express.Router();

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Only logged in users
router.get("/user", verifyToken, (req, res) => {
  res.json({ message: "User access granted", user: req.user });
});

// Only admin or super_admin
router.get("/admin", verifyToken, authorizeRoles("admin", "super_admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

// Only super_admin
router.get("/super", verifyToken, authorizeRoles("super_admin"), (req, res) => {
  res.json({ message: "Super Admin access granted" });
});

module.exports = router;