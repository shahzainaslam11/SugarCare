// store/slices/communityInsightsSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

// store/slices/communityInsightsSlice.js
export const fetchCommunityInsights = createAsyncThunk(
  'communityInsights/fetchCommunityInsights',
  async ({token, user_id}, {rejectWithValue}) => {
    try {
      const res = await api.get('/community/blogs', {
        headers: {Authorization: `Bearer ${token}`, accept: 'application/json'},
        params: {user_id},
      });

      // Only items array now
      return res.data.data.items || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {message: 'Failed to fetch community insights'},
      );
    }
  },
);

const communityInsightsSlice = createSlice({
  name: 'communityInsights',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearInsights: state => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCommunityInsights.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunityInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
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
