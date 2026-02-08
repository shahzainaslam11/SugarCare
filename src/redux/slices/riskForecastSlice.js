import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

/* =========================================================
   Async Thunk
   ========================================================= */
export const fetchRiskForecast = createAsyncThunk(
  'riskForecast/fetchRiskForecast',
  async ({token, user_id}, {rejectWithValue}) => {
    try {
      const res = await api.get(`/health/history?user_id=${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      });

      const firstItem = res.data?.items?.[0];
      const responseJson = firstItem?.response_json || {};

      return {
        risks: responseJson?.risk_areas || [],
        overallStatus: responseJson?.overall_risk_status || null,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {message: 'Failed to fetch risk forecast'},
      );
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
        state.risks = action.payload?.risks || [];
        state.overallStatus = action.payload?.overallStatus || null;
      })
      .addCase(fetchRiskForecast.rejected, (state, action) => {
        state.loading = false;
        state.risks = [];
        state.overallStatus = null;
        state.error =
          action.payload?.message || 'Failed to fetch risk forecast';
      });
  },
});

export const {clearRiskForecast} = riskForecastSlice.actions;
export default riskForecastSlice.reducer;
