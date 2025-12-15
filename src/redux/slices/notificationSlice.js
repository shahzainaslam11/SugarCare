// slices/notificationSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

// Fetch Notifications
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

// Mark Single Notification Read
export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async ({notification_id, user_id, token}, {rejectWithValue}) => {
    try {
      const res = await api.patch(
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

// Mark All Notifications Read
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
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNotificationError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Notifications
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

      // Mark Single Notification as Read
      .addCase(markNotificationRead.pending, state => {
        state.loading = true;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map(n =>
          n.id === action.payload.notification_id ? {...n, is_read: true} : n,
        );
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to mark notification as read';
      })

      // Mark All Notifications Read
      .addCase(markAllNotificationsRead.pending, state => {
        state.loading = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, state => {
        state.loading = false;
        state.items = state.items.map(n => ({
          ...n,
          is_read: true,
        }));
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to mark all notifications read';
      });
  },
});

export const {clearNotificationError} = notificationSlice.actions;
export default notificationSlice.reducer;
