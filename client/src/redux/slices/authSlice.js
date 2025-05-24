// redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  tenantId: null, 
  isAuth: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.token = payload.token;
      state.tenantId = payload.tenantId; 
      state.isAuth = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.tenantId = null; 
      state.isAuth = false;
    },
    updateUserProfile: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
    },
    // NEW: Action to set tenant ID separately
    setTenantId: (state, { payload }) => {
      state.tenantId = payload;
    },
  },
});

export const { setCredentials, logout, updateUserProfile, setTenantId } = authSlice.actions;

export default authSlice.reducer