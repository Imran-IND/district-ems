import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  const [pendingCount, setPendingCount] = useState(0);
  const token = localStorage.getItem("token");

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/offices/requests", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setPendingCount(data.length || 0);

    } catch (err) {
      console.log("Error fetching pending count", err);
    }
  };

  return (
    <div style={styles.sidebar}>
      
      <div>
        <h2 style={styles.logo}>EMS</h2>

        <div style={styles.userBox}>
          <p style={styles.name}>{user?.name}</p>
          <span style={styles.role}>{user?.role}</span>
        </div>

        <hr style={styles.divider} />

        <div style={styles.menu}>

          <Link to="/dashboard" style={{ ...styles.link, ...(isActive("/dashboard") && styles.active) }}>
            Dashboard
          </Link>

          <Link to="/employees" style={{ ...styles.link, ...(isActive("/employees") && styles.active) }}>
            Employees
          </Link>

          <Link to="/offices" style={{ ...styles.link, ...(isActive("/offices") && styles.active) }}>
            Offices
          </Link>

          <Link to="/users" style={{ ...styles.link, ...(isActive("/users") && styles.active) }}>
            User Management
          </Link>

          <div style={styles.linkWrapper}>
            <Link to="/approve-accounts" style={{ ...styles.link, ...(isActive("/approve-accounts") && styles.active) }}>
              Approve Accounts
            </Link>

            {pendingCount > 0 && (
              <span style={styles.badge}>
                {pendingCount}
              </span>
            )}
          </div>

        </div>
      </div>

      <button
        style={styles.logout}
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        Logout
      </button>

    </div>
  );
};

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#1e293b",
    color: "#fff",
    padding: "20px",
    position: "fixed",
    display: "flex",
    flexDirection: "column"
  },

  logo: {
    marginBottom: "10px"
  },

  userBox: {
    marginBottom: "10px"
  },

  name: {
    fontWeight: "bold",
    margin: 0
  },

  role: {
    fontSize: "12px",
    color: "#94a3b8"
  },

  divider: {
    borderColor: "#334155"
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  linkWrapper: {
    position: "relative"
  },

  link: {
    display: "block",
    padding: "10px",
    borderRadius: "6px",
    color: "#fff",
    textDecoration: "none"
  },

  active: {
    background: "#3b82f6"
  },

  badge: {
    position: "absolute",
    right: "10px",
    top: "8px",
    background: "red",
    color: "#fff",
    borderRadius: "50%",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: "bold"
  },

  logout: {
    marginTop: "100px",
    padding: "10px",
    width: "100%",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default Sidebar;