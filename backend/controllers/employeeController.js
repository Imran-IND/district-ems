const Employee = require("../models/Employee");
const Office = require("../models/Office");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const xlsx = require("xlsx");

// ======================
// CREATE EMPLOYEE
// ======================
exports.createEmployee = async (req, res) => {
  try {
    const { createLogin, ...data } = req.body;

    if (!data.postStatus) {
      return res.status(400).json({ message: "Post Status is required" });
    }

    let office;

    // 🔒 OFFICE USER → only their office
    if (req.user.role === "office") {
      office = await Office.findById(req.user.officeId);
    } else {
      if (!data.officeId) {
        return res.status(400).json({ message: "Office is required" });
      }
      office = await Office.findById(data.officeId);
    }

    if (!office) {
      return res.status(404).json({ message: "Office not found" });
    }

    // ✅ SET OFFICE DETAILS
    data.officeId = office._id;
    data.officeName = office.name;
    data.officeAddress = office.address;
    data.officeLac = office.lac;

    // ✅ DUPLICATE CHECK
    const existing = await Employee.findOne({ mobile: data.mobile });
    if (existing) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    // ✅ WHATSAPP SAME
    if (data.whatsappSame) {
      data.whatsapp = data.mobile;
    }

    // ✅ IMAGE
    if (req.file) {
      data.photo = `/uploads/${req.file.filename}`;
    }

    // ✅ CREATE EMPLOYEE
    const employee = await Employee.create(data);

    // ✅ OPTIONAL LOGIN
    if (createLogin) {
      const hashedPassword = await bcrypt.hash("123456", 10);

      await User.create({
        name: employee.name,
        mobile: employee.mobile,
        email: employee.email,
        password: hashedPassword,
        role: "employee",
        officeId: employee.officeId,
        mustChangePassword: true
      });

      employee.userId = user._id;
await employee.save();
    }

    res.status(201).json(employee);

  } catch (error) {
    console.log("CREATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// GET ALL EMPLOYEES (ROLE BASED)
// ======================
exports.getAllEmployees = async (req, res) => {
  try {
    const {
      search,
      officeId,
      homeLac,
      residentLac,
      postStatus,
      presentStatus,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // 🔒 ROLE BASED FILTER
    if (req.user.role === "office") {
      query.officeId = req.user.officeId;
    }

    if (req.user.role === "employee") {
      query.userId = req.user.id;
    }

    // 🔍 SEARCH
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } }
      ];
    }

    // 🎯 FILTERS
    if (officeId) query.officeId = officeId;
    if (homeLac) query.homeLac = homeLac;
    if (residentLac) query.residentLac = residentLac;
    if (presentStatus) query.presentStatus = presentStatus;
    if (postStatus) query.postStatus = postStatus;

    const skip = (page - 1) * limit;

    const employees = await Employee.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: employees
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================
// DELETE EMPLOYEE (SECURE)
// ======================
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 🔒 OFFICE restriction
    if (
      req.user.role === "office" &&
      employee.officeId.toString() !== req.user.officeId
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({ message: "Employee deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================
// UPDATE EMPLOYEE (SECURE)
// ======================
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 🔒 OFFICE restriction
    if (
      req.user.role === "office" &&
      employee.officeId.toString() !== req.user.officeId
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================
// EXPORT EMPLOYEES
// ======================
exports.exportEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().lean();

    // ✅ ONLY REQUIRED FIELDS
    const formattedData = employees.map(emp => ({
      name: emp.name,
      designation: emp.designation,
      gender: emp.gender,
      officeName: emp.officeName,
      officeAddress: emp.officeAddress,
      officeLac: emp.officeLac,
      dateOfJoining: emp.dateOfJoining,
      dateOfRetirement: emp.dateOfRetirement,
      dateOfBirth: emp.dateOfBirth,
      age: emp.age,
      mobile: emp.mobile,
      whatsapp: emp.whatsapp,
      email: emp.email,
      homeLac: emp.homeLac,
      residentLac: emp.residentLac,
      basicSalary: emp.basicSalary,
      epicNumber: emp.epicNumber,
      remarks: emp.remarks,
      presentStatus: emp.presentStatus
    }));

    const worksheet = xlsx.utils.json_to_sheet(formattedData);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, worksheet, "Employees");

    const buffer = xlsx.write(workbook, {
      type: "buffer",
      bookType: "xlsx"
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=employees.xlsx"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ======================
// 📊 DASHBOARD STATS
// ======================
exports.getDashboardStats = async (req, res) => {
  try {
    const Employee = require("../models/Employee");
    const Office = require("../models/Office");

    const totalEmployees = await Employee.countDocuments();
    const totalOffices = await Office.countDocuments();

    const working = await Employee.countDocuments({
      presentStatus: "Presently working"
    });

    const retired = await Employee.countDocuments({
      presentStatus: "Retired"
    });

    // 🏢 Office-wise count
    const officeStats = await Employee.aggregate([
      {
        $group: {
          _id: "$officeName",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalEmployees,
      totalOffices,
      working,
      retired,
      officeStats
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ======================
// 🏢 GET EMPLOYEES BY OFFICE
// ======================
exports.getEmployeesByOffice = async (req, res) => {
  try {
    const employees = await Employee.find({
      officeId: req.params.officeId
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================
// 📁 IMPORT EMPLOYEES (TEMP SIMPLE)
// ======================
exports.importEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return res.status(400).json({ message: "No sheet found" });
    }

    const rawData = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheetName],
      { defval: "" } // ✅ IMPORTANT (prevents undefined crash)
    );

    // DB data
    const existingEmployees = await Employee.find({}, "mobile email");

    const existingMobiles = new Set(
      existingEmployees.map(emp => String(emp.mobile))
    );

    const existingEmails = new Set(
      existingEmployees.map(emp => (emp.email || "").toLowerCase())
    );

    const seenMobiles = new Set();
    const seenEmails = new Set();

   const Office = require("../models/Office");

const previewData = await Promise.all(
  rawData.map(async (row, index) => {

    let fieldErrors = {};

    const mobile = String(row.mobile || "").trim();
    const email = (row.email || "").toLowerCase().trim();
    const officeName = (row.officeName || "").trim();

    // ========================
    // BASIC VALIDATION
    // ========================
    if (!row.name) fieldErrors.name = "Missing Name";
    if (!mobile) fieldErrors.mobile = "Missing Mobile";

    // ========================
    // MOBILE DUPLICATE (EXCEL)
    // ========================
    if (seenMobiles.has(mobile)) {
      fieldErrors.mobile = "Duplicate Mobile in Excel";
    } else {
      seenMobiles.add(mobile);
    }

    // ========================
    // MOBILE DUPLICATE (DB)
    // ========================
    if (existingMobiles.has(mobile)) {
      fieldErrors.mobile = "Mobile exists in DB";
    }

    // ========================
    // EMAIL VALIDATION
    // ========================
    if (email) {
      if (seenEmails.has(email)) {
        fieldErrors.email = "Duplicate Email in Excel";
      } else {
        seenEmails.add(email);
      }

      if (existingEmails.has(email)) {
        fieldErrors.email = "Email exists in DB";
      }
    }

    // ========================
    // 🆕 OFFICE VALIDATION (VERY IMPORTANT)
    // ========================
    let office = null;

    if (!officeName) {
      fieldErrors.officeName = "Missing Office Name";
    } else {
      office = await Office.findOne({
        name: { $regex: `^${officeName}$`, $options: "i" }
      });

      if (!office) {
        fieldErrors.officeName = "Office not found";
      }
    }

    // ========================
    // FINAL STATUS
    // ========================
    return {
      ...row,
      officeId: office?._id || null, // for later save
      status: Object.keys(fieldErrors).length === 0 ? "VALID" : "INVALID",
      errors: fieldErrors,
      rowNumber: index + 2
    };
  })
);

    const validEmployees = previewData.filter(r => r.status === "VALID");
    const invalidRows = previewData.filter(r => r.status === "INVALID");

    res.json({
      previewData,
      validEmployees,
      previewErrors: invalidRows
      
    });

  } catch (error) {
    console.log("IMPORT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// ======================
// 📥 DOWNLOAD SAMPLE EXCEL (TEMP)
// ======================
exports.downloadSampleExcel = async (req, res) => {
  try {
    const sampleData = [
      {
        name: "John Doe",
        designation: "Manager",
        gender: "Male",
        officeName: "DC Office",
        officeAddress: "Cachar",
        officeLac: "Silchar",
        dateOfJoining: "2020-01-01",
        dateOfRetirement: "2040-01-01",
        dateOfBirth: "1990-01-01",
        age: 34,
        mobile: "9876543210",
        whatsapp: "9876543210",
        email: "john@gmail.com",
        homeLac: "Silchar",
        residentLac: "Silchar",
        basicSalary: 50000,
        epicNumber: "ABC1234567",
        remarks: "Good employee",
        presentStatus: "Presently working"
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, worksheet, "Sample");

    const buffer = xlsx.write(workbook, {
      type: "buffer",
      bookType: "xlsx"
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=employee_sample.xlsx"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================
// 💾 SAVE PREVIEW EMPLOYEES (TEMP)
// ======================
exports.savePreviewEmployees = async (req, res) => {
  try {
   const employees = req.body.data;

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ message: "No valid data" });
    }

    await Employee.insertMany(employees);

    res.json({ message: "Employees saved successfully" });

  } catch (error) {
    console.log("SAVE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};