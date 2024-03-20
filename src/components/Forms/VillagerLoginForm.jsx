import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import HomeNavbar from "../Navbars/HomeNavbar";

const VillagerLoginForm = () => {
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
      const response = await axios.post("http://localhost:5000/loginv", {
        email,
        password,
      });
      if (response.data.message === "Login successful") {
        navigate("/notfound");
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
      <HomeNavbar />
      <div className="wr">
        <div className="form-box login">
          <h2 className="formh2">Villager&ensp;Login</h2>
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
                <Link to="/villager-signup" className="register">
                  Register
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

export default VillagerLoginForm;
