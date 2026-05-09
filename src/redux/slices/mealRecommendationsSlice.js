// mealRecommendationsSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

// Old UI used Small/Medium/Large; new UI uses Light/Medium/Large. Backend expects Small/Medium/Large.
const PORTION_UI_TO_API = { Light: 'Small', Medium: 'Medium', Large: 'Large' };

export const generateMealRecommendations = createAsyncThunk(
  'meals/generateMealRecommendations',
  async ({payload, token}, {rejectWithValue}) => {
    const portion = PORTION_UI_TO_API[payload.portion_size] ?? payload.portion_size;

    const body = {
      current_glucose: Number(payload.current_glucose),
      diabetes_control_level: payload.diabetes_control_level,
      meal_description: (payload.meal_description ?? '').trim(),
      portion_size: portion,
      time: payload.time,
      user_id: payload.user_id,
    };
    console.log('API Payload:', body);

    try {
      const response = await api.post('/meals/recommend', body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('API Response:', response.data);

      // Return the recommendations from the response
      return response.data.data?.recommendations || response.data.data;
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);

      let errorMessage = 'Failed to generate meal recommendations';
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail) && detail.length > 0) {
        // FastAPI validation errors: [{loc, msg}, ...]
        const msgs = detail.map(d => d.msg || d.message || JSON.stringify(d)).join('; ');
        errorMessage = msgs || (typeof detail[0] === 'string' ? detail[0] : errorMessage);
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      return rejectWithValue({
        message: errorMessage,
        status: err.response?.status,
      });
    }
  },
);

export const fetchMealHistory = createAsyncThunk(
  'meals/fetchMealHistory',
  async ({user_id, token}, {rejectWithValue}) => {
    try {
      const response = await api.get(`/meals/history?user_id=${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.items || [];
    } catch (err) {
      console.error('History API Error:', err.response?.data || err.message);

      let errorMessage = 'Failed to fetch meal history';

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      return rejectWithValue({
        message: errorMessage,
        status: err.response?.status,
      });
    }
  },
);

const mealRecommendationsSlice = createSlice({
  name: 'meals',
  initialState: {
    recommendations: null,
    history: [],
    loading: false,
    error: null,
    lastGenerated: null,
  },
  reducers: {
    clearMealError: state => {
      state.error = null;
    },
    clearMealRecommendations: state => {
      state.recommendations = null;
    },
    setCurrentMeal: (state, action) => {
      state.currentMeal = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Generate Recommendations — do not set `loading`; WhatToEat uses a dedicated
      // full-screen submit state. Toggling `loading` here also triggered SmallLoader
      // (a second Modal) and caused a double-spinner.
      .addCase(generateMealRecommendations.pending, state => {
        state.error = null;
      })
      .addCase(generateMealRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
        state.error = null;
        state.lastGenerated = new Date().toISOString();
      })
      .addCase(generateMealRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to generate recommendations';
      })

      // Fetch History
      .addCase(fetchMealHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMealHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
        state.error = null;
      })
      .addCase(fetchMealHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch history';
      });
  },
});

export const {clearMealError, clearMealRecommendations, setCurrentMeal} =
  mealRecommendationsSlice.actions;
export default mealRecommendationsSlice.reducer;
