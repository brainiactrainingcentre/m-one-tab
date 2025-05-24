import React from "react";
import { View, Text, Image } from "react-native";
import imagePath from "@/src/utils/constants/imagePath";

const Header = () => {
  return (
    <View className="flex-row ml-10 items-center mb-2">
      <Image source={imagePath.icon9} className="w-12 h-12" />
      <Text className="mt-6 text-[18px] font-pbold ml-5">
      Krishnakala Kids Academy
      </Text>
    </View>
  );
};

export default Header;
