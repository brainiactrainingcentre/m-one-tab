import React from "react";
import { View, Text, Image } from "react-native";
import MyButton from "../atoms/myButton";

const LearningCard = ({ title, num, icon }) => {
  return (
    <View className="mt-4 ml-2 bg-[#F4F5FA] rounded-xl p-4 w-[350px] h-[152px] shadow-md relative">
      <View className="flex flex-col">
        <Text className="text-lg font-bold text-black w-[80%] mb-4">{num}</Text>
        <MyButton
          title={title}
          containerStyle="w-[56%] h-14"
          backgroundColor="bg-[#2ECC71]"
          textStyle="font-bold"
          onPress={() => console.log("Button Pressed")} 
        />
      </View>
      {icon && <Image source={icon} className="w-[104px] h-[104px] absolute right-5 top-5" />}
    </View>
  );
};

export default LearningCard;
