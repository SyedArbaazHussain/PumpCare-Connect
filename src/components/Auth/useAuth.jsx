import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext"; // Import the AuthContext if you're using Context API

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to log in
  const login = async (email, password) => {
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      setUser(data.user); // Assuming the response includes a user object
      localStorage.setItem("token", data.token); // Store the token in localStorage
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to log out
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token"); // Remove the token from localStorage
  };

  // Function to check if the user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Load user from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch user data from the backend or use the token to set the user state
      // This is a simplified example; you might need to adjust based on your backend
      setUser({ email: "example@example.com", name: "Example User" });
    }
    setLoading(false);
  }, []);

  return {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
  };
};

export default useAuth;
