import { useState, useEffect } from "react";
import api from "../../services/api";
import PanchayatNavbar from "../../components/Navbars/PanchayatNavbar";

const PanchayatVillagerDetails = () => {
  const [villager, setVillager] = useState({
    Villager_Name: "",
    Contact_No: "",
    V_Pump_Operator_ID: "",
    V_email: "",
    V_password: "",
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
    setVillager({ ...villager, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/addvillager`, // Adjusted to match the correct route
        villager,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage("Villager added successfully");
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding villager");
    }
  };

  const handleFetchVillager = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/fetchVillager/${villager.House_No}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        setVillager({
          ...villager,
          ...response.data,
        });
        setUpdateFormVisible(true);
        setSuccessMessage("Villager fetched successfully");
      } else {
        setErrorMessage("Villager ID not found");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error fetching villager");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put(`/updateVillager/${villager.House_No}`, villager, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Villager updated successfully");
      setUpdateFormVisible(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error updating villager");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/deleteVillager/${villager.House_No}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Villager deleted successfully");
      setUpdateFormVisible(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error deleting villager");
    }
  };

  return (
    <>
      <PanchayatNavbar />
      <div className="wr">
        <div className="wrapperpsector">
          <div className="form-box login">
            <h1>Villager Details</h1>
            <form onSubmit={handleSubmit} className="form-box">
              <h2 className="formh2">Add Villager</h2>
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
                  id="addVillager_Name"
                  name="Villager_Name"
                  value={updateFormVisible ? "" : villager.Villager_Name}
                  onChange={handleChange}
                  placeholder="Villager Name"
                />
                <label>Villager Name</label>
              </div>
              <div className="input-box">
                <input
                  type="text"
                  id="addContact_No"
                  name="Contact_No"
                  value={updateFormVisible ? "" : villager.Contact_No}
                  onChange={handleChange}
                  placeholder="Contact Number"
                />
                <label>Contact Number</label>
              </div>
              <div className="input-box">
                <input
                  type="text"
                  id="addV_Pump_Operator_ID"
                  name="V_Pump_Operator_ID"
                  value={updateFormVisible ? "" : villager.V_Pump_Operator_ID}
                  onChange={handleChange}
                  placeholder="Pump Operator ID"
                />
                <label>Pump Operator ID</label>
              </div>
              <div className="input-box">
                <input
                  type="email"
                  id="addV_email"
                  name="V_email"
                  value={updateFormVisible ? "" : villager.V_email}
                  onChange={handleChange}
                  placeholder="Email"
                />
                <label>Email</label>
              </div>
              <div className="input-box">
                <input
                  type="password"
                  id="addV_password"
                  name="V_password"
                  value={updateFormVisible ? "" : villager.V_password}
                  onChange={handleChange}
                  placeholder="Password"
                />
                <label>Password</label>
              </div>
              <button type="submit" className="btn">
                Add Villager
              </button>
            </form>
            <form onSubmit={handleDelete} className="form-box">
              <h2 className="formh2">Fetch Villager</h2>
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
              <div className="input-box">
                <input
                  type="text"
                  id="fetchHouse_No"
                  name="House_No"
                  value={villager.House_No}
                  onChange={handleChange}
                  placeholder="House Number"
                />
                <label>House Number</label>
              </div>
              <button onClick={handleFetchVillager} className="btn">
                Fetch Villager
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
                  <h2 className="formh2">Update Villager</h2>
                  <div className="input-box">
                    <input
                      type="text"
                      id="updateVillager_Name"
                      name="Villager_Name"
                      value={villager.Villager_Name}
                      onChange={handleChange}
                      placeholder="Villager Name"
                    />
                    <label>Villager Name</label>
                  </div>
                  <div className="input-box">
                    <input
                      type="text"
                      id="updateContact_No"
                      name="Contact_No"
                      value={villager.Contact_No}
                      onChange={handleChange}
                      placeholder="Contact Number"
                    />
                    <label>Contact Number</label>
                  </div>
                  <div className="input-box">
                    <input
                      type="email"
                      id="updateV_email"
                      name="V_email"
                      value={villager.V_email}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                    <label>Email</label>
                  </div>
                  <div className="input-box">
                    <input
                      type="password"
                      id="updateV_password"
                      name="V_password"
                      value={villager.V_password}
                      onChange={handleChange}
                      placeholder="Password"
                    />
                    <label>Password</label>
                  </div>
                  <button type="submit" className="btn">
                    Update Villager
                  </button>
                </form>
                <form onSubmit={handleDelete} className="form-box">
                  <h2 className="formh2">Delete Villager</h2>
                  {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                  )}
                  {successMessage && (
                    <div className="success-message">{successMessage}</div>
                  )}
                  <div className="input-box">
                    <input
                      type="text"
                      id="deleteHouse_No"
                      name="House_No"
                      value={villager.House_No}
                      onChange={handleChange}
                      placeholder="House Number"
                    />
                    <label>House Number</label>
                  </div>
                  <button type="submit" className="btn">
                    Delete Villager
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

export default PanchayatVillagerDetails;
