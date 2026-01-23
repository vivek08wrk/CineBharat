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

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
