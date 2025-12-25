import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

/* =========================
   Add Sugar Record
========================= */
export const addSugarRecord = createAsyncThunk(
  'sugarForecast/addSugarRecord',
  async ({payload, token}, {rejectWithValue}) => {
    try {
      const res = await api.post('/sugar/record', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
      });

      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* =========================
   Fetch Sugar Records
========================= */
export const fetchSugarRecords = createAsyncThunk(
  'sugarForecast/fetchSugarRecords',
  async (
    {user_id, time_range = 'Today', timezone = 'UTC', token},
    {rejectWithValue},
  ) => {
    try {
      const res = await api.get(
        `/sugar/records?user_id=${user_id}&time_range=${time_range}&timezone=${timezone}`,
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
   Slice
========================= */
const sugarForecastSlice = createSlice({
  name: 'sugarForecast',
  initialState: {
    recordsByRange: {
      Today: [],
      OneWeek: [],
      OneMonth: [],
      AllTime: [],
    },
    graphData: {},
    stats: {
      count: 0,
      total: 0,
      totalSugarDays: 0,
      averageSugarLevel: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearSugarForecastError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      /* ---------- Add Sugar Record ---------- */
      .addCase(addSugarRecord.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSugarRecord.fulfilled, state => {
        state.loading = false;
        // 🔁 Always re-fetch from screen after success
      })
      .addCase(addSugarRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add sugar record';
      })

      /* ---------- Fetch Sugar Records ---------- */
      .addCase(fetchSugarRecords.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSugarRecords.fulfilled, (state, action) => {
        state.loading = false;

        const {time_range, data} = action.payload;

        // Records
        state.recordsByRange[time_range] = data?.items?.[time_range] || [];

        // Graph (merge per range)
        state.graphData = {
          ...state.graphData,
          ...data?.graph_data,
        };

        // Stats
        state.stats = {
          count: data?.count || 0,
          total: data?.total || 0,
          totalSugarDays: data?.total_sugar_days || 0,
          averageSugarLevel: data?.average_sugar_level || 0,
        };
      })
      .addCase(fetchSugarRecords.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to fetch sugar records';
      });
  },
});

export const {clearSugarForecastError} = sugarForecastSlice.actions;
export default sugarForecastSlice.reducer;
