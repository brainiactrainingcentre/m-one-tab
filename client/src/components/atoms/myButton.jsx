import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

const MyButton = ({
  title,
  icon,
  onPress,
  containerStyle = "",
  textStyle = "",
  isLoding,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        className={`bg-primary h-14 flex-row items-center justify-center gap-4 rounded-full px-6 py-1 ${containerStyle} ${
          icon ? "h-14 px-4 py-1" : ""
        }`}
      >
        {icon && <Image source={icon} />}
        <Text className={`text-[20px] text-white ${textStyle}`}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MyButton;
