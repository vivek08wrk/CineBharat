import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cinebharat', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // Allowed image formats
    transformation: [{ quality: 'auto', fetch_format: 'auto' }], // Optimize images
    public_id: (req, file) => {
      // Generate unique filename
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e5);
      return `movie-${unique}`;
    }
  }
});

// Create multer upload instance with Cloudinary storage
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
}).fields([
  { name: 'poster', maxCount: 1 },
  { name: 'trailerUrl', maxCount: 1 },
  { name: 'videoUrl', maxCount: 1 },
  { name: 'ltThumbnail', maxCount: 1 },
  { name: 'castFiles', maxCount: 20 },
  { name: 'directorFiles', maxCount: 20 },
  { name: 'producerFiles', maxCount: 20 },
  { name: 'ltDirectorFiles', maxCount: 20 },
  { name: 'ltProducerFiles', maxCount: 20 },
  { name: 'ltSingerFiles', maxCount: 20 }
]);

export default cloudinary;
