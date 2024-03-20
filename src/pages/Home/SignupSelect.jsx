import { Link } from "react-router-dom";
import HomeNavbar from "../../components/Navbars/HomeNavbar";

function SignupSelect() {
  return (
    <>
      <HomeNavbar />
      <div className="selectmenu">
        <Link to="/">
          <button className="btnselect">Home</button>
        </Link>
        <Link to="/panchayat-signup">
          <button className="btnselect">Panchayat Sign Up</button>
        </Link>
        <Link to="/pump-operator-signup">
          <button className="btnselect">Pump Operator Sign Up</button>
        </Link>
        <Link to="/villager-signup">
          <button className="btnselect">Villager Sign Up</button>
        </Link>
      </div>
    </>
  );
}

export default SignupSelect;
