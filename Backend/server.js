import express from "express";
import cors from "cors";
import "dotenv/config";
import path from 'path';
import { connectDB } from "./Congfig/db.js";
import userRouter from "./Routes/userRouter.js";
import movieRouter from "./Routes/movieRouter.js";
import bookingRouter from "./Routes/bookingRouter.js";

const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWAREs

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB
connectDB();
// ROUTES
app.use("/uploads", express.static(path.join(process.cwd(), 'uploads')));
app.use("/api/auth", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/bookings", bookingRouter);




app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "CineBharat Backend is running",
    timestamp: new Date().toISOString(),
    routes: {
      auth: "/api/auth (login, register)",
      movies: "/api/movies",
      bookings: "/api/bookings"
    }
  });
});

// TEMPORARY: Migration endpoint to fix localhost URLs in database
// TODO: Remove this endpoint after running once in production
app.get("/admin/migrate-urls", async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    const output = execSync('node migration/fixURLs.js', { 
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 60000 // 60 second timeout
    });
    res.json({ 
      success: true, 
      message: "Migration completed successfully",
      output: output
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr || ''
    });
  }
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
