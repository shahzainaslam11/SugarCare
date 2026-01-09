// store/slices/communityInsightsSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

/* =========================================================
   Async Thunks
   ========================================================= */

// Fetch community insights (blogs)
export const fetchCommunityInsights = createAsyncThunk(
  'communityInsights/fetchCommunityInsights',
  async ({token, user_id}, {rejectWithValue}) => {
    try {
      const res = await api.get('/community/blogs', {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
        // If API expects user_id as query param
        params: {
          user_id, // optional if API supports it
        },
      });

      // Return only the items array
      return res.data.data.items || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {message: 'Failed to fetch community insights'},
      );
    }
  },
);

/* =========================================================
   Slice
   ========================================================= */
const communityInsightsSlice = createSlice({
  name: 'communityInsights',
  initialState: {
    insights: [], // fetched blogs
    loading: false,
    error: null,
  },
  reducers: {
    clearInsights: state => {
      state.insights = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      /* ---------- Fetch Community Insights ---------- */
      .addCase(fetchCommunityInsights.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunityInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
      })
      .addCase(fetchCommunityInsights.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to fetch community insights';
      });
  },
});

export const {clearInsights} = communityInsightsSlice.actions;
export default communityInsightsSlice.reducer;
