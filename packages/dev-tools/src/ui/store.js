import { configureStore } from '@reduxjs/toolkit';
import requestReducer from './slices/requests';
import storeReducer from './slices/store';
import schemaReducer from './slices/schema';

export default configureStore({
  reducer: {
    request: requestReducer,
    store: storeReducer,
    schema: schemaReducer,
  },
});
