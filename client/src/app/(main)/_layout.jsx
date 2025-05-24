import { View, Text, ActivityIndicator, BackHandler } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { bootstrapAuth } from "@/src/redux/thunks/authThunks";
import { useRouter } from "expo-router";

const MainLayout = () => {
  const router = useRouter();
  const { user, isAuth } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [loadRetries, setLoadRetries] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);
  const dispatch = useDispatch();

  // Run only once and track if bootstrap has been dispatched
  useEffect(() => {
    console.log("Initial setup...");
    // Use a ref or state to ensure bootstrapAuth is only called once
    dispatch(bootstrapAuth());
  }, [dispatch]); // Add dispatch to dependencies

  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener("hardwareBackPress", () =>
  //     isAuth ? true : false
  //   );
  //   return () => backHandler.remove();
  // }, [isAuth]);

  useEffect(() => {
  const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
    if (!isAuth) return false; // Let system handle it (e.g. exit app)

    if (router.canGoBack()) {
      router.back();
      return true; // We handled it
    }

    return false; // No back stack, allow app exit
  });

  return () => backHandler.remove();
}, [isAuth]);


  // Retry logic for user role
  useEffect(() => {
    if (user?.roles) {
      setLoading(false);
    } else if (loadRetries < 3) {
      const timer = setTimeout(() => {
        setLoadRetries((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [user, loadRetries]);

  // Navigation based on role - use a clean dependency check to prevent loops
  useEffect(() => {
    // Only run if we have a user with roles, are authenticated, and haven't navigated yet
    if (!isAuth || !user?.roles || hasNavigated) return;

    const role = user.roles;
    console.log("User role found:", role);
    console.log("Navigating based on role:", role);

    // Mark as navigated BEFORE navigation
    setHasNavigated(true);

    // Use a timeout to ensure state updates complete before navigation
    setTimeout(() => {
      switch (role) {
        case "student":
          router.replace("/(students)");
          break;
        case "teacher":
          router.replace("/(teachers)");
          break;
        case "parent":
          router.replace("/(parents)");
          break;
        case "module":
          router.replace("/(administration)");
          break;
        case "admin":
          router.replace("/(module)");
          break;
        default:
          router.replace("/(auth)");
      }
    }, 0);
  }, [user, isAuth, hasNavigated]);

  // Handle unauthenticated users with a separate useEffect
  useEffect(() => {
    if (!isAuth && !loading && !hasNavigated) {
      setHasNavigated(true);
      router.replace("/(auth)");
    }
  }, [isAuth, loading, hasNavigated]);

  // Just render the loading state or stack, don't navigate in the render section
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-center">
          {loadRetries > 0
            ? `Setting up your dashboard... (${loadRetries}/3)`
            : "Loading..."}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
};

export default MainLayout;