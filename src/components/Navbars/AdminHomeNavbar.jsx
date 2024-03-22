/** @format */

import React from "react";
import { Link } from "react-router-dom";

function AdminHomeNavbar() {
  return (
    <header>
      <h2 className="logo">PumpCare Connect</h2>
      <div className="nav">
        <nav className="navigation">
          <Link className="btnLogin-popup" to="/">
            Home
          </Link>
          <Link className="btnLogin-popup" to="/admin-login">
            Admin Login
          </Link>
          <Link className="btnLogin-popup" to="/admin-signup">
            Admin Signup
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default AdminHomeNavbar;
