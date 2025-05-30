import React from "react";
import { View, Text } from "react-native";
import imagePath from "@/src/utils/constants/imagePath";
import MyButton from "../atoms/myButton";

const Events = ({ date, title }) => {
  return (
    <View className="bg-white rounded-2xl p-5 items-center shadow-md shadow-black mt-5 ml-2 w-[250px] mb-3">
      <View className="bg-[#D9D9D9] rounded-lg w-[178px] h-[109.56px] justify-center" />

      <Text className="text-black text-[16px] font-bold w-[170px] mb-2 text-left">
        {title}
      </Text>

      <MyButton
        title={date}
        icon={imagePath.icon12}
        containerStyle="w-[144px] h-[31.45px]"
        backgroundColor="#0D0169"
        textStyle="text-[12px]"
      />
    </View>
  );
};

export default Events;
