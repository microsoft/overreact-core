import { configureStore } from '@reduxjs/toolkit';
import requestReducer from './slices/requests';
import storeReducer from './slices/store';
import dataRefReducer from './slices/data-ref';

export default configureStore({
  reducer: {
    request: requestReducer,
    store: storeReducer,
    dataRef: dataRefReducer,
  },
});
