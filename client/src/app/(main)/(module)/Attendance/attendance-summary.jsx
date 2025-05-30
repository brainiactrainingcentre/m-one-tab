import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const AttendanceSummaryModal = () => {
  const params = useLocalSearchParams();
  const summary = params.summary ? JSON.parse(params.summary) : null;
  const created = parseInt(params.created) || 0;
  const updated = parseInt(params.updated) || 0;

  const getStatusColor = (status) => {
    const statusColors = {
      present: '#4CAF50',
      absent: '#F44336',
      late: '#FF9800',
      halfDay: '#2196F3',
      leave: '#9C27B0'
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
          headerTitle: 'Attendance Summary',
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
            <Text className="text-gray-500 text-sm mt-1">Attendance Rate</Text>
          </View>

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

            <View className="bg-blue-50 rounded-xl p-4 w-5/12 mb-3 mr-3">
              <View>
                <Text className="text-xs font-medium text-gray-600">Half Day</Text>
                <Text className="text-2xl font-bold text-blue-600">{summary?.halfDay || 0}</Text>
              </View>
            </View>

            <View className="bg-purple-50 rounded-xl p-4 w-6/12 mb-3">
              <View>
                <Text className="text-xs font-medium text-gray-600">Leave</Text>
                <Text className="text-2xl font-bold text-purple-600">{summary?.leave || 0}</Text>
              </View>
            </View>
          </View>

          <View className="mt-4 pt-4 border-t border-gray-100">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Total Students:</Text>
              <Text className="font-bold text-lg text-gray-800">{summary?.total || 0}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
          <Text className="text-lg font-bold text-gray-800 mb-4">Submission Results</Text>
          
          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                <Ionicons name="add-circle" size={18} color="#4CAF50" />
              </View>
              <Text className="text-gray-700">New Records Created</Text>
            </View>
            <Text className="font-bold text-lg text-green-600">{created}</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="refresh-circle" size={18} color="#2196F3" />
              </View>
              <Text className="text-gray-700">Records Updated</Text>
            </View>
            <Text className="font-bold text-lg text-blue-600">{updated}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          className="bg-blue-600 py-4 rounded-lg items-center mt-auto"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold text-base">Close Summary</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AttendanceSummaryModal;