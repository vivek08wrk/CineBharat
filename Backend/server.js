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
    cloudinary: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing",
      api_key: process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing"
    },
    routes: {
      auth: "/api/auth (login, register)",
      movies: "/api/movies",
      bookings: "/api/bookings"
    }
  });
});

// Global error handler for multer and other errors
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  
  // Handle Multer/Cloudinary specific errors
  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      message: error.message,
      code: error.code
    });
  }
  
  // Handle Cloudinary errors
  if (error.message && error.message.includes('cloudinary')) {
    return res.status(500).json({
      success: false,
      error: 'Image upload service error',
      message: error.message
    });
  }
  
  // Generic error response
  res.status(error.status || 500).json({
    success: false,
    error: error.name || 'Server Error',
    message: error.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
