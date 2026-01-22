import mongoose from 'mongoose';
import Movie from '../Models/movieModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

// Helper to extract just the filename from any URL or path
function extractFilename(value) {
  if (!value || typeof value !== 'string') return value;
  
  // If it contains /uploads/, extract everything after it
  if (value.includes('/uploads/')) {
    const parts = value.split('/uploads/');
    return parts[parts.length - 1];
  }
  
  // If it starts with uploads/, remove that prefix
  if (value.startsWith('uploads/')) {
    return value.replace(/^uploads\//, '');
  }
  
  // If it looks like a filename already (no slashes, has extension), return as-is
  if (/^[^\/]+\.[a-zA-Z0-9]+$/.test(value)) {
    return value;
  }
  
  return value;
}

// Fix a single person object (cast, director, producer, singer)
function fixPerson(person) {
  if (!person) return person;
  
  if (person.file) {
    person.file = extractFilename(person.file);
  }
  if (person.preview) {
    person.preview = extractFilename(person.preview);
  }
  if (person.image) {
    person.image = extractFilename(person.image);
  }
  if (person.url) {
    person.url = extractFilename(person.url);
  }
  
  return person;
}

async function migrateMovies() {
  try {
    const movies = await Movie.find({});
    console.log(`Found ${movies.length} movies to process`);
    
    let updatedCount = 0;
    
    for (const movie of movies) {
      let changed = false;
      
      // Fix top-level poster
      if (movie.poster) {
        const newPoster = extractFilename(movie.poster);
        if (newPoster !== movie.poster) {
          movie.poster = newPoster;
          changed = true;
        }
      }
      
      // Fix top-level thumbnail
      if (movie.thumbnail) {
        const newThumbnail = extractFilename(movie.thumbnail);
        if (newThumbnail !== movie.thumbnail) {
          movie.thumbnail = newThumbnail;
          changed = true;
        }
      }
      
      // Fix trailerUrl and videoUrl if they're file paths (unlikely but possible)
      if (movie.trailerUrl && movie.trailerUrl.includes('/uploads/')) {
        movie.trailerUrl = extractFilename(movie.trailerUrl);
        changed = true;
      }
      
      if (movie.videoUrl && movie.videoUrl.includes('/uploads/')) {
        movie.videoUrl = extractFilename(movie.videoUrl);
        changed = true;
      }
      
      // Fix cast array
      if (Array.isArray(movie.cast)) {
        movie.cast = movie.cast.map(fixPerson);
        changed = true;
      }
      
      // Fix directors array
      if (Array.isArray(movie.directors)) {
        movie.directors = movie.directors.map(fixPerson);
        changed = true;
      }
      
      // Fix producers array
      if (Array.isArray(movie.producers)) {
        movie.producers = movie.producers.map(fixPerson);
        changed = true;
      }
      
      // Fix latestTrailer nested object
      if (movie.latestTrailer) {
        if (movie.latestTrailer.thumbnail) {
          const newThumb = extractFilename(movie.latestTrailer.thumbnail);
          if (newThumb !== movie.latestTrailer.thumbnail) {
            movie.latestTrailer.thumbnail = newThumb;
            changed = true;
          }
        }
        
        if (Array.isArray(movie.latestTrailer.directors)) {
          movie.latestTrailer.directors = movie.latestTrailer.directors.map(fixPerson);
          changed = true;
        }
        
        if (Array.isArray(movie.latestTrailer.producers)) {
          movie.latestTrailer.producers = movie.latestTrailer.producers.map(fixPerson);
          changed = true;
        }
        
        if (Array.isArray(movie.latestTrailer.singers)) {
          movie.latestTrailer.singers = movie.latestTrailer.singers.map(fixPerson);
          changed = true;
        }
      }
      
      if (changed) {
        await movie.save();
        updatedCount++;
        console.log(`✓ Fixed movie: ${movie.movieName || movie.title || movie._id}`);
      }
    }
    
    console.log(`\nMigration complete!`);
    console.log(`Total movies: ${movies.length}`);
    console.log(`Updated: ${updatedCount}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateMovies();
