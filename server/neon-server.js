import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import { neon } from "@neondatabase/serverless";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware setup
app.use(
  cors({
    origin: "https://pump-care-connect.vercel.app/",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(bodyParser.json());

// Database connection setup using environment variables
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(
  `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
);

// Test database connection
async function testDbConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("Database connection successful: ", result[0].now);
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
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// Authentication Routes
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await sql`
      SELECT admin_id, admin_email, admin_password 
      FROM admin 
      WHERE admin_email = ${email}
    `;

    if (!result || result.length === 0) {
      return res
        .status(400)
        .json({ message: "Email or Password does not match!" });
    }

    const userWithEmail = result[0];
    const isPasswordValid = await bcrypt.compare(
      password,
      userWithEmail.admin_password
    );

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Email or Password does not match!" });
    }

    const jwtToken = jwt.sign(
      {
        id: userWithEmail.admin_id,
        email: userWithEmail.admin_email,
        role: "admin",
      },
      JWT_SECRET
    );

    res.json({ message: "Login successful", token: jwtToken });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/signup", async (req, res) => {
  const { admin_name, admin_email, admin_password } = req.body;

  if (!admin_name || !admin_email || !admin_password) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(admin_email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    const hashedPassword = await bcrypt.hash(admin_password, 10);

    await sql`
      INSERT INTO admin (admin_name, admin_email, admin_password) 
      VALUES (${admin_name}, ${admin_email}, ${hashedPassword})
    `;

    res.json({ message: "Admin signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);

    if (error.code === "23505") {
      // PostgreSQL unique violation error
      res.status(400).json({
        error: "Admin email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.post("/signupp", async (req, res) => {
  const {
    panchayat_name,
    panchayat_loc,
    pdo_name,
    contact_no,
    p_email,
    p_password,
  } = req.body;

  // Input validation
  if (
    !panchayat_name ||
    !panchayat_loc ||
    !pdo_name ||
    !contact_no ||
    !p_email ||
    !p_password
  ) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(contact_no)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid 10-digit contact number" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(p_email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    const hashedPassword = await bcrypt.hash(p_password, 10);

    // Check if Panchayat name or email already exists
    const existingPanchayat = await sql`
      SELECT 1 FROM panchayat WHERE p_email = ${p_email} OR panchayat_name = ${panchayat_name}
    `;

    if (existingPanchayat.length > 0) {
      return res.status(400).json({
        error:
          "Panchayat email or name already exists. Please choose a different one.",
      });
    }

    await sql`
      INSERT INTO panchayat (panchayat_name, panchayat_loc, pdo_name, contact_no, p_email, p_password) 
      VALUES (${panchayat_name}, ${panchayat_loc}, ${pdo_name}, ${contact_no}, ${p_email}, ${hashedPassword})
    `;

    res.json({ message: "Panchayat signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
      res.status(400).json({
        error:
          "Panchayat name or email already exists. Please choose a different one.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
// Pump Operator signup route
app.post("/signuppo", async (req, res) => {
  const { pump_operator_name, contact_no, po_email, po_password } = req.body;

  if (!pump_operator_name || !contact_no || !po_email || !po_password) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(contact_no)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid 10-digit contact number" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(po_email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    const hashedPassword = await bcrypt.hash(po_password, 10);

    await sql`
      INSERT INTO operator (pump_operator_name, contact_no, po_email, po_password)
      VALUES (${pump_operator_name}, ${contact_no}, ${po_email}, ${hashedPassword})
    `;

    res.json({ message: "Operator signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
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
  const { house_no, villager_name, contact_no, v_email, v_password } = req.body;

  if (!house_no || !villager_name || !contact_no || !v_email || !v_password) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(contact_no)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid 10-digit contact number" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(v_email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    const hashedPassword = await bcrypt.hash(v_password, 10);

    await sql`
      INSERT INTO villager (house_no, villager_name, contact_no, v_email, v_password)
      VALUES (${house_no}, ${villager_name}, ${contact_no}, ${v_email}, ${hashedPassword})
    `;

    res.json({ message: "Villager signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
      res.status(400).json({
        error:
          "Villager email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Panchayat login route
app.post("/loginp", async (req, res) => {
  const { email, password } = req.body;

  // Debug logging
  console.log("Login attempt:", { email });

  if (!email || !password) {
    console.log("Missing credentials:", {
      email,
      passwordProvided: !!password,
    });
    return res
      .status(400)
      .json({ message: "Email and password are required!" });
  }

  try {
    // Query debug log
    console.log("Executing query for email:", email);

    const result = await sql`
      SELECT p_email, p_password, panchayat_id
      FROM panchayat
      WHERE p_email = ${email}
    `;

    console.log("Query result:", result);

    if (!result || result.length === 0) {
      console.log("No user found with email:", email);
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const userWithEmail = result[0];

    // Log password comparison (don't log actual passwords)
    console.log("Comparing passwords for user:", userWithEmail.p_email);

    const isPasswordValid = await bcrypt.compare(
      password,
      userWithEmail.p_password
    );

    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const jwtToken = jwt.sign(
      {
        id: userWithEmail.panchayat_id,
        email: userWithEmail.p_email,
        role: "panchayat",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login successful for user:", email);
    res.json({ message: "Login successful", token: jwtToken });
  } catch (err) {
    console.error("Login error details:", err);
    res.status(500).json({
      message: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Fetch Panchayat details
app.get("/panchayat_details", isAuthenticated, async (req, res) => {
  const { email } = req.user;

  try {
    const result = await sql`
      SELECT panchayat_id, panchayat_name, panchayat_loc, pdo_name, p_email, contact_no 
      FROM panchayat 
      WHERE p_email = ${email}
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Panchayat details not found for the given email" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add Sector
app.post("/addSector", isAuthenticated, async (req, res) => {
  const { sector_name, pump_operator_id, no_of_tanks } = req.body;
  const { id } = req.user;

  try {
    if (!sector_name || !pump_operator_id || !no_of_tanks) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const result = await sql`
      INSERT INTO sector (sector_name, panchayat_id, pump_operator_id, no_of_tanks)
      VALUES (${sector_name}, ${id}, ${pump_operator_id}, ${no_of_tanks})
      RETURNING sector_id
    `;

    res.json({
      message: "Sector added successfully",
      sectorId: result[0].sector_id,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Sector
app.get("/fetchSector/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sql`
      SELECT * FROM sector WHERE sector_id = ${id}
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Sector details not found for the given ID" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Update Sector
app.put("/updateSector/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { sector_name, panchayat_id, pump_operator_id, no_of_tanks } = req.body;

  try {
    const result = await sql`
      UPDATE sector 
      SET sector_name = ${sector_name},
          panchayat_id = ${panchayat_id},
          pump_operator_id = ${pump_operator_id},
          no_of_tanks = ${no_of_tanks}
      WHERE sector_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
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
    const result = await sql`
      DELETE FROM sector 
      WHERE sector_id = ${id}
      RETURNING sector_id
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Sector not found" });
    }

    res.json({ message: "Sector deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add Pump Operator
app.post("/addOperator", isAuthenticated, async (req, res) => {
  const { pump_operator_name, contact_no, po_email, po_password, no_of_lines } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(po_password, 10);

    const result = await sql`
      INSERT INTO operator (pump_operator_name, contact_no, po_email, po_password, no_of_lines)
      VALUES (${pump_operator_name}, ${contact_no}, ${po_email}, ${hashedPassword}, ${no_of_lines})
      RETURNING pump_operator_id
    `;

    res.json({
      message: "Operator added successfully",
      operatorId: result[0].pump_operator_id,
    });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
      res.status(400).json({
        error:
          "Operator email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Fetch operator
app.get("/fetchOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sql`
      SELECT * FROM operator WHERE pump_operator_id = ${id}
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Operator details not found for the given ID" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Pump Operator
app.put("/updateOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { pump_operator_name, contact_no, po_email, po_password, no_of_lines } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(po_password, 10);

    const result = await sql`
      UPDATE operator
      SET pump_operator_name = ${pump_operator_name},
          contact_no = ${contact_no},
          po_email = ${po_email},
          po_password = ${hashedPassword},
          no_of_lines = ${no_of_lines}
      WHERE pump_operator_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Operator not found or not updated" });
    }

    res.json({ message: "Operator updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
      res.status(400).json({
        error:
          "Operator email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Delete Pump Operator
app.delete("/deleteOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sql`
      DELETE FROM operator 
      WHERE pump_operator_id = ${id}
      RETURNING pump_operator_id
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Operator not found" });
    }

    res.json({ message: "Operator deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add Villager
app.post("/addvillager", isAuthenticated, async (req, res) => {
  const { villager_name, contact_no, v_pump_operator_id, v_email, v_password } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(v_password, 10);

    const result = await sql`
      INSERT INTO villager (villager_name, contact_no, v_pump_operator_id, v_email, v_password)
      VALUES (${villager_name}, ${contact_no}, ${v_pump_operator_id}, ${v_email}, ${hashedPassword})
      RETURNING house_no
    `;

    res.json({
      message: "Villager added successfully",
      villagerId: result[0].house_no,
    });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
      res.status(400).json({
        error:
          "Villager email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
// Fetch Villager
app.get("/fetchVillager/:house_no", isAuthenticated, async (req, res) => {
  const { house_no } = req.params;

  try {
    const result = await sql`
      SELECT * FROM villager WHERE house_no = ${house_no}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Villager not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch No Of Complaints
app.get("/fetchNoOfComplaints/:f_house_no", async (req, res) => {
  const { f_house_no } = req.params;

  try {
    const result = await sql`
      SELECT * FROM feedback WHERE f_house_no = ${f_house_no}
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No complaint details found for the given house ID" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Villager
app.put("/updateVillager/:house_no", isAuthenticated, async (req, res) => {
  const { house_no } = req.params;
  const { villager_name, contact_no, v_pump_operator_id, v_email, v_password } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(v_password, 10);

    const result = await sql`
      UPDATE villager
      SET villager_name = ${villager_name},
          contact_no = ${contact_no},
          v_pump_operator_id = ${v_pump_operator_id},
          v_email = ${v_email},
          v_password = ${hashedPassword}
      WHERE house_no = ${house_no}
      RETURNING *
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Villager not found or not updated" });
    }

    res.json({ message: "Villager updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
      res.status(400).json({
        error:
          "Villager email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Delete Villager
app.delete("/deleteVillager/:house_no", isAuthenticated, async (req, res) => {
  const { house_no } = req.params;

  try {
    const result = await sql`
      DELETE FROM villager 
      WHERE house_no = ${house_no}
      RETURNING house_no
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Villager not found" });
    }

    res.json({ message: "Villager deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Routes

// Admin add panchayat
app.post("/adminAddPanchayat", isAuthenticated, async (req, res) => {
  const {
    panchayat_name,
    panchayat_loc,
    pdo_name,
    contact_no,
    p_email,
    p_password,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(p_password, 10);

    const result = await sql`
      INSERT INTO panchayat (panchayat_name, panchayat_loc, pdo_name, contact_no, p_email, p_password)
      VALUES (${panchayat_name}, ${panchayat_loc}, ${pdo_name}, ${contact_no}, ${p_email}, ${hashedPassword})
      RETURNING panchayat_id
    `;

    res.json({
      message: "Panchayat added successfully",
      panchayatId: result[0].panchayat_id,
    });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
      res.status(400).json({
        error:
          "Panchayat email or name already exists. Please choose different ones.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Admin update panchayat
app.put("/adminUpdatePanchayat/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const {
    panchayat_name,
    panchayat_loc,
    pdo_name,
    contact_no,
    p_email,
    p_password,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(p_password, 10);

    const result = await sql`
      UPDATE panchayat
      SET panchayat_name = ${panchayat_name},
          panchayat_loc = ${panchayat_loc},
          pdo_name = ${pdo_name},
          contact_no = ${contact_no},
          p_email = ${p_email},
          p_password = ${hashedPassword}
      WHERE panchayat_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Panchayat not found or not updated" });
    }

    res.json({ message: "Panchayat updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
      res.status(400).json({
        error:
          "Panchayat email or name already exists. Please choose different ones.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
// Admin delete panchayat
app.delete("/adminDeletePanchayat/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sql`
      DELETE FROM panchayat 
      WHERE panchayat_id = ${id}
      RETURNING panchayat_id
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Panchayat not found" });
    }

    res.json({ message: "Panchayat deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin fetch panchayat
app.get("/adminFetchPanchayat/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sql`
      SELECT * FROM panchayat WHERE panchayat_id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Panchayat not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin add operator
app.post("/adminAddOperator", isAuthenticated, async (req, res) => {
  const { pump_operator_name, contact_no, po_email, po_password, no_of_lines } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(po_password, 10);

    const result = await sql`
      INSERT INTO operator (pump_operator_name, contact_no, po_email, po_password, no_of_lines)
      VALUES (${pump_operator_name}, ${contact_no}, ${po_email}, ${hashedPassword}, ${no_of_lines})
      RETURNING pump_operator_id
    `;

    res.json({
      message: "Operator added successfully",
      operatorId: result[0].pump_operator_id,
    });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
      res.status(400).json({
        error:
          "Operator email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Admin update operator
app.put("/adminUpdateOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { pump_operator_name, contact_no, po_email, po_password, no_of_lines } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(po_password, 10);

    const result = await sql`
      UPDATE operator
      SET pump_operator_name = ${pump_operator_name},
          contact_no = ${contact_no},
          po_email = ${po_email},
          po_password = ${hashedPassword},
          no_of_lines = ${no_of_lines}
      WHERE pump_operator_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Operator not found or not updated" });
    }

    res.json({ message: "Operator updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "23505") {
      res.status(400).json({
        error:
          "Operator email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Admin delete operator
app.delete("/adminDeleteOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sql`
      DELETE FROM operator 
      WHERE pump_operator_id = ${id}
      RETURNING pump_operator_id
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Operator not found" });
    }

    res.json({ message: "Operator deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin fetch operator
app.get("/adminFetchOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sql`
      SELECT * FROM operator WHERE pump_operator_id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Operator not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin search
app.get("/adminSearch", isAuthenticated, async (req, res) => {
  const { query } = req.query;

  try {
    const result = await sql`
      SELECT * FROM panchayat 
      WHERE panchayat_name ILIKE ${`%${query}%`}
         OR panchayat_loc ILIKE ${`%${query}%`}
         OR pdo_name ILIKE ${`%${query}%`}
         OR contact_no LIKE ${`%${query}%`}
         OR p_email ILIKE ${`%${query}%`}
    `;

    res.json(result);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Complaints
app.get("/complaint", isAuthenticated, async (req, res) => {
  try {
    const result = await sql`
      SELECT feedback_id, f_house_no, description, date_issued, f_pump_operator_id, feedback_status 
      FROM feedback 
      ORDER BY date_issued DESC 
      LIMIT 10
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "No recent complaints found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
