import { View, Text, Image } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import MyButton from "../components/atoms/myButton";
import imagePath from "../utils/constants/imagePath";

const MainPage = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Top Section */}
      <View className="bg-indigo-800 pt-16 pb-10 items-center ">
      <View className="items-center mt-10">
        <Image
          source={imagePath.logo_onetab} 
          style={{ width: 80, height: 80, resizeMode: "contain" }}
        />
      </View>
        <Text className="text-white text-[52px] font-pbold">OneTab</Text>
      </View>

      {/* Image area */}
      <View className="items-center mt-10">
        <Image
          source={imagePath.home_img} 
          style={{ width: 220, height: 220, resizeMode: "contain" }}
        />
      </View>

      {/* Text Section */}
      <View className=" px-2 items-center">
        <Text className="text-xl font-pbold text-indigo-800 text-center">
          Get Started with{"\n"}OneTab ERP
        </Text>
        <Text className="text-center mt-4 text-gray-700">
          View and Manage your{"\n"}School Activity Effortlessly.
        </Text>
      </View>

      {/* Skip button */}
      <View className="absolute bottom-10 w-full px-6">
        <MyButton title="Skip" onPress={() => router.push("/authentication")} />
          <Text className="text-center mt-2 text-gray-700">Powered by iDrewSoftwares.com</Text>
      </View>
    </View>
  );
};

export default MainPage;
