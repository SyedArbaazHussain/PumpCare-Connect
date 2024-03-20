import React from "react";
import { Link } from "react-router-dom";

const PanchayatNavbar = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigator("/");
  };

  return (
    <header>
      <h2 className="logo">PumpCare Connect</h2>
      <div className="nav">
        <nav className="navigation">
          <Link className="btnLogin-popup" to="/panchayatdashboard">
            Dashboard
          </Link>
          <Link className="btnLogin-popup" to="/panchayatsector">
            Sector
          </Link>
          <Link className="btnLogin-popup" to="/panchayatoperator">
            Operator
          </Link>
          <Link className="btnLogin-popup" to="/panchayatvillager">
            Villager
          </Link>
          <Link className="btnLogin-popup" to="/panchayatcomplaints">
            Complaints
          </Link>
          <Link className="btnLogin-popup" to="/" onClick={handleLogout}>
            Logout
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default PanchayatNavbar;
