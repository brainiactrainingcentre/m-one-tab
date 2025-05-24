import { Stack } from "expo-router";

const teacherLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(teacherDrawer)" />
    </Stack>
  );
};

export default teacherLayout;
