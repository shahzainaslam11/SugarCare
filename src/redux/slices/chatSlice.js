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

      // Convert API response to UI-friendly messages (guard API shape, dedupe by content)
      const items = res.data?.items ?? res.data?.data?.items ?? [];
      const rawMessages = Array.isArray(items)
        ? items.flatMap(item => [
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
      ])
        : [];

      // Dedupe: same sender + message content (API may return duplicates)
      const seen = new Set();
      const messages = rawMessages.filter(m => {
        const key = `${m.sender}|${m.message}|${m.created_at}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

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

      // Return only bot message - user message is added optimistically via addUserMessage
      const reply = res.data?.data?.reply ?? res.data?.reply ?? '';
      return {
        botMessage: {
          id: Date.now() + '_bot',
          sender: 'bot',
          message: reply,
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
      const messageId =
        Date.now() + '_user_' + Math.random().toString(36).substr(2, 9);
      state.messages.push({
        id: messageId,
        sender: 'user',
        message: action.payload,
        created_at: new Date().toISOString(),
        isOptimistic: true, // Mark as optimistic for potential removal on error
      });
    },
    removeOptimisticMessage: (state, action) => {
      // Remove optimistic message by ID if API call fails
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
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
        const apiMessages = action.payload ?? [];
        // Merge: API may not have latest yet, so keep local messages and add API
        // Dedupe by sender+message to avoid showing same exchange twice
        const combined = [...state.messages];
        apiMessages.forEach(apiMsg => {
          const exists = combined.some(
            m =>
              m.sender === apiMsg.sender &&
              (m.message || '') === (apiMsg.message || ''),
          );
          if (!exists) combined.push(apiMsg);
        });
        // Sort by created_at to keep order
        combined.sort(
          (a, b) =>
            new Date(a.created_at || 0) - new Date(b.created_at || 0),
        );
        state.messages = combined;
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
        if (action.payload?.botMessage) {
          // Only add bot message - user message was already added optimistically via addUserMessage
          // Check if bot message doesn't already exist to prevent duplicates
          const botMessageExists = state.messages.some(
            msg => msg.id === action.payload.botMessage.id,
          );
          if (!botMessageExists) {
            state.messages.push(action.payload.botMessage);
          }
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send message';
        // Remove the most recent optimistic user message if API call failed
        // Find the last optimistic message and remove it
        for (let i = state.messages.length - 1; i >= 0; i--) {
          if (
            state.messages[i].sender === 'user' &&
            state.messages[i].isOptimistic
          ) {
            state.messages.splice(i, 1);
            break;
          }
        }
      });
  },
});

export const {addUserMessage, clearChat, removeOptimisticMessage} =
  chatSlice.actions;
export default chatSlice.reducer;
