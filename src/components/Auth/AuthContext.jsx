import useAuth from "./useAuth";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContextCore";

export function AuthProvider({ children }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
