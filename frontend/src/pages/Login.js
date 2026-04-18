import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [isRegister, setIsRegister] = useState(false);

  // ✅ REGISTER FORM STATE (NEW)
  const [form, setForm] = useState({
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
  });

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        identifier,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login Successful");

      if (res.data.user.mustChangePassword) {
        window.location.href = "/change-password";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // ✅ basic validation
      if (!form.name || !form.hodName || !form.hodContact || !form.email) {
        alert("Please fill required fields");
        return;
      }

      if (form.organizationType === "LPS/MES" && !form.underBEEO) {
        alert("Under BEEO is required for LPS/MES");
        return;
      }

      await axios.post("http://localhost:5000/api/offices/apply", form);

      alert("Request sent for approval ✅");

      setIsRegister(false);

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed ❌");
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, width: isRegister ? "500px" : "320px" }}>

        <h2>{isRegister ? "Office Registration" : "District EMS Login"}</h2>

        {error && <p style={styles.error}>{error}</p>}

        {/* ================= LOGIN ================= */}
        {!isRegister ? (
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Email or Mobile"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={styles.input}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />

            <button type="submit" style={styles.button}>
              Login
            </button>

            <p style={styles.switchText} onClick={() => setIsRegister(true)}>
              Register Office
            </p>
          </form>
        ) : (

        /* ================= REGISTER ================= */
          <form onSubmit={handleRegister}>

            <select
              style={styles.input}
              value={form.organizationType}
              onChange={(e) =>
                setForm({ ...form, organizationType: e.target.value })
              }
              required
            >
              <option value="">Select Type</option>
              <option>LPS/MES</option>
              <option>High School/HS School</option>
              <option>College</option>
              <option>University</option>
              <option>Central Government Office</option>
              <option>State Government Office</option>
              <option>Bank/PSU</option>
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
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
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
              onChange={(e) =>
                setForm({ ...form, hodName: e.target.value })
              }
              required
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
              onChange={(e) =>
                setForm({ ...form, hodContact: e.target.value })
              }
              required
            />

            <input
              style={styles.input}
              placeholder="Second Contact"
              value={form.secondContact}
              onChange={(e) =>
                setForm({ ...form, secondContact: e.target.value })
              }
            />

            <input
              style={styles.input}
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />

            <input
              style={styles.input}
              placeholder="LAC"
              value={form.lac}
              onChange={(e) =>
                setForm({ ...form, lac: e.target.value })
              }
            />

            <button type="submit" style={styles.button}>
              Submit Request
            </button>

            <p style={styles.switchText} onClick={() => setIsRegister(false)}>
              Back to Login
            </p>
          </form>
        )}

      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f4f6f8"
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  error: {
    color: "red"
  },
  switchText: {
    marginTop: "10px",
    color: "#2563eb",
    cursor: "pointer"
  }
};

export default Login;