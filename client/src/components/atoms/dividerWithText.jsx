import React from 'react';
import { Text, View } from 'react-native';

const DividerWithText = () => {
  return (
    <View className="relative flex-row items-center my-4">
      {/* Left Line */}
      <View className="flex-1 h-[1px] bg-gray-300"></View>
      {/* Text */}
      <Text className="px-4 text-black">or</Text>
      {/* Right Line */}
      <View className="flex-1 h-[1px] bg-gray-300"></View>
    </View>
  );
};

export default DividerWithText;
