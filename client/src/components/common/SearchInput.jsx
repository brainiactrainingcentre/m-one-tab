
// src/components/common/SearchInput.jsx
import React from 'react';
import { TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchInput = ({ value, onChangeText, placeholder = "Search..." }) => {
  return (
    <View className="relative mb-4">
      <TextInput
        className="bg-white p-3 pl-10 rounded-lg border border-gray-300"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
      <View className="absolute top-0 left-0 h-full flex justify-center pl-3">
        <Ionicons name="search" size={20} color="#9ca3af" />
      </View>
    </View>
  );
};

export default SearchInput;