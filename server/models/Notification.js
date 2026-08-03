import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Null represents broadcast to all or general platform alerts
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['order', 'stock', 'promotion', 'system', 'seller_request'],
    default: 'system'
  }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
