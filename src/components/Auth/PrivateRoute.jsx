import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

const PrivateRoute = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return (
    <Routes>
      <Route path="/pdashboard" element={<PDashboard />} />
      <Route path="/psector" element={<PSector />} />
    </Routes>
  );
};

export default PrivateRoute;
