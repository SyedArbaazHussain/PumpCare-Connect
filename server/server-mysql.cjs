const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
require("dotenv").config({ path: "./server/.env" });

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Adjust this to match your frontend's URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(bodyParser.json());

let connection;
// Database connection setup
async function connectToDatabase() {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
}
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

async function startServer() {
  await connectToDatabase();
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

async function startServer() {
  await connectToDatabase();
  // Server setup
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

// Admin login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await connection.execute(
      "SELECT Admin_ID, Admin_Email, Admin_Password FROM admin WHERE Admin_Email = ?",
      [email]
    );
    const userWithEmail = rows[0];

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

// Admin signup route
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

    const [_, fields] = await connection.execute(
      "INSERT INTO admin (Admin_Name, Admin_Email, Admin_Password) VALUES (?, ?, ?)",
      [Admin_Name, Admin_Email, hashedPassword]
    );

    res.json({ message: "Admin signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    // Provide more detailed error messages
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
      // Handle duplicate entry error
      res.status(400).json({
        error: "Admin email already exists. Please choose a different email.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Signup route
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

  const phoneRegex = /^\d{10}$/; // Ensure 10-digit phone number
  if (!phoneRegex.test(Contact_No)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid 10-digit contact number" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(P_email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    const hashedPassword = await bcrypt.hash(P_password, 10); // Hash password

    const [_, fields] = await connection.execute(
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

    res.json({ message: "Panchayat signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    // Provide more detailed error messages
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
      // Handle duplicate entry error
      res.status(400).json({
        error: "Panchayat name already exists. Please choose a different name.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
app.post("/signuppo", async (req, res) => {
  const { Pump_Operator_Name, Contact_No, PO_email, PO_password } = req.body;

  // Input validation
  if (!Pump_Operator_Name || !Contact_No || !PO_email || !PO_password) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  const phoneRegex = /^\d{10}$/; // Ensure 10-digit phone number
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
    const hashedPassword = await bcrypt.hash(PO_password, 10); // Hash password

    const [_, fields] = await connection.execute(
      "INSERT INTO operator (Pump_Operator_Name, Contact_No, PO_email, PO_password) VALUES (?, ?, ?, ?)",
      [Pump_Operator_Name, Contact_No, PO_email, hashedPassword]
    );

    res.json({ message: "Operator signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    // Provide more detailed error messages
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
      // Handle duplicate entry error
      res.status(400).json({
        error: "Operator name already exists. Please choose a different name.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
app.post("/signupv", async (req, res) => {
  const { House_No, Villager_Name, Contact_No, V_email, V_password } = req.body;

  // Input validation
  if (!House_No || !Villager_Name || !Contact_No || !V_email || !V_password) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  const phoneRegex = /^\d{10}$/; // Ensure 10-digit phone number
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
    const hashedPassword = await bcrypt.hash(V_password, 10); // Hash password

    const [_, fields] = await connection.execute(
      "INSERT INTO villager (House_No, Villager_Name, Contact_No, V_email, V_password) VALUES (?, ?, ?, ?, ?)",
      [House_No, Villager_Name, Contact_No, V_email, hashedPassword]
    );

    res.json({ message: "Villager signed up successfully" });
  } catch (error) {
    console.error("Database error:", error);
    // Provide more detailed error messages
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
      // Handle duplicate entry error
      res.status(400).json({
        error: "Villager name already exists. Please choose a different name.",
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Backend: Add Panchayat_ID to the user object upon login
app.post("/loginp", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await connection.execute(
      "SELECT P_email, P_password, Panchayat_ID FROM panchayat WHERE P_email = ?",
      [email]
    );
    const userWithEmail = rows[0];

    if (!userWithEmail) {
      return res
        .status(400)
        .json({ message: "Email or Password does not match!!" });
    }

    // Compare the provided password with the hashed password from the database
    const isPasswordValid = await bcrypt.compare(
      password,
      userWithEmail.P_password
    );

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Email or Password does not match!!" });
    }

    // If the password is valid, generate a JWT token
    const jwtToken = jwt.sign(
      {
        id: userWithEmail.Panchayat_ID,
        email: userWithEmail.P_email,
        role: "panchayat",
      },
      JWT_SECRET
    );

    res.json({ message: "Login successful", token: jwtToken });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Fetch panchayat_id by email
app.get("/panchayat_details", isAuthenticated, async (req, res) => {
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
app.get("/fetchSector/:id", isAuthenticated, async (req, res) => {
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
app.put("/updateSector/:id", isAuthenticated, async (req, res) => {
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
app.delete("/deleteSector/:id", isAuthenticated, async (req, res) => {
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
app.post("/addOperator", isAuthenticated, async (req, res) => {
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

// Fetch operator by ID
app.get("/fetchOperator/:id", isAuthenticated, async (req, res) => {
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
app.put("/updateOperator/:id", isAuthenticated, async (req, res) => {
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
app.delete("/deleteOperator/:id", isAuthenticated, async (req, res) => {
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

app.post("/addvillager", isAuthenticated, async (req, res) => {
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
app.get("/fetchVillager/:House_No", isAuthenticated, async (req, res) => {
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
app.get("/fetchNoOfComplaints/:F_House_No", async (req, res) => {
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
app.put("/updateVillager/:House_No", isAuthenticated, async (req, res) => {
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
app.delete("/deleteVillager/:House_No", isAuthenticated, async (req, res) => {
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

app.delete("/adminDeletePanchayat/:id", isAuthenticated, async (req, res) => {
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

app.get("/adminFetchPanchayat/:id", isAuthenticated, async (req, res) => {
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
app.post("/adminAddOperator", isAuthenticated, async (req, res) => {
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

app.put("/adminUpdateOperator/:id", isAuthenticated, async (req, res) => {
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

app.delete("/adminDeleteOperator/:id", isAuthenticated, async (req, res) => {
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

app.get("/adminFetchOperator/:id", isAuthenticated, async (req, res) => {
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
app.post("/adminAddVillager", isAuthenticated, async (req, res) => {
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

app.put("/adminUpdateVillager/:House_No", isAuthenticated, async (req, res) => {
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

app.delete(
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

app.get("/adminFetchVillager/:House_No", isAuthenticated, async (req, res) => {
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
app.get("/adminSearch", isAuthenticated, async (req, res) => {
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

app.get("/complaint", isAuthenticated, async (req, res) => {
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

startServer();
