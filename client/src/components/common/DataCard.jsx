import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ActionButtons from './ActionButtons';

const DataCard = ({ 
  item, 
  onPress,
  onView,
  onEdit,
  onDelete,
  isDeleting,
  renderContent,
  showActionButtons = true
}) => {
  return (
    <View className="bg-white rounded-lg mb-4 shadow">
      <TouchableOpacity 
        className="p-4"
        onPress={onPress || (onView && onView)}
        disabled={!onPress && !onView}
      >
        {renderContent && renderContent(item)}
      </TouchableOpacity>
      
      {showActionButtons && (
        <ActionButtons 
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      )}
    </View>
  );
};

export default DataCard;