import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const PeriodAttendanceSummary = () => {
  const params = useLocalSearchParams();
  const summary = params.summary ? JSON.parse(params.summary) : null;
  const created = parseInt(params.created) || 0;
  const updated = parseInt(params.updated) || 0;

  const getStatusColor = (status) => {
    const statusColors = {
      present: '#4CAF50',
      absent: '#F44336',
      late: '#FF9800',
    };
    return statusColors[status] || '#9E9E9E';
  };

  const calculateAttendancePercentage = () => {
    if (!summary) return 0;
    const total = summary.total || 0;
    if (total === 0) return 0;
    return Math.round((summary.present / total) * 100);
  };

  const getAttendanceRating = (percentage) => {
    if (percentage >= 90) return { text: 'Excellent', color: '#4CAF50' };
    if (percentage >= 80) return { text: 'Good', color: '#8BC34A' };
    if (percentage >= 70) return { text: 'Average', color: '#FFC107' };
    if (percentage >= 60) return { text: 'Fair', color: '#FF9800' };
    return { text: 'Poor', color: '#F44336' };
  };

  const attendancePercentage = calculateAttendancePercentage();
  const attendanceRating = getAttendanceRating(attendancePercentage);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen
        options={{
          headerTitle: 'Period Attendance Summary',
          headerTitleStyle: { fontWeight: 'bold' },
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="#0369a1" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 px-4 py-6">
        <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center border-4 border-blue-100">
              <Text className="text-blue-700 font-bold text-3xl">{attendancePercentage}%</Text>
            </View>
            <Text className="mt-2 text-xl font-bold" style={{ color: attendanceRating.color }}>
              {attendanceRating.text}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">Period Attendance Rate</Text>
          </View>

          {/* Period-specific attendance summary */}
          <View className="flex-row flex-wrap justify-between">
            <View className="bg-green-50 rounded-xl p-4 w-full mb-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                </View>
                <View>
                  <Text className="text-base font-bold text-gray-800">Present</Text>
                  <Text className="text-xs text-gray-500">Students marked present</Text>
                </View>
                <View className="ml-auto">
                  <Text className="text-2xl font-bold text-green-600">{summary?.present || 0}</Text>
                </View>
              </View>
            </View>

            <View className="bg-red-50 rounded-xl p-4 w-full mb-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
                  <Ionicons name="close-circle" size={18} color="#F44336" />
                </View>
                <View>
                  <Text className="text-base font-bold text-gray-800">Absent</Text>
                  <Text className="text-xs text-gray-500">Students marked absent</Text>
                </View>
                <View className="ml-auto">
                  <Text className="text-2xl font-bold text-red-600">{summary?.absent || 0}</Text>
                </View>
              </View>
            </View>

            <View className="bg-orange-50 rounded-xl p-4 w-full mb-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                  <Ionicons name="time" size={18} color="#FF9800" />
                </View>
                <View>
                  <Text className="text-base font-bold text-gray-800">Late</Text>
                  <Text className="text-xs text-gray-500">Students marked late</Text>
                </View>
                <View className="ml-auto">
                  <Text className="text-2xl font-bold text-orange-600">{summary?.late || 0}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-4 pt-4 border-t border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 text-xs">Total Students</Text>
              <Text className="text-gray-800 font-semibold">{summary?.total || 0}</Text>
            </View>
            
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-600 text-xs">Created</Text>
              <Text className="text-gray-800 text-xs">
                {created ? new Date(created).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-600 text-xs">Last Updated</Text>
              <Text className="text-gray-800 text-xs">
                {updated ? new Date(updated).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          className="bg-blue-600 rounded-lg p-4 items-center shadow-sm"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Back to Attendance</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PeriodAttendanceSummary;