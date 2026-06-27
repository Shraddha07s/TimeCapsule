import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Cloudinary resource_type: 'image', 'video', or 'raw'.
    // Setting 'auto' lets Cloudinary auto-detect images, video, and audio.
    return {
      folder: 'timecapsule',
      resource_type: 'auto',
      public_id: 'media-' + Date.now() + '-' + Math.round(Math.random() * 1e9),
    };
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit to support video uploads
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm|mp3|wav|ogg|m4a|octet-stream/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    // Audio recordings in browsers often use generic audio/webm or application/octet-stream, we support it
    if (extname || mimetype || file.fieldname === 'audio') {
      return cb(null, true);
    } else {
      cb(new Error('Format not supported! Supports images, video, and audio files.'));
    }
  }
});
