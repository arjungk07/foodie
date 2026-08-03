import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayKeyId,
} from '../utils/razorpay.js';
import { sendOrderWhatsAppNotification } from '../utils/whatsapp.js';
import { encryptOTP, decryptOTP } from '../utils/otpSecurity.js';
import sendEmail from '../utils/sendEmail.js';

const STATUS_STEPS = [
  { key: 'Pending', label: 'Order Placed' },
  { key: 'Confirmed', label: 'Order Confirmed' },
  { key: 'Processing', label: 'Processing' },
  { key: 'Packed', label: 'Packed' },
  { key: 'Shipped', label: 'Shipped' },
  { key: 'Out For Delivery', label: 'Out For Delivery' },
  { key: 'Delivered', label: 'Delivered' }
];

export const ensureTimelineAndStatus = (order) => {
  if (!order.orderStatus) {
    order.orderStatus = order.status || 'Pending';
  }
  if (!order.statusHistory || order.statusHistory.length === 0) {
    order.statusHistory = [{ status: order.orderStatus, timestamp: order.createdAt || new Date() }];
  }
  if (!order.trackingTimeline || order.trackingTimeline.length === 0) {
    const list = [];
    const targetIndex = STATUS_STEPS.findIndex(step => step.key === order.orderStatus);
    const limit = targetIndex !== -1 ? targetIndex : 0;
    for (let i = 0; i <= limit; i++) {
      list.push({
        status: STATUS_STEPS[i].label,
        timestamp: order.createdAt || new Date(),
        isCompleted: true
      });
    }
    if (order.orderStatus === 'Cancelled') {
      list.push({
        status: 'Cancelled',
        timestamp: order.updatedAt || new Date(),
        isCompleted: true
      });
    }
    order.trackingTimeline = list;
  }
  return order;
};

const updateOrderTimelineHelper = (order, newStatus) => {
  order.orderStatus = newStatus;
  order.status = newStatus;

  order.statusHistory.push({ status: newStatus, timestamp: new Date() });

  if (newStatus === 'Cancelled') {
    const exists = order.trackingTimeline.some(t => t.status === 'Cancelled');
    if (!exists) {
      order.trackingTimeline.push({
        status: 'Cancelled',
        timestamp: new Date(),
        isCompleted: true
      });
    }
    return;
  }

  const targetIndex = STATUS_STEPS.findIndex(step => step.key === newStatus);
  if (targetIndex !== -1) {
    for (let i = 0; i <= targetIndex; i++) {
      const step = STATUS_STEPS[i];
      const exists = order.trackingTimeline.some(t => t.status === step.label);
      if (!exists) {
        order.trackingTimeline.push({
          status: step.label,
          timestamp: new Date(),
          isCompleted: true
        });
      }
    }
  }
};

const processOrderForClient = (order, currentUserId) => {
  const orderObj = order.toObject ? order.toObject() : order;
  ensureTimelineAndStatus(orderObj);

  if (
    orderObj.userId &&
    (orderObj.userId._id || orderObj.userId).toString() === currentUserId.toString() &&
    orderObj.otpEncrypted &&
    !orderObj.otpVerified &&
    orderObj.otpExpiry &&
    new Date() < new Date(orderObj.otpExpiry)
  ) {
    orderObj.plainOtp = decryptOTP(orderObj.otpEncrypted);
  } else {
    orderObj.plainOtp = null;
  }

  delete orderObj.otpCode;
  delete orderObj.otpEncrypted;

  return orderObj;
};

// @desc    Create a new order (with MOQ/wholesale calculations)
//          For Razorpay: returns razorpayOrderId + key_id so frontend can open checkout
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;

  try {
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No items in the order');
    }

    let subTotal = 0;
    const finalItems = [];

    // Verify stock, MOQ, and calculate prices
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(
          `Insufficient stock for product: ${product.productName}. Available: ${product.stock}`
        );
      }

      let price = product.price;
      let wholesaleApplied = false;

      if (item.quantity >= product.minimumOrderQuantity) {
        price = product.wholesalePrice;
        wholesaleApplied = true;
      }

      if (!wholesaleApplied && product.discount > 0) {
        price = price - price * (product.discount / 100);
      }

      subTotal += price * item.quantity;

      finalItems.push({
        productId: product._id,
        productName: product.productName,
        quantity: item.quantity,
        price,
        wholesaleApplied,
      });
    }

    // Handle Coupon discounts
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && coupon.expiryDate > new Date() && subTotal >= coupon.minPurchase) {
        discountAmount =
          coupon.discountType === 'percentage'
            ? subTotal * (coupon.discountValue / 100)
            : coupon.discountValue;
      }
    }

    const shippingCharges = subTotal > 500 ? 0 : 50;
    const totalAmount = Math.max(0, subTotal - discountAmount + shippingCharges);
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Persist the order (status stays Pending until payment is verified)
    const order = await Order.create({
      userId: req.user.id,
      items: finalItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'Pending',
      subTotal,
      discountAmount,
      shippingCharges,
      totalAmount,
      invoiceNumber,
      orderStatus: 'Pending',
      statusHistory: [{ status: 'Pending', timestamp: new Date() }],
      trackingTimeline: [{ status: 'Order Placed', timestamp: new Date(), isCompleted: true }],
    });

    // ── Razorpay: create a server-side Razorpay Order ──────────────────────
    let razorpayOrder = null;
    if (paymentMethod === 'Razorpay') {
      razorpayOrder = await createRazorpayOrder(totalAmount, 'INR', order._id.toString());
      // Store Razorpay order ID temporarily in paymentId so we can cross-check on verify
      order.paymentId = razorpayOrder.id;
      await order.save();
    }

    // For COD: immediately decrement stock and clear cart
    if (paymentMethod === 'COD') {
      await _postPaymentActions(order, req.user, finalItems, items);
    }

    res.status(201).json({
      success: true,
      order,
      // Razorpay fields (null for COD)
      razorpayOrderId: razorpayOrder ? razorpayOrder.id : null,
      razorpayKeyId: paymentMethod === 'Razorpay' ? getRazorpayKeyId() : null,
      amount: razorpayOrder ? razorpayOrder.amount : null,
      currency: razorpayOrder ? razorpayOrder.currency : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature and mark order as Paid
// @route   POST /api/orders/:id/verify-payment
// @access  Private
export const verifyRazorpayPayment = async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Security: make sure the razorpayOrderId matches what we stored
    if (order.paymentId !== razorpayOrderId) {
      res.status(400);
      throw new Error('Razorpay order ID mismatch. Payment verification failed.');
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      order.paymentStatus = 'Failed';
      await order.save();
      res.status(400);
      throw new Error('Invalid payment signature. Payment verification failed.');
    }

    // Signature is valid — mark as Paid
    order.paymentStatus = 'Paid';
    order.paymentId = razorpayPaymentId; // overwrite with actual payment ID
    updateOrderTimelineHelper(order, 'Processing');
    await order.save();

    // Log the Payment transaction in the Payment collection
    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      amount: order.totalAmount,
      status: 'Paid',
      transactionId: razorpayPaymentId,
      method: 'Razorpay',
    });

    // Decrement stock, clear cart, send notifications
    const cartItems = order.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    await _postPaymentActions(order, req.user, order.items, cartItems);

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm COD / manual payment status update (legacy endpoint kept for COD)
// @route   POST /api/orders/:id/pay
// @access  Private
export const confirmPayment = async (req, res, next) => {
  const { paymentId, status } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.paymentStatus = status === 'succeeded' || status === 'Paid' ? 'Paid' : 'Pending';
    if (paymentId) order.paymentId = paymentId;
    await order.save();

    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      amount: order.totalAmount,
      status: order.paymentStatus,
      transactionId: paymentId || 'COD',
      method: order.paymentMethod,
    });

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'fullName email mobile')
      .populate({
        path: 'items.productId',
        select: 'images brand SKU sellerId productName',
        populate: {
          path: 'sellerId',
          select: 'fullName'
        }
      });

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const isOwner = order.userId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    let isSellerOfProduct = false;
    if (req.user.role === 'seller') {
      const productIds = order.items.map((item) => item.productId?._id?.toString());
      const sellerProducts = await Product.find({ _id: { $in: productIds }, sellerId: req.user.id });
      isSellerOfProduct = sellerProducts.length > 0;
    }

    if (!isOwner && !isAdmin && !isSellerOfProduct) {
      res.status(403);
      throw new Error('Access denied. You are not authorized to view this order.');
    }

    const processedOrder = processOrderForClient(order, req.user.id);

    res.status(200).json({ success: true, order: processedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate({
        path: 'items.productId',
        select: 'images brand SKU sellerId productName',
        populate: {
          path: 'sellerId',
          select: 'fullName'
        }
      })
      .sort('-createdAt');
    const processedOrders = orders.map(o => processOrderForClient(o, req.user.id));
    res.status(200).json({ success: true, orders: processedOrders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order shipping and delivery status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller/Admin)
export const updateOrderStatus = async (req, res, next) => {
  const { status, trackingNumber } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Prevent manually marking as Delivered
    if (status === 'Delivered') {
      res.status(400);
      throw new Error('Delivered status must be verified using the customer OTP.');
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;

    if (status) {
      // Check if transitioning to Out For Delivery to generate OTP
      if (status === 'Out For Delivery') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        order.otpCode = await bcrypt.hash(otp, salt);
        order.otpEncrypted = encryptOTP(otp);
        order.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        order.otpVerified = false;

        // Send email to customer
        const user = await User.findById(order.userId);
        if (user) {
          await sendEmail({
            email: user.email,
            subject: `Your Foodie Order is Out for Delivery! OTP: ${otp}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #059669;">Your Foodie Order is Out for Delivery! 🚚</h2>
                <p>Hello <strong>${user.fullName}</strong>,</p>
                <p>Your order <strong>${order.invoiceNumber}</strong> is on its way to you.</p>
                <p>Please share the following secure 6-digit OTP with the delivery partner to verify and receive your package:</p>
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 28px; font-weight: bold; color: #10b981; letter-spacing: 4px;">${otp}</span>
                </div>
                <p style="color: #ef4444; font-size: 13px;">*Note: This OTP is valid for 15 minutes and will expire at ${new Date(order.otpExpiry).toLocaleTimeString('en-IN')}.</p>
                <p>Thank you for shopping with Foodie!</p>
              </div>
            `
          });
        }
      }

      updateOrderTimelineHelper(order, status);
    }

    await order.save();

    await Notification.create({
      userId: order.userId,
      title: `Order Status Updated: ${status || order.status}`,
      message: status === 'Out For Delivery' 
        ? `Your order ${order.invoiceNumber} is out for delivery. Check your dashboard for the OTP.`
        : `Your order ${order.invoiceNumber} has been updated to: ${status || order.status}. ${
            trackingNumber ? 'Tracking No: ' + trackingNumber : ''
          }`,
      type: 'order',
    });

    res.status(200).json({ success: true, message: 'Order status updated successfully', order: processOrderForClient(order, req.user.id) });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate OTP manually (resend/regenerate)
// @route   POST /api/orders/:id/generate-otp
// @access  Private (Seller/Admin/Customer)
export const generateOTP = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Verify ownership or seller/admin access
    const isOwner = order.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    let isSellerOfProduct = false;
    if (req.user.role === 'seller') {
      const productIds = order.items.map((item) => item.productId.toString());
      const sellerProducts = await Product.find({ _id: { $in: productIds }, sellerId: req.user.id });
      isSellerOfProduct = sellerProducts.length > 0;
    }

    if (!isOwner && !isAdmin && !isSellerOfProduct) {
      res.status(403);
      throw new Error('Not authorized to generate OTP for this order.');
    }

    if (order.status !== 'Out For Delivery') {
      res.status(400);
      throw new Error('OTP can only be generated when the order is Out For Delivery.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    order.otpCode = await bcrypt.hash(otp, salt);
    order.otpEncrypted = encryptOTP(otp);
    order.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    order.otpVerified = false;

    await order.save();

    // Send email to customer
    const user = await User.findById(order.userId);
    if (user) {
      await sendEmail({
        email: user.email,
        subject: `Your Foodie Order OTP Regenerated`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #059669;">Your Foodie Order OTP has been Regenerated 🚚</h2>
            <p>Hello <strong>${user.fullName}</strong>,</p>
            <p>A new delivery OTP has been generated for order <strong>${order.invoiceNumber}</strong>.</p>
            <p>Please share this new OTP with the delivery partner:</p>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <span style="font-size: 28px; font-weight: bold; color: #10b981; letter-spacing: 4px;">${otp}</span>
            </div>
            <p style="color: #ef4444; font-size: 13px;">*Note: This OTP is valid for 15 minutes and will expire at ${new Date(order.otpExpiry).toLocaleTimeString('en-IN')}.</p>
          </div>
        `
      });
    }

    await Notification.create({
      userId: order.userId,
      title: 'New Delivery OTP Generated',
      message: `A new OTP has been generated for order ${order.invoiceNumber}. Check your My Orders page.`,
      type: 'order',
    });

    res.status(200).json({
      success: true,
      message: 'OTP generated and sent successfully.',
      order: processOrderForClient(order, req.user.id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and mark order as Delivered
// @route   POST /api/orders/:id/verify-otp
// @access  Private (Authenticated)
export const verifyOTP = async (req, res, next) => {
  const { otp } = req.body;

  try {
    if (!otp) {
      res.status(400);
      throw new Error('Please provide the 6-digit OTP code.');
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.otpVerified) {
      res.status(400);
      throw new Error('Order has already been verified and delivered.');
    }

    if (order.status !== 'Out For Delivery' || !order.otpCode) {
      res.status(400);
      throw new Error('This order is not currently out for delivery or has no OTP pending.');
    }

    // Check if OTP has expired
    if (new Date() > new Date(order.otpExpiry)) {
      res.status(400);
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp, order.otpCode);
    if (!isMatch) {
      res.status(400);
      throw new Error('Invalid OTP. Please check and try again.');
    }

    // Mark as Delivered and verified
    order.otpVerified = true;
    order.deliveredAt = new Date();
    order.paymentStatus = 'Paid'; // Payment is completed upon verification
    updateOrderTimelineHelper(order, 'Delivered');

    await order.save();

    // Create Notification
    await Notification.create({
      userId: order.userId,
      title: 'Order Delivered Successfully!',
      message: `Your order ${order.invoiceNumber} was delivered successfully at ${order.deliveredAt.toLocaleTimeString('en-IN')}. Verified by OTP.`,
      type: 'order',
    });

    res.status(200).json({
      success: true,
      message: 'Delivery Verified and Completed Successfully.',
      order: processOrderForClient(order, req.user.id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Order tracking info
// @route   GET /api/orders/:id/track
// @access  Private
export const trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).select('status orderStatus trackingTimeline statusHistory invoiceNumber');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    ensureTimelineAndStatus(order);
    res.status(200).json({ success: true, tracking: order });
  } catch (error) {
    next(error);
  }
};

// ── Internal helper ────────────────────────────────────────────────────────────
// Decrement stock, clear cart, fire buyer/seller notifications, WhatsApp alert.
async function _postPaymentActions(order, user, finalItems, rawCartItems) {
  // Decrement inventory with stock floor protection (prevent negative stock)
  for (const item of finalItems) {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    // Fallback safeguard if stock was depleted prior to payment completion
    if (!updatedProduct) {
      console.warn(`[INVENTORY SAFEGUARD] Product ${item.productId} stock was below order quantity ${item.quantity}. Adjusting stock to 0.`);
      await Product.findByIdAndUpdate(item.productId, { stock: 0, availability: false });
    }
  }

  // Clear user cart
  await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });

  // Notify buyer
  await Notification.create({
    userId: order.userId,
    title: 'Order Placed Successfully',
    message: `Your order ${order.invoiceNumber} has been placed. Total: ₹${order.totalAmount}`,
    type: 'order',
  });

  // Notify sellers
  const sellerIds = [
    ...new Set(
      await Promise.all(
        rawCartItems.map(async (i) => {
          const p = await Product.findById(i.productId);
          return p?.sellerId?.toString();
        })
      )
    ),
  ].filter(Boolean);

  for (const sellerId of sellerIds) {
    await Notification.create({
      userId: sellerId,
      title: 'New Wholesale Order Received',
      message: 'You have received a new order. Check your Seller Dashboard for order details.',
      type: 'order',
    });
  }

  // WhatsApp notification to store owner
  try {
    const waResult = await sendOrderWhatsAppNotification(order, user);
    order.whatsappStatus = {
      status: waResult.status,
      errorMessage: waResult.errorMessage || undefined,
      messageSid: waResult.messageSid || undefined,
    };
    await order.save();
  } catch (waError) {
    console.error(`WhatsApp dispatch error: ${waError.message}`);
  }
}
