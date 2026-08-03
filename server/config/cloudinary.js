import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Direct official configuration using environment credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Centralized folder names mapping directly to root folders
export const CLOUDINARY_FOLDERS = {
  PROFILES:   'Foodie/profiles',
  PRODUCTS:   'Foodie/products',
  CATEGORIES: 'Foodie/categories',
  BANNERS:    'Foodie/banners',
  FUTURE:     'Foodie/future'
};

/**
 * Upload a file buffer to Cloudinary using the official v2 uploader stream.
 * @param {Buffer} fileBuffer - Raw image buffer from Multer memoryStorage
 * @param {string} folder - Destination folder on Cloudinary (e.g. 'profiles')
 * @returns {Promise<object>} Real Cloudinary uploader response payload
 */
export const uploadImage = async (fileBuffer, folder = CLOUDINARY_FOLDERS.FUTURE) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('[CLOUDINARY ERROR] Upload stream failed:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an image from Cloudinary using the official v2 destroy method.
 * @param {string} publicId - The Cloudinary public_id to destroy
 * @returns {Promise<object>} Real Cloudinary uploader destroy response
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return { result: 'not_found' };
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('[CLOUDINARY ERROR] Image deletion failed:', error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export default cloudinary;
