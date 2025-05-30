import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUserProfile } from "@/src/redux/slices/authSlice";
import { pickImage, prepareImageUpload } from "@/src/utils/imageUploadUtils";
import { useUpdateProfileImageMutation } from "@/src/redux/services/auth";
import { useRouter } from "expo-router";

const LayoutDrawer = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user = {}, isAuth } = useSelector((state) => state.auth || {});
  const [updateProfileImage, { isLoading: uploading }] = useUpdateProfileImageMutation();
  
  const userName = user?.name || "Guest";
  const userRole = user?.roles || "student";
  const userAvatar = user?.avatar || "";

  const handleProfileImageUpdate = async () => {
    if (!isAuth) {
      Alert.alert("Login Required", "Please log in to update your profile picture.");
      return;
    }
    
    const imageAsset = await pickImage();
    if (imageAsset) {
      uploadImage(imageAsset.uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const formData = prepareImageUpload(uri);
      console.log("Uploading image...");
  
      const response = await updateProfileImage(formData).unwrap();
  
      if (response.status === "success") {
        dispatch(updateUserProfile(response.user));
        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = error?.data?.message || "Failed to upload image. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <Drawer
        screenOptions={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: "#0D0169" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
          drawerStyle: { width: 280 },
        }}
        drawerContent={() => (
          <ScrollView
            className="flex-1 bg-white"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-grow">
              {/* Profile Section */}
              <View className="p-5 items-center border-b border-gray-100">
                <TouchableOpacity 
                  className="relative"
                  onPress={handleProfileImageUpdate}
                  disabled={uploading}
                >
                  {userAvatar ? (
                    <Image 
                      source={{ uri: userAvatar }} 
                      className="w-20 h-20 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center">
                      <Text className="text-3xl text-gray-400">
                        {userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  
                  {/* Camera icon overlay */}
                  <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                  
                  {/* Loading indicator */}
                  {uploading && (
                    <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 rounded-full items-center justify-center">
                      <Text className="text-white font-bold">Uploading...</Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                <Text className="text-lg font-semibold text-gray-800 mt-2.5">{userName}</Text>
                <Text className="text-sm text-gray-500 mt-1">{userRole}</Text>
              </View>

              {/* Menu Items */}
              <View className="p-3">
                <TouchableOpacity 
                  className="flex-row items-center py-3 px-4"
                  onPress={() => router.push("/")}
                >
                  <Ionicons
                    name="home-outline"
                    size={24}
                    color="#666"
                    className="mr-4 w-6"
                  />
                  <Text>Home</Text>
                </TouchableOpacity>

                {/* Add more navigation items as needed... */}

                {isAuth ? (
                  <TouchableOpacity
                    className="flex-row items-center py-3 px-4"
                    onPress={() => {
                      dispatch(logout());
                      router.push("/(auth)/login");
                    }}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={24}
                      color="#ff6b6b"
                      className="mr-4 w-6"
                    />
                    <Text>Log Out</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="flex-row items-center py-3 px-4"
                    onPress={() => router.push("/(auth)/login")}
                  >
                    <Ionicons
                      name="log-in-outline"
                      size={24}
                      color="#4BB543"
                      className="mr-4 w-6"
                    />
                    <Text>Log In</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        )}
      >
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default LayoutDrawer;
