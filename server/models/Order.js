import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    platformFee: { type: Number, required: true, default: 0, min: 0 }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    mobile: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentId: {
    type: String
  },
  subTotal: { type: Number, required: true },
  totalPlatformFee: { type: Number, required: true, default: 0 },
  discountAmount: { type: Number, default: 0 },
  shippingCharges: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  trackingTimeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: true }
  }],
  otpCode: {
    type: String,
    default: null
  },
  otpEncrypted: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  trackingNumber: { type: String, default: '' },
  invoiceNumber: { type: String, unique: true, sparse: true },
  whatsappStatus: {
    status: { type: String, enum: ['Pending', 'Sent', 'Failed'], default: 'Pending' },
    errorMessage: { type: String },
    messageSid: { type: String }
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
