import { useState, useEffect } from "react";
import api from "../../services/api";
import PanchayatNavbar from "../../components/Navbars/PanchayatNavbar";

const PanchayatSectorDetails = () => {
  const [sector, setSector] = useState({
    Sector_ID: "",
    Panchayat_ID: "",
    Sector_Name: "",
    Pump_Operator_ID: "",
    No_Of_Tanks: "",
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
    setSector({ ...sector, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post(`/addSector`, sector, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Sector added successfully");
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding sector");
    }
  };

  const handleFetchSector = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/fetchSector/${sector.Sector_ID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        setSector(response.data);
        setUpdateFormVisible(true);
        setSuccessMessage("Sector fetched successfully");
      } else {
        setErrorMessage("Sector ID not found");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error fetching sector");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/updateSector/${sector.Sector_ID}`,
        sector,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data); // Log response data
      setSuccessMessage("Sector updated successfully");
      setUpdateFormVisible(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error updating sector");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await api.delete(`/deleteSector/${sector.Sector_ID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data); // Log response data
      setSuccessMessage("Sector deleted successfully");
      setUpdateFormVisible(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error deleting sector");
    }
  };

  return (
    <>
      <PanchayatNavbar />
      <div className="wr">
        <div className="wrapperpsector">
          <div className="form-box login">
            <h1>Sector Details</h1>
            <form onSubmit={handleSubmit} className="form-box">
              <h2 className="formh2">Add Sector</h2>
              <br />
              <div className="input-box">
                <input
                  type="text"
                  id="addSector_Name"
                  name="Sector_Name"
                  value={updateFormVisible ? "" : sector.Sector_Name}
                  onChange={handleChange}
                  placeholder="Sector Name"
                />
                <label>Sector Name</label>
              </div>
              <div className="input-box">
                <input
                  type="number"
                  id="addPump_Operator_ID"
                  name="Pump_Operator_ID"
                  value={updateFormVisible ? "" : sector.Pump_Operator_ID}
                  onChange={handleChange}
                  placeholder="Pump Operator ID"
                />
                <label>Pump Operator ID</label>
              </div>
              <div className="input-box">
                <input
                  type="number"
                  id="addNo_Of_Tanks"
                  name="No_Of_Tanks"
                  value={updateFormVisible ? "" : sector.No_Of_Tanks}
                  onChange={handleChange}
                  placeholder="Number of Tanks"
                />
                <label>Number of Tanks</label>
              </div>
              <button type="submit" className="btn">
                Add Sector
              </button>
            </form>
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            <form onSubmit={handleDelete} className="form-box">
              <h2 className="formh2">Fetch Sector</h2>
              <div className="input-box">
                <input
                  type="text"
                  id="fetchSector_ID"
                  name="Sector_ID"
                  value={sector.Sector_ID}
                  onChange={handleChange}
                  placeholder="Sector ID"
                />
                <label>Sector ID</label>
              </div>
              <button onClick={handleFetchSector} className="btn">
                Fetch Sector
              </button>
            </form>
            {updateFormVisible && (
              <>
                <form onSubmit={handleUpdate} className="form-box">
                  <h2 className="formh2">Update Sector</h2>
                  <div className="input-box">
                    <input
                      type="text"
                      id="updateSector_Name"
                      name="Sector_Name"
                      value={sector.Sector_Name}
                      onChange={handleChange}
                      placeholder="Sector Name"
                    />
                    <label>Sector Name</label>
                  </div>
                  <div className="input-box">
                    <input
                      type="number"
                      id="updatePump_Operator_ID"
                      name="Pump_Operator_ID"
                      value={sector.Pump_Operator_ID}
                      onChange={handleChange}
                      placeholder="Pump Operator ID"
                    />
                    <label>Pump Operator ID</label>
                  </div>
                  <div className="input-box">
                    <input
                      type="number"
                      id="updateNo_Of_Tanks"
                      name="No_Of_Tanks"
                      value={sector.No_Of_Tanks}
                      onChange={handleChange}
                      placeholder="Number of Tanks"
                    />
                    <label>Number of Tanks</label>
                  </div>
                  <button type="submit" className="btn">
                    Update Sector
                  </button>
                </form>
                <form onSubmit={handleDelete} className="form-box">
                  <h2 className="formh2">Delete Sector</h2>
                  <div className="input-box">
                    <input
                      type="text"
                      id="deleteSector_ID"
                      name="Sector_ID"
                      value={sector.Sector_ID}
                      onChange={handleChange}
                      placeholder="Sector ID"
                    />
                    <label>Sector ID</label>
                  </div>
                  <button type="submit" className="btn">
                    Delete Sector
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

export default PanchayatSectorDetails;
