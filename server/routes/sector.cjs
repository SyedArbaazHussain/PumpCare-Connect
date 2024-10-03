const express = require("express");
const router = express.Router();
const { connection } = require("../server");
const isAuthenticated = require("../middleware/auth");

// Add Sector
router.post("/addSector", isAuthenticated, async (req, res) => {
  const { Sector_Name, Pump_Operator_ID, No_Of_Tanks } = req.body;
  const { id } = req.user;

  try {
    if (!Sector_Name || !Pump_Operator_ID || !No_Of_Tanks) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const [result] = await connection.execute(
      "INSERT INTO sector (Sector_Name, Panchayat_ID, Pump_Operator_ID, No_Of_Tanks) VALUES (?, ?, ?, ?)",
      [Sector_Name, id, Pump_Operator_ID, No_Of_Tanks]
    );

    res.json({
      message: "Sector added successfully",
      sectorId: result.insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Sector by ID
router.get("/fetchSector/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await connection.execute(
      "SELECT * FROM sector WHERE Sector_ID = ?",
      [id]
    );
    const sectorDetails = rows[0];

    if (!sectorDetails) {
      return res
        .status(404)
        .json({ error: "Sector details not found for the given ID" });
    }

    res.json(sectorDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Sector
router.put("/updateSector/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { Sector_Name, Panchayat_ID, Pump_Operator_ID, No_Of_Tanks } = req.body;

  try {
    await connection.execute(
      "UPDATE sector SET Sector_Name= ?, Panchayat_ID= ?, Pump_Operator_ID= ?, No_Of_Tanks= ? WHERE Sector_ID = ?",
      [Sector_Name, Panchayat_ID, Pump_Operator_ID, No_Of_Tanks, id]
    );
    res.json({ message: "Sector updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Sector
router.delete("/deleteSector/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    await connection.execute("DELETE FROM sector WHERE Sector_ID = ?", [id]);
    res.json({ message: "Sector deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add Pump Operator
router.post("/addOperator", isAuthenticated, async (req, res) => {
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(PO_password, 10); // Hash password

    const [result] = await connection.execute(
      "INSERT INTO operator (Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines) VALUES (?, ?, ?, ?, ?)",
      [Pump_Operator_Name, Contact_No, PO_email, hashedPassword, No_Of_Lines]
    );

    res.json({
      message: "Operator added successfully",
      operatorId: result.insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
