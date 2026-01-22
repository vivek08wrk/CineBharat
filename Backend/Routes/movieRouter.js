import express from "express";
import { upload } from "../Congfig/cloudinary.js";
import { createMovie, deleteMovie, getMovieById, getMovies } from "../Controllers/moviesController.js";

const movieRouter = express.Router();

movieRouter.post("/", upload, createMovie);
movieRouter.get("/", getMovies);
movieRouter.get("/:id", getMovieById);
movieRouter.delete("/:id", deleteMovie);

export default movieRouter;
