import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

/* =========================================================
   Async Thunk
   ========================================================= */
export const fetchRiskForecast = createAsyncThunk(
  'riskForecast/fetchRiskForecast',
  async ({token, user_id}, {rejectWithValue}) => {
    try {
      const res = await api.post(
        '/health/risk_forecast',
        {user_id},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );

      const data = res.data?.data ?? res.data;
      const risks = data?.risk_areas ?? data?.risks ?? [];
      const overallStatus = data?.overall_risk_status ?? data?.overallStatus ?? null;

      return {
        risks: Array.isArray(risks) ? risks : [],
        overallStatus,
      };
    } catch (err) {
      const payload =
        err.response?.data || {message: 'Failed to fetch risk forecast'};
      return rejectWithValue(payload);
    }
  },
);

/* =========================================================
   Slice
   ========================================================= */
const riskForecastSlice = createSlice({
  name: 'riskForecast',
  initialState: {
    risks: [], // ✅ always exists
    overallStatus: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearRiskForecast: state => {
      state.risks = [];
      state.overallStatus = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRiskForecast.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRiskForecast.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.risks = action.payload?.risks || [];
        state.overallStatus = action.payload?.overallStatus || null;
      })
      .addCase(fetchRiskForecast.rejected, (state, action) => {
        state.loading = false;
        state.risks = [];
        state.overallStatus = null;
        const p = action.payload;
        state.error =
          (typeof p === 'string' ? p : null) ||
          p?.message ||
          p?.error?.message ||
          p?.msg ||
          'Failed to fetch risk forecast';
      });
  },
});

export const {clearRiskForecast} = riskForecastSlice.actions;
export default riskForecastSlice.reducer;
