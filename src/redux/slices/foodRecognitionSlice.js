// slices/foodRecognitionSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import api from '../api/axiosInstance';

const normalizeUploadUri = uri => {
  if (!uri || typeof uri !== 'string') {
    return uri;
  }
  // Android file uploads should use file:// for local paths.
  if (Platform.OS === 'android' && !uri.startsWith('content://') && !uri.startsWith('file://')) {
    return `file://${uri}`;
  }
  return uri;
};

const resolveFoodScanErrorMessage = err => {
  if (err?.code === 'ECONNABORTED') {
    return 'Scan is taking longer than expected. Please try again.';
  }
  return null;
};

const toLocalUploadUriIfNeeded = async uri => {
  if (!uri || Platform.OS !== 'android' || !uri.startsWith('content://')) {
    return normalizeUploadUri(uri);
  }
  try {
    const destinationPath = `${RNFS.CachesDirectoryPath}/food_upload_${Date.now()}.jpg`;
    await RNFS.copyFile(uri, destinationPath);
    return `file://${destinationPath}`;
  } catch (_) {
    // If copy fails, fall back to original content URI.
    return uri;
  }
};

const postFoodAnalyzeWithFetch = async ({formData, token}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch('https://sugarcare.cloud/api/v1/food/analyze', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
      body: formData,
      signal: controller.signal,
    });

    const responseText = await response.text();
    let responseData = null;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch (_) {
      responseData = {message: responseText || 'Invalid server response'};
    }

    if (!response.ok) {
      const error = new Error(
        responseData?.message ||
          responseData?.detail ||
          responseData?.error ||
          `Scan request failed (${response.status})`,
      );
      error.response = {status: response.status, data: responseData};
      throw error;
    }

    return responseData;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Analyze Food Image (send file as FormData)
export const analyzeFoodImage = createAsyncThunk(
  'food/analyzeFoodImage',
  async ({file, user_id, token}, {rejectWithValue}) => {
    try {
      const uploadUri = await toLocalUploadUriIfNeeded(file.uri);
      const formData = new FormData();
      formData.append('user_id', user_id);
      formData.append('file', {
        uri: uploadUri,
        type: file.type || 'image/jpeg',
        name: file.name || `food_${Date.now()}.jpg`,
      });

      console.log('📤 Sending Data To API:', {file, uploadUri, user_id});

      let responseData = null;
      try {
        const axiosRes = await api.post('/food/analyze', formData, {
          timeout: 90000,
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        });
        responseData = axiosRes.data;
      } catch (firstError) {
        const isAndroidUploadTransportError =
          Platform.OS === 'android' &&
          !firstError?.response &&
          (firstError?.code === 'ERR_NETWORK' || firstError?.message === 'Network Error');

        if (!isAndroidUploadTransportError) {
          throw firstError;
        }

        // Android-only fallback for multipart transport issues on some devices/vendors.
        responseData = await postFoodAnalyzeWithFetch({formData, token});
      }

      console.log('📥 Food Analysis Response:', JSON.stringify(responseData));
      // Handle both { data: {...} } and direct {...} response structures
      const result = responseData?.data ?? responseData;
      return result;
    } catch (err) {
      console.log('❌ Food Analysis Error:', {
        code: err?.code,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      const payload = err.response?.data;
      const networkMessage = resolveFoodScanErrorMessage(err);
      let uploadAwareNetworkMessage = null;

      if (
        !err?.response &&
        (err?.name === 'AbortError' ||
          err?.code === 'ERR_NETWORK' ||
          err?.message === 'Network Error')
      ) {
        try {
          // Probe a lightweight authenticated endpoint. If this succeeds, connectivity is fine
          // and the failure is likely during image upload/processing.
          await api.get('/iap/balance', {
            timeout: 10000,
            headers: {
              Authorization: `Bearer ${token}`,
              accept: 'application/json',
            },
          });
          uploadAwareNetworkMessage =
            err?.name === 'AbortError'
              ? 'Scan request timed out. Please try a smaller/clearer image and try again.'
              : 'Server is reachable, but this image upload failed. Try another photo and try again.';
        } catch (_) {
          uploadAwareNetworkMessage =
            err?.name === 'AbortError'
              ? 'Scan request timed out. Please check internet speed and try again.'
              : 'Unable to reach the server. Please check your internet and try again.';
        }
      }

      if (!uploadAwareNetworkMessage && err?.name === 'AbortError') {
        uploadAwareNetworkMessage = 'Scan request timed out. Please try again.';
      }

      if (err?.name === 'AbortError') {
        return rejectWithValue({
          status: undefined,
          message: uploadAwareNetworkMessage || 'Scan timed out. Please try again.',
          raw: undefined,
        });
      }

      return rejectWithValue({
        status: err.response?.status,
        message:
          uploadAwareNetworkMessage ||
          networkMessage ||
          payload?.message ||
          payload?.detail ||
          payload?.error ||
          err.message ||
          'Failed to analyze food image',
        raw: payload,
      });
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
