import React from "react";
import { View, Text, Image } from "react-native";
const SummaryCard = ({ label, count, color, icon }) => {
  return (
    <View
      className={`flex-row items-center  p-4 rounded-lg shadow-sm space-x-2 w-[38%] mb-2`}
      style={{ backgroundColor: color }}
    >
      <View className="w-16 h-16 bg-[#D9D9D9] rounded-full flex items-center justify-center">
        <Image source={icon} className="h-12 w-12" />
      </View>
      <View className="">
        <Text className="text-sm font-semibold">{label}</Text>
        <Text className="text-sm font-bold">{count} Days</Text>
      </View>
    </View>
  );
};
export default SummaryCard;
