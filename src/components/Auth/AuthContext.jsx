import React, { createContext, useContext } from "react";
import useAuth from "./useAuth";

// Create the context
export const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  // The value to be provided to the context consumers
  const value = {
    ...auth, // Spread the auth object to include all properties and methods
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
