import mongoose from 'mongoose';
import Movie from './Models/movieModel.js';

mongoose.connect('mongodb://localhost:27017/cinebharat')
  .then(async () => {
    console.log('Connected to DB');
    
    const trailers = await Movie.find({ type: 'latestTrailers' });
    console.log('\n=== TRAILERS (type: latestTrailers) ===');
    console.log('Count:', trailers.length);
    if (trailers.length > 0) {
      console.log('Sample:', JSON.stringify(trailers[0], null, 2));
    }
    
    const allMovies = await Movie.find({});
    console.log('\n=== ALL MOVIES ===');
    console.log('Total count:', allMovies.length);
    
    const types = [...new Set(allMovies.map(m => m.type))];
    console.log('Types in DB:', types);
    
    // Show count by type
    for (const type of types) {
      const count = await Movie.countDocuments({ type });
      console.log(`  ${type}: ${count}`);
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
