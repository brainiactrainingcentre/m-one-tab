import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ErrorState = ({ message = "An error occurred", onRetry }) => {
  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-base text-red-600 mb-4">{message}</Text>
      {onRetry && (
        <TouchableOpacity 
          className="bg-blue-500 py-2 px-4 rounded"
          onPress={onRetry}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorState;