import React from "react";
import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import imagePath from "@/src/utils/constants/imagePath";
import MyButton from "../atoms/myButton";

const LearningCard = () => {
  return (
    <View className="mt-4 rounded-xl overflow-hidden w-[98%] h-[269px] self-center shadow-md shadow-black">
      <LinearGradient
        colors={["#4C37EE", "#1A02CF"]}
        className="p-5 w-full h-full"
      >
        <Text className="text-white font-bold text-[32px] w-full mb-2">
          Elevate Your Education with Profound Learning
        </Text>
        <Text className="text-white mb-4 w-[200px]">
          Access your lectures with Convenience
        </Text>

        <MyButton
          title="View →"
          containerStyle="w-[48%] h-[58px] mt-1"
          backgroundColor="bg-[#2ECC71]"
          textStyle="font-bold"
        />

        <Image
          source={imagePath.elevete_icon}
          className="w-[50%] h-[180px] absolute top-[97px] right-[10px]"
        />
      </LinearGradient>
    </View>
  );
};

export default LearningCard;