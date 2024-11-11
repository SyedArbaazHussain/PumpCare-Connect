import { Link } from "react-router-dom";

const OperatorNavbar = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    // You can add redirection logic here if needed
  };

  return (
    <header>
      <h2 className="logo">PumpCare Connect</h2>
      <div className="nav">
        <nav className="navigation">
          <Link className="btnLogin-popup" to="/pdashboard">
            Dashboard
          </Link>
          <Link className="btnLogin-popup" to="/psector">
            Sector
          </Link>
          <Link className="btnLogin-popup" to="/poperator">
            Operator
          </Link>
          <Link className="btnLogin-popup" to="/pvillager">
            Villager
          </Link>
          <Link className="btnLogin-popup" to="/pcomplaints">
            Complaints
          </Link>
          <Link className="btnLogin-popup" to="/" onClick={handleLogout}>
            Logout
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default OperatorNavbar;
