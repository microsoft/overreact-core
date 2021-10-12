import { configureStore } from '@reduxjs/toolkit';
import requestReducer from './slices/requests';

export default configureStore({
  reducer: {
    request: requestReducer,
  },
});
