import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  useGetClassAttendanceReportQuery,
  useGetClassQuery
} from "@/src/redux/services/auth";
import LoadingState from "@/src/components/common/LoadingState";
import ErrorState from "@/src/components/common/ErrorState";
import EmptyState from "@/src/components/common/EmptyState";
import DataCard from "@/src/components/common/DataCard";

const ClassAttendanceReportScreen = () => {
  const { classId } = useLocalSearchParams();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentAcademicYear, setCurrentAcademicYear] = useState("2024-2025");
  
  // Format dates for API
  const [formattedStartDate, setFormattedStartDate] = useState("");
  const [formattedEndDate, setFormattedEndDate] = useState("");

  useEffect(() => {
    // Set default date range to current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setStartDate(firstDayOfMonth);
    setEndDate(today);
    
    // Format dates for API
    setFormattedStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setFormattedEndDate(today.toISOString().split('T')[0]);
  }, []);

  // Get class info
  const { 
    data: classInfo,
    isLoading: classLoading
  } = useGetClassQuery(classId);

  // Get attendance report data
  const {
    data: reportData,
    isLoading: reportLoading,
    error: reportError,
    refetch: refetchReport
  } = useGetClassAttendanceReportQuery(
    { 
      classId, 
      startDate: formattedStartDate, 
      endDate: formattedEndDate,
      academicYear: currentAcademicYear
    },
    { skip: !classId || !formattedStartDate || !formattedEndDate }
  );

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      setFormattedStartDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      setFormattedEndDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const getStatusColor = (value) => {
    if (value >= 90) return "text-green-600";
    if (value >= 75) return "text-blue-600";
    if (value >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const renderStudentItem = ({ item }) => {
    const totalDays = (item.totalPresent + item.totalAbsent + item.totalLate + 
                      item.totalHalfDay + item.totalLeave) || 1;
    
    return (
      <DataCard
        item={item}
        showActionButtons={false}
        onPress={() => {
          router.push({
            pathname: '/attendance/reports/student-report',
            params: { 
              studentId: item.student._id,
              startDate: formattedStartDate,
              endDate: formattedEndDate
            }
          });
        }}
        renderContent={() => (
          <View className="p-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-bold text-gray-800">
                  {item.student.name || "Unknown"}
                </Text>
                <Text className="text-xs text-gray-600">
                  ID: {item.student.studentId || "N/A"}
                </Text>
                
                <View className="flex-row mt-2">
                  <View className="mr-4">
                    <Text className="text-xs text-gray-500">Present</Text>
                    <Text className="text-sm font-medium text-gray-800">
                      {item.totalPresent}/{totalDays}
                    </Text>
                  </View>
                  
                  <View className="mr-4">
                    <Text className="text-xs text-gray-500">Absent</Text>
                    <Text className="text-sm font-medium text-gray-800">
                      {item.totalAbsent}/{totalDays}
                    </Text>
                  </View>
                  
                  <View>
                    <Text className="text-xs text-gray-500">Late</Text>
                    <Text className="text-sm font-medium text-gray-800">
                      {item.totalLate}/{totalDays}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View className="items-center">
                <Text className="text-xs text-gray-500">Attendance</Text>
                <Text className={`text-lg font-bold ${getStatusColor(item.attendancePercentage)}`}>
                  {Math.round(item.attendancePercentage)}%
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    );
  };

  if (classLoading || (reportLoading && !reportData)) {
    return <LoadingState message="Loading attendance report..." />;
  }

  if (reportError) {
    return (
      <ErrorState 
        message="Failed to load attendance report" 
        onRetry={refetchReport} 
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-4 shadow-sm">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <Text className="text-lg font-bold text-gray-800">
            {classInfo?.name || "Class"} Attendance
          </Text>
          
          <View style={{ width: 32 }} />
        </View>

        {/* Date Range Selector */}
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity 
            onPress={() => setShowStartPicker(true)}
            className="flex-1 mr-2 border border-gray-300 rounded-md p-3"
          >
            <Text className="text-xs text-gray-500">Start Date</Text>
            <Text className="text-sm font-medium text-gray-800">
              {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowEndPicker(true)}
            className="flex-1 ml-2 border border-gray-300 rounded-md p-3"
          >
            <Text className="text-xs text-gray-500">End Date</Text>
            <Text className="text-sm font-medium text-gray-800">
              {endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Academic Year Selector (simplified for now) */}
        <View className="mt-4">
          <Text className="text-xs text-gray-500 mb-1">Academic Year</Text>
          <View className="border border-gray-300 rounded-md p-3">
            <Text className="text-sm font-medium text-gray-800">
              {currentAcademicYear}
            </Text>
          </View>
        </View>

        {/* Apply Button */}
        <TouchableOpacity 
          onPress={refetchReport}
          className="bg-blue-600 rounded-md py-3 mt-4"
        >
          <Text className="text-white font-medium text-center">
            Apply Filters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers - only show when needed */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}
      
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}

      {/* Report Content */}
      {reportData?.students?.length > 0 ? (
        <FlatList
          data={reportData.students}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item.student._id}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
        />
      ) : (
        <EmptyState 
          message="No attendance data found for the selected period" 
          iconName="calendar-outline"
        />
      )}

      {/* Summary */}
      {reportData && (
        <View className="bg-white p-4 shadow-sm">
          <Text className="text-sm font-medium text-gray-800 mb-2">
            Class Summary
          </Text>
          
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xs text-gray-500">Average</Text>
              <Text className={`text-base font-bold ${getStatusColor(reportData.classAverage || 0)}`}>
                {Math.round(reportData.classAverage || 0)}%
              </Text>
            </View>
            
            <View className="items-center">
              <Text className="text-xs text-gray-500">Highest</Text>
              <Text className="text-base font-bold text-green-600">
                {Math.round(reportData.highestAttendance || 0)}%
              </Text>
            </View>
            
            <View className="items-center">
              <Text className="text-xs text-gray-500">Lowest</Text>
              <Text className="text-base font-bold text-red-600">
                {Math.round(reportData.lowestAttendance || 0)}%
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ClassAttendanceReportScreen;