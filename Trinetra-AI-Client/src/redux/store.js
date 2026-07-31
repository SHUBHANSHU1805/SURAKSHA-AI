import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import firReducer from './slices/firSlice';
import mapReducer from './slices/mapSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    fir: firReducer,
    map: mapReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Firebase Timestamp objects
        ignoredActions: ['fir/fetchFIRs/fulfilled', 'fir/submitFIR/fulfilled'],
        ignoredPaths: ['fir.firs', 'fir.selectedFIR']
      }
    })
});

export default store;