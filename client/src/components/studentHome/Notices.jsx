import React from "react";
import { View, Text } from "react-native";
import imagePath from "@/src/utils/constants/imagePath";
import MyButton from "../atoms/myButton";

const Notices = () => {
  return (
    <View className="bg-[#F4F5FA] rounded-2xl p-5 items-center shadow-md w-[95%] h-36 mx-auto mt-5 mb-4">
      <Text className="text-[#0D0169] text-lg font-bold text-left w-72 mb-3">
        Invitation & Guidelines for students: 14th Anniversary
      </Text>
      <MyButton
        label="19th Jun, 2025 | 10:30 AM"
        icon={imagePath.icon12}
        containerStyle="w-52 h-8"
        backgroundColor="bg-[#0D0169]"
        textStyle="text-xs"
      />
    </View>
  );
};

export default Notices;
