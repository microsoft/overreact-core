import { configureStore } from '@reduxjs/toolkit';
import requestReducer from './slices/requests';
import storeReducer from './slices/store';

export default configureStore({
  reducer: {
    request: requestReducer,
    store: storeReducer,
  },
});
