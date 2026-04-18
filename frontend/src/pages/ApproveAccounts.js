import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar"; // ✅ ADD THIS

const ApproveAccounts = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/offices/requests",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRequests(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const approve = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/offices/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Approved ✅");
      fetchRequests();
    } catch (err) {
      alert("Error approving ❌");
    }
  };

  const reject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await axios.put(
        `http://localhost:5000/api/offices/reject/${id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Rejected ❌");
      fetchRequests();
    } catch (err) {
      alert("Error rejecting ❌");
    }
  };

  // ✅ ONLY WRAPPER ADDED HERE
  return (
    <div style={{ display: "flex" }}>
      
      <Sidebar />

      <div style={styles.page}>
        <h2>Approve Accounts</h2>

        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.header}>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r._id} style={styles.row}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.hodContact}</td>

                  <td>
                    <span style={styles.status(r.status)}>
                      {r.status || "pending"}
                    </span>
                  </td>

                  <td>
                    <button
                      style={styles.view}
                      onClick={() => setSelected(r)}
                    >
                      View
                    </button>

                    {r.status === "pending" && (
                      <>
                        <button
                          style={styles.approve}
                          onClick={() => approve(r._id)}
                        >
                          Approve
                        </button>

                        <button
                          style={styles.reject}
                          onClick={() => reject(r._id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VIEW MODAL */}
        {selected && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3>Office Details</h3>

              <div style={styles.details}>
                {Object.entries(selected).map(([key, value]) => {
                  if (["_id", "__v"].includes(key)) return null;

                  return (
                    <div key={key} style={styles.detailRow}>
                      <b>{key}:</b> {value || "-"}
                    </div>
                  );
                })}
              </div>

              <button
                style={styles.close}
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

const styles = {
  page: {
    marginLeft: "260px", // ✅ match dashboard
    padding: "20px",
    background: "#f1f5f9",
    minHeight: "100vh",
    width: "100%"
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  header: {
    background: "#1e3a8a",
    color: "#fff",
    textAlign: "left"
  },

  row: {
    borderBottom: "1px solid #ddd"
  },

  status: (status) => ({
    padding: "4px 10px",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "12px",
    background:
      status === "approved"
        ? "#16a34a"
        : status === "rejected"
        ? "#dc2626"
        : "#f59e0b"
  }),

  view: {
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    marginRight: "5px",
    borderRadius: "5px",
    cursor: "pointer"
  },

  approve: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    marginRight: "5px",
    borderRadius: "5px",
    cursor: "pointer"
  },

  reject: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer"
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
    alignItems: "center"
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "450px",
    maxHeight: "80vh",
    overflowY: "auto"
  },

  details: {
    marginTop: "10px"
  },

  detailRow: {
    marginBottom: "5px"
  },

  close: {
    marginTop: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default ApproveAccounts;