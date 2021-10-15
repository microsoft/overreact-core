import { createSlice } from '@reduxjs/toolkit';

export const schemaSlice = createSlice({
  name: 'schema',
  initialState: {
    schema: {},
  },
  reducers: {
    update: (state, action) => {
      const { payload: { schema } } = action;

      state.schema = schema;
    },
  },
});

export default schemaSlice.reducer;
export const { update } = schemaSlice.actions;
