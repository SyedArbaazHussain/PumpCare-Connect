import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../Navbars/AdminNavbar";

const AdminSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hno: "",
    name: "",
    cno: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const { hno, name, cno, email, password } = formData;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSignup = async (e) => {
    e.preventDefault();

    // Input validation
    if (!name.trim() || !cno.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    const phoneRegex = /^\d{10}$/; // Ensure 10-digit phone number
    if (!phoneRegex.test(cno)) {
      setError("Please enter a valid 10-digit contact number");
      return;
    }
    const hnoRegex = /^\d{3}$/; // Ensure 10-digit phone number
    if (!hnoRegex.test(hno)) {
      setError("Please enter a valid 3-digit house number");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/signupv",
        {
          House_No: hno,
          Villager_Name: name,
          Contact_No: cno,
          V_email: email,
          V_password: password,
        },
        { withCredentials: true },
      );

      if (response.data.error) {
        // Set specific error message based on backend response
        switch (response.data.error) {
          case "Please provide all required fields":
            setError(
              "Missing required fields. Please fill out the form completely.",
            );
            break;
          case "Please enter a valid 10-digit contact number":
            setError(
              "Invalid phone number. Please enter a valid 10-digit number.",
            );
            break;
          case "Please enter a valid email address":
            setError(
              "Invalid email address. Please enter a valid email format.",
            );
            break;
          case "Password must be at least 8 characters long":
            setError(
              "Password is too short. Please enter at least 8 characters.",
            );
            break;
          default:
            setError(
              "An error occurred during signup. Please try again later.",
            );
        }
      } else {
        navigate("/login"); // Redirect to dashboard on successful signup
      }
    } catch (error) {
      console.error("Signup error:", error);
      // Enhanced error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          "Server responded with status code:",
          error.response.status,
        );
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error", error.message);
      }
      console.error("Config:", error.config);

      setError("An error occurred while signing up. Please try again later.");
    }
  };
  return (
    <>
      <AdminNavbar />
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
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
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
            <div className="input-box">
              <label htmlFor="password" className="icon">
                <ion-icon name="password"></ion-icon>
              </label>
              <input
                type="password"
                id="password"
                className="password"
                name="password"
                value={password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn">
              Signup
            </button>
            <div className="login-register">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="register">
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
};

export default AdminSignup;
