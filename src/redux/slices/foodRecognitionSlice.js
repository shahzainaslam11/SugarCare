// slices/foodRecognitionSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

// Analyze Food Image (send file as FormData)
export const analyzeFoodImage = createAsyncThunk(
  'food/analyzeFoodImage',
  async ({file, user_id, token}, {rejectWithValue}) => {
    try {
      const formData = new FormData();
      formData.append('user_id', user_id);
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });

      console.log('📤 Sending Data To API:', {file, user_id});

      const res = await api.post('/food/analyze', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      });

      console.log('📥 Food Analysis Response:', JSON.stringify(res.data));
      // Handle both { data: {...} } and direct {...} response structures
      const result = res.data?.data ?? res.data;
      return result;
    } catch (err) {
      console.log(
        '❌ Food Analysis Error:',
        JSON.stringify(err.response?.data),
      );
      return rejectWithValue(err.response?.data);
    }
  },
);

const foodRecognitionSlice = createSlice({
  name: 'food',
  initialState: {
    result: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearFoodResult: state => {
      state.result = null;
    },
    clearFoodError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(analyzeFoodImage.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeFoodImage.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(analyzeFoodImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to analyze food image';
      });
  },
});

export const {clearFoodResult, clearFoodError} = foodRecognitionSlice.actions;
export default foodRecognitionSlice.reducer;
