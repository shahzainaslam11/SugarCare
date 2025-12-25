import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

// Helper to extract validation errors
const getErrorMessage = payload => {
  if (!payload) return 'Something went wrong.';

  if (payload?.details?.validation_errors) {
    return payload.details.validation_errors
      .map(err => `${err.field.replace('body.', '')}: ${err.message}`)
      .join('\n');
  }
  return payload.message || 'Something went wrong.';
};

// LOGIN
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({email, password}, {rejectWithValue}) => {
    try {
      const res = await api.post('/auth/login', {email, password});
      return res.data; // contains tokens + user info
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// SIGNUP - updated with new fields
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, {rejectWithValue}) => {
    try {
      const res = await api.post('/auth/register', payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// SEND OTP - updated API endpoint and payload
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async ({email, purpose = 'reset_pw'}, {rejectWithValue}) => {
    try {
      const res = await api.post('/auth/otp/send', {
        purpose,
        email,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// VERIFY OTP - updated with purpose field
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({email, code, purpose = 'reset_pw'}, {rejectWithValue}) => {
    try {
      const res = await api.post('/auth/otp/verify', {
        purpose,
        email,
        code,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// RESET PASSWORD - updated with new password structure
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({email, new_password, confirm_password}, {rejectWithValue}) => {
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        new_password,
        confirm_password,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// LOGOUT - updated to match new API structure
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async ({access_token, refresh_token}, {rejectWithValue}) => {
    try {
      const res = await api.post('/auth/logout', {access_token, refresh_token});
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
    otpSent: false,
    otpVerified: false,
  },
  reducers: {
    clearAuthError: state => {
      state.error = null;
    },
    clearOtpStatus: state => {
      state.otpSent = false;
      state.otpVerified = false;
    },
    setTokens: (state, action) => {
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
    },
    clearAuthData: state => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.otpSent = false;
      state.otpVerified = false;
    },
  },
  extraReducers: builder => {
    builder
      // LOGIN
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
      })

      // REGISTER
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
      })

      // SEND OTP
      .addCase(sendOtp.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, state => {
        state.loading = false;
        state.otpSent = true;
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.otpSent = false;
        state.error = getErrorMessage(action.payload);
      })

      // VERIFY OTP
      .addCase(verifyOtp.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpVerified = true;
        // If OTP verification returns tokens (like for email verification)
        if (action.payload.access_token) {
          state.accessToken = action.payload.access_token;
          state.refreshToken = action.payload.refresh_token;
        }
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.otpVerified = false;
        state.error = getErrorMessage(action.payload);
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.loading = false;
        state.otpSent = false;
        state.otpVerified = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
      })

      // LOGOUT
      .addCase(logoutUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.otpSent = false;
        state.otpVerified = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
        // Still clear local auth data even if API call fails
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const {clearAuthError, clearOtpStatus, setTokens, clearAuthData} =
  authSlice.actions;
export default authSlice.reducer;
