import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please enter category name'], 
    unique: true, 
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  description: { 
    type: String 
  },
  image: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
