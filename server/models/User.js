import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please enter your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: [function () { return !this.googleId; }, 'Please enter your mobile number'],
    default: '',
    trim: true
  },
  password: {
    type: String,
    required: [function () { return !this.googleId; }, 'Please enter a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  profileImage: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  refreshToken: { type: String }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
