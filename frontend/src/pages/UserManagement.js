import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useLocation } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const location = useLocation();

  // 🔑 Logged-in user (VERY IMPORTANT)
  const loggedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchUsers();
  }, [location.pathname]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= RESET PASSWORD =================
  const resetPassword = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/auth/reset-password/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert("Password reset to 123456");
    } catch (err) {
      console.error(err);
      alert("Error resetting password");
    }
  };

  // ================= DELETE USER =================
  const deleteUser = async (id) => {

    // ❌ BLOCK OWN ACCOUNT DELETE
    if (loggedUser?.id === id) {
      alert("You cannot delete your own account");
      return;
    }

    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/auth/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // ✅ Update UI instantly
      setUsers((prev) => prev.filter((u) => u._id !== id));

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.main}>
        <h2 style={styles.title}>User Management</h2>

        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Office</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => {
                const isSelf = loggedUser?.id === u._id;

                return (
                  <tr key={u._id} style={styles.row}>
                    <td>{u.name}</td>
                    <td>{u.email || "-"}</td>
                    <td>{u.mobile}</td>

                    <td>{u.officeId?.name || "-"}</td>

                    <td>
                      <span style={styles.roleBadge(u.role)}>
                        {u.role}
                      </span>
                    </td>

                    <td>
                      <button
                        style={styles.resetBtn}
                        onClick={() => resetPassword(u._id)}
                      >
                        Reset Password
                      </button>

                      <button
                        style={{
                          ...styles.resetBtn,
                          background: isSelf ? "#9ca3af" : "#dc2626",
                          marginLeft: "8px",
                          cursor: isSelf ? "not-allowed" : "pointer"
                        }}
                        onClick={() => deleteUser(u._id)}
                        disabled={isSelf} // ❌ cannot delete own account
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f1f5f9"
  },

  main: {
    marginLeft: "260px",
    padding: "30px",
    flex: 1,
    width: "100%"
  },

  title: {
    marginBottom: "20px",
    color: "#1e293b",
    fontWeight: "600"
  },

  card: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  headerRow: {
    background: "#1e3a8a",
    color: "#fff",
    textAlign: "left"
  },

  row: {
    borderBottom: "1px solid #e5e7eb"
  },

  resetBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px"
  },

  roleBadge: (role) => ({
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#fff",
    display: "inline-block",
    background:
      role === "super_admin"
        ? "#7c3aed"
        : role === "admin"
        ? "#2563eb"
        : role === "office"
        ? "#16a34a"
        : "#f59e0b"
  })
};

export default UserManagement;