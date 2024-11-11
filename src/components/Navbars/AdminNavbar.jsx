import { Link, Navigate } from "react-router-dom";
function AdminNavbar() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    Navigate("/");
  };
  return (
    <header>
      <h2 className="logo">PumpCare Connect</h2>
      <div className="nav">
        <nav className="navigation">
          <Link className="btnLogin-popup" to="/admin">
            Home
          </Link>
          <Link className="btnLogin-popup" to="/pcomplaints">
            About
          </Link>
          <Link className="btnLogin-popup" to="/pcomplaints">
            Services
          </Link>
          <Link className="btnLogin-popup" to="/pcomplaints">
            Contact
          </Link>
          <Link className="btnLogin-popup" to="/" onClick={handleLogout}>
            Logout
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default AdminNavbar;
