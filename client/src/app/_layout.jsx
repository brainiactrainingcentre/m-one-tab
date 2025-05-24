import { SplashScreen, Stack } from "expo-router";
import "../global.css";
import React, { useEffect, useState } from "react";
import StoreProvider from "../redux/StoreProvider";
import { useFonts } from "expo-font";
import { View, Text } from "react-native";

const AuthenticatedContent = () => {
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Artificially delay for 2 seconds to simulate app loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn("Error in prepare:", e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
    }

    if (fontsLoaded && appIsReady) {
      SplashScreen.hideAsync().catch(e => {
        console.warn("Error hiding splash screen:", e);
      });
    }
  }, [fontsLoaded, appIsReady, fontError]);

  if (!fontsLoaded || !appIsReady) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading app...</Text>
      </View>
    );
  }

  if (fontError) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-lg">Failed to load fonts</Text>
        <Text className="text-sm text-gray-700 mt-2">Please restart the app</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="authentication" />
        <Stack.Screen name="Termpolice" />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  useEffect(() => {
    const preventAutoHide = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn("Error preventing splash screen auto hide:", e);
      }
    };
    
    preventAutoHide();
    
    return () => {
      SplashScreen.hideAsync().catch(e => {
        console.warn("Error hiding splash screen on cleanup:", e);
      });
    };
  }, []);

  return (
    <StoreProvider>
      <AuthenticatedContent />
    </StoreProvider>
  );
}