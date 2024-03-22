import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminHomeNavbar from "../Navbars/AdminHomeNavbar";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setTimeout(() => setError(""), 2000); // Clear error after 2 seconds
      return;
    }

    try {
      const response = await axios.post("http://localhost:8081/login", {
        email,
        password,
      });
      if (response.data.message === "Login successful") {
        // Store the JWT token in local storage
        localStorage.setItem("token", response.data.token);
        navigate("/PDashboard");
      } else {
        setError(response.data.error);
        setTimeout(() => setError(""), 2000); // Clear error after 2 seconds
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred while logging in");
      setTimeout(() => setError(""), 2000); // Clear error after 2 seconds
    }
  };

  return (
    <>
      <div>
        <AdminHomeNavbar />
      </div>
      <div className="wr">
        <div className="form-box login">
          <h2 className="formh2">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="mail"></ion-icon>
              </span>
              <input
                type="text"
                className="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>Email</label>
            </div>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="lock-closed"></ion-icon>
              </span>
              <input
                type="password"
                className="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="off"
              />
              <label>Password</label>
            </div>
            <button type="submit" className="btn">
              Login
            </button>
            <div className="login-register">
              <p>
                Don&apos;t have an account?{" "}
                <Link to="/admin-signup" className="register">
                  Request Access
                </Link>
              </p>
            </div>
            {error && (
              <div className="err">
                <p>{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
