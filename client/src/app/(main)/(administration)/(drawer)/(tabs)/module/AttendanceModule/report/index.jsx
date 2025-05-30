import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGetClassesQuery } from "@/src/redux/services/auth";
import DataCard from "@/src/components/common/DataCard";
import LoadingState from "@/src/components/common/LoadingState";
import ErrorState from "@/src/components/common/ErrorState";
import EmptyState from "@/src/components/common/EmptyState";

const ReportTypeCard = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity
    className="bg-white rounded-lg shadow-sm p-4 mb-4"
    onPress={onPress}
  >
    <View className="flex-row items-center mb-2">
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 bg-${color}-100`}>
        <Ionicons name={icon} size={20} color={`#${color === "blue" ? "3b82f6" : color === "green" ? "10b981" : color === "purple" ? "8b5cf6" : "f59e0b"}`} />
      </View>
      <Text className="text-lg font-bold text-gray-800">{title}</Text>
    </View>
    <Text className="text-sm text-gray-600">{description}</Text>
  </TouchableOpacity>
);

const ClassSelectCard = ({ classItem, onPress }) => (
  <DataCard
    item={classItem}
    onPress={onPress}
    renderContent={() => (
      <View className="p-3">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="font-bold text-gray-800">{classItem.name} - {classItem.section}</Text>
            <Text className="text-gray-600 text-xs">
              {classItem.studentCount || 0} Students
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6b7280" />
        </View>
      </View>
    )}
    showActionButtons={false}
  />
);

const AttendanceReportsScreen = () => {
  const [selectedReportType, setSelectedReportType] = useState(null);
  const { data: classes, isLoading, error, refetch } = useGetClassesQuery();

  const handleClassSelected = (classId) => {
    if (selectedReportType === "class") {
      router.push({
        pathname: '/attendance/reports/class-report',
        params: { classId }
      });
    } else if (selectedReportType === "student") {
      router.push({
        pathname: '/attendance/reports/student-list',
        params: { classId }
      });
    }
  };

  const renderContent = () => {
    if (!selectedReportType) {
      return (
        <View className="px-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Select Report Type</Text>
          
          <ReportTypeCard
            title="Class Reports"
            description="View attendance reports by class with daily, weekly, and monthly summaries"
            icon="people"
            color="blue"
            onPress={() => setSelectedReportType("class")}
          />
          
          <ReportTypeCard
            title="Student Reports"
            description="View detailed attendance history for individual students"
            icon="person"
            color="green"
            onPress={() => setSelectedReportType("student")}
          />
          
          <ReportTypeCard
            title="Daily Summary"
            description="View school-wide attendance summary for specific dates"
            icon="today"
            color="amber"
            onPress={() => router.push('/attendance/reports/daily-summary')}
          />
          
          <ReportTypeCard
            title="Monthly Analysis"
            description="View monthly attendance statistics and trends"
            icon="stats-chart"
            color="purple"
            onPress={() => router.push('/attendance/reports/monthly-analysis')}
          />
        </View>
      );
    } else {
      // Show class selection for class or student reports
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
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Select Class
          </Text>
          {classes.data.map((classItem) => (
            <ClassSelectCard
              key={classItem._id}
              classItem={classItem}
              onPress={() => handleClassSelected(classItem._id)}
            />
          ))}
        </View>
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">Attendance Reports</Text>
            <Text className="text-blue-100">View and generate attendance statistics</Text>
          </View>
        </View>
      </View>

      {/* Back button if report type selected */}
      {selectedReportType && (
        <TouchableOpacity 
          className="flex-row items-center p-4 bg-white border-b border-gray-200"
          onPress={() => setSelectedReportType(null)}
        >
          <Ionicons name="arrow-back" size={20} color="#3b82f6" />
          <Text className="text-blue-600 ml-2">Back to Report Types</Text>
        </TouchableOpacity>
      )}

      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 16 }}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default AttendanceReportsScreen;