import React from "react";
import AdminNavbar from "../../components/Navbars/AdminNavbar";

function Admin() {
  return (
    <div className="App">
      <AdminNavbar />
      <main>
        <div className="wrapper">
          <div className="formh2">Welcome to our Dashboard</div>
          <div className="input-box">
            <input type="text" id="username" name="username" required />
            <label htmlFor="username">Username</label>
          </div>
          <div className="input-box">
            <input type="password" id="password" name="password" required />
            <label htmlFor="password">Password</label>
          </div>
          <button className="btn">Login</button>
          <div className="login-register">
            <p>
              Don't have an account? <a href="#">Register</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin;
