import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmptyState = ({ message, icon = "alert-circle-outline" }) => {
  return (
    <View className="flex-1 justify-center items-center">
      <Ionicons name={icon} size={64} color="#ccc" />
      <Text className="text-gray-600 text-lg mt-4">{message}</Text>
    </View>
  );
};

export default EmptyState;