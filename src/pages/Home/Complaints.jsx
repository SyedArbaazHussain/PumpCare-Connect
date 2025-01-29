import { useState } from "react";
import api from "../../services/api";
import HomeNavbar from "../../components/Navbars/HomeNavbar";

const Complaints = () => {
  const [complaintId, setComplaintId] = useState("");
  const [complaintDetails, setComplaintDetails] = useState(null);

  const handleChange = (e) => {
    setComplaintDetails(false);
    setComplaintId(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/fetchNoOfComplaints/${complaintId}`);

      setComplaintDetails(response.data);
    } catch (error) {
      setComplaintDetails(false);
      console.error("Error fetching complaints:", error);
    }
  };

  return (
    <>
      <HomeNavbar />
      <div className="wr">
        <div className="wrapperpdetails">
          <div className="wrappercomplaints">
            <div>
              <h1>Search Complaints by House ID</h1>
              <form onSubmit={handleSearch}>
                <div className="input-box">
                  <input
                    type="text"
                    value={complaintId}
                    onChange={handleChange}
                    placeholder="Enter House ID"
                  />
                </div>
                <button type="submit" className="btn">
                  Search
                </button>
              </form>
            </div>
            {complaintDetails && (
              <div className="wrappercomplaints">
                <h2>Complaint Details</h2>
                <p>ID: {complaintDetails.F_House_No}</p>
                <p>Description: {complaintDetails.Description}</p>
                <p>Date Issued: {complaintDetails.Date_Issued}</p>
                <p>Operator ID: {complaintDetails.F_Pump_Operator_ID}</p>
                <p>Status: {complaintDetails.Feedback_Status}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Complaints;
