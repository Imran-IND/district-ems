const express = require("express");
const router = express.Router();

// ======================
// 🔐 MIDDLEWARE
// ======================
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const uploadExcel = require("../middleware/uploadExcel");

// ======================
// 🎮 CONTROLLERS
// ======================
const {
  createEmployee,
  getAllEmployees,
  importEmployees,
  deleteEmployee,
  updateEmployee,
  downloadSampleExcel,
  exportEmployees,
  savePreviewEmployees,
  getDashboardStats,
  getEmployeesByOffice
} = require("../controllers/employeeController");

// ======================
// 🏢 DASHBOARD STATS
// ======================
router.get(
  "/dashboard/stats",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getDashboardStats
);

// ======================
// 🏢 GET EMPLOYEES BY OFFICE
// ======================
router.get(
  "/office/:officeId",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getEmployeesByOffice
);

// ======================
// 📥 DOWNLOAD SAMPLE
// ======================
router.get(
  "/sample",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  downloadSampleExcel
);

// ======================
// 📤 EXPORT
// ======================
router.get(
  "/export",
  verifyToken,
  authorizeRoles("admin", "super_admin", "office"),
  exportEmployees
);

// ======================
// 📁 IMPORT
// ======================
router.post(
  "/import",
  verifyToken,
  authorizeRoles("admin", "super_admin", "office"),
  uploadExcel.single("file"),
  importEmployees
);

// ======================
// 💾 SAVE PREVIEW
// ======================
router.post(
  "/save-preview",
  verifyToken,
  authorizeRoles("admin", "super_admin", "office"),
  savePreviewEmployees
);

// ======================
// 👨‍💼 CREATE EMPLOYEE
// ======================
router.post(
  "/",
  verifyToken,
  authorizeRoles("office", "admin", "super_admin"),
  upload.single("photo"),
  createEmployee
);

// ======================
// 📊 GET ALL EMPLOYEES (LAST ALWAYS)
// ======================
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "super_admin", "office", "employee"),
  getAllEmployees
);

// ======================
// ✏️ UPDATE
// ======================
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin", "office"),
  updateEmployee
);

// ======================
// 🗑 DELETE
// ======================
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin", "office"),
  deleteEmployee
);

module.exports = router;