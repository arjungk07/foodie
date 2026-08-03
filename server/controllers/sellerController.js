import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { ensureTimelineAndStatus } from './orderController.js';

// @desc    Get Seller Dashboard Statistics
// @route   GET /api/seller/stats
// @access  Private (Seller)
export const getSellerDashboardStats = async (req, res, next) => {
  try {
    const products = await Product.find({ sellerId: req.user.id });
    const productIds = products.map(p => p._id.toString());

    // Find all orders containing this seller's products
    const orders = await Order.find({ 'items.productId': { $in: products.map(p => p._id) } });

    // Calculate revenue, items sold, and build inventory status
    let totalRevenue = 0;
    let totalItemsSold = 0;
    let lowStockCount = 0;

    products.forEach(p => {
      if (p.stock <= 15) {
        lowStockCount++;
      }
    });

    orders.forEach(order => {
      // Only aggregate revenue from items owned by this seller
      order.items.forEach(item => {
        if (productIds.includes(item.productId.toString())) {
          totalRevenue += item.price * item.quantity;
          totalItemsSold += item.quantity;
        }
      });
    });

    // Dynamic monthly revenue aggregation
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    monthNames.forEach(m => { monthlyMap[m] = 0; });

    orders.forEach(order => {
      if (order.createdAt) {
        const mName = monthNames[new Date(order.createdAt).getMonth()];
        order.items.forEach(item => {
          if (productIds.includes(item.productId.toString())) {
            monthlyMap[mName] += item.price * item.quantity;
          }
        });
      }
    });

    const monthlyRevenue = Object.keys(monthlyMap).map(m => ({
      month: m,
      revenue: Math.round(monthlyMap[m] * 100) / 100
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalItemsSold,
        lowStockCount,
        monthlyRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders associated with a seller's products
// @route   GET /api/seller/orders
// @access  Private (Seller)
export const getSellerOrders = async (req, res, next) => {
  try {
    const products = await Product.find({ sellerId: req.user.id });
    const productIds = products.map(p => p._id);

    const orders = await Order.find({ 'items.productId': { $in: productIds } })
      .populate('userId', 'fullName email mobile')
      .populate({
        path: 'items.productId',
        select: 'images brand SKU sellerId productName',
        populate: {
          path: 'sellerId',
          select: 'fullName'
        }
      })
      .sort('-createdAt');

    // Filter items inside the orders to only show the items belonging to this seller
    const sellerOrders = orders.map(order => {
      const orderObj = order.toObject();
      ensureTimelineAndStatus(orderObj);
      orderObj.items = orderObj.items.filter(item => 
        productIds.map(id => id.toString()).includes(item.productId.toString())
      );
      
      // Strip OTP details for seller safety
      delete orderObj.otpCode;
      delete orderObj.otpEncrypted;
      
      return orderObj;
    });

    res.status(200).json({
      success: true,
      orders: sellerOrders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a seller's products
// @route   GET /api/seller/reviews
// @access  Private (Seller)
export const getSellerReviews = async (req, res, next) => {
  try {
    const products = await Product.find({ sellerId: req.user.id });
    const productIds = products.map(p => p._id);

    const reviews = await Review.find({ productId: { $in: productIds } })
      .populate('userId', 'fullName profileImage')
      .populate('productId', 'productName images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    next(error);
  }
};
