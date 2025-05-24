import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/src/redux/slices/authSlice";

const LayoutDrawer = () => {
  const dispatch = useDispatch();
  const { user = {}, isAuth } = useSelector((state) => state.auth || {});
  
  // Set default values if user is null/undefined
  const userName = user?.name || "Harendra Ranjan";
  const userRole = user?.roles || "Admin";

  return (
    <GestureHandlerRootView className="flex-1">
      <Drawer
        screenOptions={{
          headerShown: true,
          drawerStyle: { width: 280 },
        }}
        drawerContent={({ navigation }) => (
          <ScrollView
            className="flex-1 bg-white"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-grow">
              {/* Profile Section */}
              <View className="p-5 items-center border-b border-gray-100">
                <View className="w-20 h-20 rounded-full bg-gray-100 mb-2.5" />
                <Text className="text-lg font-semibold text-gray-800">{userName}</Text>
                <Text className="text-sm text-gray-500 mt-1">{userRole}</Text>
              </View>

              {/* Menu Items */}
              <View className="p-3">
                <TouchableOpacity className="flex-row items-center py-3 px-4">
                  <Ionicons
                    name="home-outline"
                    size={24}
                    color="#666"
                    className="mr-4 w-6"
                  />
                  <Text>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-3 px-4">
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color="#ff6b6b"
                    className="mr-4 w-6"
                  />
                  <Text>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-3 px-4">
                  <Ionicons
                    name="people-outline"
                    size={24}
                    color="#ff6b6b"
                    className="mr-4 w-6"
                  />
                  <Text>Switch User</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-3 px-4">
                  <Ionicons
                    name="shield-outline"
                    size={24}
                    color="#74c0fc"
                    className="mr-4 w-6"
                  />
                  <Text>2 FA Authentication</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-3 px-4">
                  <Ionicons
                    name="key-outline"
                    size={24}
                    color="#845ef7"
                    className="mr-4 w-6"
                  />
                  <Text>Change Password</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-3 px-4">
                  <Ionicons
                    name="share-social-outline"
                    size={24}
                    color="#666"
                    className="mr-4 w-6"
                  />
                  <Text>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-3 px-4">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={24}
                    color="#ffd43b"
                    className="mr-4 w-6"
                  />
                  <Text>Privacy Policy</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-3 px-4">
                  <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color="#666"
                    className="mr-4 w-6"
                  />
                  <Text>FAQ</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-3 px-4">
                  <Ionicons
                    name="download-outline"
                    size={24}
                    color="#845ef7"
                    className="mr-4 w-6"
                  />
                  <Text>App Update</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center py-3 px-4"
                  onPress={() => {
                    dispatch(logout());
                    // router.replace("/auth/login");
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