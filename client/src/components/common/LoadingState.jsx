import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#1976D2" />
      <Text className="mt-3 text-base">{message}</Text>
    </View>
  );
};

export default LoadingState;