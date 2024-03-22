/** @format */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminHomeNavbar from "../Navbars/AdminHomeNavbar";

function AdminAuth() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const { name, email, password } = formData;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await axios.post(
        isLogin
          ? "http://localhost:8081/login"
          : "http://localhost:8081/signup",
        {
          Admin_Name: name,
          Admin_email: email,
          password,
        },
        { withCredentials: true }
      );

      if (response.data.error) {
        setError(response.data.error);
      } else {
        if (isLogin) {
          localStorage.setItem("token", response.data.token);
          navigate("/PDashboard");
        } else {
          setError("Signup successful. Please login.");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <div>
        <AdminHomeNavbar />
      </div>
      <div className="wr">
        <div className="form-box">
          <h2 className="formh2">{isLogin ? "Admin Login" : "Admin Signup"}</h2>
          <form onSubmit={handleAuth} className="authform">
            {!isLogin && (
              <div className="input-box">
                <label htmlFor="name" className="icon">
                  <ion-icon name="name"></ion-icon>
                </label>
                <input
                  type="text"
                  id="name"
                  className="name"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  required
                  autoComplete="organization"
                />
                <label htmlFor="name">Admin Name</label>
              </div>
            )}
            <div className="input-box">
              <label htmlFor="email" className="icon">
                <ion-icon name="email"></ion-icon>
              </label>
              <input
                type="text"
                id="email"
                className="email"
                name="email"
                value={email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              <label htmlFor="email">Email</label>
            </div>
            {isLogin && (
              <div className="input-box">
                <label htmlFor="password" className="icon">
                  <ion-icon name="lock-closed"></ion-icon>
                </label>
                <input
                  type="password"
                  id="password"
                  className="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                />
                <label htmlFor="password">Password</label>
              </div>
            )}
            <button type="submit" className="btn">
              {isLogin ? "Login" : "Request Admin Access"}
            </button>
            <div className="login-register">
              <p>
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="register"
                >
                  {isLogin ? "Request Access" : "Login"}
                </button>
              </p>
            </div>
          </form>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
}
export default AdminAuth;
