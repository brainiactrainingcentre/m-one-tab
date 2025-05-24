
import React from 'react';
import { Stack } from 'expo-router';

const StudentsLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="create" />
      <Stack.Screen name="ParentForm" />
    </Stack>
  );
};
 
export default StudentsLayout;