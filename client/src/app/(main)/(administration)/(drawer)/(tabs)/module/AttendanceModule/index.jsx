import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGetClassesQuery } from "@/src/redux/services/auth";
import DataCard from "@/src/components/common/DataCard";
import EmptyState from "@/src/components/common/EmptyState";
import LoadingState from "@/src/components/common/LoadingState";
import ErrorState from "@/src/components/common/ErrorState";

const AttendanceFeatureCard = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity
    className="bg-white rounded-lg shadow-sm p-4 mb-4 flex-row items-center"
    onPress={onPress}
  >
    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 bg-${color}-100`}>
      <Ionicons name={icon} size={24} color={`#${color === "blue" ? "3b82f6" : color === "green" ? "10b981" : color === "purple" ? "8b5cf6" : "f59e0b"}`} />
    </View>
    <View className="flex-1">
      <Text className="text-lg font-bold text-gray-800">{title}</Text>
      <Text className="text-sm text-gray-600">{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
  </TouchableOpacity>
);

const ClassCard = ({ classItem, onPress }) => {
  const studentCount = classItem.studentCount || 0;
  
  return (
    <DataCard
      item={classItem}
      onPress={onPress}
      renderContent={() => (
        <View className="p-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="font-bold text-lg text-gray-800">{classItem.name} - {classItem.section}</Text>
              <Text className="text-gray-600">{studentCount} Students</Text>
              {classItem.teacher && (
                <Text className="text-gray-600">Class Teacher: {classItem.teacher.name}</Text>
              )}
            </View>
            <View className="h-14 w-14 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="people" size={24} color="#3b82f6" />
            </View>
          </View>
        </View>
      )}
      showActionButtons={false}
    />
  );
};

const AttendanceMainScreen = () => {
  const [activeTab, setActiveTab] = useState("features");
  const { data: classes, isLoading, error, refetch } = useGetClassesQuery();

  const navigateToStudentAttendance = () => {
    router.push('/(main)/(administration)/(drawer)/(tabs)/module/AttendanceModule/student-attendance');
  };

  const navigateToReports = () => {
    router.push('/(main)/(administration)/(drawer)/(tabs)/module/AttendanceModule/report');
  };

  const navigateToClassAttendance = (classId) => {
    router.push({
      pathname: '/attendance/class-attendance',
      params: { classId }
    });
  };

  const navigateToAttendanceCalendar = () => {
    router.push('/(main)/(administration)/(drawer)/(tabs)/module/AttendanceModule/calendar');
  };

  const renderContent = () => {
    if (activeTab === "features") {
      return (
        <View className="px-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Attendance Management</Text>
          
          <AttendanceFeatureCard
            title="Take Attendance"
            description="Mark daily attendance for students by class"
            icon="checkbox-outline"
            color="blue"
            onPress={navigateToStudentAttendance}
          />
          
          <AttendanceFeatureCard
            title="Attendance Reports"
            description="View and generate attendance reports"
            icon="stats-chart"
            color="green"
            onPress={navigateToReports}
          />
          
          <AttendanceFeatureCard
            title="Attendance Calendar"
            description="View attendance on calendar"
            icon="calendar"
            color="purple"
            onPress={navigateToAttendanceCalendar}
          />
          
          <AttendanceFeatureCard
            title="Period Attendance"
            description="Manage subject-wise attendance"
            icon="time-outline"
            color="amber"
            onPress={() => router.push('/(main)/(administration)/(drawer)/(tabs)/module/AttendanceModule/period-attendance')}
          />
        </View>
      );
    } else if (activeTab === "classes") {
      if (isLoading) {
        return <LoadingState message="Loading classes..." />;
      }

      if (error) {
        return (
          <ErrorState
            message={`Failed to load classes: ${error.message || "Unknown error"}`}
            onRetry={refetch}
          />
        );
      }

      if (!classes?.data || classes.data.length === 0) {
        return (
          <EmptyState
            message="No classes found"
            icon="school-outline"
          />
        );
      }

      return (
        <View className="px-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Classes</Text>
          {classes.data.map((classItem) => (
            <ClassCard
              key={classItem._id}
              classItem={classItem}
              onPress={() => navigateToClassAttendance(classItem._id)}
            />
          ))}
        </View>
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-blue-600 pt-12 pb-4 px-4">
        <Text className="text-white text-2xl font-bold">Attendance</Text>
        <Text className="text-blue-100">Manage student attendance records</Text>
      </View>
      
      <View className="flex-row border-b border-gray-200 bg-white">
        <TouchableOpacity
          className={`flex-1 py-4 ${activeTab === "features" ? "border-b-2 border-blue-600" : ""}`}
          onPress={() => setActiveTab("features")}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "features" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Features
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-4 ${activeTab === "classes" ? "border-b-2 border-blue-600" : ""}`}
          onPress={() => setActiveTab("classes")}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "classes" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Classes
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default AttendanceMainScreen;