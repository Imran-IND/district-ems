import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

// VALIDATION FUNCTIONS
const onlyText = (value) => /^[A-Za-z\s]*$/.test(value);
const onlyAddress = (value) => /^[A-Za-z0-9\s,.-]*$/.test(value);
const onlyNumber = (value) => /^[0-9]*$/.test(value);


const Employees = () => {


  const initialEmployeeState = {
  name: "",
  designation: "",
  dateOfJoining: "",
  dateOfRetirement: "",
  dateOfBirth: "",
  age: "",
  mobile: "",
  whatsapp: "",
  email: "",
  homeLac: "",
  residentLac: "",
  basicSalary: "",
  epicNumber: "",
  remarks: "",
  postStatus: "",
  presentStatus: "Presently working"
};


  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
 const [addEmployee, setAddEmployee] = useState(initialEmployeeState);
  const [search, setSearch] = useState("");
const [officeId, setOfficeId] = useState("");
const [page, setPage] = useState(1);
const [offices, setOffices] = useState([]);
const user = JSON.parse(localStorage.getItem("user"));
const [successMsg, setSuccessMsg] = useState("");
const [editSuccessMsg, setEditSuccessMsg] = useState("");
const [importErrors, setImportErrors] = useState([]);
const [loading, setLoading] = useState(false);
const [previewData, setPreviewData] = useState([]);
const [validEmployees, setValidEmployees] = useState([]);
const [previewErrors, setPreviewErrors] = useState([]);
const [showPreview, setShowPreview] = useState(false);


  const token = localStorage.getItem("token");

  // FETCH EMPLOYEES
 const fetchEmployees = async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/employees?search=${search}&officeId=${officeId}&page=${page}&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setEmployees(res.data.data);
  } catch (error) {
    console.log(error);
  }
};

const fetchOffices = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/offices", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setOffices(res.data);
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  fetchEmployees();
  fetchOffices();
}, [search, officeId, page]);



  // VIEW
  const handleView = (emp) => {
    setSelectedEmployee(emp);
  };
 // EDIT
  const handleEdit = (emp) => {
  setEditEmployee(emp);
};



const handleUpdate = async () => {

  // ✅ VALIDATIONS (unchanged)
  if (!editEmployee.name || !editEmployee.designation) {
    alert("Name and Designation required");
    return;
  }

  if (editEmployee.mobile.length !== 10) {
    alert("Mobile must be 10 digits");
    return;
  }

  if (editEmployee.whatsapp.length !== 10) {
    alert("Whatsapp must be 10 digits");
    return;
  }

  try {
    await axios.put(
      `http://localhost:5000/api/employees/${editEmployee._id}`,
      editEmployee,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    // Success message
    setEditSuccessMsg("Employee updated successfully");

    // wait 2 sec → close modal
    setTimeout(() => {
      setEditEmployee(null);
      setEditSuccessMsg("");
      fetchEmployees();
    }, 2000);

  } catch (error) {
    console.log(error);

    setEditSuccessMsg("Update failed ❌");

    setTimeout(() => setEditSuccessMsg(""), 3000);
  }
};


const handleAdd = () => {
  setAddEmployee(initialEmployeeState);
};


const handleCreate = async () => {
  if ((user.role === "admin" || user.role === "super_admin") && !addEmployee?.officeId) {
  alert("Please select an office");
  return;
}

  if (!addEmployee.name || !addEmployee.designation) {
    alert("Name and Designation are required");
    return;
  }

  if (!addEmployee.postStatus) {
  alert("Post Status is required");
  return;
}

  if (addEmployee.mobile.length !== 10) {
    alert("Mobile must be 10 digits");
    return;
  }

  if (!addEmployee.whatsapp || addEmployee.whatsapp.length !== 10) {
    alert("Whatsapp must be 10 digits");
    return;
  }

  try {
    await axios.post(
      "http://localhost:5000/api/employees",
      addEmployee,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    alert("Employee created successfully");

    // 🔥 RESET FORM
    setAddEmployee(initialEmployeeState);

    // 🔥 CLOSE MODAL
        setAddEmployee(initialEmployeeState);

    // 🔥 REFRESH TABLE
    fetchEmployees();

  } catch (error) {
    console.log(error);
    alert("Error creating employee");
  }
};

// export excel
const handleExport = async () => {
  const res = await axios.get(
    "http://localhost:5000/api/employees/export",
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob"
    }
  );

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "employees.xlsx");
  document.body.appendChild(link);
  link.click();
};

// ✅ SAVE PREVIEW DATA
const handleSavePreview = async () => {
  // ❌ BLOCK SAVE IF ERROR EXISTS
  if (previewErrors.length > 0) {
    setSuccessMsg("Fix Excel errors and re-upload ❌");
    setTimeout(() => setSuccessMsg(""), 3000);
    return;
  }

  try {
    await axios.post(
  "http://localhost:5000/api/employees/save-preview",
  { data: validEmployees },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setSuccessMsg("Saved successfully ✅");
    setTimeout(() => setSuccessMsg(""), 3000);

    setPreviewData([]);
    setValidEmployees([]);
    setPreviewErrors([]);

    fetchEmployees();

  } catch (err) {
    console.log(err);
    setSuccessMsg("Save failed ❌");
    setTimeout(() => setSuccessMsg(""), 3000);
  }
};

//import
// import (PREVIEW MODE)
const handleImport = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  setLoading(true);

  try {
    const res = await axios.post(
      "http://localhost:5000/api/employees/import",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    setPreviewData(res.data.previewData || []);
    setValidEmployees(res.data.validEmployees || []);
    setPreviewErrors(res.data.previewErrors || []);
    setShowPreview(true);

    setSuccessMsg("Preview loaded ✅");
    setTimeout(() => setSuccessMsg(""), 3000);

  } catch (err) {
    console.log(err);
    setSuccessMsg("Import failed ❌");
    setTimeout(() => setSuccessMsg(""), 3000);
  } finally {
    setLoading(false);
  }
};

    // ✅ STORE PREVIEW DATA
  /*  setPreviewData(res.data.previewData || []);
    setValidEmployees(res.data.validEmployees || []);
    setPreviewErrors(res.data.invalidRows || []);
    setShowPreview(true);

    // ✅ MESSAGE
    setSuccessMsg("Preview loaded successfully ✅");
    setTimeout(() => setSuccessMsg(""), 3000);

  } catch (error) {
    console.log(error.response?.data || error);

    setSuccessMsg("Import Failed ❌");
    setTimeout(() => setSuccessMsg(""), 3000);

  } finally {
    setLoading(false);
  }
};*/



const handleDownloadSample = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/employees/sample",
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "employee_sample.xlsx");
    document.body.appendChild(link);
    link.click();

  } catch (error) {
    console.log(error);
    alert("Download failed");
  }
};



  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchEmployees();
    } catch (error) {
      console.log(error);
    }
  };





  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={styles.main}>
        <h2>Employees</h2>

        {successMsg && (
  <div style={styles.successMsg}>
    {successMsg}
  </div>
)}
        

        {/* ACTION BUTTONS */}
        <div style={styles.actions}>
          <button style={styles.btn} onClick={handleAdd}>
          ➕ Add Employee
          </button>
           <label style={styles.btn}>
    📥 Import
    <input
      type="file"
      accept=".xlsx, .xls"
      style={{ display: "none" }}
      onChange={handleImport}
    />
  </label>

  <button style={styles.btn} onClick={handleExport}>
    📤 Export
  </button>
  <button style={styles.btn} onClick={handleDownloadSample}>
    📄 Sample
  </button>
        </div>
        <div style={styles.searchBox}>
  <input
    placeholder="🔍 Search by name or mobile"
    style={styles.input}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>


<div style={styles.filterBox}>
  <select
    style={styles.input}
    value={officeId}
    onChange={(e) => setOfficeId(e.target.value)}
  >
    <option value="">All Offices</option>

    {offices.map((office) => (
      <option key={office._id} value={office._id}>
        {office.name}
      </option>
    ))}
  </select>
</div>

{loading && (
  <div style={styles.loader}>
    Processing... Please wait ⏳
  </div>
)}



{importErrors.length > 0 && (
  <div style={{ marginTop: "20px" }}>
    <h3 style={{ color: "red" }}>Import Errors</h3>

    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Row</th>
          <th style={styles.th}>Reason</th>
        </tr>
      </thead>
      <tbody>
        {importErrors.map((err, i) => (
          <tr key={i}>
            <td style={styles.td}>{err.row}</td>
            <td style={styles.td}>{err.reason}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}



        {/* TABLE */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Designation</th>
              <th style={styles.th}>Mobile</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Office</th>
              <th style={styles.th}>Post Type</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp, index) => (
              <tr
                key={emp._id}
                style={index % 2 === 0 ? styles.row : styles.rowAlt}
              >
                <td style={styles.td}>{emp.name}</td>
                <td style={styles.td}>{emp.designation}</td>
                <td style={styles.td}>{emp.mobile}</td>
                <td style={styles.td}>{emp.email}</td>
                <td style={styles.td}>{emp.officeName}</td>
                <td style={styles.td}>{emp.postStatus}</td>
                <td style={styles.td}>{emp.presentStatus}</td>

               <td style={styles.td}>
                  <div style={styles.actionGroup}>
                  <button
                  style={styles.view}
                  onClick={() => handleView(emp)}
                  >
                  View
                </button>

                <button
                  style={styles.edit}
                  onClick={() => handleEdit(emp)}
                >
                  Edit
                </button>

                  <button
                  style={styles.delete}
                  onClick={() => handleDelete(emp._id)}
                  >
                  Delete
                  </button>
                  </div>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>







{/* ================= VIEW MODAL ================= */}
{selectedEmployee && (
  <div style={styles.overlay}>
    <div style={styles.modal}>
      <h2>Employee Details</h2>

      <div style={styles.grid}>
        <p><b>Name:</b> {selectedEmployee.name}</p>
        <p><b>Designation:</b> {selectedEmployee.designation}</p>
        <p><b>Gender:</b> {selectedEmployee.gender}</p>
        <p><b>Office:</b> {selectedEmployee.officeName}</p>
        <p><b>Office Address:</b> {selectedEmployee.officeAddress}</p>
        <p><b>Office LAC:</b> {selectedEmployee.officeLac}</p>

        <p><b>Date of Joining:</b> {selectedEmployee.dateOfJoining}</p>
        <p><b>Date of Retirement:</b> {selectedEmployee.dateOfRetirement}</p>
        <p><b>Date of Birth:</b> {selectedEmployee.dateOfBirth}</p>
        <p><b>Age:</b> {selectedEmployee.age}</p>

        <p><b>Mobile:</b> {selectedEmployee.mobile}</p>
        <p><b>Whatsapp:</b> {selectedEmployee.whatsapp}</p>
        <p><b>Email:</b> {selectedEmployee.email}</p>

        <p><b>Home LAC:</b> {selectedEmployee.homeLac}</p>
        <p><b>Resident LAC:</b> {selectedEmployee.residentLac}</p>

        <p><b>Salary:</b> ₹{selectedEmployee.basicSalary}</p>
        <p><b>EPIC:</b> {selectedEmployee.epicNumber}</p>
        <p><b>Remarks:</b> {selectedEmployee.remarks}</p>
        <p><b>Post Type:</b> {selectedEmployee.postStatus}</p>
        <p><b>Status:</b> {selectedEmployee.presentStatus}</p>
      </div>

      <button
        onClick={() => setSelectedEmployee(null)}
        style={styles.close}
      >
        Close
      </button>
    </div>
  </div>
)}





{/* ================= EDIT MODAL ================= */}
{editEmployee && (
  <div style={styles.overlay}>
    <div style={{ ...styles.modal, width: "850px" }}>
      <h2>Edit Employee</h2>
      {editSuccessMsg && (
  <div style={styles.successMsg}>
    {editSuccessMsg}
  </div>
)}

      {/* ================= GRID ================= */}
      <div style={styles.grid}>

        {/* NAME */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input
            style={styles.input}
            value={editEmployee.name || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[A-Za-z\s]*$/.test(val)) {
                setEditEmployee({ ...editEmployee, name: val });
              }
            }}
          />
        </div>

        {/* DESIGNATION */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Designation</label>
          <input
            style={styles.input}
            value={editEmployee.designation || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[A-Za-z\s]*$/.test(val)) {
                setEditEmployee({ ...editEmployee, designation: val });
              }
            }}
          />
        </div>

        {/* GENDER (FIXED) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Gender</label>
          <select
            style={styles.input}
            value={editEmployee.gender || ""}
            onChange={(e) =>
              setEditEmployee({
                ...editEmployee,
                gender: e.target.value   // ✅ FIXED
              })
            }
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        {/* MOBILE */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Mobile</label>
          <input
            style={styles.input}
            value={editEmployee.mobile || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[0-9]*$/.test(val) && val.length <= 10) {
                setEditEmployee({ ...editEmployee, mobile: val });
              }
            }}
          />
        </div>

        {/* WHATSAPP */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Whatsapp</label>
          <input
            style={styles.input}
            value={editEmployee.whatsapp || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[0-9]*$/.test(val) && val.length <= 10) {
                setEditEmployee({ ...editEmployee, whatsapp: val });
              }
            }}
          />
        </div>

        {/* EMAIL */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            value={editEmployee.email || ""}
            onChange={(e) =>
              setEditEmployee({ ...editEmployee, email: e.target.value })
            }
          />
        </div>

        {/* HOME LAC */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Home LAC</label>
          <input
            style={styles.input}
            value={editEmployee.homeLac || ""}
            onChange={(e) =>
              setEditEmployee({ ...editEmployee, homeLac: e.target.value })
            }
          />
        </div>

        {/* RESIDENT LAC */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Resident LAC</label>
          <input
            style={styles.input}
            value={editEmployee.residentLac || ""}
            onChange={(e) =>
              setEditEmployee({ ...editEmployee, residentLac: e.target.value })
            }
          />
        </div>

        {/* POST TYPE */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Post Type</label>
          <select
            style={styles.input}
            value={editEmployee.postStatus || ""}
            onChange={(e) =>
              setEditEmployee({
                ...editEmployee,
                postStatus: e.target.value
              })
            }
          >
            <option value="">Select</option>
            <option>Permanent</option>
            <option>Government Contractual</option>
            <option>Third-Party Contractual</option>
          </select>
        </div>

        {/* STATUS */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select
            style={styles.input}
            value={editEmployee.presentStatus || ""}
            onChange={(e) =>
              setEditEmployee({
                ...editEmployee,
                presentStatus: e.target.value
              })
            }
          >
            <option>Presently working</option>
            <option>Transferred</option>
            <option>Retired</option>
          </select>
        </div>

        {/* REMARKS */}
        <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
          <label style={styles.label}>Remarks</label>
          <input
            style={styles.input}
            value={editEmployee.remarks || ""}
            onChange={(e) =>
              setEditEmployee({ ...editEmployee, remarks: e.target.value })
            }
          />
        </div>

      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div style={styles.buttonRow}>
        <button style={styles.btn} onClick={handleUpdate}>
          Update
        </button>

        <button
          style={styles.close}
          onClick={() => setEditEmployee(null)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}









{/* ================= ADD MODAL (FULL FORM) ================= */}

{addEmployee && (
  <div style={styles.overlay}>
    <div style={{ ...styles.modal, width: "800px" }}>
      
      
      
      {(user.role === "admin" || user.role === "super_admin") && (
  <div style={styles.formGroup}>
    <label style={styles.label}>Select Office</label>
    <select
      style={styles.input}
      value={addEmployee.officeId || ""}
      onChange={(e) =>
        setAddEmployee({ ...addEmployee, officeId: e.target.value })
      }
    >
      <option value="">Select Office</option>

      {[...new Map(offices.map(o => [o.name, o])).values()].map((office) => (
        <option key={office._id} value={office._id}>
          {office.name}
        </option>
      ))}
    </select>
  </div>
)}


      <h2>Add Employee</h2>

      <div style={styles.grid}>

       <input
  style={styles.input}
  placeholder="Name"
  value={addEmployee.name || ""}
  onChange={(e) => {
    const val = e.target.value;
    if (onlyText(val)) {
      setAddEmployee({ ...addEmployee, name: val });
    }
  }}
/>

        <input
  style={styles.input}
  placeholder="Designation"
  value={addEmployee.designation || ""}
  onChange={(e) => {
    const val = e.target.value;
    if (onlyText(val)) {
      setAddEmployee({ ...addEmployee, designation: val });
    }
  }}
/>

<select
  style={styles.input}
  value={addEmployee.gender || ""}
  onChange={(e) =>
    setAddEmployee({ ...addEmployee, gender: e.target.value })
  }
>
  <option value="">Select Gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
  <option value="Other">Other</option>
</select>

      <input
  style={styles.input}
  placeholder="Office Name"
  value={addEmployee.officeName || ""}
  onChange={(e) => {
    const val = e.target.value;
    if (onlyText(val)) {
      setAddEmployee({ ...addEmployee, officeName: val });
    }
  }}
/>

      <input
  style={styles.input}
  placeholder="Office Address"
  value={addEmployee.officeAddress || ""}
  onChange={(e) => {
    const val = e.target.value;
    if (onlyAddress(val)) {
      setAddEmployee({ ...addEmployee, officeAddress: val });
    }
  }} 
/>

     { /* <input style={styles.input} placeholder="Office LAC"
          value={addEmployee.officeLac || ""}
          onChange={(e) => setAddEmployee({ ...addEmployee, officeLac: e.target.value })}
        /> */}

        <input type="date" style={styles.input}
          value={addEmployee.dateOfJoining || ""}
          onChange={(e) => setAddEmployee({ ...addEmployee, dateOfJoining: e.target.value })}
        />

        <input type="date" style={styles.input}
          value={addEmployee.dateOfRetirement || ""}
          onChange={(e) => setAddEmployee({ ...addEmployee, dateOfRetirement: e.target.value })}
        />

        <input type="date" style={styles.input}
          value={addEmployee.dateOfBirth || ""}
          onChange={(e) => setAddEmployee({ ...addEmployee, dateOfBirth: e.target.value })}
        />

      <input
  style={styles.input}
  placeholder="Age"
  value={addEmployee.age || ""}
  onChange={(e) => {
    const val = e.target.value;
    if (onlyNumber(val)) {
      setAddEmployee({ ...addEmployee, age: val });
    }
  }}
/>

       <input
  style={styles.input}
  placeholder="Mobile (10 digits)"
  value={addEmployee.mobile || ""}
  onChange={(e) => {
    const val = e.target.value;

    if (onlyNumber(val) && val.length <= 10) {
      setAddEmployee({
        ...addEmployee,
        mobile: val,
        whatsapp: val // AUTO FILL
      });
    }
  }}
/>

    <input
  style={styles.input}
  placeholder="Whatsapp (10 digits)"
  value={addEmployee.whatsapp || ""}
  onChange={(e) => {
    const val = e.target.value;
    if (onlyNumber(val) && val.length <= 10) {
      setAddEmployee({ ...addEmployee, whatsapp: val });
    }
  }}
/>

        <input style={styles.input} placeholder="Email"
          value={addEmployee.email || ""}
          onChange={(e) => setAddEmployee({ ...addEmployee, email: e.target.value })}
        />

        <input style={styles.input} placeholder="Home LAC"
          value={addEmployee.homeLac || ""}
          onChange={(e) => setAddEmployee({ ...addEmployee, homeLac: e.target.value })}
        />

        <input style={styles.input} placeholder="Resident LAC"
          value={addEmployee.residentLac || ""}
          onChange={(e) => setAddEmployee({ ...addEmployee, residentLac: e.target.value })}
        />
<input
  style={styles.input}
  placeholder="Basic Salary"
  value={addEmployee.basicSalary || ""}
  onChange={(e) => {
    const val = e.target.value;
    if (onlyNumber(val)) {
      setAddEmployee({ ...addEmployee, basicSalary: val });
    }
  }}
/>

        <input style={styles.input} placeholder="EPIC Number"
          value={addEmployee.epicNumber || ""}
          onChange={(e) => setAddEmployee({ ...addEmployee, epicNumber: e.target.value })}
        />

        <input style={styles.input} placeholder="Remarks"
          value={addEmployee.remarks || ""}
          onChange={(e) => setAddEmployee({ ...addEmployee, remarks: e.target.value })}
        />

        <select style={styles.input}
          value={addEmployee.presentStatus || "Presently working"}
          onChange={(e) => setAddEmployee({ ...addEmployee, presentStatus: e.target.value })}
        >
          <option>Presently working</option>
          <option>Transferred</option>
          <option>Retired</option>
        </select>


        <select
  style={styles.input}
  value={addEmployee.postStatus || ""}
  onChange={(e) =>
    setAddEmployee({ ...addEmployee, postStatus: e.target.value })
  }
>
  <option value="">Select Post Status</option>
  <option value="Permanent">Permanent</option>
  <option value="Government Contractual">Government Contractual</option>
  <option value="Third-Party Contractual">Third-Party Contractual</option>
</select>



      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
       <button style={styles.btn} onClick={handleCreate}>
  Create
</button>

        <button style={styles.close} onClick={() => setAddEmployee(null)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


{/* ================= PREVIEW MODAL ================= */}
{showPreview && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      
      <h2>Preview Data</h2>

     {previewErrors.length > 0 && (
  <p style={{ color: "#555", marginBottom: "10px" }}>
    🔴 Highlighted cells contain errors. Please fix your Excel file and re-upload.
  </p>
)}

      <div style={{ overflowX: "auto", maxHeight: "400px" }}>
        <table style={styles.table}>
          <thead>
            <tr>
            {Object.keys(previewData[0] || {})
  .filter(key => 
    !["officeId", "status", "errors", "rowNumber"].includes(key)
  )
  .map((key) => (
    <th key={key} style={styles.th}>{key}</th>
))}
              <th style={styles.th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {previewData.map((row, i) => {
              const errorRow = previewErrors.find(e => e.rowNumber === i + 2);

              return (
                <tr key={i}>
                  
                  {Object.keys(row)
  .filter(key => 
    !["officeId", "status", "errors", "rowNumber"].includes(key)
  )
  .map((key, idx) => {


                    const hasError = errorRow?.errors?.[key];

                    return (
                      <td
                        key={idx}
                        style={{
                          ...styles.td,
                          background: hasError ? "#ffe5e5" : "white",
                          border: hasError ? "2px solid red" : "1px solid #ddd"
                        }}
                      >
                       {typeof row[key] === "object"
  ? JSON.stringify(row[key])
  : row[key] || "-"}

                        {/* ✅ ERROR MESSAGE */}
                        {hasError && (
                          <div style={{ color: "red", fontSize: "10px", marginTop: "2px" }}>
                            {errorRow.errors[key]}
                          </div>
                        )}
                      </td>
                    );
                  })}

     {/* STATUS COLUMN */}
<td style={styles.td}>
  {errorRow ? "❌ Invalid Data" : "✅ Valid"}
</td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        
        <button
          style={{
            ...styles.btn,
            background: previewErrors.length > 0 ? "#ccc" : "#2563eb",
            cursor: previewErrors.length > 0 ? "not-allowed" : "pointer"
          }}
          disabled={previewErrors.length > 0}
          onClick={handleSavePreview}
        >
          💾 Save Valid Data
        </button>

        <button
          style={{ ...styles.btn, background: "red" }}
          onClick={() => setShowPreview(false)}
        >
          ❌ Close
        </button>

      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

// STYLES
const styles = {
  main: {
    marginLeft: "260px",
    padding: "20px",
    width: "100%"
  },

  actions: {
    marginBottom: "15px",
    display: "flex",
    gap: "10px",
    marginTop: "10px" 
  },

  btn: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },

  th: {
    background: "#1e3a8a",
    color: "#fff",
    padding: "12px",
    textAlign: "left",
    border: "1px solid #ccc"
  },

  td: {
    padding: "10px",
    border: "1px solid #ddd"
  },

  row: {
    background: "#f9fafb"
  },

  rowAlt: {
    background: "#ffffff"
  },

view: {
  background: "#0ea5e9",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
  minWidth: "60px"
},

edit: {
  background: "orange",
  border: "none",
  padding: "6px 12px",
  color: "#fff",
  cursor: "pointer",
  minWidth: "60px"
},

delete: {
  background: "red",
  border: "none",
  padding: "6px 12px",
  color: "#fff",
  cursor: "pointer",
  minWidth: "60px"
},

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "600px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "10px"
  },

  actionGroup: {
  display: "flex",
  gap: "8px",
  alignItems: "center"
},

formGroup: {
  display: "flex",
  flexDirection: "column",
  marginBottom: "10px"
},

label: {
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "4px",
  color: "#374151"
},

searchBox: {
  marginBottom: "15px",
  marginTop: "10px"
},


successMsg: {
  background: "#16a34a",
  color: "#fff",
  padding: "10px 15px",
  borderRadius: "6px",
  marginBottom: "10px",
  fontWeight: "500"
},



loader: {
  background: "#facc15",
  padding: "10px",
  borderRadius: "6px",
  marginTop: "10px",
  fontWeight: "500"
},


modalOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
},

modalContent: {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "90%",
  maxWidth: "1000px",
  maxHeight: "90%",
  overflowY: "auto"
},



  close: {
    marginTop: "15px",
    padding: "8px 12px",
    background: "red",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px"
  }
};

export default Employees;