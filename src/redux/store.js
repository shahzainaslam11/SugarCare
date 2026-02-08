import {configureStore} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from 'redux';

// Import all reducers
import authReducer from './slices/authSlice';
import homeReducer from './slices/homeSlice';
import sugarForecastReducer from './slices/sugarForecastSlice';
import fastingReducer from './slices/fastingSlice';
import hba1cReducer from './slices/hba1cSlice';
import profileReducer from './slices/profileSlice';
import chatReducer from './slices/chatSlice';
import foodReducer from './slices/foodRecognitionSlice';
import notificationReducer from './slices/notificationSlice';
import reportReducer from './slices/reportSlice';
import mealRecommendationsReducer from './slices/mealRecommendationsSlice';
import communityInsightsReducer from './slices/communityInsightsSlice';
import sugarAlertReducer from './slices/sugarAlertSlice';
import riskForecastReducer from './slices/riskForecastSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
  // Optional: blacklist reducers you don't want to persist
  // blacklist: ['home', 'sugarForecast', 'chat', 'food'],
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  home: homeReducer,
  sugarForecast: sugarForecastReducer,
  fasting: fastingReducer,
  hba1c: hba1cReducer,
  profile: profileReducer,
  chat: chatReducer,
  food: foodReducer,
  notifications: notificationReducer,
  report: reportReducer,
  meals: mealRecommendationsReducer,
  communityInsights: communityInsightsReducer,
  sugarAlert: sugarAlertReducer,
  riskForecast: riskForecastReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

export default store;
