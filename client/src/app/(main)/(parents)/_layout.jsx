import { Stack } from "expo-router";

const parentLayout = () => {
  return (
    <Stack >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }}/>
    </Stack>
  );
};

export default parentLayout;
