import express from 'express';
import { 
  getAdminDashboardStats, 
  getAllUsers, 
  updateUserRole, 
  deleteUser,
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon,
  deleteReview, 
  broadcastNotification
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminDashboardStats);

// User / Seller management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Category management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Coupon management
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Review moderation
router.delete('/reviews/:id', deleteReview);

// System Notifications
router.post('/notifications/broadcast', broadcastNotification);

export default router;
