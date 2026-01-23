import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with credentials from environment variables
const cloudConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

// Log configuration status (without exposing secrets)
console.log('Cloudinary Config:', {
  cloud_name: cloudConfig.cloud_name ? '✓ Set' : '✗ Missing',
  api_key: cloudConfig.api_key ? '✓ Set' : '✗ Missing',
  api_secret: cloudConfig.api_secret ? '✓ Set' : '✗ Missing'
});

// Check if all credentials are present
const hasAllCredentials = cloudConfig.cloud_name && cloudConfig.api_key && cloudConfig.api_secret;

if (!hasAllCredentials) {
  console.warn('⚠️  WARNING: Cloudinary credentials are incomplete. File uploads will fail.');
  console.warn('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables.');
}

cloudinary.config(cloudConfig);

let storage;
try {
  // Configure Cloudinary storage for Multer
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'cinebharat', // Folder name in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg'], // Allowed image formats
      transformation: [{ quality: 'auto', fetch_format: 'auto' }], // Optimize images
      public_id: (req, file) => {
        // Generate unique filename
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e5);
        return `movie-${unique}`;
      }
    }
  });
} catch (error) {
  console.error('Failed to initialize Cloudinary storage:', error.message);
  // Fallback to memory storage if Cloudinary fails
  storage = multer.memoryStorage();
}

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
