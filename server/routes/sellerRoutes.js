import express from 'express';
import { 
  getAllProductsForSeller,
  getSellerDashboardStats, 
  getSellerOrders, 
  getSellerReviews 
} from '../controllers/sellerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('seller', 'admin'));

router.get('/products', getAllProductsForSeller);
router.get('/stats', getSellerDashboardStats);
router.get('/orders', getSellerOrders);
router.get('/reviews', getSellerReviews);

export default router;
