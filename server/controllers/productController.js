import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import SearchQuery from '../models/SearchQuery.js';
import { uploadImage, deleteImage, CLOUDINARY_FOLDERS } from '../config/cloudinary.js';

// @desc    Get all products with searching, filtering, sorting & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      subCategory,
      minPrice,
      maxPrice,
      brand,
      rating,
      availability,
      discount,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const queryObj = {};

    // Instant Search (with regex escaping for security)
    if (search) {
      const sanitizedSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      queryObj.productName = { $regex: sanitizedSearch, $options: 'i' };

      // Log search query in background for trending tracking
      const trimmedQuery = search.trim().toLowerCase();
      if (trimmedQuery.length > 2) {
        SearchQuery.findOneAndUpdate(
          { query: trimmedQuery },
          { $inc: { count: 1 } },
          { upsert: true, new: true }
        ).catch(err => console.error('Error logging search query:', err));
      }
    }

    // Category / Subcategory filter
    if (category) {
      // Find category by slug or ID
      const cat = await Category.findOne({ $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }] });
      if (cat) {
        queryObj.category = cat._id;
      }
    }
    if (subCategory) {
      queryObj.subCategory = subCategory;
    }

    // Brand Filter
    if (brand) {
      const brandsArray = brand.split(',');
      queryObj.brand = { $in: brandsArray };
    }

    // Price Range Filter
    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = Number(minPrice);
      if (maxPrice) queryObj.price.$lte = Number(maxPrice);
    }

    // Min Rating Filter
    if (rating) {
      queryObj.rating = { $gte: Number(rating) };
    }

    // Availability Filter
    if (availability) {
      queryObj.availability = availability === 'true';
    }

    // Discount Filter
    if (discount) {
      queryObj.discount = { $gte: Number(discount) };
    }

    // Execute query with sorting
    let apiQuery = Product.find(queryObj).populate('category', 'name slug');

    if (sort) {
      switch (sort) {
        case 'price-low':
          apiQuery = apiQuery.sort('price');
          break;
        case 'price-high':
          apiQuery = apiQuery.sort('-price');
          break;
        case 'rating':
          apiQuery = apiQuery.sort('-rating');
          break;
        case 'newest':
          apiQuery = apiQuery.sort('-createdAt');
          break;
        case 'popular':
          apiQuery = apiQuery.sort('-reviewsCount');
          break;
        default:
          apiQuery = apiQuery.sort('-createdAt');
      }
    } else {
      apiQuery = apiQuery.sort('-createdAt');
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    apiQuery = apiQuery.skip(skip).limit(Number(limit));

    const products = await apiQuery;
    const totalProducts = await Product.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      count: products.length,
      totalPages: Math.ceil(totalProducts / Number(limit)),
      currentPage: Number(page),
      totalProducts,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('sellerId', 'fullName email mobile');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Fetch related products (same category)
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id }
    }).limit(4);

    // Fetch reviews
    const reviews = await Review.find({ productId: product._id })
      .populate('userId', 'fullName profileImage')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      product,
      relatedProducts,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
export const createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      productDescription,
      category,
      subCategory,
      brand,
      SKU,
      price,
      minimumOrderQuantity,
      stock,
      specifications,
      tags,
      discount,
      featuredProduct
    } = req.body;

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      res.status(400);
      throw new Error('Selected category is invalid or does not exist');
    }

    // Process files using Cloudinary config
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadImage(file.buffer, CLOUDINARY_FOLDERS.PRODUCTS);
        images.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });
      }
    } else {
      // Set a clean placeholder image if none uploaded
      images.push({
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        publicId: 'placeholder_product_img'
      });
    }

    // Parse specifications if sent as JSON string
    let parsedSpecs = specifications;
    if (typeof specifications === 'string') {
      parsedSpecs = JSON.parse(specifications);
    }

    // Parse tags if sent as JSON string or comma-separated list
    let parsedTags = tags;
    if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(t => t.trim());
    }

    const product = await Product.create({
      productName,
      productDescription,
      category,
      subCategory,
      brand,
      SKU,
      price: Number(price),
      minimumOrderQuantity: Number(minimumOrderQuantity || 10),
      stock: Number(stock || 0),
      images,
      sellerId: req.user.id,
      discount: Number(discount || 0),
      specifications: parsedSpecs || [],
      tags: parsedTags || [],
      featuredProduct: featuredProduct === 'true' || featuredProduct === true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Access control: Only seller of product or Admin can update
    if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied. You are not authorized to edit this product.');
    }

    const {
      productName,
      productDescription,
      category,
      subCategory,
      brand,
      SKU,
      price,
      minimumOrderQuantity,
      stock,
      specifications,
      tags,
      discount,
      featuredProduct,
      availability,
      removeImages // Array of image publicIds to remove
    } = req.body;

    // Handle Category update
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        res.status(400);
        throw new Error('Selected category is invalid or does not exist');
      }
      product.category = category;
    }

    // Process image deletions
    let updatedImages = [...product.images];
    if (removeImages) {
      const idsToDelete = typeof removeImages === 'string' ? JSON.parse(removeImages) : removeImages;
      for (const publicId of idsToDelete) {
        await deleteImage(publicId);
        updatedImages = updatedImages.filter(img => img.publicId !== publicId);
      }
    }

    // Process new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadImage(file.buffer, CLOUDINARY_FOLDERS.PRODUCTS);
        updatedImages.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });
      }
    }

    // Parse specifications
    let parsedSpecs = specifications;
    if (typeof specifications === 'string') {
      parsedSpecs = JSON.parse(specifications);
    }

    // Parse tags
    let parsedTags = tags;
    if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(t => t.trim());
    }

    // Set fields
    product.productName = productName || product.productName;
    product.productDescription = productDescription || product.productDescription;
    product.subCategory = subCategory !== undefined ? subCategory : product.subCategory;
    product.brand = brand || product.brand;
    product.SKU = SKU || product.SKU;
    product.price = price !== undefined ? Number(price) : product.price;
    product.minimumOrderQuantity = minimumOrderQuantity !== undefined ? Number(minimumOrderQuantity) : product.minimumOrderQuantity;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.images = updatedImages;
    product.discount = discount !== undefined ? Number(discount) : product.discount;
    if (parsedSpecs) product.specifications = parsedSpecs;
    if (parsedTags) product.tags = parsedTags;
    if (featuredProduct !== undefined) product.featuredProduct = featuredProduct === 'true' || featuredProduct === true;
    if (availability !== undefined) product.availability = availability === 'true' || availability === true;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check ownership or admin status
    if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied. You are not authorized to delete this product.');
    }

    // Delete associated images from Cloudinary
    for (const image of product.images) {
      await deleteImage(image.publicId);
    }

    await Product.findByIdAndDelete(req.params.id);

    // Also delete associated reviews
    await Review.deleteMany({ productId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Product and associated reviews deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories list
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instant suggestions (products, categories, brands) matching query
// @route   GET /api/products/search/suggestions
// @access  Public
export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json({ success: true, categories: [], brands: [], products: [] });
    }

    const regex = new RegExp(q.trim(), 'i');

    // 1. Search products
    const products = await Product.find({ productName: regex })
      .select('productName price images')
      .limit(5);

    // 2. Search categories
    const categories = await Category.find({ name: regex })
      .select('name slug')
      .limit(3);

    // 3. Search brands (using distinct query and matching on product collection)
    const matchedProductsForBrands = await Product.find({ brand: regex })
      .select('brand')
      .limit(50);
    const brands = [...new Set(matchedProductsForBrands.map(p => p.brand))].slice(0, 3);

    res.status(200).json({
      success: true,
      categories,
      brands,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top trending search terms
// @route   GET /api/products/search/trending
// @access  Public
export const getTrendingSearches = async (req, res, next) => {
  try {
    const trending = await SearchQuery.find({})
      .sort({ count: -1 })
      .limit(6)
      .select('query');

    res.status(200).json({
      success: true,
      trending: trending.map(item => item.query)
    });
  } catch (error) {
    next(error);
  }
};
