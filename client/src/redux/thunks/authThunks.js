// redux/thunks/authThunks.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCredentials, logout, updateUserProfile } from "../slices/authSlice";
import { storeTenantId, removeTenantId } from "../services/asyncAstorageService"; 

export const loginAndPersist = (payload) => async (dispatch) => {
  try {
    await AsyncStorage.setItem("token", payload.token);
    await AsyncStorage.setItem("userData", JSON.stringify(payload.user));
    
    // NEW: Store tenant ID if available
    if (payload.tenantId) {
      await storeTenantId(payload.tenantId);
    }
    
    dispatch(setCredentials(payload));
  } catch (error) {
    console.error("Login persistence error:", error);
  }
};

export const logoutAndClear = () => async (dispatch) => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userData");
    await removeTenantId(); // NEW: Remove tenant ID on logout
    dispatch(logout());
  } catch (error) {
    console.error("Logout cleanup error:", error);
  }
};

export const updateProfileAndPersist = (updatedUser) => async (dispatch, getState) => {
  try {
    dispatch(updateUserProfile(updatedUser));
    const { user } = getState().auth;
    await AsyncStorage.setItem("userData", JSON.stringify(user));
  } catch (error) {
    console.error("Profile update error:", error);
  }
};

export const bootstrapAuth = () => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const userDataString = await AsyncStorage.getItem("userData");
    const tenantId = await AsyncStorage.getItem("tenantId"); // NEW: Get tenant ID
    
    if (token && userDataString) {
      const user = JSON.parse(userDataString);
      dispatch(setCredentials({ 
        token, 
        user, 
        tenantId // NEW: Include tenant ID in credentials
      }));
    }
  } catch (error) {
    console.error("Bootstrap error:", error);
  }
};