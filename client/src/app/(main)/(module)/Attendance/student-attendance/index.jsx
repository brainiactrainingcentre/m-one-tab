import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import {
  useGetStudentsByClassQuery,
  useBulkMarkDailyAttendanceMutation,
  useGetClassesQuery,
} from "@/src/redux/services/auth";
import { Ionicons } from "@expo/vector-icons";
import SearchInput from "@/src/components/common/SearchInput";
import AttendanceStatusBadge from "@/src/components/attendance/AttendanceStatusBadge";
import DataCard from "@/src/components/common/DataCard";
import { FlatList } from "react-native";
import LoadingState from "@/src/components/common/LoadingState";
import ErrorState from "@/src/components/common/ErrorState";
import EmptyState from "@/src/components/common/EmptyState";
import DateTimePicker from "@react-native-community/datetimepicker";

const StudentAttendanceScreen = () => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentAcademicYear, setCurrentAcademicYear] = useState("2024-2025");
  const [remarks, setRemarks] = useState({});
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  const { data: classes, isLoading: classesLoading } = useGetClassesQuery();

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useGetStudentsByClassQuery(selectedClassId, {
    skip: !selectedClassId,
  });

  const [bulkCreateAttendance, { isLoading: isSubmitting }] = useBulkMarkDailyAttendanceMutation();

  // Initialize attendance when students data loads
  useEffect(() => {
    if (selectedClassId) {
      console.log("Selected class ID:", selectedClassId);
    }
    if (students) {
      console.log("Students data structure:", JSON.stringify(students));
      console.log("Students data array:", students?.data);
      
      // FIXED: Initialize attendance status for all students as "present" by default
      if (Array.isArray(students?.data)) {
        const initialStatus = {};
        const initialRemarks = {};
        students.data.forEach(student => {
          initialStatus[student._id] = "present";
          initialRemarks[student._id] = "";
        });
        setAttendanceStatus(initialStatus);
        setRemarks(initialRemarks);
        console.log("Initialized attendance for", students.data.length, "students");
      }
    }
  }, [selectedClassId, students]);

  // FIXED: Filter students based on search term
  useEffect(() => {
    let studentArray = [];

    // The API returns students directly in data array
    if (Array.isArray(students?.data)) {
      studentArray = students.data.map((student) => ({
        _id: student._id,
        name: student.name || "Unnamed",
        studentId: student.studentId,
        email: student.email || "",
        className: student.className,
        section: student.section,
        parentName: student.parentName || "",
        contactNumber: student.contactNumber || "",
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        bloodGroup: student.bloodGroup,
        academicYear: student.academicYear,
        address: student.address
      }));
      
      console.log("Processed student array:", studentArray.length, "students");
    }

    if (studentArray.length > 0) {
      const filtered = studentArray.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
      console.log("Filtered students:", filtered.length);
    } else {
      setFilteredStudents([]);
      console.log("No students to filter");
    }
  }, [students, searchTerm]);

  useEffect(() => {
    if (Object.keys(attendanceStatus).length > 0) {
      const summary = {
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0,
        leave: 0,
        total: Object.keys(attendanceStatus).length,
      };
      
      Object.values(attendanceStatus).forEach(status => {
        summary[status]++;
      });
      
      setAttendanceSummary(summary);
    } else {
      setAttendanceSummary(null);
    }
  }, [attendanceStatus]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleAttendanceStatus = (studentId) => {
    setAttendanceStatus(prevStatus => {
      const currentStatus = prevStatus[studentId] || 'present';
      const newStatus = getNextStatus(currentStatus);
      
      return {
        ...prevStatus,
        [studentId]: newStatus
      };
    });
  };

  const getNextStatus = (currentStatus) => {
    const statusCycle = ['present', 'absent', 'late', 'halfDay', 'leave'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    return statusCycle[nextIndex];
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const updateStudentRemark = (studentId, remark) => {
    setRemarks(prev => ({
      ...prev,
      [studentId]: remark
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      // Format date as ISO string for the API
      const formattedDate = selectedDate.toISOString();

      // Prepare data for bulk attendance
      const attendanceData = filteredStudents.map(student => ({
        studentId: student._id,
        dailyStatus: attendanceStatus[student._id] || "present",
        remarks: remarks[student._id] || ""
      }));

      // API request payload
      const payload = {
        classId: selectedClassId,
        date: formattedDate,
        academicYear: currentAcademicYear,
        attendanceData
      };

      // Call the API
      const response = await bulkCreateAttendance(payload).unwrap();
      
      
      if (response.success) {
        showAttendanceSummaryModal(response.data);
      } else {
        Alert.alert("Error", "Failed to save attendance", [{ text: "OK" }]);
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      Alert.alert(
        "Error",
        `Failed to save attendance: ${error.message || "Unknown error"}`,
        [{ text: "OK" }]
      );
    }
  };

  const showAttendanceSummaryModal = (responseData) => {
    // Calculate summary based on current attendance status
    Alert.alert(
      "Attendance Saved Successfully",
      "",
      [{ text: "Close", style: "cancel" }],
      { cancelable: true }
    );
    
    // Using custom alert to show the summary
    router.push({
      pathname: "/(module)/Attendance/attendance-summary",
      params: {
        summary: JSON.stringify(attendanceSummary),
        created: responseData.created,
        updated: responseData.updated
      }
    });
  };

  const renderStudentContent = (item) => (
    <View className="bg-white rounded-xl shadow-sm overflow-hidden">
      <View className="flex-row justify-between items-start p-4">
        <View className="flex-row items-center flex-1">
          <View className="w-14 h-14 bg-blue-50 rounded-full mr-4 items-center justify-center border-2 border-blue-100">
            <Text className="text-blue-600 font-bold text-xl">
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-base text-gray-800">
              {item.name}
            </Text>
            <View className="flex-row items-center mt-1 bg-gray-50 rounded-full px-3 py-1 self-start">
              <Text className="text-xs text-gray-600">
                <Text className="font-medium">{item.className} {item.section}</Text> • ID: {item.studentId}
              </Text>
            </View>
            <View className="flex-row items-center mt-2">
              <Ionicons name="person-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
              <Text className="text-xs text-gray-500">
                {item.parentName || "Parent N/A"}
              </Text>
              <Text className="text-gray-400 mx-1">•</Text>
              <Ionicons name="call-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
              <Text className="text-xs text-gray-500">
                {item.contactNumber || "No contact"}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => toggleAttendanceStatus(item._id)}
          className="ml-2"
        >
          <AttendanceStatusBadge 
            status={attendanceStatus[item._id] || "present"} 
            size="large" 
          />
        </TouchableOpacity>
      </View>
      
      {remarks[item._id] ? (
        <View className="px-4 py-2 bg-white border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="chatbubble-ellipses-outline" size={14} color="#4B5563" />
            <Text className="text-xs font-medium text-gray-700 ml-1">Remarks</Text>
          </View>
          <Text className="text-xs text-gray-600 mt-1">{remarks[item._id]}</Text>
          <TouchableOpacity 
            onPress={() => {
              Alert.prompt(
                "Update Remarks",
                "Edit remarks for this student's attendance",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Save", onPress: text => updateStudentRemark(item._id, text) }
                ],
                "plain-text",
                remarks[item._id] || ""
              );
            }}
            className="self-end mt-1"
          >
            <Text className="text-xs text-blue-600 font-medium">Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={() => {
            Alert.prompt(
              "Add Remarks",
              "Enter remarks for this student's attendance",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Save", onPress: text => updateStudentRemark(item._id, text) }
              ],
              "plain-text",
              ""
            );
          }}
          className="py-2 px-4 border-t border-gray-100 flex-row items-center"
        >
          <Ionicons name="add-circle-outline" size={14} color="#3B82F6" />
          <Text className="text-xs text-blue-600 font-medium ml-1">Add Remarks</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStudentItem = ({ item }) => (
    <View className="px-1 py-2">
      <DataCard
        item={item}
        onPress={() => {
          toggleAttendanceStatus(item._id);
        }}
        renderContent={() => renderStudentContent(item)}
        showActionButtons={false}
      />
    </View>
  );

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

  const ListHeaderWithSearch = () => (
    <View className="px-4 pt-4 pb-2">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-gray-800">Student Attendance</Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-700 font-medium text-xs">{currentAcademicYear}</Text>
        </View>
      </View>
      
      <View className="mb-5 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-3">
          <Ionicons name="school" size={18} color="#3B82F6" />
          <Text className="text-gray-800 ml-2 font-semibold">Select Class</Text>
        </View>
        <TouchableOpacity
          onPress={toggleDropdown}
          className="flex-row items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-white"
        >
          <Text className={`${selectedClassId ? "text-gray-800 font-medium" : "text-gray-500"}`}>
            {selectedClassId
              ? classes?.data.find((c) => c._id === selectedClassId)?.name +
                " - " +
                classes?.data.find((c) => c._id === selectedClassId)?.section
              : "Select a class"}
          </Text>
          <Ionicons
            name={showDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6b7280"
          />
        </TouchableOpacity>

        {showDropdown && (
          <View className="border border-gray-200 rounded-lg mt-2 bg-white max-h-60 shadow-md z-10">
            {classesLoading ? (
              <View className="p-4 items-center">
                <Text className="text-gray-500">Loading classes...</Text>
              </View>
            ) : classes?.data?.length > 0 ? (
              <ScrollView className="max-h-60">
                {classes.data.map((classItem) => (
                  <TouchableOpacity
                    key={classItem._id}
                    className={`p-4 border-b border-gray-100 ${
                      selectedClassId === classItem._id ? "bg-blue-50" : ""
                    }`}
                    onPress={() => {
                      setSelectedClassId(classItem._id);
                      setShowDropdown(false);
                    }}
                  >
                    <Text
                      className={`${
                        selectedClassId === classItem._id
                          ? "font-bold text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {classItem.name} - {classItem.section}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View className="p-4 items-center">
                <Text className="text-gray-500">No classes available</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {selectedClassId && (
        <>
          <View className="mb-5 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar" size={18} color="#3B82F6" />
              <Text className="text-gray-800 ml-2 font-semibold">Attendance Date</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-white"
            >
              <Text className="text-gray-800 font-medium">
                {selectedDate.toDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#4B5563" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          
          <View className="mb-5">
            <SearchInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search students by name, ID or email"
            />
          </View>
          
          {attendanceSummary && (
            <View className="mb-5 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="pie-chart" size={18} color="#3B82F6" />
                  <Text className="text-gray-800 ml-2 font-semibold">Attendance Summary</Text>
                </View>
                <Text className="text-gray-500 text-xs">
                  Total: <Text className="font-bold">{attendanceSummary.total}</Text>
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <View className="bg-green-50 rounded-xl p-3 w-1/5 items-center border border-green-100">
                  <View className="h-8 w-8 rounded-full bg-green-100 items-center justify-center mb-1">
                    <Text className="text-green-600 font-bold">{attendanceSummary.present}</Text>
                  </View>
                  <Text className="text-xs text-green-700 font-medium">Present</Text>
                </View>
                
                <View className="bg-red-50 rounded-xl p-3 w-1/5 items-center border border-red-100">
                  <View className="h-8 w-8 rounded-full bg-red-100 items-center justify-center mb-1">
                    <Text className="text-red-600 font-bold">{attendanceSummary.absent}</Text>
                  </View>
                  <Text className="text-xs text-red-700 font-medium">Absent</Text>
                </View>
                
                <View className="bg-orange-50 rounded-xl p-3 w-1/5 items-center border border-orange-100">
                  <View className="h-8 w-8 rounded-full bg-orange-100 items-center justify-center mb-1">
                    <Text className="text-orange-600 font-bold">{attendanceSummary.late}</Text>
                  </View>
                  <Text className="text-xs text-orange-700 font-medium">Late</Text>
                </View>
                
                <View className="bg-blue-50 rounded-xl p-3 w-1/5 items-center border border-blue-100">
                  <View className="h-8 w-8 rounded-full bg-blue-100 items-center justify-center mb-1">
                    <Text className="text-blue-600 font-bold">{attendanceSummary.halfDay}</Text>
                  </View>
                  <Text className="text-xs text-blue-700 font-medium">Half Day</Text>
                </View>
                
                <View className="bg-purple-50 rounded-xl p-3 w-1/5 items-center border border-purple-100">
                  <View className="h-8 w-8 rounded-full bg-purple-100 items-center justify-center mb-1">
                    <Text className="text-purple-600 font-bold">{attendanceSummary.leave}</Text>
                  </View>
                  <Text className="text-xs text-purple-700 font-medium">Leave</Text>
                </View>
              </View>
            </View>
          )}
          
          <View className="mt-2 mb-4 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="people" size={18} color="#3B82F6" />
              <Text className="text-gray-800 ml-2 font-semibold">Students List</Text>
              <View className="bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-xs text-gray-700 font-medium">{filteredStudents.length}</Text>
              </View>
            </View>
            <TouchableOpacity className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
              <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
              <Text className="text-gray-600 text-xs font-medium ml-1">Tap status to change</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
            {['present', 'absent', 'late', 'halfDay', 'leave'].map((status) => (
              <View key={status} className="mr-4 mb-1 flex-row items-center">
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getStatusColor(status), marginRight: 6 }} />
                <Text className="text-xs text-gray-700 capitalize font-medium">{status}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const getEmptyMessage = () => {
    if (!selectedClassId) {
      return "Please select a class to view students";
    }
    return "No students found in this class";
  };

  const getEmptyIcon = () => {
    if (!selectedClassId) {
      return "school-outline";
    }
    return "people-outline";
  };

  if (studentsLoading && selectedClassId) {
    return <LoadingState message="Loading students..." />;
  }

  if (studentsError) {
    return (
      <ErrorState 
        message={`Failed to load students: ${studentsError.message || "Unknown error"}`}
        onRetry={refetchStudents}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListHeaderComponent={<ListHeaderWithSearch />}
        ListEmptyComponent={
          <EmptyState message={getEmptyMessage()} icon={getEmptyIcon()} />
        }
        refreshing={studentsLoading && selectedClassId}
        onRefresh={selectedClassId ? refetchStudents : null}
      />
      
      {selectedClassId && filteredStudents.length > 0 && (
        <View className="px-4 py-4 bg-white border-t border-gray-200 absolute bottom-0 left-0 right-0 shadow-lg">
          <TouchableOpacity 
            className={`py-4 rounded-xl items-center justify-center flex-row ${
              isSubmitting ? 'bg-blue-400' : 'bg-blue-600'
            }`}
            onPress={handleSaveAttendance}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Ionicons name="hourglass-outline" size={18} color="white" className="mr-2" />
                <Text className="text-white font-bold">Saving Attendance...</Text>
              </>
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="white" />
                <Text className="text-white font-bold ml-2">Save Attendance</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View> 
  );
};

export default StudentAttendanceScreen;