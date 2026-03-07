// redux/slices/notificationSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

// =======================
// Register FCM device token (for push notifications)
// =======================
export const registerDeviceToken = createAsyncThunk(
  'notifications/registerDeviceToken',
  async ({fcm_token}, {rejectWithValue, getState}) => {
    try {
      const token = getState().auth?.accessToken;
      if (!token) {
        return rejectWithValue({message: 'Not authenticated'});
      }
      const res = await api.post(
        '/notifications/device_token',
        {fcm_token},
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
      return rejectWithValue(err.response?.data);
    }
  },
);

// =======================
// Fetch Notifications
// =======================
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({user_id, token, type_filter = 'all'}, {rejectWithValue}) => {
    try {
      const res = await api.get(
        `/notifications/?user_id=${user_id}&type_filter=${type_filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// =======================
// Mark Single Notification Read
// =======================
export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async ({notification_id, user_id, token}, {rejectWithValue}) => {
    try {
      await api.patch(
        `/notifications/${notification_id}/read?user_id=${user_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );
      return {notification_id};
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// =======================
// Mark All Notifications Read
// =======================
export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async ({user_id, token}, {rejectWithValue}) => {
    try {
      await api.patch(
        `/notifications/read-all?user_id=${user_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: {}, // { Today: [], Yesterday: [], ... }
    loading: false, // only for fetch
    markLoading: false, // only for mark read
    error: null,
  },
  reducers: {
    clearNotificationError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // =======================
      // Fetch Notifications
      // =======================
      .addCase(fetchNotifications.pending, state => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.data?.notifications || {};
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to fetch notifications';
      })

      // =======================
      // Mark Single Read
      // =======================
      .addCase(markNotificationRead.pending, state => {
        state.markLoading = true;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.markLoading = false;
        const id = action.payload.notification_id;

        Object.keys(state.items || {}).forEach(section => {
          state.items[section] = state.items[section].map(n =>
            n.id === id ? {...n, is_read: true} : n,
          );
        });
        
        // Update unread count
        if (state.items?.unread_count && state.items.unread_count > 0) {
          state.items.unread_count = state.items.unread_count - 1;
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.markLoading = false;
        state.error =
          action.payload?.message || 'Failed to mark notification as read';
      })

      // =======================
      // Mark All Read
      // =======================
      .addCase(markAllNotificationsRead.pending, state => {
        state.markLoading = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, state => {
        state.markLoading = false;
        Object.keys(state.items || {}).forEach(section => {
          state.items[section] = state.items[section].map(n => ({
            ...n,
            is_read: true,
          }));
        });
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.markLoading = false;
        state.error =
          action.payload?.message || 'Failed to mark all notifications read';
      });
  },
});

export const {clearNotificationError} = notificationSlice.actions;
export default notificationSlice.reducer;
