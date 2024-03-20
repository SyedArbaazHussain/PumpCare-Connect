import { Link } from "react-router-dom";

const HomeNavbar = () => {
  return (
    <header>
      <h2 className="logo">PumpCare Connect</h2>
      <div className="nav">
        <nav className="navigation">
          <Link className="btnLogin-popup" to="/">
            Home
          </Link>
          <Link className="btnLogin-popup" to="/LoginSelect">
            Login
          </Link>
          <Link className="btnLogin-popup" to="/SignupSelect">
            Sign Up
          </Link>
          <Link className="btnLogin-popup" to="/complaints">
            Complaints
          </Link>
          <Link className="btnLogin-popup" to="/login">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default HomeNavbar;
