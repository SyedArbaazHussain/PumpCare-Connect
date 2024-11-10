import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import process from "process";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware setup
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust this to match your frontend's URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(bodyParser.json());

// Database connection setup using environment variables
const dbPromise = open({
  filename: "./pcc.sqlite",
  driver: sqlite3.Database,
});

// Test database connection
async function testDbConnection() {
  try {
    const db = await dbPromise;
    await db.get("SELECT 1");
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

testDbConnection();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "not_authorized";

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("No auth header present");
    return res.status(401).json({ error: "No authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("No token found in auth header");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Admin login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await dbPromise;
    const userWithEmail = await db.get(
      "SELECT Admin_ID, Admin_Email, Admin_Password FROM admin WHERE Admin_Email = ?",
      [email]
    );

    if (!userWithEmail) {
      return res
        .status(400)
        .json({ message: "Email or Password does not match!!" });
    }

    // Compare the provided password with the hashed password from the database
    const isPasswordValid = await bcrypt.compare(
      password,
      userWithEmail.Admin_Password
    );

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Email or Password does not match!!" });
    }

    // If the password is valid, generate a JWT token
    const jwtToken = jwt.sign(
      {
        id: userWithEmail.Admin_ID,
        email: userWithEmail.Admin_Email,
        role: "admin",
      },
      JWT_SECRET
    );

    res.json({ message: "Login successful", token: jwtToken });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Admin sign-up route
app.post("/signup", async (req, res) => {
  const { Admin_Name, Admin_Email, Admin_Password } = req.body;

  try {
    const db = await dbPromise;
    const hashedPassword = await bcrypt.hash(Admin_Password, 10);

    await db.run(
      "INSERT INTO admin (Admin_Name, Admin_Email, Admin_Password) VALUES (?, ?, ?)",
      [Admin_Name, Admin_Email, hashedPassword]
    );

    res.json({ message: "Admin signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);

    // Modify error handling for SQLite specific errors
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({
        error: "Admin email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Panchayat signup route
app.post("/signupp", async (req, res) => {
  const {
    Panchayat_Name,
    Panchayat_Loc,
    PDO_Name,
    Contact_No,
    P_email,
    P_password,
  } = req.body;

  // Input validation
  if (
    !Panchayat_Name ||
    !Panchayat_Loc ||
    !PDO_Name ||
    !Contact_No ||
    !P_email ||
    !P_password
  ) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  // Validate phone number (10 digits)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(Contact_No)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid 10-digit contact number" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(P_email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    const db = await dbPromise;
    const hashedPassword = await bcrypt.hash(P_password, 10);

    // Check if Panchayat name or email already exists
    const existingPanchayat = await db.get(
      "SELECT 1 FROM panchayat WHERE P_email = ? OR Panchayat_Name = ?",
      [P_email, Panchayat_Name]
    );

    if (existingPanchayat) {
      return res.status(400).json({
        error:
          "Panchayat email or name already exists. Please choose a different one.",
      });
    }

    // Insert the new Panchayat
    await db.run(
      `INSERT INTO panchayat (Panchayat_Name, Panchayat_Loc, PDO_Name, Contact_No, P_email, P_password)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Panchayat_Name,
        Panchayat_Loc,
        PDO_Name,
        Contact_No,
        P_email,
        hashedPassword,
      ]
    );

    res.json({ message: "Panchayat signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({
        error:
          "Panchayat email or name already exists. Please choose a different one.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Pump Operator signup route
app.post("/signuppo", async (req, res) => {
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password } = req.body;

  // Input validation
  if (!Pump_Operator_Name || !Contact_No || !PO_email || !PO_password) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(Contact_No)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid 10-digit contact number" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(PO_email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    const db = await dbPromise;
    const hashedPassword = await bcrypt.hash(PO_password, 10);

    await db.run(
      `INSERT INTO operator (Pump_Operator_Name, Contact_No, PO_email, PO_password)
       VALUES (?, ?, ?, ?)`,
      [Pump_Operator_Name, Contact_No, PO_email, hashedPassword]
    );

    res.json({ message: "Operator signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({
        error:
          "Operator email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Villager signup route
app.post("/signupv", async (req, res) => {
  const { House_No, Villager_Name, Contact_No, V_email, V_password } = req.body;

  // Input validation
  if (!House_No || !Villager_Name || !Contact_No || !V_email || !V_password) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(Contact_No)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid 10-digit contact number" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(V_email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    const db = await dbPromise;
    const hashedPassword = await bcrypt.hash(V_password, 10);

    await db.run(
      `INSERT INTO villager (House_No, Villager_Name, Contact_No, V_email, V_password)
       VALUES (?, ?, ?, ?, ?)`,
      [House_No, Villager_Name, Contact_No, V_email, hashedPassword]
    );

    res.json({ message: "Villager signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({
        error:
          "Villager email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
app.post("/loginp", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required!" });
  }

  try {
    const db = await dbPromise;
    const userWithEmail = await db.get(
      "SELECT P_email, P_password, Panchayat_ID FROM panchayat WHERE P_email = ?",
      [email]
    );

    if (!userWithEmail) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userWithEmail.P_password
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const jwtToken = jwt.sign(
      {
        id: userWithEmail.Panchayat_ID,
        email: userWithEmail.P_email,
        role: "panchayat",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token: jwtToken });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Fetch Panchayat_ID by email
app.get("/panchayat_details", isAuthenticated, async (req, res) => {
  const { email } = req.user;

  try {
    const db = await dbPromise;
    const panchayatDetails = await db.get(
      `SELECT Panchayat_ID, Panchayat_Name, Panchayat_Loc, PDO_Name, P_email, Contact_No 
       FROM panchayat WHERE P_email = ?`,
      [email]
    );

    if (!panchayatDetails) {
      return res.status(404).json({
        error: "Panchayat details not found for the given email",
      });
    }

    res.json(panchayatDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add Sector
app.post("/addSector", isAuthenticated, async (req, res) => {
  const { Sector_Name, Pump_Operator_ID, No_Of_Tanks } = req.body;
  const { id } = req.user;

  try {
    const db = await dbPromise;
    if (!Sector_Name || !Pump_Operator_ID || !No_Of_Tanks) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const result = await db.run(
      `INSERT INTO sector (Sector_Name, Panchayat_ID, Pump_Operator_ID, No_Of_Tanks)
       VALUES (?, ?, ?, ?)`,
      [Sector_Name, id, Pump_Operator_ID, No_Of_Tanks]
    );

    res.json({
      message: "Sector added successfully",
      sectorId: result.lastID,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Sector by ID
app.get("/fetchSector/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await dbPromise;
    const sectorDetails = await db.get(
      "SELECT * FROM sector WHERE Sector_ID = ?",
      [id]
    );

    if (!sectorDetails) {
      return res.status(404).json({
        error: "Sector details not found for the given ID",
      });
    }

    res.json(sectorDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Sector
app.put("/updateSector/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { Sector_Name, Panchayat_ID, Pump_Operator_ID, No_Of_Tanks } = req.body;

  try {
    const db = await dbPromise;
    const result = await db.run(
      `UPDATE sector 
       SET Sector_Name = ?, Panchayat_ID = ?, Pump_Operator_ID = ?, No_Of_Tanks = ?
       WHERE Sector_ID = ?`,
      [Sector_Name, Panchayat_ID, Pump_Operator_ID, No_Of_Tanks, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Sector not found or not updated" });
    }

    res.json({ message: "Sector updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Delete Sector
app.delete("/deleteSector/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await dbPromise;
    await db.run("DELETE FROM sector WHERE Sector_ID = ?", [id]);
    res.json({ message: "Sector deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add Pump Operator
app.post("/addOperator", isAuthenticated, async (req, res) => {
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(PO_password, 10); // Hash password

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO operator (Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines)
       VALUES (?, ?, ?, ?, ?)`,
      [Pump_Operator_Name, Contact_No, PO_email, hashedPassword, No_Of_Lines]
    );

    res.json({
      message: "Operator added successfully",
      operatorId: result.lastID,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch operator by ID
app.get("/fetchOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await dbPromise;
    const operatorDetails = await db.get(
      "SELECT * FROM operator WHERE Pump_Operator_ID = ?",
      [id]
    );

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
app.put("/updateOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(PO_password, 10); // Hash password

    const db = await dbPromise;
    await db.run(
      `UPDATE operator
       SET Pump_Operator_Name = ?, Contact_No = ?, PO_email = ?,
           PO_password = ?, No_Of_Lines = ?
       WHERE Pump_Operator_ID = ?`,
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
app.delete("/deleteOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await dbPromise;
    await db.run("DELETE FROM operator WHERE Pump_Operator_ID = ?", [id]);
    res.json({ message: "Operator deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add Villager
app.post("/addvillager", isAuthenticated, async (req, res) => {
  const villager = req.body;

  try {
    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO villager (Villager_Name, Contact_No, V_Pump_Operator_ID, V_email, V_password)
       VALUES (?, ?, ?, ?, ?)`,
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
      villagerId: result.lastID,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Villager
app.get("/fetchVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;

  try {
    const db = await dbPromise;
    const villagerDetails = await db.get(
      "SELECT * FROM villager WHERE House_No = ?",
      [House_No]
    );
    if (!villagerDetails) {
      return res.status(404).json({ error: "Villager not found" });
    }
    res.json(villagerDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch No Of Complaints
app.get("/fetchNoOfComplaints/:F_House_No", async (req, res) => {
  const { F_House_No } = req.params;

  try {
    const db = await dbPromise;
    const complaints = await db.all(
      "SELECT * FROM feedback WHERE F_House_No = ?",
      [F_House_No]
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        error: "No complaint details found for the given house ID",
      });
    }
    res.json(complaints);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Villager
app.put("/updateVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;
  const villager = req.body;

  try {
    const db = await dbPromise;
    await db.run(
      `UPDATE villager
       SET Villager_Name = ?, Contact_No = ?, V_Pump_Operator_ID = ?,
           V_email = ?, V_password = ?
       WHERE House_No = ?`,
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
app.delete("/deleteVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;
  try {
    const db = await dbPromise;
    await db.run("DELETE FROM villager WHERE House_No = ?", [House_No]);
    res.json({ message: "Villager deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin add, update, delete, and fetch operations for panchayat
app.post("/adminAddPanchayat", isAuthenticated, async (req, res) => {
  const {
    Panchayat_Name,
    Panchayat_Loc,
    PDO_Name,
    Contact_No,
    P_email,
    P_password,
  } = req.body;

  try {
    const db = await dbPromise;
    const hashedPassword = await bcrypt.hash(P_password, 10);

    const result = await db.run(
      `INSERT INTO panchayat (Panchayat_Name, Panchayat_Loc, PDO_Name, Contact_No, P_email, P_password)
       VALUES (?, ?, ?, ?, ?, ?)`,
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
      panchayatId: result.lastID,
    });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({
        error: "Panchayat with this email or name already exists",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.put("/adminUpdatePanchayat/:id", isAuthenticated, async (req, res) => {
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
    const db = await dbPromise;
    let result;

    if (P_password) {
      const hashedPassword = await bcrypt.hash(P_password, 10);
      result = await db.run(
        `UPDATE panchayat 
         SET Panchayat_Name = ?, Panchayat_Loc = ?, PDO_Name = ?,
             Contact_No = ?, P_email = ?, P_password = ?
         WHERE Panchayat_ID = ?`,
        [
          Panchayat_Name,
          Panchayat_Loc,
          PDO_Name,
          Contact_No,
          P_email,
          hashedPassword,
          id,
        ]
      );
    } else {
      result = await db.run(
        `UPDATE panchayat 
         SET Panchayat_Name = ?, Panchayat_Loc = ?, PDO_Name = ?,
             Contact_No = ?, P_email = ?
         WHERE Panchayat_ID = ?`,
        [Panchayat_Name, Panchayat_Loc, PDO_Name, Contact_No, P_email, id]
      );
    }

    if (result.changes === 0) {
      return res.status(404).json({ error: "Panchayat not found" });
    }

    res.json({ message: "Panchayat updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({
        error: "Email already exists or other constraint violation",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.delete("/adminDeletePanchayat/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await dbPromise;
    await db.run("DELETE FROM panchayat WHERE Panchayat_ID = ?", [id]);
    res.json({ message: "Panchayat deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/adminFetchPanchayat/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await dbPromise;
    const panchayatDetails = await db.get(
      "SELECT * FROM panchayat WHERE Panchayat_ID = ?",
      [id]
    );
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
app.post("/adminAddOperator", isAuthenticated, async (req, res) => {
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines } =
    req.body;

  try {
    const db = await dbPromise;
    const hashedPassword = await bcrypt.hash(PO_password, 10);

    const result = await db.run(
      `INSERT INTO operator (Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines)
       VALUES (?, ?, ?, ?, ?)`,
      [Pump_Operator_Name, Contact_No, PO_email, hashedPassword, No_Of_Lines]
    );

    res.json({
      message: "Operator added successfully",
      operatorId: result.lastID,
    });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({
        error: "Operator email already exists",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.get("/adminFetchOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await dbPromise;
    const operatorDetails = await db.get(
      "SELECT * FROM operator WHERE Pump_Operator_ID = ?",
      [id]
    );

    if (!operatorDetails) {
      return res.status(404).json({ error: "Operator not found" });
    }
    res.json(operatorDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/adminUpdateOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(PO_password, 10);
    const db = await dbPromise;
    await db.run(
      `UPDATE operator
       SET Pump_Operator_Name = ?, Contact_No = ?, PO_email = ?,
           PO_password = ?, No_Of_Lines = ?
       WHERE Pump_Operator_ID = ?`,
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
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({
        error: "Email already exists or other constraint violation",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.delete("/adminDeleteOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await dbPromise;
    const result = await db.run(
      "DELETE FROM operator WHERE Pump_Operator_ID = ?",
      [id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Operator not found" });
    }

    res.json({ message: "Operator deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin operations for villagers
app.post("/adminAddVillager", isAuthenticated, async (req, res) => {
  const { House_No, Villager_Name, Contact_No, V_email, V_password } = req.body;

  try {
    const db = await dbPromise;
    const hashedPassword = await bcrypt.hash(V_password, 10);

    const result = await db.run(
      `INSERT INTO villager (House_No, Villager_Name, Contact_No, V_email, V_password)
       VALUES (?, ?, ?, ?, ?)`,
      [House_No, Villager_Name, Contact_No, V_email, hashedPassword]
    );

    res.json({
      message: "Villager added successfully",
      villagerId: result.lastID,
    });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({
        error: "House number or email already exists",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.get("/adminFetchVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;
  try {
    const db = await dbPromise;
    const villagerDetails = await db.get(
      "SELECT * FROM villager WHERE House_No = ?",
      [House_No]
    );

    if (!villagerDetails) {
      return res.status(404).json({ error: "Villager not found" });
    }
    res.json(villagerDetails);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/adminUpdateVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;
  const { Villager_Name, Contact_No, V_email, V_password } = req.body;

  try {
    const db = await dbPromise;
    let result;

    if (V_password) {
      const hashedPassword = await bcrypt.hash(V_password, 10);
      result = await db.run(
        `UPDATE villager 
         SET Villager_Name = ?, Contact_No = ?, V_email = ?, V_password = ?
         WHERE House_No = ?`,
        [Villager_Name, Contact_No, V_email, hashedPassword, House_No]
      );
    } else {
      result = await db.run(
        `UPDATE villager 
         SET Villager_Name = ?, Contact_No = ?, V_email = ?
         WHERE House_No = ?`,
        [Villager_Name, Contact_No, V_email, House_No]
      );
    }

    if (result.changes === 0) {
      return res.status(404).json({ error: "Villager not found" });
    }

    res.json({ message: "Villager updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({
        error: "Email already exists or other constraint violation",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.delete(
  "/adminDeleteVillager/:House_No",
  isAuthenticated,
  async (req, res) => {
    const { House_No } = req.params;
    try {
      const db = await dbPromise;
      const result = await db.run("DELETE FROM villager WHERE House_No = ?", [
        House_No,
      ]);

      if (result.changes === 0) {
        return res.status(404).json({ error: "Villager not found" });
      }

      res.json({ message: "Villager deleted successfully" });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Admin Search
app.get("/adminSearch", isAuthenticated, async (req, res) => {
  const { query } = req.query;
  try {
    const db = await dbPromise;
    const searchResults = await db.all(
      `SELECT * FROM panchayat 
       WHERE Panchayat_Name LIKE ? 
          OR Panchayat_Loc LIKE ? 
          OR PDO_Name LIKE ? 
          OR Contact_No LIKE ? 
          OR P_email LIKE ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );
    res.json(searchResults);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Complaints
app.get("/complaint", async (req, res) => {
  try {
    const db = await dbPromise;
    const complaints = await db.all(
      `SELECT f.*, v.Villager_Name 
       FROM feedback f
       LEFT JOIN villager v ON f.F_House_No = v.House_No
       ORDER BY Date_Issued DESC 
       LIMIT 10`
    );

    if (complaints.length > 0) {
      res.json(complaints);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch all complaints with pagination
app.get("/complaints", isAuthenticated, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const db = await dbPromise;
    const complaints = await db.all(
      `SELECT f.*, v.Villager_Name, v.Contact_No
       FROM feedback f
       LEFT JOIN villager v ON f.F_House_No = v.House_No
       ORDER BY f.Date_Issued DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalCount = await db.get("SELECT COUNT(*) as count FROM feedback");

    res.json({
      complaints,
      totalCount: totalCount.count,
      currentPage: page,
      totalPages: Math.ceil(totalCount.count / limit),
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000; // Use the PORT from the .env file or default to 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
