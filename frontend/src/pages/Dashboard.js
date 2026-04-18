import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "https://ems-backend-2my3.onrender.com/api/employees/dashboard/stats",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStats(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!stats) return <p style={{ marginLeft: "240px" }}>Loading...</p>;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={styles.container}>
        <h2 style={styles.heading}>Dashboard</h2>

        {/* CARDS */}
        <div style={styles.cardContainer}>
          <div style={{ ...styles.card, background: "#2563eb" }}>
            <h4>Total Employees</h4>
            <h2>{stats.totalEmployees}</h2>
          </div>

          <div style={{ ...styles.card, background: "#1d4ed8" }}>
            <h4>Total Offices</h4>
            <h2>{stats.totalOffices}</h2>
          </div>

          <div style={{ ...styles.card, background: "green" }}>
            <h4>Working</h4>
            <h2>{stats.working}</h2>
          </div>

          <div style={{ ...styles.card, background: "red" }}>
            <h4>Retired</h4>
            <h2>{stats.retired}</h2>
          </div>
        </div>

        {/* TABLE */}
        <div style={styles.tableContainer}>
          <h3 style={{ marginBottom: "15px" }}>
            Office-wise Employees
          </h3>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Office</th>
                <th style={styles.th}>Employees</th>
              </tr>
            </thead>

            <tbody>
              {stats.officeStats.map((item, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>{item._id}</td>
                  <td style={styles.tdCenter}>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    marginLeft: "260px",
    padding: "25px",
    width: "100%",
    background: "#f1f5f9",
    minHeight: "100vh"
  },

  heading: {
    marginBottom: "20px",
    fontWeight: "600"
  },

  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "30px"
  },

  card: {
    color: "#fff",
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },

  tableContainer: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  th: {
    background: "#1e3a8a",
    color: "#fff",
    padding: "12px",
    textAlign: "left",
    fontWeight: "600"
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd"
  },

  tdCenter: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "center"
  },

  tr: {
    background: "#fff"
  }
};

export default Dashboard;
