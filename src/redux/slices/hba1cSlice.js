// redux/slices/hba1cSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance'; // your axios instance

// Fetch HbA1c Records
export const fetchHbA1cRecords = createAsyncThunk(
  'hba1c/fetchHbA1cRecords',
  async ({user_id, token}, {rejectWithValue}) => {
    try {
      const res = await api.get(`/hba1c/records?user_id=${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      });
      return res.data.data.items; // directly return array of records
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {message: 'Failed to fetch HbA1C records'},
      );
    }
  },
);

// Add HbA1c Record
export const addHbA1cRecord = createAsyncThunk(
  'hba1c/addHbA1cRecord',
  async (payload, {rejectWithValue}) => {
    try {
      const response = await fetch(
        'https://sugarcare.cloud/api/v1/hba1c/record',
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${payload.token}`, // include token if required
          },
          body: JSON.stringify({
            date: payload.date,
            time: payload.time,
            value: parseFloat(payload.value), // ensure number
            notes: payload.notes,
            user_id: payload.user_id,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      // return the new record object directly
      return result.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const hba1cSlice = createSlice({
  name: 'hba1c',
  initialState: {
    records: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearHbA1cError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Records
      .addCase(fetchHbA1cRecords.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHbA1cRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload || [];
      })
      .addCase(fetchHbA1cRecords.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to fetch HbA1C records';
      })

      // Add Record
      .addCase(addHbA1cRecord.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHbA1cRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records.push(action.payload);
      })
      .addCase(addHbA1cRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add HbA1C record';
      });
  },
});

export const {clearHbA1cError} = hba1cSlice.actions;
export default hba1cSlice.reducer;
