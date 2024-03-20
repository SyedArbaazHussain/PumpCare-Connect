import React, { useState, useEffect } from "react";
import axios from "axios";
import PanchayatNavbar from "../../components/Navbars/PanchayatNavbar";

const PanchayatPumpOperatorDetails = () => {
  const [operator, setOperator] = useState({
    Pump_Operator_ID: "",
    Pump_Operator_Name: "",
    Contact_No: "",
    PO_email: "",
    PO_password: "",
    No_Of_Lines: "",
  });

  const [updateFormVisible, setUpdateFormVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleChange = (e) => {
    setOperator({ ...operator, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8081/addOperator`,
        operator,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSuccessMessage("Operator added successfully");
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding operator");
    }
  };

  const handleFetchOperator = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8081/fetchOperator/${operator.Pump_Operator_ID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data) {
        setOperator(response.data);
        setUpdateFormVisible(true);
        setSuccessMessage("Operator fetched successfully");
      } else {
        setErrorMessage("Operator ID not found");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error fetching operator");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8081/updateOperator/${operator.Pump_Operator_ID}`,
        operator,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSuccessMessage("Operator updated successfully");
      setUpdateFormVisible(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error updating operator");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:8081/deleteOperator/${operator.Pump_Operator_ID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSuccessMessage("Operator deleted successfully");
      setUpdateFormVisible(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error deleting operator");
    }
  };

  return (
    <>
      <PanchayatNavbar />
      <div className="wr">
        <div className="wrapperpsector">
          <div className="form-box login">
            <h1>Pump Operator Details</h1>
            <form onSubmit={handleSubmit} className="form-box">
              <h2 className="formh2">Add Pump Operator</h2>
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
              <br />
              <div className="input-box">
                <input
                  type="text"
                  id="addPump_Operator_Name"
                  name="Pump_Operator_Name"
                  value={updateFormVisible ? "" : operator.Pump_Operator_Name}
                  onChange={handleChange}
                  placeholder="Pump Operator Name"
                />
                <label>Pump Operator Name</label>
              </div>
              <div className="input-box">
                <input
                  type="text"
                  id="addContact_No"
                  name="Contact_No"
                  value={updateFormVisible ? "" : operator.Contact_No}
                  onChange={handleChange}
                  placeholder="Contact Number"
                />
                <label>Contact Number</label>
              </div>
              <div className="input-box">
                <input
                  type="email"
                  id="addPO_email"
                  name="PO_email"
                  value={updateFormVisible ? "" : operator.PO_email}
                  onChange={handleChange}
                  placeholder="Email"
                />
                <label>Email</label>
              </div>
              <div className="input-box">
                <input
                  type="password"
                  id="addPO_password"
                  name="PO_password"
                  value={updateFormVisible ? "" : operator.PO_password}
                  onChange={handleChange}
                  placeholder="Password"
                />
                <label>Password</label>
              </div>
              <div className="input-box">
                <input
                  type="number"
                  id="addNo_Of_Lines"
                  name="No_Of_Lines"
                  value={updateFormVisible ? "" : operator.No_Of_Lines}
                  onChange={handleChange}
                  placeholder="Number of Lines"
                />
                <label>Number of Lines</label>
              </div>
              <button type="submit" className="btn">
                Add Operator
              </button>
            </form>
            <form onSubmit={handleDelete} className="form-box">
              <h2 className="formh2">Fetch Pump Operator</h2>
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
              <div className="input-box">
                <input
                  type="text"
                  id="fetchPump_Operator_ID"
                  name="Pump_Operator_ID"
                  value={operator.Pump_Operator_ID}
                  onChange={handleChange}
                  placeholder="Operator ID"
                />
                <label>Operator ID</label>
              </div>
              <button onClick={handleFetchOperator} className="btn">
                Fetch Operator
              </button>
              <br />
            </form>
            <div className="errors">
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
            </div>
            {updateFormVisible && (
              <>
                <form onSubmit={handleUpdate} className="form-box">
                  <h2 className="formh2">Update Pump Operator</h2>
                  <div className="input-box">
                    <input
                      type="text"
                      id="updatePump_Operator_Name"
                      name="Pump_Operator_Name"
                      value={operator.Pump_Operator_Name}
                      onChange={handleChange}
                      placeholder="Pump Operator Name"
                    />
                    <label>Pump Operator Name</label>
                  </div>
                  <div className="input-box">
                    <input
                      type="text"
                      id="updateContact_No"
                      name="Contact_No"
                      value={operator.Contact_No}
                      onChange={handleChange}
                      placeholder="Contact Number"
                    />
                    <label>Contact Number</label>
                  </div>
                  <div className="input-box">
                    <input
                      type="email"
                      id="updatePO_email"
                      name="PO_email"
                      value={operator.PO_email}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                    <label>Email</label>
                  </div>
                  <div className="input-box">
                    <input
                      type="number"
                      id="updateNo_Of_Lines"
                      name="No_Of_Lines"
                      value={operator.No_Of_Lines}
                      onChange={handleChange}
                      placeholder="Number of Lines"
                    />
                    <label>Number of Lines</label>
                  </div>
                  <button type="submit" className="btn">
                    Update Operator
                  </button>
                </form>
                <form onSubmit={handleDelete} className="form-box">
                  <h2 className="formh2">Delete Pump Operator</h2>
                  {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                  )}
                  {successMessage && (
                    <div className="success-message">{successMessage}</div>
                  )}
                  <div className="input-box">
                    <input
                      type="text"
                      id="deletePump_Operator_ID"
                      name="Pump_Operator_ID"
                      value={operator.Pump_Operator_ID}
                      onChange={handleChange}
                      placeholder="Operator ID"
                    />
                    <label>Operator ID</label>
                  </div>
                  <button type="submit" className="btn">
                    Delete Operator
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PanchayatPumpOperatorDetails;
