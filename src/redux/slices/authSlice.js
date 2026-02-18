import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';

// Ensure email is always lowercase before sending to backend
const normalizeEmail = e => (typeof e === 'string' ? e.trim().toLowerCase() : e);

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

// Helper to save auth data to AsyncStorage
const saveAuthDataToStorage = async data => {
  try {
    if (data.accessToken || data.access_token) {
      await AsyncStorage.setItem(
        'accessToken',
        data.accessToken || data.access_token,
      );
    }
    if (data.refreshToken || data.refresh_token) {
      await AsyncStorage.setItem(
        'refreshToken',
        data.refreshToken || data.refresh_token,
      );
    }
    if (data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    }
  } catch (error) {
    console.error('Error saving auth data to storage:', error);
  }
};

// Helper to clear auth data from AsyncStorage
const clearAuthDataFromStorage = async () => {
  try {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  } catch (error) {
    console.error('Error clearing auth data from storage:', error);
  }
};

// LOGIN
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({email, password}, {rejectWithValue, dispatch}) => {
    try {
      const res = await api.post('/auth/login', {
        email: normalizeEmail(email),
        password,
      });

      // Save to AsyncStorage
      await saveAuthDataToStorage({
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token,
        user: res.data.data,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// SIGNUP
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, {rejectWithValue}) => {
    try {
      const normalized = {
        ...payload,
        email: normalizeEmail(payload.email),
      };
      const res = await api.post('/auth/register', normalized);

      // Save to AsyncStorage
      await saveAuthDataToStorage({
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token,
        user: res.data.data,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// SEND OTP
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

// VERIFY OTP
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({email, code, purpose = 'reset_pw'}, {rejectWithValue}) => {
    try {
      const res = await api.post('/auth/otp/verify', {
        purpose,
        email: normalizeEmail(email),
        code,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// RESET PASSWORD
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({email, new_password, confirm_password}, {rejectWithValue}) => {
    try {
      const res = await api.post('/auth/reset-password', {
        email: normalizeEmail(email),
        new_password,
        confirm_password,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// LOGOUT
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, {rejectWithValue, getState}) => {
    try {
      const state = getState();
      const {accessToken, refreshToken} = state.auth;

      // Call logout API if tokens exist
      if (accessToken && refreshToken) {
        const res = await api.post('/auth/logout', {
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Clear from AsyncStorage
        await clearAuthDataFromStorage();

        return res.data;
      }

      // If no tokens, just clear local data
      await clearAuthDataFromStorage();
      return {success: true, message: 'Logged out locally'};
    } catch (error) {
      // Even if API call fails, clear local data
      await clearAuthDataFromStorage();
      return rejectWithValue(error.response?.data);
    }
  },
);

// REFRESH TOKEN (if your API supports it)
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, {rejectWithValue, getState}) => {
    try {
      const state = getState();
      const {refreshToken} = state.auth;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const res = await api.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      // Save new tokens to AsyncStorage
      await saveAuthDataToStorage({
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token || refreshToken, // Use new refresh token if provided
      });

      return res.data;
    } catch (error) {
      // If refresh fails, clear auth data
      await clearAuthDataFromStorage();
      return rejectWithValue(error.response?.data);
    }
  },
);

// INITIALIZE AUTH FROM STORAGE
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, {rejectWithValue}) => {
    try {
      const [accessToken, refreshToken, userString] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
        AsyncStorage.getItem('user'),
      ]);

      return {
        accessToken,
        refreshToken,
        user: userString ? JSON.parse(userString) : null,
      };
    } catch (error) {
      return rejectWithValue(error.message);
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
    isInitialized: false, // Track if auth is initialized from storage
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

      // Save to AsyncStorage
      if (action.payload.access_token) {
        AsyncStorage.setItem('accessToken', action.payload.access_token);
      }
      if (action.payload.refresh_token) {
        AsyncStorage.setItem('refreshToken', action.payload.refresh_token);
      }
    },
    updateUser: (state, action) => {
      state.user = {...state.user, ...action.payload};

      // Save updated user to AsyncStorage
      if (state.user) {
        AsyncStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    logout: state => {
      // Clear Redux state
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.error = null;

      // Clear AsyncStorage
      clearAuthDataFromStorage();
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      if (action.payload) {
        AsyncStorage.setItem('accessToken', action.payload);
      }
    },
    markAsInitialized: state => {
      state.isInitialized = true;
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
        state.isInitialized = true;
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
        state.isInitialized = true;
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

          // Save to AsyncStorage
          saveAuthDataToStorage({
            accessToken: action.payload.access_token,
            refreshToken: action.payload.refresh_token,
          });
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
        state.isInitialized = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
        // Still clear local auth data even if API call fails
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.otpSent = false;
        state.otpVerified = false;
        state.isInitialized = true;
      })

      // REFRESH TOKEN
      .addCase(refreshAccessToken.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access_token;
        if (action.payload.refresh_token) {
          state.refreshToken = action.payload.refresh_token;
        }
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
        // Clear auth data if refresh fails
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })

      // INITIALIZE AUTH
      .addCase(initializeAuth.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      });
  },
});

export const {
  clearAuthError,
  clearOtpStatus,
  setTokens,
  updateUser,
  logout,
  setAccessToken,
  markAsInitialized,
} = authSlice.actions;

export default authSlice.reducer;
