import { GestureHandlerRootView } from "react-native-gesture-handler";
import React from "react";
import { Stack } from "expo-router";

const AdminModulLayout = () => {
  return (
    <GestureHandlerRootView className="flex-1">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="Attendance" />
        <Stack.Screen name="students" />
        <Stack.Screen name="teacher" />
        <Stack.Screen name="class" />
      </Stack>
    </GestureHandlerRootView>
  );
};

export default AdminModulLayout;
