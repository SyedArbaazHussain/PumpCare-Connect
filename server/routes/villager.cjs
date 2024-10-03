const express = require("express");
const router = express.Router();
const { connection } = require("../server");
const isAuthenticated = require("../middleware/auth");

router.post("/addvillager", isAuthenticated, async (req, res) => {
  const villager = req.body;
  try {
    const [result] = await connection.execute(
      "INSERT INTO villager (Villager_Name, Contact_No, V_Pump_Operator_ID, V_email, V_password) VALUES (?, ?, ?, ?, ?)",
      [
        villager.Villager_Name,
        villager.Contact_No,
        villager.V_Pump_Operator_ID,
        villager.V_email,
        villager.V_password,
      ]
    );
    res.json({
      message: "Villager added successfully",
      villagerId: result.insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Villager
router.get("/fetchVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM villager WHERE House_No = ?",
      [House_No]
    );
    const villagerDetails = rows[0];
    if (!villagerDetails) {
      return res.status(404).json({ error: "Villager not found" });
    }
    res.json(villagerDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/fetchNoOfComplaints/:F_House_No", async (req, res) => {
  const { F_House_No } = req.params;
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM feedback WHERE F_House_No = ?",
      [F_House_No]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No complaint details found for the given house ID" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Villager
router.put("/updateVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;
  const villager = req.body;
  try {
    await connection.execute(
      "UPDATE villager SET Villager_Name = ?, Contact_No = ?, V_Pump_Operator_ID = ?, V_email = ?, V_password = ? WHERE House_No = ?",
      [
        villager.Villager_Name,
        villager.Contact_No,
        villager.V_Pump_Operator_ID,
        villager.V_email,
        villager.V_password,
        House_No,
      ]
    );
    res.json({ message: "Villager updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Villager
router.delete("/deleteVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;
  try {
    await connection.execute("DELETE FROM villager WHERE House_No = ?", [
      House_No,
    ]);
    res.json({ message: "Villager deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
