import React from 'react';
import { Stack } from 'expo-router';

const AdminModuleTeacherLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="edit/[id]" />
      <Stack.Screen name="subjects/[id]" />
      <Stack.Screen name="classes/[id]" />
    </Stack>
  );
};

export default AdminModuleTeacherLayout;