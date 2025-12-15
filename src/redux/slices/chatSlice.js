import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

// Fetch chat history
export const fetchChatHistory = createAsyncThunk(
  'chat/fetchChatHistory',
  async ({user_id, token}, {rejectWithValue}) => {
    try {
      const res = await api.get(`/chatbot/history?user_id=${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      });

      // Convert API response to UI-friendly messages
      const messages = res.data.items.flatMap(item => [
        {
          id: item.id + '_user',
          sender: 'user',
          message: item.message,
          created_at: item.created_at,
        },
        {
          id: item.id + '_bot',
          sender: 'bot',
          message: item.reply,
          created_at: item.created_at,
        },
      ]);

      return messages;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// Send chat message
export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async ({message, user_id, token}, {rejectWithValue}) => {
    try {
      const res = await api.post(
        '/chatbot/message',
        {message, user_id},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        },
      );

      return {
        userMessage: {
          id: Date.now() + '_user',
          sender: 'user',
          message,
          created_at: new Date().toISOString(),
        },
        botMessage: {
          id: Date.now() + '_bot',
          sender: 'bot',
          message: res.data.data.reply,
          created_at: new Date().toISOString(),
        },
      };
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        id: Date.now() + '_user',
        sender: 'user',
        message: action.payload,
        created_at: new Date().toISOString(),
      });
    },
    clearChat: state => {
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch history
      .addCase(fetchChatHistory.pending, state => {
        state.loading = true;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        // Merge old history with existing messages without overwriting
        const existingIds = new Set(state.messages.map(m => m.id));
        const merged = [...state.messages];

        action.payload.forEach(msg => {
          if (!existingIds.has(msg.id)) merged.push(msg);
        });

        state.messages = merged;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch chat history';
      })

      // Send message
      .addCase(sendChatMessage.pending, state => {
        state.loading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.messages.push(action.payload.userMessage);
          state.messages.push(action.payload.botMessage);
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send message';
      });
  },
});

export const {addUserMessage, clearChat} = chatSlice.actions;
export default chatSlice.reducer;
