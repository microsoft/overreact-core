import { createSlice } from '@reduxjs/toolkit';

export const dataRefSlice = createSlice({
  name: 'dataRef',
  initialState: {
    dataRefs: {},
  },
  reducers: {
    updateDataRef: (state, action) => {
      const { payload: { dataRef } } = action;
      state.dataRefs[dataRef.key] = {
        components: dataRef.components,
        idRefs: dataRef.idRefs,
      };
      state.dataRefs.fake_data_ref_1 = {
        components: ['fake_component_1', 'fake_component_2'],
        idRefs: ['fake_data_ref_1', 'fake_data_ref_2'],
      };
    },
  },
});

export default dataRefSlice.reducer;
export const { updateDataRef } = dataRefSlice.actions;
