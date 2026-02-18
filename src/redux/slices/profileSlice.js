// redux/slices/profileSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

// Fetch user profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async ({token}, {rejectWithValue}) => {
    try {
      const res = await api.get('/profile/me', {
        headers: {Authorization: `Bearer ${token}`}, // Simplified headers
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async ({token, payload}, {rejectWithValue}) => {
    try {
      const res = await api.put('/profile/me', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return res.data.data; // Full updated profile
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Upload profile image
export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async ({token, file}, {rejectWithValue}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/profile/me/image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Assuming API returns an object like { profile_image: "/path/to/img.jpg" }
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Delete profile image
// In deleteProfileImage thunk:
export const deleteProfileImage = createAsyncThunk(
  'profile/deleteProfileImage',
  async ({token}, {rejectWithValue}) => {
    try {
      console.log('DELETE API Request to /profile/me/image');
      const res = await api.delete('/profile/me/image', {
        headers: {Authorization: `Bearer ${token}`},
      });

      console.log('DELETE Response:', JSON.stringify(res.data, null, 2));

      // Check if the API returns the full profile or just success message
      return res.data.data || res.data;
    } catch (error) {
      console.log('DELETE Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProfileError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch profile';
      })

      // Update profile
      .addCase(updateProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      })

      // Upload profile image
      .addCase(uploadProfileImage.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // Assuming API returns full profile
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to upload profile image';
      })

      // Delete profile image
      .addCase(deleteProfileImage.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(deleteProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to delete profile image';
      });
  },
});

export const {clearProfileError} = profileSlice.actions;
export default profileSlice.reducer;
