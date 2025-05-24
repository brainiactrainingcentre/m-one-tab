import { Stack } from "expo-router";

const studentLayout = () => {
  return (
    <Stack >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }}/>
      
    </Stack>
  );
};

export default studentLayout;
