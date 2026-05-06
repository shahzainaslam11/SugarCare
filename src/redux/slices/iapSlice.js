import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

const parseBackendMessage = error => {
  if (
    error?.code === 'ECONNABORTED' ||
    (typeof error?.message === 'string' &&
      error.message.toLowerCase().includes('timeout'))
  ) {
    return 'Purchase verification is taking longer than expected. Please try again in a moment.';
  }
  const payload = error?.response?.data;
  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload?.detail === 'string' && payload.detail.trim()) {
    return payload.detail;
  }
  if (Array.isArray(payload?.detail) && payload.detail.length > 0) {
    const first = payload.detail[0];
    if (typeof first?.msg === 'string' && first.msg.trim()) {
      return first.msg;
    }
  }
  return error?.message || 'IAP request failed';
};

export const fetchIapBalance = createAsyncThunk(
  'iap/fetchBalance',
  async (_, {rejectWithValue}) => {
    try {
      const response = await api.get('/iap/balance');
      const payload = response?.data?.data ?? response?.data ?? {};
      return Number(payload?.balance ?? 0) || 0;
    } catch (error) {
      return rejectWithValue(parseBackendMessage(error));
    }
  },
);

export const verifyAndCreditPurchase = createAsyncThunk(
  'iap/verifyAndCreditPurchase',
  async (
    {
      platform,
      product_id,
      signed_transaction_info,
      receipt_data,
      transactionReceipt,
      transaction_id,
      purchase_token,
      package_name,
    },
    {rejectWithValue},
  ) => {
    try {
      const payload =
        platform === 'ios'
          ? {
              platform,
              product_id,
              ...(signed_transaction_info ? {signed_transaction_info} : {}),
              ...(receipt_data ? {receipt_data} : {}),
              ...(transactionReceipt ? {transactionReceipt} : {}),
              ...(transaction_id ? {transaction_id} : {}),
            }
          : {
              platform,
              product_id,
              purchase_token,
              package_name,
            };

      const response = await api.post('/iap/verify-and-credit', payload, {
        // Apple/Google verification may take longer than normal API calls.
        timeout: 90000,
      });
      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(parseBackendMessage(error));
    }
  },
);

const iapSlice = createSlice({
  name: 'iap',
  initialState: {
    balance: 0,
    loadingBalance: false,
    verifyingPurchase: false,
    error: null,
  },
  reducers: {
    clearIapError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchIapBalance.pending, state => {
        state.loadingBalance = true;
        state.error = null;
      })
      .addCase(fetchIapBalance.fulfilled, (state, action) => {
        state.loadingBalance = false;
        state.balance = action.payload;
      })
      .addCase(fetchIapBalance.rejected, (state, action) => {
        state.loadingBalance = false;
        state.error = action.payload || 'Unable to fetch balance';
      })
      .addCase(verifyAndCreditPurchase.pending, state => {
        state.verifyingPurchase = true;
        state.error = null;
      })
      .addCase(verifyAndCreditPurchase.fulfilled, state => {
        state.verifyingPurchase = false;
      })
      .addCase(verifyAndCreditPurchase.rejected, (state, action) => {
        state.verifyingPurchase = false;
        state.error = action.payload || 'Unable to verify purchase';
      });
  },
});

export const {clearIapError} = iapSlice.actions;
export default iapSlice.reducer;
