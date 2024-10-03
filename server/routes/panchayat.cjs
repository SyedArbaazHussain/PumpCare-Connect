const express = require("express");
const router = express.Router();
const { connection } = require("../server");
const isAuthenticated = require("../middleware/auth");

// Fetch panchayat_id by email
router.get("/panchayat_details", isAuthenticated, async (req, res) => {
  const { email } = req.user;

  try {
    const [rows] = await connection.execute(
      "SELECT Panchayat_ID, Panchayat_Name, Panchayat_Loc, PDO_Name, P_email, Contact_No FROM panchayat WHERE P_email = ?",
      [email]
    );
    const panchayatDetails = rows[0];

    if (!panchayatDetails) {
      return res
        .status(404)
        .json({ error: "Panchayat details not found for the given email" });
    }

    res.json(panchayatDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/complaint", isAuthenticated, async (req, res) => {
  try {
    const [rows] = await connection.execute(
      "SELECT `Feedback_ID`,`F_House_No`,`Description`,`Date_Issued`,`F_Pump_Operator_ID`,`Feedback_Status` FROM feedback ORDER BY Date_Issued DESC LIMIT 10"
    );
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.status(404).json({ message: "No recent complaints found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
