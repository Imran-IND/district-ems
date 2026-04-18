const express = require("express");
const router = express.Router();

const { 
  createOffice, 
  getOffices, 
  deleteOffice,      // ✅ ADD
  updateOffice,     // (optional but recommended)
  applyOffice,
  approveOffice,
  rejectOffice
} = require("../controllers/officeController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { getPendingRequests } = require("../controllers/officeController");

// Get pending approvals (admin only)
router.get("/requests", verifyToken, authorizeRoles("admin", "super_admin"), getPendingRequests);


// Create Office
router.post("/", verifyToken, authorizeRoles("super_admin"), createOffice);

// Get Offices
router.get("/", verifyToken, authorizeRoles("admin", "super_admin"), getOffices);

// ✅ DELETE OFFICE
router.delete("/:id", verifyToken, authorizeRoles("super_admin"), deleteOffice);

// ✅ UPDATE OFFICE (optional but recommended)
router.put("/:id", verifyToken, authorizeRoles("super_admin"), updateOffice);

router.post("/apply", applyOffice); // public

router.put(
  "/approve/:id",
  verifyToken,
  authorizeRoles("super_admin"),
  approveOffice
);


router.put("/reject/:id", verifyToken, authorizeRoles("admin", "super_admin"), rejectOffice);
module.exports = router;