import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api.js';

// Helper to get initial state from localStorage
const storedUser = localStorage.getItem('user');
const initialUser = storedUser ? JSON.parse(storedUser) : null;
console.log(initialUser);
// {
//     "_id": "6a70c6ed9c6418045b2a2d88",
//     "fullName": "Alice Shopkeeper",
//     "email": "customer@foodie.com",
//     "mobile": "+919876543212",
//     "role": "customer",
//     "profileImage": "",
//     "isVerified": true 
// } --- it is the initialuser after login if no login it gives null

// Async Thunks
export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await API.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const response = await API.post('/auth/login', credentials);
    const { accessToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await API.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    return true;
  } catch (error) {
    const message = error.response?.data?.message || 'Logout failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const loadMe = createAsyncThunk('auth/loadMe', async (_, thunkAPI) => {
  try {
    const response = await API.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to load user';
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk('users/updateProfile', async (formData, thunkAPI) => {
  try {
    const response = await API.put('/users/updateprofile', formData);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  } catch (error) {
    const message = error.response?.data?.message || 'Profile update failed';
    return thunkAPI.rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    isAuthenticated: !!initialUser,
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    forceLogout: (state) => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      state.user = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // Load Me
      .addCase(loadMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = 'Profile updated successfully!';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearErrors, forceLogout } = authSlice.actions;
export default authSlice.reducer;
