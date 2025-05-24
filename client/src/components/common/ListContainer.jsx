import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import {
  useGetClassesQuery,
  useGetStudentsByClassQuery,
} from "@/src/redux/services/auth";
import { Ionicons } from "@expo/vector-icons";

import ListHeader from "@/src/components/common/ListHeader";
import SearchInput from "@/src/components/common/SearchInput";
import AttendanceStatusBadge from "@/src/components/attendance/AttendanceStatusBadge";
import DataCard from "@/src/components/common/DataCard";
import { FlatList } from "react-native";
import LoadingState from "@/src/components/common/LoadingState";
import ErrorState from "@/src/components/common/ErrorState";
import EmptyState from "@/src/components/common/EmptyState";

const StudentsByClassScreen = () => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});

  const { data: classes, isLoading: classesLoading } = useGetClassesQuery();

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useGetStudentsByClassQuery(selectedClassId, {
    skip: !selectedClassId,
  });

  useEffect(() => {
    if (selectedClassId) {
      console.log("Selected class ID:", selectedClassId);
    }
    if (students) {
      console.log("Students data structure:", JSON.stringify(students));
      
      // Initialize attendance status for all students as "present" by default
      if (Array.isArray(students?.data?.students)) {
        const initialStatus = {};
        students.data.students.forEach(student => {
          initialStatus[student._id] = "present";
        });
        setAttendanceStatus(initialStatus);
      }
    }
  }, [selectedClassId, students]);

  useEffect(() => {
    let studentArray = [];

    if (Array.isArray(students?.data?.students)) {
      const classInfo = students.data;
      studentArray = classInfo.students.map((s) => ({
        _id: s._id,
        name: s.userId?.name || "Unnamed",
        studentId: s.studentId,
        email: s.userId?.email || "",
        className: classInfo.name,
        section: classInfo.section,
        parentName: s.userId?.parentName || "",
        contactNumber: s.userId?.contactNumber || "",
      }));
    }

    if (studentArray.length > 0) {
      const filtered = studentArray.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [students, searchTerm]);

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
    const statusCycle = ['present', 'absent', 'late', 'halfday', 'leave'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    return statusCycle[nextIndex];
  };

  const renderStudentContent = (item) => (
    <View>
      <View className="flex-row justify-between items-center rounded-lg my-1 mx-2">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 bg-gray-300 rounded-full mr-2.5" />
          <View>
            <Text className="font-bold text-sm text-black">
              {item.name} ({item.className} {item.section})
            </Text>
            <Text className="text-xs text-black">
              Adm No.: {item.studentId} | Roll No.: null
            </Text>
            <Text className="text-xs text-black">
              Parent: {item.parentName || "N/A"} ({item.contactNumber || "N/A"})
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => toggleAttendanceStatus(item._id)}>
          <AttendanceStatusBadge 
            status={attendanceStatus[item._id] || "present"} 
            size="large" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStudentItem = ({ item }) => (
    <DataCard
      item={item}
      onPress={() => {
        // Tap on the card to toggle attendance status
        toggleAttendanceStatus(item._id);
      }}
      renderContent={() => renderStudentContent(item)}
      showActionButtons={false}
    />
  );

  const ListHeaderWithSearch = () => (
    <View className="px-4 pt-2 pb-2">
      <View className="mb-4">
        <Text className="text-gray-700 mb-1 font-medium">Select Class</Text>
        <TouchableOpacity
          onPress={toggleDropdown}
          className="flex-row items-center justify-between border border-gray-300 rounded-md px-3 py-2 bg-white"
        >
          <Text className="text-gray-700">
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
          <View className="border border-gray-300 rounded-md mt-1 bg-white max-h-60">
            {classesLoading ? (
              <Text className="p-3 text-gray-500">Loading classes...</Text>
            ) : classes?.data?.length > 0 ? (
              classes.data.map((classItem) => (
                <TouchableOpacity
                  key={classItem._id}
                  className="p-3 border-b border-gray-200"
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
              ))
            ) : (
              <Text className="p-3 text-gray-500">No classes available</Text>
            )}
          </View>
        )}
      </View>

      {selectedClassId && (
        <>
          <SearchInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search students by name, ID or email"
          />
          <View className="mt-4 flex-row justify-between items-center">
            <Text className="text-gray-700 font-medium">Students Attendance</Text>
            <Text className="text-gray-600 text-xs">Tap on status to change</Text>
          </View>
          <View className="flex-row justify-between mt-2 mb-4">
            <View className="flex-row">
              {['present', 'absent', 'late', 'halfday', 'leave'].map((status) => (
                <View key={status} className="mr-2 flex-row items-center">
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(status), marginRight: 4 }} />
                  <Text className="text-xs text-gray-600 capitalize">{status}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );

  const getStatusColor = () => {
    const statusColors = {
      present: '#4CAF50',
      absent: '#F44336',
      late: '#FF9800',
      halfday: '#2196F3',
      leave: '#9C27B0',
      default: '#9E9E9E'
    };
    return statusColors;
  };

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
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ListHeaderComponent={<ListHeaderWithSearch />}
        ListEmptyComponent={
          <EmptyState message={getEmptyMessage()} icon={getEmptyIcon()} />
        }
        refreshing={studentsLoading && selectedClassId}
        onRefresh={selectedClassId ? refetchStudents : null}
      />
      
      {selectedClassId && filteredStudents.length > 0 && (
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity 
            className="bg-blue-600 py-3 rounded-lg items-center"
            onPress={() => {
              // Here you would implement your API call to save attendance
              console.log("Saving attendance:", attendanceStatus);
              alert("Attendance saved successfully!");
            }}
          >
            <Text className="text-white font-bold">Save Attendance</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default StudentsByClassScreen;