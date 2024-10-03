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

// async function startServer() {
//   await connectToDatabase();
//   // Server setup
//   const port = process.env.PORT;
//   app.listen(port, () => {
//     console.log(`Server started on port ${port}`);
//   });
// }
startServer();
