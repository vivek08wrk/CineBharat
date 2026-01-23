import mongoose from "mongoose";
import Movie from "../Models/movieModel.js";
import path from "path";
import fs from "fs";

// Use environment variable for production, fallback to localhost for local dev
const API_BASE = process.env.API_BASE || "http://localhost:5000";

/* ---------------------- small helpers ---------------------- */
// Builds a full upload URL from a filename or returns the URL as-is if already absolute
// Used for READ operations (when sending data to clients)
const getUploadUrl = (val) => {
  if (!val) return null;
  if (typeof val === "string") {
    // If it's already a full URL (Cloudinary or other CDN), return as-is
    if (/^https?:\/\//.test(val)) return val;
  }
  // Otherwise treat as local filename and construct URL
  const cleaned = String(val).replace(/^uploads\//, "");
  if (!cleaned) return null;
  return `${API_BASE}/uploads/${cleaned}`;
};

// Extracts the filename from a URL or upload path
const extractFilenameFromUrl = (u) => {
  if (!u || typeof u !== "string") return null;
  const parts = u.split("/uploads/");
  if (parts[1]) return parts[1];
  if (u.startsWith("uploads/")) return u.replace(/^uploads\//, "");
  return /^[^\/]+\.[a-zA-Z0-9]+$/.test(u) ? u : null;
};

// Deletes a file from the uploads folder if it exists
const tryUnlinkUploadUrl = (urlOrFilename) => {
  const fn = extractFilenameFromUrl(urlOrFilename);
  if (!fn) return;
  const filepath = path.join(process.cwd(), "uploads", fn);
  fs.unlink(filepath, (err) => {
    if (err)
      console.warn("Failed to unlink file", filepath, err?.message || err);
  });
};

// Safely parses JSON and returns null on failure
const safeParseJSON = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

// Normalizes a person file value to a simple filename
const normalizeLatestPersonFilename = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const fn = extractFilenameFromUrl(value);
    return fn || value;
  }
  if (typeof value === "object") {
    const candidate =
      value.filename ||
      value.path ||
      value.url ||
      value.file ||
      value.image ||
      value.preview ||
      null;
    return candidate ? normalizeLatestPersonFilename(candidate) : null;
  }
  return null;
};

// Converts a person object into a {name, role, preview} format
const personToPreview = (p) => {
  if (!p) return { name: "", role: "", preview: null };
  const candidate = p.preview || p.file || p.image || p.url || null;
  return {
    name: p.name || "",
    role: p.role || "",
    preview: candidate ? getUploadUrl(candidate) : null,
  };
};

/* ---------------------- shared transformers ---------------------- */
const buildLatestTrailerPeople = (arr = []) =>
  (arr || []).map((p) => ({
    name: (p && p.name) || "",
    role: (p && p.role) || "",
    file: normalizeLatestPersonFilename(
      p && (p.file || p.preview || p.url || p.image)
    ),
  }));

const enrichLatestTrailerForOutput = (lt = {}) => {
  const copy = { ...lt };
  copy.thumbnail = copy.thumbnail
    ? getUploadUrl(copy.thumbnail)
    : copy.thumbnail || null;
  const mapPerson = (p) => {
    const c = { ...(p || {}) };
    c.preview = c.file
      ? getUploadUrl(c.file)
      : c.preview
      ? getUploadUrl(c.preview)
      : null;
    c.name = c.name || "";
    c.role = c.role || "";
    return c;
  };
  copy.directors = (copy.directors || []).map(mapPerson);
  copy.producers = (copy.producers || []).map(mapPerson);
  copy.singers = (copy.singers || []).map(mapPerson);
  return copy;
};

const normalizeItemForOutput = (it = {}) => {
  try {
    const obj = { ...it };
    obj.thumbnail = it.latestTrailer?.thumbnail
      ? getUploadUrl(it.latestTrailer.thumbnail)
      : it.poster
      ? getUploadUrl(it.poster)
      : null;
    obj.trailerUrl =
      it.trailerUrl || it.latestTrailer?.url || it.latestTrailer?.videoId || null;

    if (it.type === "latestTrailers" && it.latestTrailer) {
      const lt = it.latestTrailer;
      obj.genres = obj.genres || lt.genres || [];
      obj.year = obj.year || lt.year || null;
      obj.rating = obj.rating || lt.rating || null;
      obj.duration = obj.duration || lt.duration || null;
      obj.description = obj.description || lt.description || lt.excerpt || "";
    }

    obj.cast = (it.cast || []).map(personToPreview);
    obj.directors = (it.directors || []).map(personToPreview);
    obj.producers = (it.producers || []).map(personToPreview);

    if (it.latestTrailer)
      obj.latestTrailer = enrichLatestTrailerForOutput(it.latestTrailer);

    // NEW: include auditorium in normalized output (keep null if not present)
    obj.auditorium = it.auditorium || null;

    return obj;
  } catch (error) {
    console.error('normalizeItemForOutput error:', error, 'for item:', it);
    return it;
  }
};

// CREATE A MOVIE

export async function createMovie(req, res) {
  try {
    console.log('=== CREATE MOVIE START ===');
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request files:', req.files ? Object.keys(req.files) : 'none');
    
    const body = req.body || {};

    // With Cloudinary, files have a 'path' property containing the full URL
    // Store the full Cloudinary URL directly (it's permanent and CDN-backed)
    const posterUrl = req.files?.poster?.[0]?.path
      ? req.files.poster[0].path
      : body.poster || null;
    const trailerUrl = req.files?.trailerUrl?.[0]?.path
      ? req.files.trailerUrl[0].path
      : body.trailerUrl || null;
    const videoUrl = req.files?.videoUrl?.[0]?.path
      ? req.files.videoUrl[0].path
      : body.videoUrl || null;
    
    console.log('Poster URL:', posterUrl);

    const categories =
      safeParseJSON(body.categories) ||
      (body.categories
        ? String(body.categories)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []);
    const slots = safeParseJSON(body.slots) || [];
    const seatPrices = safeParseJSON(body.seatPrices) || {
      standard: Number(body.standard || 0),
      recliner: Number(body.recliner || 0),
    };

    const cast = safeParseJSON(body.cast) || [];
    const directors = safeParseJSON(body.directors) || [];
    const producers = safeParseJSON(body.producers) || [];

    const attachFiles = (
      filesArrName,
      targetArr,
      toFilename = (f) => f  // For Cloudinary, 'path' contains the full URL
    ) => {
      if (!req.files?.[filesArrName]) return;
      req.files[filesArrName].forEach((file, idx) => {
        // Cloudinary files have 'path' property with full URL
        const fileUrl = file.path || file.filename;
        if (targetArr[idx]) targetArr[idx].file = fileUrl;
        else targetArr[idx] = { name: "", file: fileUrl };
      });
    };
    attachFiles("castFiles", cast);
    attachFiles("directorFiles", directors);
    attachFiles("producerFiles", producers);

    // latest trailer
    const latestTrailerBody = safeParseJSON(body.latestTrailer) || {};
    if (req.files?.ltThumbnail?.[0]?.path)
      latestTrailerBody.thumbnail = req.files.ltThumbnail[0].path;
    else if (req.files?.ltThumbnail?.[0]?.filename)
      latestTrailerBody.thumbnail = req.files.ltThumbnail[0].filename;
    else if (body.ltThumbnail) {
      const fn = extractFilenameFromUrl(body.ltThumbnail);
      latestTrailerBody.thumbnail = fn ? fn : body.ltThumbnail;
    }
    if (body.ltVideoUrl) latestTrailerBody.videoId = body.ltVideoUrl;
    if (body.ltUrl) latestTrailerBody.url = body.ltUrl;
    if (body.ltTitle) latestTrailerBody.title = body.ltTitle;

    latestTrailerBody.directors = latestTrailerBody.directors || [];
    latestTrailerBody.producers = latestTrailerBody.producers || [];
    latestTrailerBody.singers = latestTrailerBody.singers || [];

    const attachLtFiles = (fieldName, arrName) => {
      if (!req.files?.[fieldName]) return;
      req.files[fieldName].forEach((file, idx) => {
        const fileUrl = file.path || file.filename;
        if (latestTrailerBody[arrName][idx])
          latestTrailerBody[arrName][idx].file = fileUrl;
        else latestTrailerBody[arrName][idx] = { name: "", file: fileUrl };
      });
    };
    attachLtFiles("ltDirectorFiles", "directors");
    attachLtFiles("ltProducerFiles", "producers");
    attachLtFiles("ltSingerFiles", "singers");

    latestTrailerBody.directors = buildLatestTrailerPeople(
      latestTrailerBody.directors
    );
    latestTrailerBody.producers = buildLatestTrailerPeople(
      latestTrailerBody.producers
    );
    latestTrailerBody.singers = buildLatestTrailerPeople(
      latestTrailerBody.singers
    );

    const auditoriumValue =
      typeof body.auditorium === "string" && body.auditorium.trim()
        ? String(body.auditorium).trim()
        : "Audi 1";

    const doc = new Movie({
      _id: new mongoose.Types.ObjectId(),
      type: body.type || "normal",
      movieName: body.movieName || body.title || "",
      categories,
      poster: posterUrl,
      trailerUrl,
      videoUrl,
      rating: Number(body.rating) || 0,
      duration: Number(body.duration) || 0,
      slots,
      seatPrices,
      cast,
      directors,
      producers,
      story: body.story || "",
      latestTrailer: latestTrailerBody,
      auditorium: auditoriumValue,
    });

    const saved = await doc.save();
    return res.status(201).json({
      success: true,
      message: "Movie added successfully!",
      data: saved,
    });
  } catch (error) {
    console.error("CreateMovie Error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Get MOVIES (ALL)

export async  function getMovies(req, res) {
  try {
    const {
      category,
      type,
      sort = "-createdAt",
      page = 1,
      limit = 500,
      search,
      latestTrailer,
    } = req.query;
    let filter = {};
    if (typeof category === "string" && category.trim())
      filter.categories = { $in: [category.trim()] };
    if (typeof type === "string" && type.trim()) filter.type = type.trim();
    if (typeof search === "string" && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { movieName: { $regex: q, $options: "i" } },
        { "latestTrailer.title": { $regex: q, $options: "i" } },
        { story: { $regex: q, $options: "i" } },
      ];
    }
    if (latestTrailer && String(latestTrailer).toLowerCase() != "false") {
      filter =
        Object.keys(filter).length === 0
          ? {
              type: "latestTrailers",
            }
          : {
              $and: [filter, { type: "latestTrailers" }],
            };
    }

     const pg = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(200, parseInt(limit, 10) || 12);
    const skip = (pg - 1) * lim;

    const total = await Movie.countDocuments(filter);
    const items = await Movie.find(filter).sort(sort).skip(skip).limit(lim).lean();

    const normalized = (items || []).map(normalizeItemForOutput);
    return res.json({
        success: true,
        total,
        page:pg,
        limit: lim,
        items: normalized
    });

  } catch (error) {
    console.error('Getmovies Error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
        success: false,
        message: error.message || 'Server Error'
    })
  }
}

// Get A MOVIE USING ID

export async function getMovieById(req,res){
    try {
        const {id} =req.params;
        if(!id) return res.status(400).json({
            success: false,
            message:'ID id  required.'
        });

      const item = await Movie.findById(id).lean();
        if(!item) return res.status(404).json({
            success: false,
            message:'Movie Not Found'
        });

        const obj = normalizeItemForOutput(item);

         if (item.type === "latestTrailers" && item.latestTrailer) {
      const lt = item.latestTrailer;
      obj.genres = obj.genres || lt.genres || [];
      obj.year = obj.year || lt.year || null;
      obj.rating = obj.rating || lt.rating || null;
      obj.duration = obj.duration || lt.duration || null;
      obj.description = obj.description || lt.description || lt.excerpt || obj.description || "";
    }
    return res.json({ success: true, item: obj});
        
    } catch (err) {
        console.error('Getmovies Error:', err);
    return res.status(500).json({
        success: false,
        message: 'Server Error' 
    })
}
}

// DELETE A MOVIE AND UNLINK THE IMG

export async function deleteMovie(req, res) {

    try {
         const {id} =req.params;
        if(!id) return res.status(400).json({
            success: false,
            message:'ID id  required.'
        });

      const m = await Movie.findById(id).lean();
        if(!m) return res.status(404).json({
            success: false,
            message:'Movie Not Found'
        });

        // Unlink main assets

        if(m.poster) tryUnlinkUploadUrl(m.poster);
        if(m.latestTrailer && m.latestTrailer.thumbnail) tryUnlinkUploadUrl(m.latestTrailer.thumbnail);

         // unlink person files
    [(m.cast || []), (m.directors || []), (m.producers || [])].forEach(arr =>
      arr.forEach(p => { if (p && p.file) tryUnlinkUploadUrl(p.file); })
    );

    if (m.latestTrailer) {
      ([...(m.latestTrailer.directors || []), ...(m.latestTrailer.producers || []), ...(m.latestTrailer.singers || [])])
        .forEach(p => { if (p && p.file) tryUnlinkUploadUrl(p.file); });
    }

    await Movie.findByIdAndDelete(id);
    return res.json({
        success: true,
        message: 'Movie Deleted'
    });
        
    } catch (error) {


          console.error('DeleteMovie Error:', err);
    return res.status(500).json({
        success: false,
        message: 'Server Error' 
    })
        
        
    }
    
}

export default {createMovie, getMovies,getMovieById, deleteMovie}