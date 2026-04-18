import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard"; 
import Employees from "./pages/Employees";
import Offices from "./pages/Offices"; 
import UserManagement from "./pages/UserManagement";
import ApproveAccounts from "./pages/ApproveAccounts";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* ✅ ADD */}
        <Route path="/employees" element={<Employees />} />
        <Route path="/offices" element={<Offices />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/approve-accounts" element={<ApproveAccounts />} />
      </Routes>
    </Router>
  );
}

export default App;