import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ListHeader = ({ title, onAddPress, addButtonText, icon = "add" }) => {
  return (
    <View className="flex-row justify-between items-center mb-4 p-4 bg-white border-b border-gray-200">
      <Text className="text-xl font-bold">{title}</Text>
      <TouchableOpacity 
        className="flex-row items-center bg-blue-500 px-4 py-2 rounded"
        onPress={onAddPress}
      >
        <Ionicons name={icon} size={24} color="white" />
        <Text className="text-white font-semibold ml-2">{addButtonText || `Add ${title}`}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListHeader;