import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartQuantity, 
  removeFromCart,
  getWishlist, 
  addToWishlist, 
  removeFromWishlist,
  getAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress,
  addReview,
  updateProfile, 
  changePassword,
  getNotifications, 
  markNotificationRead,
  validateCoupon
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// Coupon Validation Route
router.post('/coupons/validate', validateCoupon);

// Cart Routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart', updateCartQuantity);
router.delete('/cart/:productId', removeFromCart);

// Wishlist Routes
router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

// Address Routes
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Review Routes
router.post('/reviews', addReview);

// Notification Routes
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

// Profile & Password Routes
router.put('/updateprofile', updateProfile);
router.put('/change-password', changePassword);

export default router;
