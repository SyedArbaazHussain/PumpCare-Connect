const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { connection, JWT_SECRET } = require("../server");

// Admin login route
router.post("/login", async (req, res) => {
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
router.post("/signup", async (req, res) => {
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
router.post("/signupp", async (req, res) => {
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

router.post("/signuppo", async (req, res) => {
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

router.post("/signupv", async (req, res) => {
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
router.post("/loginp", async (req, res) => {
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

