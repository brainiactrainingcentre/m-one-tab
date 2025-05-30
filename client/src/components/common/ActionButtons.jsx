import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ActionButtons = ({ 
  onView, 
  onEdit, 
  onDelete, 
  viewText = "View",
  editText = "Edit",
  deleteText = "Delete",
  showIconsOnly = false,
  isDeleting = false
}) => {
  return (
    <View className="flex-row justify-end border-t border-gray-200 p-2">
      {onView && (
        <TouchableOpacity 
          className="bg-blue-500 py-1.5 px-3 rounded mr-2 flex-row items-center"
          onPress={onView}
        >
          <Ionicons name="eye" size={16} color="white" />
          {!showIconsOnly && <Text className="text-white font-medium text-xs ml-1">{viewText}</Text>}
        </TouchableOpacity>
      )}
      
      {onEdit && (
        <TouchableOpacity 
          className="bg-green-500 py-1.5 px-3 rounded mr-2 flex-row items-center"
          onPress={onEdit}
        >
          <Ionicons name="pencil" size={16} color="white" />
          {!showIconsOnly && <Text className="text-white font-medium text-xs ml-1">{editText}</Text>}
        </TouchableOpacity>
      )}
      
      {onDelete && (
        <TouchableOpacity 
          className="bg-red-500 py-1.5 px-3 rounded flex-row items-center"
          onPress={onDelete}
          disabled={isDeleting}
        >
          <Ionicons name="trash" size={16} color="white" />
          {!showIconsOnly && <Text className="text-white font-medium text-xs ml-1">{deleteText}</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ActionButtons;