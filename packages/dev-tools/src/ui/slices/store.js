import { createSlice } from '@reduxjs/toolkit';

export const storeSlice = createSlice({
  name: 'store',
  initialState: {
    stores: {},
  },
  reducers: {
    updateStore: (state, action) => {
      const { payload: { store } } = action;
      state.stores[store.storeId] = state.stores[store.storeId] || {};
      state.stores[store.storeId][store.schemaType] = store.records;
    },
  },
});

export default storeSlice.reducer;
export const { updateStore } = storeSlice.actions;
