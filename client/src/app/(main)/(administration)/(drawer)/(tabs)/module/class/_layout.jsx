
import React from 'react';
import { Stack } from 'expo-router';

const ClassLayoutForAdminModule = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
     
    </Stack>
  );
};
 
export default ClassLayoutForAdminModule;