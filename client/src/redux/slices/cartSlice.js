import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api.js';

// Async Thunks
export const fetchCart = createAsyncThunk('cart/fetch', async (_, thunkAPI) => {
  try {
    const response = await API.get('/users/cart');
    return response.data.cart;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to load cart';
    return thunkAPI.rejectWithValue(message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, thunkAPI) => {
  try {
    const response = await API.post('/users/cart', { productId, quantity });
    return response.data.cart;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add item to cart';
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateCartQty = createAsyncThunk('cart/updateQty', async ({ productId, quantity }, thunkAPI) => {
  try {
    const response = await API.put('/users/cart', { productId, quantity });
    return response.data.cart;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update quantity';
    return thunkAPI.rejectWithValue(message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, thunkAPI) => {
  try {
    const response = await API.delete(`/users/cart/${productId}`);
    return response.data.cart;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to remove item';
    return thunkAPI.rejectWithValue(message);
  }
});

export const validateCoupon = createAsyncThunk('cart/validateCoupon', async ({ code, amount }, thunkAPI) => {
  try {
    const response = await API.post('/users/coupons/validate', { code, amount });
    return response.data.coupon;
  } catch (error) {
    const message = error.response?.data?.message || 'Coupon verification failed';
    return thunkAPI.rejectWithValue(message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    activeCoupon: null,
    couponError: null
  },
  reducers: {
    clearCartErrors: (state) => {
      state.error = null;
      state.couponError = null;
    },
    resetCoupon: (state) => {
      state.activeCoupon = null;
    },
    updateItemQuantityOptimistic: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(i => {
        const id = i.productId?._id ? i.productId._id.toString() : i.productId.toString();
        return id === productId.toString();
      });
      if (item) {
        item.quantity = quantity;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
      })
      // Update Qty
      .addCase(updateCartQty.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
      })
      .addCase(updateCartQty.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
      })
      // Validate Coupon
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.activeCoupon = action.payload;
        state.couponError = null;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.couponError = action.payload;
        state.activeCoupon = null;
      });
  }
});

export const { clearCartErrors, resetCoupon, updateItemQuantityOptimistic } = cartSlice.actions;
export default cartSlice.reducer;
