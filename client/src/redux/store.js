//src/redux/store.js
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { schoolApi } from './services/auth'
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    [schoolApi.reducerPath]: schoolApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(schoolApi.middleware),
})

setupListeners(store.dispatch)