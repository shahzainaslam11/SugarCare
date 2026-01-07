// redux/slices/sugarAlertSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

export const fetchRecentSugarReadings = createAsyncThunk(
  'sugarAlert/fetchRecentSugarReadings',
  async ({token, user_id, limit = 30}, {rejectWithValue}) => {
    try {
      const res = await api.get(`/sugar/records/recent`, {
        params: {
          user_id,
          limit,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      });

      const readings = res.data?.data?.recent_readings || [];
      const uniqueReadings = readings.reduce((acc, current) => {
        const exists = acc.find(item => item.timestamp === current.timestamp);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      uniqueReadings.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );

      return uniqueReadings;
    } catch (err) {
      console.error('Error fetching recent readings:', err.response?.data);
      return rejectWithValue(
        err.response?.data || {message: 'Failed to fetch readings'},
      );
    }
  },
);

const prepareReadingsForAPI = readings => {
  if (!readings || readings.length === 0) return [];

  const uniqueReadings = readings.reduce((acc, current) => {
    const exists = acc.find(item => item.timestamp === current.timestamp);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  uniqueReadings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const preparedReadings = [];
  let lastTimestamp = null;

  uniqueReadings.forEach(reading => {
    const currentDate = new Date(reading.timestamp);

    if (lastTimestamp) {
      const lastDate = new Date(lastTimestamp);
      if (currentDate <= lastDate) {
        const adjustedDate = new Date(lastDate);
        adjustedDate.setDate(adjustedDate.getDate() + 1);
        reading.timestamp = adjustedDate.toISOString().split('T')[0];
      }
    }

    preparedReadings.push({
      timestamp: reading.timestamp,
      value: reading.value,
    });

    lastTimestamp = reading.timestamp;
  });

  return preparedReadings;
};

export const predictSugarAlert = createAsyncThunk(
  'sugarAlert/predictSugarAlert',
  async (
    {token, user_id, activity_level, meal_info, recent_readings},
    {rejectWithValue},
  ) => {
    try {
      const preparedReadings = prepareReadingsForAPI(recent_readings);

      const res = await api.post(
        '/sugar/forecast',
        {
          user_id,
          activity_level,
          meal_info,
          recent_readings: preparedReadings,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      return res.data;
    } catch (err) {
      console.error('Error predicting sugar alert:', err.response?.data);
      return rejectWithValue(
        err.response?.data || {message: 'Prediction failed'},
      );
    }
  },
);

const sugarAlertSlice = createSlice({
  name: 'sugarAlert',
  initialState: {
    recentReadings: [],
    prediction: null,
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    clearPrediction: state => {
      state.prediction = null;
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
    addManualReading: (state, action) => {
      const today = new Date().toISOString().split('T')[0];
      const existingIndex = state.recentReadings.findIndex(
        reading => reading.timestamp === today,
      );

      if (existingIndex >= 0) {
        state.recentReadings[existingIndex].value = action.payload.value;
      } else {
        const newReading = {
          timestamp: today,
          value: action.payload.value,
        };
        state.recentReadings.unshift(newReading);
      }
      if (state.recentReadings.length > 30) {
        state.recentReadings = state.recentReadings.slice(0, 30);
      }
      state.recentReadings.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRecentSugarReadings.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentSugarReadings.fulfilled, (state, action) => {
        state.loading = false;
        state.recentReadings = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchRecentSugarReadings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch readings';
      })
      .addCase(predictSugarAlert.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(predictSugarAlert.fulfilled, (state, action) => {
        state.loading = false;
        state.prediction = action.payload;
      })
      .addCase(predictSugarAlert.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to predict sugar alert';
      });
  },
});

export const {clearPrediction, clearError, addManualReading} =
  sugarAlertSlice.actions;
export default sugarAlertSlice.reducer;
