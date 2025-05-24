import React from 'react';
import { Stack } from 'expo-router';

const AdminModulLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="AttendanceModule" />
      <Stack.Screen name="students" />
      <Stack.Screen name="teacher" />
      <Stack.Screen name="class" />
    </Stack>
  );
};

export default AdminModulLayout;