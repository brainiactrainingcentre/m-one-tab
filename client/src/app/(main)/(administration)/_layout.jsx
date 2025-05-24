import { Stack } from "expo-router";

const administraionLayout = () => {
  return (
    <Stack >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }}/>
    </Stack>
  );
};

export default administraionLayout;
