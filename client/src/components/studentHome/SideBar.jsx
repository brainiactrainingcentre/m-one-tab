import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const Sidebar = ({ bgColor, icon, name }) => {
  return (
    <View className="bg-[#F5F5F5]">
      <TouchableOpacity className="flex-row items-center p-5 bg-white rounded-xl shadow-md">
        <View className="w-12 h-12 rounded-md flex items-center justify-center" style={{ backgroundColor: bgColor }}>
          {icon}
        </View>
        <Text className="text-lg font-bold text-[#333] ml-4 flex-1">{name}</Text>
        <Text className="text-lg font-bold text-[#aaa]">{">"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Sidebar;
