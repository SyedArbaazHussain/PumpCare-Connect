const express = require("express");
const router = express.Router();
const { connection } = require("../server");
const isAuthenticated = require("../middleware/auth");



// Admin add, update, delete, and fetch operations for panchayat
router.post("/adminAddPanchayat", isAuthenticated, async (req, res) => {
  const {
    Panchayat_Name,
    Panchayat_Loc,
    PDO_Name,
    Contact_No,
    P_email,
    P_password,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(P_password, 10); // Hash password
    const [result] = await connection.execute(
      "INSERT INTO panchayat (Panchayat_Name, Panchayat_Loc, PDO_Name, Contact_No, P_email, P_password) VALUES (?, ?, ?, ?, ?, ?)",
      [
        Panchayat_Name,
        Panchayat_Loc,
        PDO_Name,
        Contact_No,
        P_email,
        hashedPassword,
      ]
    );
    res.json({
      message: "Panchayat added successfully",
      panchayatId: result.insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/adminUpdatePanchayat/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const {
    Panchayat_Name,
    Panchayat_Loc,
    PDO_Name,
    Contact_No,
    P_email,
    P_password,
  } = req.body;
  try {
    await connection.execute(
      "UPDATE panchayat SET Panchayat_Name = ?, Panchayat_Loc = ?, PDO_Name = ?, Contact_No = ?, P_email = ?, P_password = ? WHERE Panchayat_ID = ?",
      [
        Panchayat_Name,
        Panchayat_Loc,
        PDO_Name,
        Contact_No,
        P_email,
        P_password,
        id,
      ]
    );
    res.json({ message: "Panchayat updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/adminDeletePanchayat/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await connection.execute("DELETE FROM panchayat WHERE Panchayat_ID = ?", [
      id,
    ]);
    res.json({ message: "Panchayat deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/adminFetchPanchayat/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM panchayat WHERE Panchayat_ID = ?",
      [id]
    );
    const panchayatDetails = rows[0];
    if (!panchayatDetails) {
      return res.status(404).json({ error: "Panchayat not found" });
    }
    res.json(panchayatDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin add, update, delete, and fetch operations for operator
router.post("/adminAddOperator", isAuthenticated, async (req, res) => {
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

router.put("/adminUpdateOperator/:id", isAuthenticated, async (req, res) => {
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

router.delete("/adminDeleteOperator/:id", isAuthenticated, async (req, res) => {
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

router.get("/adminFetchOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM operator WHERE Pump_Operator_ID = ?",
      [id]
    );
    const operatorDetails = rows[0];
    if (!operatorDetails) {
      return res.status(404).json({ error: "Operator not found" });
    }
    res.json(operatorDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin add, update, delete, and fetch operations for villager
router.post("/adminAddVillager", isAuthenticated, async (req, res) => {
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

router.put("/adminUpdateVillager/:House_No", isAuthenticated, async (req, res) => {
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

router.delete(
  "/adminDeleteVillager/:House_No",
  isAuthenticated,
  async (req, res) => {
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
  }
);

router.get("/adminFetchVillager/:House_No", isAuthenticated, async (req, res) => {
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

// Admin search route
router.get("/adminSearch", isAuthenticated, async (req, res) => {
  const { query } = req.query;
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM panchayat WHERE Panchayat_Name LIKE ? OR Panchayat_Loc LIKE ? OR PDO_Name LIKE ? OR Contact_No LIKE ? OR P_email LIKE ?",
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
