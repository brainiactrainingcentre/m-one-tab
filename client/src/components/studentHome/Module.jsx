import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

const Module = ({ title, subtext, icon ,onPress}) => {

  return (
    <View>
      <TouchableOpacity 
        className="bg-white p-4 rounded-lg shadow-md w-44 items-start m-2"
        onPress={onPress}
      >
        <Image source={icon} className="w-6 h-6" />
        <Text className="text-lg font-bold text-indigo-900 mt-2">{title}</Text>
        {subtext && (
          <Text className="text-xs text-gray-500 font-bold mt-1">{subtext}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Module;