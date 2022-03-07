import { createSlice } from '@reduxjs/toolkit';

export const requestSlice = createSlice({
  name: 'request',
  initialState: {
    requests: [],
  },
  reducers: {
    add: (state, action) => {
      const { payload: { request } } = action;
      state = {
        ...state,
        requests: state.requests.push(request),
      };
    },
  },
});

export default requestSlice.reducer;
export const { add } = requestSlice.actions;
