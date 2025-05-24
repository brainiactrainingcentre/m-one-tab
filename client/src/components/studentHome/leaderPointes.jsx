import React from "react";
import { View, Text, Image } from "react-native";
import imagePath from "@/src/utils/constants/imagePath";

const LeaderPointes = ({ Pointe }) => {
  return (
    <View className="bg-[#0D0169] p-4 rounded-lg m-2 mr-auto items-center shadow-md shadow-black mt-2 w-[96%] h-[89px] flex-row">
      <Text className="text-[25px] text-white mt-2">My Leader Points</Text>
      <View className="flex-col ml-2">
        <Image source={imagePath.icon11} className="w-[31px] h-[40px] ml-2" />
        <Text className="text-black font-bold text-[14px] w-[49px] h-[22px] text-center bg-[#F7C948] rounded-full mt-1">
          {Pointe}
        </Text>
      </View>
    </View>
  );
};

export default LeaderPointes;
