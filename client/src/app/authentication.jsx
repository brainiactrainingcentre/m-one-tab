import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/src/redux/slices/authSlice';

const Authentication = () => {
  const { isAuth, user } = useSelector((state) => state.auth);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check if there's a token in AsyncStorage
        const token = await AsyncStorage.getItem('token');
        
        // If there's a token in AsyncStorage but isAuth is false, restore the session
        if (token && !isAuth) {
          try {
            // Get user data if available
            const userData = await AsyncStorage.getItem('userData');
            const user = userData ? JSON.parse(userData) : null;
            
            if (user) {
              // Restore the session
              dispatch(setCredentials({ user, token }));
            }
          } catch (err) {
            console.log("Error restoring session:", err);
          }
        }
        
        // Mark as checked after a short delay to ensure state updates have processed
        setTimeout(() => setChecked(true), 500);
      } catch (err) {
        console.error("Authentication check error:", err);
        setError(err.message);
        setChecked(true);
      }
    };

    checkAuthState();
  }, [dispatch, isAuth]);

  if (!checked) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2">Checking authentication...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-lg">Authentication Error</Text>
        <Text className="text-sm text-gray-700 mt-2">{error}</Text>
      </View>
    );
  }

  return <Redirect href={isAuth ? '/(main)' : '/(auth)'} />;
};

export default Authentication;