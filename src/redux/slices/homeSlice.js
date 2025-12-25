import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

// Fetch Sugar Records
export const fetchSugarRecords = createAsyncThunk(
  'home/fetchSugarRecords',
  async ({user_id, token}, {rejectWithValue}) => {
    try {
      const res = await api.get(`/sugar/records?user_id=${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// Fetch Fasting Records
export const fetchFastingRecords = createAsyncThunk(
  'home/fetchFastingRecords',
  async ({user_id, token}, {rejectWithValue}) => {
    try {
      const res = await api.get(`/fasting/records?user_id=${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    sugarRecords: [],
    fastingRecords: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearHomeError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSugarRecords.pending, state => {
        state.loading = true;
      })
      .addCase(fetchSugarRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.sugarRecords = action.payload?.data || [];
      })
      .addCase(fetchSugarRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchFastingRecords.pending, state => {
        state.loading = true;
      })
      .addCase(fetchFastingRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.fastingRecords = action.payload?.data || [];
      })
      .addCase(fetchFastingRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const {clearHomeError} = homeSlice.actions;
export default homeSlice.reducer;
