import axios from "axios";
// Set the base URL from the environment variable directly
const api = axios.create({
  baseURL: "https://pump-care-connect.vercel.app/", // Fallback to localhost for development
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
