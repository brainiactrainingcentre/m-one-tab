import { Stack } from "expo-router";
import { useSelector, useDispatch } from "react-redux";

const authLayout = () => {
  return (
    <Stack screenOptions={{ headerShown:false}}>
      {/* <Stack.Screen name="index" options={{ headerShown: false }}/> */}
      <Stack.Screen name="login" />
      <Stack.Screen name="signup"/>
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
};

export default authLayout;