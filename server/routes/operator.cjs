const express = require("express");
const router = express.Router();
const { connection } = require("../server");
const isAuthenticated = require("../middleware/auth");

// Fetch operator by ID
router.get("/fetchOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await connection.execute(
      "SELECT * FROM operator WHERE Pump_Operator_ID = ?",
      [id]
    );
    const operatorDetails = rows[0];

    if (!operatorDetails) {
      return res
        .status(404)
        .json({ error: "Operator details not found for the given ID" });
    }

    res.json(operatorDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Pump Operator
router.put("/updateOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(PO_password, 10); // Hash password

    await connection.execute(
      "UPDATE operator SET Pump_Operator_Name = ?, Contact_No = ?, PO_email = ?, PO_password = ?, No_Of_Lines = ? WHERE Pump_Operator_ID = ?",
      [
        Pump_Operator_Name,
        Contact_No,
        PO_email,
        hashedPassword,
        No_Of_Lines,
        id,
      ]
    );
    res.json({ message: "Operator updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Pump Operator
router.delete("/deleteOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    await connection.execute(
      "DELETE FROM operator WHERE Pump_Operator_ID = ?",
      [id]
    );
    res.json({ message: "Operator deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;