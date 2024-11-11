import { useState, useEffect } from "react";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to log in
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      localStorage.setItem("token", data.token);
    } catch (error) {
      setError(error.message);
      setUser(null);
      localStorage.removeItem("token");
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
    const validateToken = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Add an API call to validate the token and get user data
        const response = await fetch("/api/validate-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Invalid token");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        setError(error.message);
        setUser(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  return {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
    error,
  };
};

export default useAuth;
