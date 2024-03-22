import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminHomeNavbar from "../Navbars/AdminHomeNavbar";

function AdminSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [error, setError] = useState("");

  const { name, email } = formData;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
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
        "http://localhost:8081/signup",
        {
          Admin_Name: name,
          Admin_email: email,
        },
        { withCredentials: true }
      );

      if (response.data.error) {
        switch (response.data.error) {
          case "Please provide all required fields":
            setError(
              "Missing required fields. Please fill out the form completely."
            );
            break;
          case "Please enter a valid email address":
            setError(
              "Invalid email address. Please enter a valid email format."
            );
            break;
          default:
            setError(
              "An error occurred during signup. Please try again later."
            );
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response) {
        console.error(
          "Server responded with status code:",
          error.response.status
        );
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error", error.message);
      }
      console.error("Config:", error.config);

      setError("An error occurred while signing up. Please try again later.");
    }
  };

  return (
    <>
      <div>
        <AdminHomeNavbar />
      </div>
      <div className="wr">
        <div className="form-box">
          <h2 className="formh2">Admin Signup</h2>
          <form onSubmit={handleSignup} className="signupform">
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
            <button type="submit" className="btn">
              Request Admin Access
            </button>
            <div className="login-register">
              <p>
                Already have an account?{" "}
                <Link to="/admin-login" className="register">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
}
export default AdminSignup;
