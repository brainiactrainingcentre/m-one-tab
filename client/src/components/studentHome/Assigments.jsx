import React from "react";
import { View, Text } from "react-native";

const Assignments = ({ title, num }) => {
  return (
    <View className="bg-[#F4F5FA] p-3 rounded-lg shadow-md shadow-black m-1 items-start">
      <Text className="text-[35px] font-bold text-black text-left">{title}</Text>

      <Text className="bg-[#0D0169] text-white text-[25px] rounded-full w-21 text-center ml-24 py-1 px-6">
        {num}
      </Text>
    </View>
  );
};

export default Assignments;
