import React from "react";
import { View, Text, Image } from "react-native";
import imagePath from "@/src/utils/constants/imagePath";

const Certificate = () => {
  return (
    <View className="bg-[#F4F5FA] rounded-2xl p-5 shadow-md shadow-black mt-5 mx-auto w-[95%] mb-3 flex-row">
      <View>
        <Text className="text-[#0D0169] text-[25px] font-bold w-[170px] mb-2 ml-2">
          Certificate Hub
        </Text>
        <Text className="text-[#0D0169] text-[15px] w-[186px] ml-2">
          Request and Download your Achievement
        </Text>
      </View>
      <Image source={imagePath.image3} className="w-[184px] h-[137px]" />
    </View>
  );
};

export default Certificate;
