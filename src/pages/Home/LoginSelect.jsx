import { Link } from "react-router-dom";
import HomeNavbar from "../../components/Navbars/HomeNavbar";

function LoginSelect() {
  return (
    <>
      <HomeNavbar />
      <div className="selectmenu">
        <Link to="/">
          <button className="btnselect">Home</button>
        </Link>
        <Link to="/panchayat-login">
          <button className="btnselect">Panchayat Login</button>
        </Link>
        <Link to="/pump-operator-login">
          <button className="btnselect">Pump Operator Login</button>
        </Link>
        <Link to="/villager-login">
          <button className="btnselect">Villager Login</button>
        </Link>
      </div>
    </>
  );
}

export default LoginSelect;
