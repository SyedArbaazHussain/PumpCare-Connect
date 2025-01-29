import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import LoginSelect from "./pages/Home/LoginSelect";
import SignupSelect from "./pages/Home/SignupSelect";
import Complaints from "./pages/Home/Complaints";
import PanchayatLoginForm from "./components/Forms/PanchayatLoginForm";
import PumpOperatorLoginForm from "./components/Forms/PumpOperatorLoginForm";
import VillagerLoginForm from "./components/Forms/VillagerLoginForm";
import PanchayatSignupForm from "./components/Forms/PanchayatSignupForm";
import PumpOperatorSignupForm from "./components/Forms/PumpOperatorSignupForm";
import VillagerSignupForm from "./components/Forms/VillagerSignupForm";
import NotFound from "./pages/NotFound/NotFound";
import PanchayatDashboard from "./pages/Panchayat/PanchayatDashboard";
import PanchayatSectorDetails from "./pages/Panchayat/PanchayatSectorDetails";
import PanchayatPumpOperatorDetails from "./pages/Panchayat/PanchayatPumpOperatorDetails";
import Panchayatvillager from "./pages/Panchayat/PanchayatVillagerDetails";
import PanchayatComplaints from "./pages/Panchayat/PanchayatComplaints";
import Admin from "./pages/Admin/Admin";
import AdminLogin from "./components/Admin/AdminLogin";
import AdminSignup from "./components/Admin/AdminSignup";
import "./App.css";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/*" element={<NotFound />} />
          <Route path="/LoginSelect" element={<LoginSelect />} />
          <Route path="/SignupSelect" element={<SignupSelect />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/panchayat-signup" element={<PanchayatSignupForm />} />
          <Route
            path="/pump-operator-signup"
            element={<PumpOperatorSignupForm />}
          />
          <Route path="/villager-signup" element={<VillagerSignupForm />} />
          <Route path="/panchayat-login" element={<PanchayatLoginForm />} />
          <Route
            path="/pump-operator-login"
            element={<PumpOperatorLoginForm />}
          />
          <Route path="/villager-login" element={<VillagerLoginForm />} />
          <Route path="/panchayatdashboard" element={<PanchayatDashboard />} />
          <Route path="/panchayatsector" element={<PanchayatSectorDetails />} />
          <Route
            path="/panchayatoperator"
            element={<PanchayatPumpOperatorDetails />}
          />
          <Route path="/panchayatvillager" element={<Panchayatvillager />} />
          <Route
            path="/panchayatcomplaints"
            element={<PanchayatComplaints />}
          />
          <Route path="/admin-dashboard" element={<Admin />} />
          <Route path="/admin-auth" element={<Admin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
