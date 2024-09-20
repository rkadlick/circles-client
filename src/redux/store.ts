import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import circleReducer from '../features/circleSlice'
import postReducer from '../features/postSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    circle: circleReducer,
    post: postReducer,
  },
});

// Define RootState and AppDispatch for usage in your components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;