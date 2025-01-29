import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api", // Ensure base URL includes /api
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Return the response if successful
    return response;
  },
  (error) => {
    // Handle specific error scenarios
    if (error.response) {
      // Server responded with a status other than 2xx
      const { status, data } = error.response;

      if (status === 401) {
        console.error("Unauthorized: Redirecting to login.");
        // Handle unauthorized access (e.g., clear session or redirect)
        window.location.href = "/"; // Example: Redirect to login page
      } else if (status === 404) {
        console.error("Resource not found:", error.config.url);
      } else if (status === 500) {
        console.error("Server error. Please try again later.");
      } else {
        console.error(`Error ${status}:`, data.message || "An error occurred.");
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error(
        "No response received from the server. Check your network."
      );
    } else {
      // Other errors (e.g., request setup)
      console.error("Error setting up the request:", error.message);
    }

    // Reject the error so it can be handled downstream
    return Promise.reject(error);
  }
);

export default api;
