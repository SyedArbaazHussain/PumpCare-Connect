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
    origin: "http://localhost:5173", // Adjust this to match your frontend's URL
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
    const result = await sql`SELECT NOW()`; // Neon query
    console.log("Database connection successful: ", result[0]);
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
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// Admin login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result =
      await sql`SELECT Admin_ID, Admin_Email, Admin_Password FROM admin WHERE Admin_Email = ${email}`; // Use NeonDB's templated queries
    const userWithEmail = result[0];

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

  // Input validation
  if (!Admin_Name || !Admin_Email || !Admin_Password) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(Admin_Email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    const hashedPassword = await bcrypt.hash(Admin_Password, 10); // Hash password

    // Insert query to the database
    await sql`INSERT INTO admin (Admin_Name, Admin_Email, Admin_Password) VALUES (${Admin_Name}, ${Admin_Email}, ${hashedPassword})`;

    // Returning success message after insertion
    res.json({ message: "Admin signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      res.status(500).json({
        error:
          "Database access denied. Please check your database credentials.",
      });
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      res.status(500).json({
        error: "Database table not found. Please check your database schema.",
      });
    } else if (error.code === "ER_DUP_ENTRY") {
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
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(P_password, 10);

    // Check if Panchayat name or email already exists
    const existingPanchayat = await sql`
      SELECT 1 FROM panchayat WHERE P_email = ${P_email} OR Panchayat_Name = ${Panchayat_Name}
    `;

    // Ensure that `existingPanchayat` is an array or object with a `length` property
    if (
      existingPanchayat &&
      existingPanchayat.rows &&
      existingPanchayat.rows.length > 0
    ) {
      return res.status(400).json({
        error:
          "Panchayat email or name already exists. Please choose a different one.",
      });
    }

    // Insert the new Panchayat
    await sql`
      INSERT INTO panchayat (Panchayat_Name, Panchayat_Loc, PDO_Name, Contact_No, P_email, P_password) 
      VALUES (${Panchayat_Name}, ${Panchayat_Loc}, ${PDO_Name}, ${Contact_No}, ${P_email}, ${hashedPassword})
    `;

    // Return success response
    res.json({ message: "Panchayat signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);

    // Custom error handling
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      res.status(500).json({
        error:
          "Database access denied. Please check your database credentials.",
      });
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      res.status(500).json({
        error: "Database table not found. Please check your database schema.",
      });
    } else if (error.code === "23505") {
      // PostgreSQL Duplicate Key Error
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
    const hashedPassword = await bcrypt.hash(PO_password, 10);

    await sql`
      INSERT INTO operator (Pump_Operator_Name, Contact_No, PO_email, PO_password)
      VALUES (${Pump_Operator_Name}, ${Contact_No}, ${PO_email}, ${hashedPassword})
    `;

    res.json({ message: "Operator signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      res.status(500).json({
        error:
          "Database access denied. Please check your database credentials.",
      });
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      res.status(500).json({
        error: "Database table not found. Please check your database schema.",
      });
    } else if (error.code === "ER_DUP_ENTRY") {
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
    const hashedPassword = await bcrypt.hash(V_password, 10);

    await sql`
      INSERT INTO villager (House_No, Villager_Name, Contact_No, V_email, V_password)
      VALUES (${House_No}, ${Villager_Name}, ${Contact_No}, ${V_email}, ${hashedPassword})
    `;

    res.json({ message: "Villager signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      res.status(500).json({
        error:
          "Database access denied. Please check your database credentials.",
      });
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      res.status(500).json({
        error: "Database table not found. Please check your database schema.",
      });
    } else if (error.code === "ER_DUP_ENTRY") {
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

  // Validate the incoming request data
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required!" });
  }

  try {
    const { rows } = await sql`
      SELECT P_email, P_password, Panchayat_ID
      FROM panchayat
      WHERE P_email = ${email}
    `;

    // Safeguard to check if rows is empty
    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const userWithEmail = rows[0];

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(
      password,
      userWithEmail.P_password
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    // Generate JWT token upon successful authentication
    const jwtToken = jwt.sign(
      {
        id: userWithEmail.Panchayat_ID,
        email: userWithEmail.P_email,
        role: "panchayat",
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Optional: set token expiration time
    );

    // Send success response with token
    res.json({ message: "Login successful", token: jwtToken });
  } catch (err) {
    // Log error and send internal server error response
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Fetch Panchayat_ID by email
app.get("/panchayat_details", isAuthenticated, async (req, res) => {
  const { email } = req.user;

  try {
    const panchayatDetails = await sql`
      SELECT Panchayat_ID, Panchayat_Name, Panchayat_Loc, PDO_Name, P_email, Contact_No 
      FROM panchayat 
      WHERE P_email = ${email}
    `;

    if (panchayatDetails.length === 0) {
      return res
        .status(404)
        .json({ error: "Panchayat details not found for the given email" });
    }

    res.json(panchayatDetails[0]);
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
    if (!Sector_Name || !Pump_Operator_ID || !No_Of_Tanks) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const result = await sql`
      INSERT INTO sector (Sector_Name, Panchayat_ID, Pump_Operator_ID, No_Of_Tanks)
      VALUES (${Sector_Name}, ${id}, ${Pump_Operator_ID}, ${No_Of_Tanks})
    `;

    res.json({
      message: "Sector added successfully",
      sectorId: result[0].insertId,
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
    const sectorDetails = await sql`
      SELECT * FROM sector WHERE Sector_ID = ${id}
    `;

    if (sectorDetails.length === 0) {
      return res
        .status(404)
        .json({ error: "Sector details not found for the given ID" });
    }

    res.json(sectorDetails[0]);
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
    const result = await sql`
      UPDATE sector 
      SET Sector_Name = ${Sector_Name}, Panchayat_ID = ${Panchayat_ID}, 
          Pump_Operator_ID = ${Pump_Operator_ID}, No_Of_Tanks = ${No_Of_Tanks} 
      WHERE Sector_ID = ${id}
    `;

    if (result.rowCount === 0) {
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
    await sql`
      DELETE FROM sector WHERE Sector_ID = ${id}
    `;

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

    const [result] = await sql`
      INSERT INTO operator (Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines)
      VALUES (${Pump_Operator_Name}, ${Contact_No}, ${PO_email}, ${hashedPassword}, ${No_Of_Lines})
    `;

    res.json({
      message: "Operator added successfully",
      operatorId: result.insertId,
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
    const { rows } = await sql`
      SELECT * FROM operator WHERE Pump_Operator_ID = ${id}
    `;
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
app.put("/updateOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(PO_password, 10); // Hash password

    await sql`
      UPDATE operator
      SET Pump_Operator_Name = ${Pump_Operator_Name}, Contact_No = ${Contact_No}, PO_email = ${PO_email}, 
          PO_password = ${hashedPassword}, No_Of_Lines = ${No_Of_Lines}
      WHERE Pump_Operator_ID = ${id}
    `;

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
    await sql`
      DELETE FROM operator WHERE Pump_Operator_ID = ${id}
    `;
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
    const [result] = await sql`
      INSERT INTO villager (Villager_Name, Contact_No, V_Pump_Operator_ID, V_email, V_password)
      VALUES (${villager.Villager_Name}, ${villager.Contact_No}, ${villager.V_Pump_Operator_ID}, 
              ${villager.V_email}, ${villager.V_password})
    `;
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
app.get("/fetchVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;

  try {
    const { rows } = await sql`
      SELECT * FROM villager WHERE House_No = ${House_No}
    `;
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

// Fetch No Of Complaints
app.get("/fetchNoOfComplaints/:F_House_No", async (req, res) => {
  const { F_House_No } = req.params;

  try {
    const { rows } = await sql`
      SELECT * FROM feedback WHERE F_House_No = ${F_House_No}
    `;
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
app.put("/updateVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;
  const villager = req.body;

  try {
    await sql`
      UPDATE villager
      SET Villager_Name = ${villager.Villager_Name}, Contact_No = ${villager.Contact_No},
          V_Pump_Operator_ID = ${villager.V_Pump_Operator_ID}, V_email = ${villager.V_email},
          V_password = ${villager.V_password}
      WHERE House_No = ${House_No}
    `;
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
    await sql`DELETE FROM villager WHERE House_No = ${House_No}`;
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
    const hashedPassword = await bcrypt.hash(P_password, 10); // Hash password
    await sql`
      INSERT INTO panchayat (Panchayat_Name, Panchayat_Loc, PDO_Name, Contact_No, P_email, P_password)
      VALUES (${Panchayat_Name}, ${Panchayat_Loc}, ${PDO_Name}, ${Contact_No}, ${P_email}, ${hashedPassword})
    `;
    res.json({ message: "Panchayat added successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    await sql`
      UPDATE panchayat
      SET Panchayat_Name = ${Panchayat_Name}, Panchayat_Loc = ${Panchayat_Loc}, PDO_Name = ${PDO_Name},
          Contact_No = ${Contact_No}, P_email = ${P_email}, P_password = ${P_password}
      WHERE Panchayat_ID = ${id}
    `;
    res.json({ message: "Panchayat updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/adminDeletePanchayat/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM panchayat WHERE Panchayat_ID = ${id}`;
    res.json({ message: "Panchayat deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/adminFetchPanchayat/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await sql`
      SELECT * FROM panchayat WHERE Panchayat_ID = ${id}
    `;
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
app.post("/adminAddOperator", isAuthenticated, async (req, res) => {
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines } =
    req.body;
  try {
    const hashedPassword = await bcrypt.hash(PO_password, 10); // Hash password
    await sql`
      INSERT INTO operator (Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines)
      VALUES (${Pump_Operator_Name}, ${Contact_No}, ${PO_email}, ${hashedPassword}, ${No_Of_Lines})
    `;
    res.json({ message: "Operator added successfully" });
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
    const hashedPassword = await bcrypt.hash(PO_password, 10); // Hash password
    await sql`
      UPDATE operator
      SET Pump_Operator_Name = ${Pump_Operator_Name}, Contact_No = ${Contact_No}, PO_email = ${PO_email},
          PO_password = ${hashedPassword}, No_Of_Lines = ${No_Of_Lines}
      WHERE Pump_Operator_ID = ${id}
    `;
    res.json({ message: "Operator updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Operator
app.delete("/adminDeleteOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM operator WHERE Pump_Operator_ID = ${id}`;
    res.json({ message: "Operator deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Operator
app.get("/adminFetchOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } =
      await sql`SELECT * FROM operator WHERE Pump_Operator_ID = ${id}`;
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

// Admin Add Operator
app.post("/adminAddOperator", isAuthenticated, async (req, res) => {
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines } =
    req.body;
  try {
    const hashedPassword = await bcrypt.hash(PO_password, 10); // Hash password
    const [result] =
      await sql`INSERT INTO operator (Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines) 
                               VALUES (${Pump_Operator_Name}, ${Contact_No}, ${PO_email}, ${hashedPassword}, ${No_Of_Lines})`;
    res.json({
      message: "Operator added successfully",
      operatorId: result.insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Update Operator
app.put("/adminUpdateOperator/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password, No_Of_Lines } =
    req.body;
  try {
    const hashedPassword = await bcrypt.hash(PO_password, 10); // Hash password
    await sql`UPDATE operator SET Pump_Operator_Name = ${Pump_Operator_Name}, Contact_No = ${Contact_No}, 
              PO_email = ${PO_email}, PO_password = ${hashedPassword}, No_Of_Lines = ${No_Of_Lines} 
              WHERE Pump_Operator_ID = ${id}`;
    res.json({ message: "Operator updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Add Villager
app.post("/adminAddVillager", isAuthenticated, async (req, res) => {
  const villager = req.body;
  try {
    const [result] =
      await sql`INSERT INTO villager (Villager_Name, Contact_No, V_Pump_Operator_ID, V_email, V_password) 
                               VALUES (${villager.Villager_Name}, ${villager.Contact_No}, ${villager.V_Pump_Operator_ID}, 
                                       ${villager.V_email}, ${villager.V_password})`;
    res.json({
      message: "Villager added successfully",
      villagerId: result.insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Update Villager
app.put("/adminUpdateVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;
  const villager = req.body;
  try {
    await sql`UPDATE villager SET Villager_Name = ${villager.Villager_Name}, Contact_No = ${villager.Contact_No}, 
              V_Pump_Operator_ID = ${villager.V_Pump_Operator_ID}, V_email = ${villager.V_email}, 
              V_password = ${villager.V_password} WHERE House_No = ${House_No}`;
    res.json({ message: "Villager updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Delete Villager
app.delete(
  "/adminDeleteVillager/:House_No",
  isAuthenticated,
  async (req, res) => {
    const { House_No } = req.params;
    try {
      await sql`DELETE FROM villager WHERE House_No = ${House_No}`;
      res.json({ message: "Villager deleted successfully" });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Admin Fetch Villager
app.get("/adminFetchVillager/:House_No", isAuthenticated, async (req, res) => {
  const { House_No } = req.params;
  try {
    const { rows } =
      await sql`SELECT * FROM villager WHERE House_No = ${House_No}`;
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

// Admin Search
app.get("/adminSearch", isAuthenticated, async (req, res) => {
  const { query } = req.query;
  try {
    const { rows } =
      await sql`SELECT * FROM panchayat WHERE Panchayat_Name LIKE ${`%${query}%`} 
                               OR Panchayat_Loc LIKE ${`%${query}%`} OR PDO_Name LIKE ${`%${query}%`} 
                               OR Contact_No LIKE ${`%${query}%`} OR P_email LIKE ${`%${query}%`}`;
    res.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Complaints
app.get("/complaint", isAuthenticated, async (req, res) => {
  try {
    const { rows } =
      await sql`SELECT Feedback_ID, F_House_No, Description, Date_Issued, F_Pump_Operator_ID, Feedback_Status 
                               FROM feedback ORDER BY Date_Issued DESC LIMIT 10`;
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

const PORT = process.env.PORT || 3000; // Use the PORT from the .env file or default to 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
