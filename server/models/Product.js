import mongoose from 'mongoose';
import Category from "../models/Category.js";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true
  },
  productDescription: {
    type: String,
    required: [true, 'Please enter product description']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  subCategory: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    required: [true, 'Please enter product brand'],
    trim: true
  },
  SKU: {
    type: String,
    unique: true,
    trim: true,
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Please enter retail price'],
    min: [0, 'Price cannot be negative']
  },
  minimumOrderQuantity: {
    type: Number,
    default: 1,
  },
  stock: {
    type: Number,
    required: [true, 'Please enter stock level'],
    default: 0
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  }],
  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  specifications: [{
    key: { type: String, required: true },
    value: { type: String, required: true }
  }],
  tags: [{
    type: String
  }],
  availability: {
    type: Boolean,
    default: true
  },
  featuredProduct: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });




productSchema.pre("save", async function (next) {

  if (this.SKU) return next();

  const category = await Category.findById(this.category);

  const categoryCode = category
    ? category.name.substring(0, 3).toUpperCase()
    : "PRD";

  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  this.SKU = `${categoryCode}-${randomNumber}`;

  next();
});

export default mongoose.model('Product', productSchema);
