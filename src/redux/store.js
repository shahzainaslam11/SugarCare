import {configureStore} from '@reduxjs/toolkit';
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

const store = configureStore({
  reducer: {
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
  },
});

export default store;
