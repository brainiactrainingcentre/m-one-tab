import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AttendanceStatusBadge = ({ status, size = 'medium', style }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'present':
        return '#4CAF50'; 
      case 'absent':
        return '#F44336'; 
      case 'late':
        return '#FF9800'; 
      case 'halfday':
      case 'halfDay':
        return '#2196F3'; 
      case 'leave':
        return '#9C27B0'; 
      default:
        return '#9E9E9E'; 
    }
  };

  // Get badge size
  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 2,
          paddingHorizontal: 6,
          fontSize: 10,
          borderRadius: 4,
        };
      case 'large':
        return {
          paddingVertical: 6,
          paddingHorizontal: 14,
          fontSize: 16,
          borderRadius: 8,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 4,
          paddingHorizontal: 10,
          fontSize: 14,
          borderRadius: 6,
        };
    }
  };

  const sizeStyles = getBadgeSize();
  const statusColor = getStatusColor();
  const displayText = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

  return (
    <View 
      style={[
        styles.badge, 
        { backgroundColor: statusColor },
        { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal, borderRadius: sizeStyles.borderRadius },
        style
      ]}
    >
      <Text style={[styles.text, { fontSize: sizeStyles.fontSize }]}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AttendanceStatusBadge;