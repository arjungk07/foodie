import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  confirmPayment,
  verifyRazorpayPayment,
  verifyOTP,
  generateOTP,
  trackOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', createOrder);                                                    // Create order (returns Razorpay order details for online payment)
router.get('/my-orders', getMyOrders);                                            // My order history
router.get('/:id', getOrderById);                                                 // Single order details
router.post('/:id/pay', confirmPayment);                                          // COD confirmation / legacy
router.post('/:id/verify-payment', verifyRazorpayPayment);                        // Verify Razorpay signature → mark Paid
router.put('/:id/status', authorize('seller', 'admin'), updateOrderStatus);       // Seller/Admin status update
router.post('/:id/verify-otp', verifyOTP);                                        // Verify OTP to complete delivery
router.post('/:id/generate-otp', generateOTP);                                    // Regenerate OTP
router.get('/:id/track', trackOrder);                                             // Get order tracking timeline

export default router;
