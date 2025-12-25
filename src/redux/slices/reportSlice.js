import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

// ================= FETCH SUGAR REPORT =================
export const fetchSugarReport = createAsyncThunk(
  'report/fetchSugarReport',
  async ({user_id, time_range = 'Today', token}, {rejectWithValue}) => {
    try {
      const response = await api.get(
        `/sugar/forecast/report?user_id=${user_id}&time_range=${time_range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// ================= FETCH FASTING REPORT =================
export const fetchFastingReport = createAsyncThunk(
  'report/fetchFastingReport',
  async ({user_id, time_range = 'Today', token}, {rejectWithValue}) => {
    try {
      const response = await api.get(
        `/fasting/report?user_id=${user_id}&time_range=${time_range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const reportSlice = createSlice({
  name: 'report',
  initialState: {
    loading: false,
    error: null,
    sugarReport: null,
    fastingReport: null,
  },
  reducers: {
    clearReports: state => {
      state.sugarReport = null;
      state.fastingReport = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      /* ---------- Sugar Report ---------- */
      .addCase(fetchSugarReport.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSugarReport.fulfilled, (state, action) => {
        state.loading = false;
        state.sugarReport = action.payload;
      })
      .addCase(fetchSugarReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Fasting Report ---------- */
      .addCase(fetchFastingReport.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFastingReport.fulfilled, (state, action) => {
        state.loading = false;
        state.fastingReport = action.payload;
      })
      .addCase(fetchFastingReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {clearReports} = reportSlice.actions;
export default reportSlice.reducer;
