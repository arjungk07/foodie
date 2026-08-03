import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';

// @desc    Get global Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments({});
    
    // Revenue calculations
    const completedOrders = await Order.find({ paymentStatus: 'Paid' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const recentOrders = await Order.find({})
      .populate('userId', 'fullName email')
      .sort('-createdAt')
      .limit(5);

    const lowStockAlerts = await Product.find({ stock: { $lte: 15 } })
      .populate('sellerId', 'fullName email')
      .limit(5);

    // Grouping sales by month (Mock data since this is a clean, fresh setup)
    const monthlySales = [
      { name: 'Jan', revenue: totalRevenue * 0.1 },
      { name: 'Feb', revenue: totalRevenue * 0.15 },
      { name: 'Mar', revenue: totalRevenue * 0.2 },
      { name: 'Apr', revenue: totalRevenue * 0.12 },
      { name: 'May', revenue: totalRevenue * 0.18 },
      { name: 'Jun', revenue: totalRevenue * 0.25 }
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        recentOrders,
        lowStockAlerts,
        monthlySales
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// USER & SELLER MANAGEMENT
// ==========================================

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  const { role } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.role = role || user.role;
    await user.save();
    res.status(200).json({ success: true, message: 'User role updated successfully', user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CATEGORY CRUD
// ==========================================

export const createCategory = async (req, res, next) => {
  const { name, description, image } = req.body;
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ name, slug, description, image });
    res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  const { name, description, image } = req.body;
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    category.description = description !== undefined ? description : category.description;
    category.image = image !== undefined ? image : category.image;
    await category.save();

    res.status(200).json({ success: true, message: 'Category updated successfully', category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COUPON CRUD
// ==========================================

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort('-createdAt');
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    res.status(200).json({ success: true, message: 'Coupon updated successfully', coupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REVIEW MODERATION
// ==========================================

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// NOTIFICATIONS / ANNOUNCEMENTS
// ==========================================

export const broadcastNotification = async (req, res, next) => {
  const { title, message, type } = req.body;
  try {
    const notification = await Notification.create({
      userId: null, // broadcast to all
      title,
      message,
      type: type || 'system'
    });
    res.status(201).json({ success: true, message: 'Announcement broadcasted successfully', notification });
  } catch (error) {
    next(error);
  }
};
