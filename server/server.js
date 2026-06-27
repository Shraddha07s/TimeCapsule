import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db.js';

// Import Controllers
import {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword
} from './controllers/authController.js';

import {
  connectPartner,
  getPartnerProfile,
  disconnectPartner
} from './controllers/coupleController.js';

import { updateProfile } from './controllers/profileController.js';

import {
  createMemory,
  getMemories,
  getMemoryById,
  deleteMemory
} from './controllers/memoryController.js';

import {
  createLetter,
  getLetters,
  getLetterById
} from './controllers/letterController.js';

import {
  contributeJournal,
  getJournals,
  getJournalById
} from './controllers/journalController.js';

import {
  getDashboardStats,
  getStatsDetails
} from './controllers/statsController.js';

// Import Middleware
import { protect } from './middleware/authMiddleware.js';
import { upload } from './middleware/uploadMiddleware.js';

// Initialize Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (Mongo vs. Fallback JSON)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Media Statically
const uploadDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// ==========================================
// API Routes
// ==========================================

// Auth Endpoints
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.get('/api/auth/me', protect, getMe);
app.get('/api/auth/verify-email/:token', verifyEmail);
app.post('/api/auth/forgot-password', forgotPassword);
app.put('/api/auth/reset-password/:token', resetPassword);

// Couple Connection Endpoints
app.post('/api/couple/connect', protect, connectPartner);
app.get('/api/couple/profile', protect, getPartnerProfile);
app.post('/api/couple/disconnect', protect, disconnectPartner);

// Profile Endpoints
app.put('/api/profile/update', protect, updateProfile);

// Memory Endpoints
app.post(
  '/api/memories',
  protect,
  upload.fields([
    { name: 'image', maxCount: 10 },
    { name: 'video', maxCount: 2 },
    { name: 'audio', maxCount: 2 }
  ]),
  createMemory
);
app.get('/api/memories', protect, getMemories);
app.get('/api/memories/:id', protect, getMemoryById);
app.delete('/api/memories/:id', protect, deleteMemory);

// Future Letters Endpoints
app.post('/api/letters', protect, createLetter);
app.get('/api/letters', protect, getLetters);
app.get('/api/letters/:id', protect, getLetterById);

// Collaborative Weekly Journals Endpoints
app.post('/api/journals', protect, contributeJournal);
app.get('/api/journals', protect, getJournals);
app.get('/api/journals/:id', protect, getJournalById);

// Stats & Dashboard Endpoints
app.get('/api/stats/dashboard', protect, getDashboardStats);
app.get('/api/stats/details', protect, getStatsDetails);

// Test Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Global Error Handler for Uploads
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message || 'An upload error occurred.' });
  }
  next();
});

// ==========================================
// Static Assets / Production Serve
// ==========================================
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
