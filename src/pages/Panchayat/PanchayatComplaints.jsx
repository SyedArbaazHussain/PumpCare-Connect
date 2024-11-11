import { useState, useEffect } from "react";
import api from "../../services/api";
import PanchayatNavbar from "../../components/Navbars/PanchayatNavbar";

function PanchayatComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get("/complaint", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data) {
          setComplaints(response.data);
        } else {
          setErrorMessage("No Complaints");
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Error Getting Complaints");
      }
    };

    fetchComplaints();
  }, []);

  return (
    <>
      <PanchayatNavbar />
      <div className="wrcomplaints">
        <div className="wrappercomplaints">
          <h1 className="phomeh1">Complaints</h1>
          <table>
            <thead>
              <tr className="trclass">
                <th>Feedback_ID</th>
                <th>F_House_No</th>
                <th>Description</th>
                <th>F_Pump_Operator_ID</th>
                <th>Feedback_Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length > 0 ? (
                complaints.map((complaint, index) => (
                  <tr key={index} className="trclass">
                    <td>{complaint.Feedback_ID}</td>
                    <td>{complaint.F_House_No}</td>
                    <td>{complaint.Description}</td>
                    <td>{complaint.F_Pump_Operator_ID}</td>
                    <td>{complaint.Feedback_Status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">{errorMessage}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default PanchayatComplaints;
