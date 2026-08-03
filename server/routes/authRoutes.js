import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe
} from '../controllers/authController.js';
import { updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// GET /api/auth/me  — original route (kept for backward compat)
router.get('/me', protect, getMe);

// GET /api/auth/profile  — alias for /me (resolves "Not Found" error)
router.get('/profile', protect, getMe);

// PUT /api/auth/profile  — update profile + optional image upload
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

export default router;
