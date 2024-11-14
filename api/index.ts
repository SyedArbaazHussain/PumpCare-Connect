import express, {
  Request,
  Response,
  NextFunction,
  Express,
  RequestHandler,
} from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import process from "process";
import dotenv from "dotenv";
// Type definitions
interface User {
  id: number;
  email: string;
  role: string;
  exp?: number;
}

interface AuthRequest extends Request {
  user: User;
}

interface Admin {
  admin_id: number;
  admin_email: string;
  admin_password: string;
  admin_name: string;
}

interface Panchayat {
  panchayat_id: number;
  panchayat_name: string;
  panchayat_loc: string;
  pdo_name: string;
  contact_no: string;
  p_email: string;
  p_password: string;
}

interface Operator {
  pump_operator_id: number;
  pump_operator_name: string;
  contact_no: string;
  po_email: string;
  po_password: string;
  no_of_lines?: number;
}

interface Villager {
  house_no: number;
  villager_name: string;
  contact_no: string;
  v_email: string;
  v_password: string;
  v_pump_operator_id?: number;
}

interface Sector {
  sector_id: number;
  sector_name: string;
  panchayat_id: number;
  pump_operator_id: number;
  no_of_tanks: number;
}

interface Feedback {
  feedback_id: number;
  f_house_no: number;
  description: string;
  date_issued: Date;
  f_pump_operator_id: number;
  feedback_status: string;
}

// Types for request bodies
interface LoginRequest {
  email: string;
  password: string;
}

interface AdminSignupRequest {
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

interface PanchayatSignupRequest {
  panchayat_name: string;
  panchayat_loc: string;
  pdo_name: string;
  contact_no: string;
  p_email: string;
  p_password: string;
}

interface OperatorSignupRequest {
  pump_operator_name: string;
  contact_no: string;
  po_email: string;
  po_password: string;
  no_of_lines?: number;
}

interface VillagerSignupRequest {
  villager_name: string;
  contact_no: string;
  v_email: string;
  v_password: string;
  house_no: number;
  v_pump_operator_id?: number;
}

// Types for additional requests
interface UpdateOperatorRequest {
  pump_operator_name?: string;
  contact_no?: string;
  no_of_lines?: number;
}

interface UpdatePanchayatRequest {
  panchayat_name?: string;
  panchayat_loc?: string;
  pdo_name?: string;
  contact_no?: string;
}

dotenv.config();

const app: Express = express();

// Middleware setup
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://pump-care-connect.vercel.app"
        : ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Database connection setup
const databaseUrl: string = process.env.DATABASE_URL as string;
const sql: NeonQueryFunction<any, any> = neon(databaseUrl);

// Test database connection
async function testDbConnection(): Promise<void> {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("Database connection successful: ", result[0].now);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

testDbConnection();

// Authentication middleware
const isAuthenticated: RequestHandler = async (
  req: AuthRequest,
  res: Response,
  next
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" }); // Keep this line
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as User;

    // Check if the token has expired
    if (
      typeof decoded === "object" &&
      decoded.exp &&
      decoded.exp < Date.now() / 1000
    ) {
      return res.status(401).json({ error: "Token has expired" });
    }

    req.user = decoded;
    next(); // Ensure to call next() without returning it
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Unauthorized" }); // Keep this line
  }
};
app.get("/", (_req: Request, res: Response) => res.send("Express on Vercel"));

// Login route
app.post(
  "/login",
  async (
    req: Request<{}, {}, LoginRequest>,
    res: Response
  ): Promise<Response> => {
    const { email, password } = req.body;

    try {
      const result = await sql`
      SELECT admin_id, admin_email, admin_password 
      FROM admin 
      WHERE admin_email = ${email}
    ` as Admin[];

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
        process.env.JWT_SECRET as string
      );

      return res.json({ message: "Login successful", token: jwtToken });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Admin signup route
app.post(
  "/signup",
  async (
    req: Request<unknown, unknown, AdminSignupRequest>,
    res: Response
  ): Promise<Response> => {
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

      return res.json({ message: "Admin signed up successfully" });
    } catch (error: any) {
      console.error("Database error:", error);

      if (error.code === "23505") {
        return res.status(400).json({
          error: "Admin email already exists. Please choose a different email.",
        });
      } else {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

// Panchayat signup route
app.post(
  "/signupp",
  async (
    req: Request<unknown, unknown, PanchayatSignupRequest>,
    res: Response
  ): Promise<Response> => {
    const {
      panchayat_name,
      panchayat_loc,
      pdo_name,
      contact_no,
      p_email,
      p_password,
    } = req.body;

    try {
      // Validate required fields
      if (
        !panchayat_name ||
        !panchayat_loc ||
        !pdo_name ||
        !contact_no ||
        !p_email ||
        !p_password
      ) {
        return res.status(400).json({
          success: false,
          error: "Please provide all required fields",
        });
      }

      // Validate phone number
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(contact_no)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid 10-digit contact number",
        });
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(p_email)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid email address",
        });
      }

      const hashedPassword = await bcrypt.hash(p_password, 10);

      // Check for existing panchayat
      const existingPanchayat = await sql`
      SELECT 1 FROM panchayat 
      WHERE p_email = ${p_email} 
      OR panchayat_name = ${panchayat_name}
    ` as any[];

      if (existingPanchayat.length > 0) {
        return res.status(400).json({
          success: false,
          error:
            "Panchayat email or name already exists. Please choose a different one.",
        });
      }

      // Insert new panchayat
      await sql`
      INSERT INTO panchayat (
        panchayat_name, 
        panchayat_loc, 
        pdo_name, 
        contact_no, 
        p_email, 
        p_password
      ) VALUES (
        ${panchayat_name}, 
        ${panchayat_loc}, 
        ${pdo_name}, 
        ${contact_no}, 
        ${p_email}, 
        ${hashedPassword}
      )
    `;

      return res.status(201).json({
        success: true,
        message: "Panchayat signed up successfully",
      });
    } catch (error: any) {
      console.error("Signup error:", error);

      if (error.code === "23505") {
        return res.status(400).json({
          success: false,
          error:
            "Panchayat name or email already exists. Please choose a different one.",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Operator signup route
app.post(
  "/signupo",
  async (
    req: Request<{}, {}, OperatorSignupRequest>,
    res: Response
  ): Promise<Response> => {
    const {
      pump_operator_name,
      contact_no,
      po_email,
      po_password,
      no_of_lines,
    } = req.body;

    try {
      // Validate required fields
      if (!pump_operator_name || !contact_no || !po_email || !po_password) {
        return res.status(400).json({
          success: false,
          error: "Please provide all required fields",
        });
      }

      // Validate phone number
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(contact_no)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid 10-digit contact number",
        });
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(po_email)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid email address",
        });
      }

      const hashedPassword = await bcrypt.hash(po_password, 10);

      // Check for existing operator
      const existingOperator = await sql`
      SELECT EXISTS (
        SELECT 1 FROM pump_operator 
        WHERE po_email = ${po_email}
      ) AS exists
    ` as { exists: boolean }[];

      if (existingOperator[0].exists) {
        return res.status(400).json({
          success: false,
          error:
            "Operator email already exists. Please choose a different one.",
        });
      }

      // Insert new operator
      await sql`
      INSERT INTO pump_operator (
        pump_operator_name,
        contact_no,
        po_email,
        po_password,
        no_of_lines
      ) VALUES (
        ${pump_operator_name},
        ${contact_no},
        ${po_email},
        ${hashedPassword},
        ${no_of_lines || null}
      )
    `;

      return res.status(201).json({
        success: true,
        message: "Operator signed up successfully",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Villager signup route
app.post(
  "/signupv",
  async (
    req: Request<{}, {}, VillagerSignupRequest>,
    res: Response
  ): Promise<Response> => {
    const {
      villager_name,
      contact_no,
      v_email,
      v_password,
      house_no,
      v_pump_operator_id,
    } = req.body;

    try {
      // Validate required fields
      if (
        !villager_name ||
        !contact_no ||
        !v_email ||
        !v_password ||
        !house_no
      ) {
        return res.status(400).json({
          success: false,
          error: "Please provide all required fields",
        });
      }

      // Validate phone number
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(contact_no)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid 10-digit contact number",
        });
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(v_email)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid email address",
        });
      }

      const hashedPassword = await bcrypt.hash(v_password, 10);

      // Check for existing villager
      const existingVillager = await sql`
      SELECT EXISTS (
        SELECT 1 FROM villager 
        WHERE v_email = ${v_email} 
        OR house_no = ${house_no}
      ) AS exists
    ` as { exists: boolean }[];

      if (existingVillager[0].exists) {
        return res.status(400).json({
          success: false,
          error: "Villager email or house number already exists.",
        });
      }

      // Insert new villager
      await sql`
      INSERT INTO villager (
        house_no,
        villager_name,
        contact_no,
        v_email,
        v_password,
        v_pump_operator_id
      ) VALUES (
        ${house_no},
        ${villager_name},
        ${contact_no},
        ${v_email},
        ${hashedPassword},
        ${v_pump_operator_id || null}
      )
    `;

      return res.status(201).json({
        success: true,
        message: "Villager signed up successfully",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Get operator details
app.put(
  "/operator/:id",
  isAuthenticated,
  async (
    req: Request<{ id: string }, {}, UpdateOperatorRequest>,
    res: Response
  ): Promise<Response> => {
    const { id } = req.params;

    try {
      const operator = await sql`
      SELECT * FROM pump_operator 
      WHERE pump_operator_id = ${parseInt(id)}
    ` as Operator[];

      if (operator.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Operator not found",
        });
      }

      return res.json({
        success: true,
        data: operator[0],
      });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Get all operators
app.get(
  "/operators",
  isAuthenticated,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const operators = await sql`
      SELECT pump_operator_id, pump_operator_name, contact_no, po_email, no_of_lines 
      FROM pump_operator
      ` as Operator[];
      res.json({
        success: true,
        data: operators,
      });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Update operator details
app.put(
  "/operator/:id",
  isAuthenticated,
  async (
    req: Request<{ id: string }, {}, UpdateOperatorRequest>,
    res: Response
  ): Promise<Response> => {
    const { id } = req.params;
    const updates = req.body;

    try {
      // Build dynamic update query
      let updateFields: string[] = [];
      let values: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = $${values.length + 1}`);
          values.push(value);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid fields to update",
        });
      }

      const result = await sql`
      UPDATE pump_operator 
      SET ${sql(updateFields.join(", "))}
      WHERE pump_operator_id = ${parseInt(id)}
      RETURNING *
    `;

            if ((result as any[]).length === 0) {
              // Type assertion to any[]
              return res.status(404).json({
                success: false,
                error: "Operator not found",
              });
            }

      return res.json({
        success: true,
        message: "Operator updated successfully",
        data: result[0],
      });
    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Get all panchayats
app.get(
  "/panchayats",
  isAuthenticated,
  async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const panchayats = await sql`
      SELECT panchayat_id, panchayat_name, panchayat_loc, pdo_name, contact_no, p_email 
      FROM panchayat
      ` as Panchayat[];

      return res.json({
        success: true,
        data: panchayats,
      });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
}

app.use(
  (
    err: ErrorWithStatus,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      error: err.message || "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
);

// 404 handler
app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Start server
const PORT: number = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export app for testing
export default app;
