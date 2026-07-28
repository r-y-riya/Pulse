import { Router } from 'express';
import { register, login, refreshToken, getProfile, updateProfile, changePassword, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
