import { createSlice } from '@reduxjs/toolkit';
import initialState from '../initialState';

export const authSlice = createSlice({
  initialState: initialState.auth,
  name: 'auth',
  reducers: {
    setSignedIn: (state, action) => {
      state.isSignedIn = action.payload;
      state.isLoading = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setDetail: (state, action) => {
      state.userDetail = action.payload;
    },
  },
});

export const { setSignedIn, setUser, setDetail } = authSlice.actions;

export default authSlice.reducer;
