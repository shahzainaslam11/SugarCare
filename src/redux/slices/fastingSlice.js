// slices/fastingSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

/* =========================
   Fetch Fasting Records
========================= */
export const fetchFastingRecords = createAsyncThunk(
  'fasting/fetchFastingRecords',
  async (
    {user_id, time_range = 'Today', timezone = 'UTC', token},
    {rejectWithValue},
  ) => {
    try {
      const res = await api.get(
        `/fasting/records?user_id=${user_id}&time_range=${time_range}&timezone=${timezone}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );

      return {
        time_range,
        data: res.data?.data,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* =========================
   Add Fasting Record
========================= */
export const addFastingRecord = createAsyncThunk(
  'fasting/addFastingRecord',
  async (
    {user_id, date, start_time, end_time, duration_hours, notes, token},
    {rejectWithValue},
  ) => {
    try {
      const res = await api.post(
        '/fasting/record',
        {
          user_id,
          date,
          start_time,
          end_time,
          duration_hours,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        },
      );

      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* =========================
   Slice
========================= */
const fastingSlice = createSlice({
  name: 'fasting',
  initialState: {
    recordsByRange: {
      Today: [],
      OneWeek: [],
      OneMonth: [],
      AllTime: [],
    },
    graphData: {},
    stats: {
      total: 0,
      totalFastingDays: 0,
      averageFastingTime: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearFastingError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      /* ---------- Fetch Records ---------- */
      .addCase(fetchFastingRecords.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFastingRecords.fulfilled, (state, action) => {
        state.loading = false;

        const {time_range, data} = action.payload;

        // Records
        state.recordsByRange[time_range] = data?.items?.[time_range] || [];

        // Graph (merge to avoid overwrite)
        state.graphData = {
          ...state.graphData,
          ...data?.graph_data,
        };

        // Stats
        state.stats = {
          total: data?.total || 0,
          totalFastingDays: data?.total_fasting_days || 0,
          averageFastingTime: data?.average_fasting_time || 0,
        };
      })
      .addCase(fetchFastingRecords.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to fetch fasting records';
      })

      /* ---------- Add Record ---------- */
      .addCase(addFastingRecord.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFastingRecord.fulfilled, state => {
        state.loading = false;
        // 🔁 Re-fetch from screen after success
      })
      .addCase(addFastingRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add fasting record';
      });
  },
});

export const {clearFastingError} = fastingSlice.actions;
export default fastingSlice.reducer;
