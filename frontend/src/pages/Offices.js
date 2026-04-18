import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const Offices = () => {
  const token = localStorage.getItem("token");

  const [offices, setOffices] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedRole, setSelectedRole] = useState({});

  const initialState = {
    organizationType: "",
    underBEEO: "",
    name: "",
    address: "",
    hodName: "",
    hodDesignation: "",
    hodContact: "",
    secondContact: "",
    email: "",
    lac: ""
  };

  const [form, setForm] = useState(initialState);

  // ================= FETCH =================
  const fetchOffices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/offices", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffices(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  // ================= VALIDATION =================
  const onlyText = (val) => /^[A-Za-z\s]*$/.test(val);
  const onlyNumber = (val) => /^[0-9]*$/.test(val);

  // ================= CREATE / UPDATE =================
  const handleSubmit = async () => {
    if (!form.name || !form.hodName || !form.hodContact) {
      alert("Fill required fields");
      return;
    }

    if (form.hodContact.length !== 10) {
      alert("Phone must be 10 digits");
      return;
    }

    try {
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/offices/${selectedOffice._id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("http://localhost:5000/api/offices", form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowForm(false);
      setEditMode(false);
      setViewMode(false);
      setForm(initialState);
      fetchOffices();
    } catch (err) {
      alert("Error saving office");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this office?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/offices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchOffices();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (office) => {
    setForm(office);
    setSelectedOffice(office);
    setEditMode(true);
    setViewMode(false);
    setShowForm(true);
  };

  // ================= VIEW =================
  const handleView = (office) => {
    setForm(office);
    setSelectedOffice(office);
    setViewMode(true);
    setEditMode(false);
    setShowForm(true);
  };

// create login
 const createLogin = async (officeId) => {
  const role = selectedRole[officeId];

  if (!role) {
    alert("Please select role");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    // 🔍 Check if user already exists
    const res = await axios.get(
      `http://localhost:5000/api/auth/user-by-office/${officeId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const existingUser = res.data;

    if (existingUser && existingUser._id) {
      // ✅ UPDATE ROLE (THIS IS WHAT YOU WANT)
      await axios.put(
        `http://localhost:5000/api/auth/change-role/${existingUser._id}`,
        { role },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Role updated successfully");
    } else {
      // ✅ CREATE USER (ONLY FIRST TIME)
      const email = prompt("Enter Email");

      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: "New User",
          mobile: Date.now().toString(),
          password: "123456",
          role,
          email,
          officeId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("User created successfully");
    }
  } catch (err) {
    console.log(err);
    alert("Error creating/updating user");
  }
};

  // ================= FILTER =================
  const filtered = offices.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.hodName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={styles.main}>
        <h2>Offices</h2>

        <div style={styles.topBar}>
          <button
            style={styles.addBtn}
            onClick={() => {
              setForm(initialState);
              setEditMode(false);
              setViewMode(false);
              setShowForm(true);
            }}
          >
            + Add Office
          </button>

          <input
            placeholder="Search office / HOD"
            style={styles.search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ================= MODAL ================= */}
        {showForm && (
          <div style={styles.modal}>
            <div style={styles.formBox}>
              <h3>
                {viewMode
                  ? "Office Details"
                  : editMode
                  ? "Edit Office"
                  : "Add Office"}
              </h3>

              <div style={viewMode ? styles.detailsGrid : styles.grid}>
                {viewMode ? (
                  <>
                    <p><b>Organization Type:</b> {form.organizationType}</p>
                    {form.organizationType === "LPS/MES" ? (
  <p><b>Under BEEO:</b> {form.underBEEO}</p>
) : (
  <div></div>
)}
                    <p><b>Office Name:</b> {form.name}</p>
                    <p><b>Address:</b> {form.address}</p>
                    <p><b>HOD Name:</b> {form.hodName}</p>
                    <p><b>Designation:</b> {form.hodDesignation}</p>
                    <p><b>Contact:</b> {form.hodContact}</p>
                    <p><b>Second Contact:</b> {form.secondContact || "-"}</p>
                    <p><b>Email:</b> {form.email || "-"}</p>
                    <p><b>LAC:</b> {form.lac}</p>
                  </>
                ) : (
                  <>
                    <select
                      style={styles.input}
                      value={form.organizationType}
                      onChange={(e) =>
                        setForm({ ...form, organizationType: e.target.value })
                      }
                    >
                      <option value="">Select Type</option>
                      <option>LPS/MES</option>
                      <option>High School/HS School</option>
                      <option>College</option>
                      <option>University</option>
                      <option>Central Government Office</option>
                      <option>State Government Office</option>
                      <option>Bank/PSU</option>
                      <option>State Government Institute</option>
                      <option>Central Government Institute</option>
                    </select>

                    <input
                      style={styles.input}
                      placeholder="Under BEEO"
                      value={form.underBEEO}
                      disabled={form.organizationType !== "LPS/MES"}
                      onChange={(e) =>
                        setForm({ ...form, underBEEO: e.target.value })
                      }
                    />

                    <input
                      style={styles.input}
                      placeholder="Office Name"
                      value={form.name}
                      onChange={(e) => {
                        if (onlyText(e.target.value))
                          setForm({ ...form, name: e.target.value });
                      }}
                    />

                    <input
                      style={styles.input}
                      placeholder="Address"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />

                    <input
                      style={styles.input}
                      placeholder="HOD Name"
                      value={form.hodName}
                      onChange={(e) => {
                        if (onlyText(e.target.value))
                          setForm({ ...form, hodName: e.target.value });
                      }}
                    />

                    <input
                      style={styles.input}
                      placeholder="Designation"
                      value={form.hodDesignation}
                      onChange={(e) =>
                        setForm({ ...form, hodDesignation: e.target.value })
                      }
                    />

                    <input
                      style={styles.input}
                      placeholder="Contact"
                      value={form.hodContact}
                      onChange={(e) => {
                        if (onlyNumber(e.target.value))
                          setForm({ ...form, hodContact: e.target.value });
                      }}
                    />

                    <input
                      style={styles.input}
                      placeholder="Second Contact"
                      value={form.secondContact}
                      onChange={(e) => {
                        if (onlyNumber(e.target.value))
                          setForm({ ...form, secondContact: e.target.value });
                      }}
                    />

                    <input
                      style={styles.input}
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />

                    <input
                      style={styles.input}
                      placeholder="LAC"
                      value={form.lac}
                      onChange={(e) =>
                        setForm({ ...form, lac: e.target.value })
                      }
                    />
                  </>
                )}
              </div>

              <div style={styles.actions}>
                {!viewMode && (
                  <button style={styles.save} onClick={handleSubmit}>
                    {editMode ? "Update" : "Create"}
                  </button>
                )}

                <button
                  style={styles.cancel}
                  onClick={() => {
                    setShowForm(false);
                    setViewMode(false);
                    setEditMode(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TABLE ================= */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>HOD</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>LAC</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr key={o._id}>
                <td style={styles.td}>{o.name}</td>
                <td style={styles.td}>{o.organizationType}</td>
                <td style={styles.td}>{o.hodName}</td>
                <td style={styles.td}>{o.hodContact}</td>
                <td style={styles.td}>{o.lac}</td>

                <td style={styles.td}>
                  <div style={styles.actionsCell}>
                    <button style={styles.view} onClick={() => handleView(o)}>
                      View
                    </button>
                    <button style={styles.edit} onClick={() => handleEdit(o)}>
                      Edit
                    </button>
                    <button style={styles.delete} onClick={() => handleDelete(o._id)}>
                      Delete
                    </button>
                              <select
                      value={selectedRole[o._id] || ""}
                      onChange={(e) =>
                        setSelectedRole({
                          ...selectedRole,
                          [o._id]: e.target.value
                        })
                      }
                    >
                      <option value="">Select Role</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="office">Office</option>
                      <option value="employee">Employee</option>
                    </select>

                    <button onClick={() => createLogin(o._id)}>
                      Create Login
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  main: { marginLeft: "260px", padding: "20px", width: "100%" },
  topBar: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  addBtn: { background: "#2563eb", color: "#fff", padding: "10px", border: "none" },
  search: { padding: "8px", width: "250px" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  th: { background: "#1e3a8a", color: "#fff", padding: "10px" },
  td: { padding: "10px", border: "1px solid #ddd" },
  actionsCell: { display: "flex", gap: "5px" },

  modal: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.4)", display: "flex",
    justifyContent: "center", alignItems: "center"
  },

  formBox: { background: "#fff", padding: "20px", width: "700px" },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    fontSize: "15px"
  },

  input: { padding: "8px", border: "1px solid #ccc" },

  actions: { marginTop: "15px", display: "flex", gap: "10px" },

  save: { background: "green", color: "#fff", padding: "8px" },
  cancel: { background: "red", color: "#fff", padding: "8px" },

  view: { background: "#0ea5e9", color: "#fff", padding: "5px" },
  edit: { background: "#f59e0b", color: "#fff", padding: "5px" },
  delete: { background: "#ef4444", color: "#fff", padding: "5px" }
};

export default Offices;