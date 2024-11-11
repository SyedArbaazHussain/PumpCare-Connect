import { useContext } from "react";
import { AuthContext } from './AuthContextCore';

export const useAuthContext = () => useContext(AuthContext); 