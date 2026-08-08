import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api.js';

// Async Thunks
export const fetchProducts = createAsyncThunk('products/fetchAll', async (queryParams, thunkAPI) => {
  try {
    const { append, ...params } = queryParams;
    const response = await API.get('/products', { params });
    return { ...response.data, append };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch products';
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, thunkAPI) => {
  try {
    const response = await API.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch product details';
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, thunkAPI) => {
  try {
    const response = await API.get('/products/categories');
    return response.data.categories;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch categories';
    return thunkAPI.rejectWithValue(message);
  }
});

export const createProduct = createAsyncThunk('products/create', async (formData, thunkAPI) => {
  try {
    const response = await API.post('/products', formData);
    return response.data.product;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create product';
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchSellerProducts = createAsyncThunk(
  'products/fetchSellerProducts',
  async (_, thunkAPI) => {
    try {
      const response = await API.get('/seller/products');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to fetch seller products';

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const submitProductReview = createAsyncThunk('products/submitReview', async (reviewData, thunkAPI) => {
  try {
    const response = await API.post('/users/reviews', reviewData);
    return response.data.review;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to submit review';
    return thunkAPI.rejectWithValue(message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    sellerProducts: [],
    sellerProductsLoading: false,
    categories: [],
    currentProduct: null,
    relatedProducts: [],
    reviews: [],
    totalPages: 1,
    currentPage: 1,
    totalProducts: 0,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetProductStatus: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products (Customer)
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.append) {
          state.products = [...state.products, ...action.payload.products];
        } else {
          state.products = action.payload.products;
        }
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Seller Products (All)
      .addCase(fetchSellerProducts.pending, (state) => {
        state.sellerProductsLoading = true;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.sellerProductsLoading = false;
        state.sellerProducts = action.payload.products || [];
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.sellerProductsLoading = false;
        state.error = action.payload;
      })
      // Fetch Product By ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.currentProduct = null;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
        state.relatedProducts = action.payload.relatedProducts;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit Review
      .addCase(submitProductReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload);
      });
  }
});

export const { resetProductStatus } = productSlice.actions;
export default productSlice.reducer;
