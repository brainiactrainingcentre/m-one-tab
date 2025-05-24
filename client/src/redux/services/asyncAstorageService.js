// redux/services/asyncStorageService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeToken = async (value) => {
  try {
    await AsyncStorage.setItem("token", value);
  } catch (error) {
    console.log(error);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token !== null ? token : null;
  } catch (error) {
    console.log(error);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.log(error);
  }
};

// NEW: Tenant ID storage functions
export const storeTenantId = async (tenantId) => {
  try {
    await AsyncStorage.setItem("tenantId", tenantId);
  } catch (error) {
    console.log("Error storing tenant ID:", error);
  }
};

export const getTenantId = async () => {
  try {
    const tenantId = await AsyncStorage.getItem("tenantId");
    return tenantId !== null ? tenantId : null;
  } catch (error) {
    console.log("Error getting tenant ID:", error);
    return null;
  }
};

export const removeTenantId = async () => {
  try {
    await AsyncStorage.removeItem("tenantId");
  } catch (error) {
    console.log("Error removing tenant ID:", error);
  }
};