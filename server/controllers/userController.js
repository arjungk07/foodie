import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Address from '../models/Address.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import Coupon from '../models/Coupon.js';
import { uploadImage, CLOUDINARY_FOLDERS } from '../config/cloudinary.js';

// ==========================================
// CART OPERATIONS
// ==========================================

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: 'items.productId',
      select: 'productName price minimumOrderQuantity stock images brand discount availability'
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    // Enforce MOQ check on first add if requested, otherwise we let the user adjust it
    const reqQty = Number(quantity || 1);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += reqQty;
    } else {
      cart.items.push({ productId, quantity: reqQty });
    }

    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'productName price minimumOrderQuantity stock images brand discount availability'
    });
    res.status(200).json({ success: true, message: 'Item added to cart successfully', cart });
  } catch (error) {
    next(error);
  }
};

export const updateCartQuantity = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    const newQty = Number(quantity);
    if (isNaN(newQty) || newQty < 1) {
      res.status(400);
      throw new Error('Invalid quantity');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const minQty = product.minimumOrderQuantity || 1;
    if (newQty < minQty) {
      res.status(400);
      throw new Error(`Quantity cannot be less than minimum order quantity of ${minQty}`);
    }

    if (newQty > product.stock) {
      res.status(400);
      throw new Error(`Quantity cannot exceed available stock of ${product.stock}`);
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      res.status(404);
      throw new Error('Product not found in cart');
    }

    cart.items[itemIndex].quantity = newQty;
    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'productName price minimumOrderQuantity stock images brand discount availability'
    });

    res.status(200).json({ success: true, message: 'Cart updated successfully', cart });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'productName price minimumOrderQuantity stock images brand discount availability'
    });

    res.status(200).json({ success: true, message: 'Product removed from cart', cart });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// WISHLIST OPERATIONS
// ==========================================

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate(
      'products',
      'productName price minimumOrderQuantity stock images brand discount availability'
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
    }

    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  const { productId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
    }

    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Added to wishlist', wishlist });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      res.status(404);
      throw new Error('Wishlist not found');
    }

    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Removed from wishlist', wishlist });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADDRESS OPERATIONS
// ==========================================

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort('-isDefault');
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const address = await Address.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json({ success: true, message: 'Address added successfully', address });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!address) {
      res.status(404);
      throw new Error('Address not found or unauthorized');
    }

    res.status(200).json({ success: true, message: 'Address updated successfully', address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!address) {
      res.status(404);
      throw new Error('Address not found or unauthorized');
    }
    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PRODUCT REVIEWS
// ==========================================

export const addReview = async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Create review
    const review = await Review.create({
      userId: req.user.id,
      productId,
      rating: Number(rating),
      comment
    });

    // Recompute product ratings average
    const reviews = await Review.find({ productId });
    const ratingSum = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = ratingSum / reviews.length;

    product.rating = Number(averageRating.toFixed(1));
    product.reviewsCount = reviews.length;
    await product.save();

    res.status(201).json({ success: true, message: 'Review added successfully', review });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PROFILE MANAGEMENT
// ==========================================

export const updateProfile = async (req, res, next) => {
  const { fullName, mobile } = req.body;

  console.log('[DEBUG] updateProfile invoked');
  console.log('[DEBUG] req.body:', req.body);
  console.log('[DEBUG] req.file:', req.file);

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (req.file) {
      console.log('[DEBUG] File found, starting Cloudinary upload...');
      const uploadResult = await uploadImage(req.file.buffer, CLOUDINARY_FOLDERS.PROFILES);
      console.log('[DEBUG] Cloudinary upload success:', uploadResult);
      user.profileImage = uploadResult.secure_url;
    } else {
      console.log('[DEBUG] No req.file received by controller.');
    }

    user.fullName = fullName || user.fullName;
    user.mobile = mobile || user.mobile;
    await user.save();
    console.log('[DEBUG] User updated in MongoDB:', user);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!(await user.comparePassword(oldPassword))) {
      res.status(400);
      throw new Error('Incorrect current password');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// NOTIFICATIONS
// ==========================================

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { userId: req.user.id },
        { userId: null } // System broadcast alerts
      ]
    }).sort('-createdAt');

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, $or: [{ userId: req.user.id }, { userId: null }] },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found or unauthorized');
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COUPON VALIDATION
// ==========================================

export const validateCoupon = async (req, res, next) => {
  const { code, amount } = req.body;

  try {
    if (!code) {
      res.status(400);
      throw new Error('Please enter a coupon code.');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      res.status(404);
      throw new Error('Invalid or inactive coupon code.');
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      res.status(400);
      throw new Error('This coupon code has expired.');
    }

    if (amount && amount < coupon.minPurchase) {
      res.status(400);
      throw new Error(`Minimum purchase amount of ₹${coupon.minPurchase} required for this coupon.`);
    }

    res.status(200).json({
      success: true,
      message: 'Coupon code applied successfully!',
      coupon
    });
  } catch (error) {
    next(error);
  }
};

