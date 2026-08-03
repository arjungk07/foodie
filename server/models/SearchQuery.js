import mongoose from 'mongoose';

const searchQuerySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  count: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

export default mongoose.model('SearchQuery', searchQuerySchema);
