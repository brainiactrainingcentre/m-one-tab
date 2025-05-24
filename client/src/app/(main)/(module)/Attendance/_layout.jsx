import React from "react";
import { Stack } from "expo-router";

const AttandanceLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="student-attendance/index" />
      <Stack.Screen name="period-attendance/index" />
      <Stack.Screen name="report/index" />
      <Stack.Screen name="attendance-summary" />
      <Stack.Screen name="calendar" />
    </Stack>
  );
};

export default AttandanceLayout;
