import { useState, useEffect } from "react";
import PanchayatNavbar from "../../components/Navbars/PanchayatNavbar";

const PanchayatDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetch("/panchayat_details", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("User Details:", data);
        setUserDetails(data);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, []);

  return (
    <>
      <PanchayatNavbar />
      <div className="wr">
        <h2 className="formh2">DASHBOARD</h2>
        {userDetails && (
          <>
            <div className="wrapperpdetails">
              <table className="ptable">
                <tr>
                  <th className="thpdetails">Panchayat ID</th>
                  <td className="pcolon">:</td>
                  <td className="tdpdetails">{userDetails.Panchayat_ID}</td>
                </tr>
                <tr>
                  <th className="thpdetails">Panchayat Name</th>
                  <td className="pcolon">:</td>
                  <td className="tdpdetails">{userDetails.Panchayat_Name}</td>
                </tr>
                <tr>
                  <th className="thpdetails">Location</th>
                  <td className="pcolon">:</td>
                  <td className="tdpdetails">{userDetails.Panchayat_Loc}</td>
                </tr>
                <tr>
                  <th className="thpdetails">PDO Name</th>
                  <td className="pcolon">:</td>
                  <td className="tdpdetails">{userDetails.PDO_Name}</td>
                </tr>
                <tr>
                  <th className="thpdetails">Email</th>
                  <td className="pcolon">:</td>
                  <td className="tdpdetails">{userDetails.P_email}</td>
                </tr>
                <tr>
                  <th className="thpdetails">Contact Number</th>
                  <td className="pcolon">:</td>
                  <td className="tdpdetails"> {userDetails.Contact_No}</td>
                </tr>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PanchayatDashboard;
