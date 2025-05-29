import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import {
  useGetClassesQuery,
  useGetStudentsByClassQuery,
  useBulkMarkPeriodAttendanceMutation,
  useGetSubjectsQuery,
  useGetAllTeachersQuery,
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

const PeriodAttendanceScreen = () => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentAcademicYear, setCurrentAcademicYear] = useState("2024-2025");
  const [remarks, setRemarks] = useState({});
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  // Period specific state
  const [periodIndex, setPeriodIndex] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const { data: classes, isLoading: classesLoading } = useGetClassesQuery();
  const { data: subjects, isLoading: subjectsLoading } = useGetSubjectsQuery();
  const { data: teachers, isLoading: teachersLoading } =
    useGetAllTeachersQuery();

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useGetStudentsByClassQuery(selectedClassId, {
    skip: !selectedClassId,
  });

  const [bulkCreatePeriodAttendance, { isLoading: isSubmitting }] =
    useBulkMarkPeriodAttendanceMutation();

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

  // FIXED: Filter students based on search term - Updated to match the working StudentAttendanceScreen structure
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
  
  // Calculate attendance summary whenever attendance status changes
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

      Object.values(attendanceStatus).forEach((status) => {
        summary[status]++;
      });

      setAttendanceSummary(summary);
    } else {
      setAttendanceSummary(null);
    }
  }, [attendanceStatus]);

  const toggleAttendanceStatus = (studentId) => {
    setAttendanceStatus((prevStatus) => {
      const currentStatus = prevStatus[studentId] || "present";
      const newStatus = getNextPeriodStatus(currentStatus);

      return {
        ...prevStatus,
        [studentId]: newStatus,
      };
    });
  };

  const getNextPeriodStatus = (currentStatus) => {
    // For periods, we only have present, absent, and late
    const statusCycle = ["present", "absent", "late"];
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
    setRemarks((prev) => ({
      ...prev,
      [studentId]: remark,
    }));
  };

  const incrementPeriod = () => {
    setPeriodIndex((prev) => prev + 1);
  };

  const decrementPeriod = () => {
    if (periodIndex > 1) {
      setPeriodIndex((prev) => prev - 1);
    }
  };

  // Fixed showAttendanceSummaryModal function
  const showAttendanceSummaryModal = (responseData) => {
    // Ensure we have the summary data
    if (!attendanceSummary) return;
    
    // Display a brief notification
    Alert.alert(
      "Attendance Saved Successfully",
      "",
      [{ text: "Close", style: "cancel" }],
      { cancelable: true }
    );
    
    // Navigate to the summary screen with correct data
    router.push({
      pathname: "/(module)/Attendance/period-attendance/PeriodAttendanceSummary",
      params: {
        summary: JSON.stringify(attendanceSummary),
        created: responseData.created || 0,
        updated: responseData.updated || 0
      }
    });
  };

  const handleSavePeriodAttendance = async () => {
    try {
      if (!selectedSubjectId) {
        Alert.alert("Error", "Please select a subject for this period");
        return;
      }

      if (!selectedTeacherId) {
        Alert.alert("Error", "Please select a teacher for this period");
        return;
      }

      // Format date as ISO string for the API
      const formattedDate = selectedDate.toISOString();

      // Prepare data for bulk attendance
      const attendanceData = filteredStudents.map((student) => ({
        studentId: student._id,
        status: attendanceStatus[student._id] || "present",
        remarks: remarks[student._id] || "",
      }));

      // API request payload
      const payload = {
        classId: selectedClassId,
        date: formattedDate,
        periodIndex: periodIndex,
        subjectId: selectedSubjectId,
        teacherId: selectedTeacherId,
        attendanceData,
      };

      // Call the API
      const response = await bulkCreatePeriodAttendance(payload).unwrap();
      if (response.success) {
        // Show the attendance summary after successful save
        showAttendanceSummaryModal({
          created: response.data.created || 0,
          updated: response.data.updated || 0
        });
        
        // You can also keep the existing Alert if you want 
        Alert.alert(
          "Success",
          `Period ${periodIndex} attendance saved successfully!\nCreated/Updated: ${response.data.updated}\nFailed: ${response.data.failed}`,
          [
            {
              text: "Next Period",
              onPress: () => {
                incrementPeriod();
                // Reset statuses to all present for the next period
                const initialStatus = {};
                filteredStudents.forEach((student) => {
                  initialStatus[student._id] = "present";
                });
                setAttendanceStatus(initialStatus);
              },
            },
            { text: "Stay on Current Period" },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to save period attendance", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      console.error("Error saving period attendance:", error);
      Alert.alert(
        "Error",
        `Failed to save period attendance: ${error.message || "Unknown error"}`,
        [{ text: "OK" }]
      );
    }
  };

  const renderStudentContent = (item) => (
    <View className="p-3">
      <View className="flex-row justify-between items-center rounded-lg">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 bg-blue-100 rounded-full mr-3 items-center justify-center">
            <Text className="text-blue-600 font-bold text-lg">
              {item.name.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-base text-gray-800">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-600">
              {item.className} {item.section} • ID: {item.studentId}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-xs text-gray-500 mr-1">
                {item.parentName || "Parent"}: {item.contactNumber || "N/A"}
              </Text>
              {remarks[item._id] && (
                <View className="bg-gray-200 rounded-full px-2 py-0.5 ml-1">
                  <Text className="text-xs text-gray-700">
                    {remarks[item._id]}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                Alert.prompt(
                  "Add Remarks",
                  "Enter remarks for this student's attendance",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Save",
                      onPress: (text) => updateStudentRemark(item._id, text),
                    },
                  ],
                  "plain-text",
                  remarks[item._id] || ""
                );
              }}
              className="mt-1"
            >
              <Text className="text-xs text-blue-600 font-medium">
                {remarks[item._id] ? "Edit Remarks" : "Add Remarks"}
              </Text>
            </TouchableOpacity>
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
    </View>
  );

  const renderStudentItem = ({ item }) => (
    <DataCard
      item={item}
      onPress={() => {
        toggleAttendanceStatus(item._id);
      }}
      renderContent={() => renderStudentContent(item)}
      showActionButtons={false}
      className="mb-3 shadow-sm"
    />
  );

  const getStatusColor = (status) => {
    const statusColors = {
      present: "#4CAF50",
      absent: "#F44336",
      late: "#FF9800",
    };
    return statusColors[status] || "#9E9E9E";
  };

  // Custom Dropdown Component
  const CustomDropdown = ({
    label,
    value,
    options,
    loading,
    showDropdown,
    setShowDropdown,
    onSelect,
    getOptionLabel,
    getOptionKey = (item) => item._id,
    noDataMessage,
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 mb-1 font-medium">{label}</Text>
      <TouchableOpacity
        onPress={() => setShowDropdown(!showDropdown)}
        className="flex-row items-center justify-between border border-gray-300 rounded-lg px-4 py-3 bg-white shadow-sm"
      >
        <Text
          className={`${value ? "text-gray-800" : "text-gray-500"} font-medium`}
        >
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <Ionicons
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </TouchableOpacity>

      {showDropdown && (
        <View className="border border-gray-300 rounded-lg mt-1 bg-white shadow-md max-h-60 z-10">
          {loading ? (
            <Text className="p-3 text-gray-500">
              Loading {label.toLowerCase()}...
            </Text>
          ) : options?.length > 0 ? (
            <ScrollView style={{ maxHeight: 200 }}>
              {options.map((option) => (
                <TouchableOpacity
                  key={getOptionKey(option)}
                  className="p-3 border-b border-gray-200"
                  onPress={() => {
                    onSelect(option);
                    setShowDropdown(false);
                  }}
                >
                  <Text
                    className={`${
                      value && value.includes(getOptionLabel(option))
                        ? "font-bold text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {getOptionLabel(option)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text className="p-3 text-gray-500">
              {noDataMessage || `No ${label.toLowerCase()} available`}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const ListHeaderWithSearch = () => (
    <View className="px-4 pt-3 pb-2">
      <View className="bg-blue-50 rounded-xl p-4 mb-5 shadow-sm border border-blue-100">
        <Text className="text-blue-800 text-xl font-bold mb-1">
          Period Attendance
        </Text>
        <Text className="text-blue-600 text-sm">
          Take attendance for each period with subject and teacher details
        </Text>
      </View>

      <CustomDropdown
        label="Class"
        value={
          selectedClassId
            ? `${
                classes?.data?.find((c) => c._id === selectedClassId)?.name
              } - ${
                classes?.data?.find((c) => c._id === selectedClassId)?.section
              }`
            : null
        }
        options={classes?.data || []}
        loading={classesLoading}
        showDropdown={showClassDropdown}
        setShowDropdown={setShowClassDropdown}
        onSelect={(classItem) => setSelectedClassId(classItem._id)}
        getOptionLabel={(classItem) =>
          `${classItem.name} - ${classItem.section}`
        }
        noDataMessage="No classes available"
      />

      {selectedClassId && (
        <>
          <View className="mb-4">
            <Text className="text-gray-700 mb-1 font-medium">
              Attendance Date
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between border border-gray-300 rounded-lg px-4 py-3 bg-white shadow-sm"
            >
              <Text className="text-gray-800 font-medium">
                {selectedDate.toDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
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
            <Text className="text-gray-700 mb-2 font-medium">Period</Text>
            <View className="flex-row justify-center items-center bg-white py-3 rounded-lg shadow-sm border border-gray-200">
              <TouchableOpacity
                onPress={decrementPeriod}
                className={`${
                  periodIndex <= 1 ? "bg-gray-100" : "bg-blue-100"
                } w-12 h-12 rounded-full items-center justify-center mr-6`}
                disabled={periodIndex <= 1}
              >
                <Ionicons
                  name="remove"
                  size={24}
                  color={periodIndex <= 1 ? "#ccc" : "#1E40AF"}
                />
              </TouchableOpacity>

              <View className="bg-blue-600 w-20 h-20 rounded-full items-center justify-center shadow-md">
                <Text className="text-white text-2xl font-bold">
                  {periodIndex}
                </Text>
              </View>

              <TouchableOpacity
                onPress={incrementPeriod}
                className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center ml-6"
              >
                <Ionicons name="add" size={24} color="#1E40AF" />
              </TouchableOpacity>
            </View>
          </View>

          <CustomDropdown
            label="Subject"
            value={
              selectedSubjectId
                ? subjects?.find((s) => s._id === selectedSubjectId)?.name ||
                  "Unknown Subject"
                : null
            }
            options={subjects || []}
            loading={subjectsLoading}
            showDropdown={showSubjectDropdown}
            setShowDropdown={setShowSubjectDropdown}
            onSelect={(subject) => setSelectedSubjectId(subject._id)}
            getOptionLabel={(subject) =>
              `${subject.name}${subject.code ? ` (${subject.code})` : ""}`
            }
            noDataMessage="No subjects available"
          />

          <CustomDropdown
            label="Teacher"
            value={
              selectedTeacherId
                ? teachers?.data?.find((t) => t._id === selectedTeacherId)
                    ?.userId?.name || "Unknown Teacher"
                : null
            }
            options={teachers?.data || []}
            loading={teachersLoading}
            showDropdown={showTeacherDropdown}
            setShowDropdown={setShowTeacherDropdown}
            onSelect={(teacher) => setSelectedTeacherId(teacher._id)}
            getOptionLabel={(teacher) =>
              `${teacher.userId?.name}${
                teacher.employeeId ? ` (${teacher.employeeId})` : ""
              }`
            }
            noDataMessage="No teachers available"
          />

          <View className="mb-5">
            <SearchInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search students by name, ID or email"
            />
          </View>

          <View className="mt-1 mb-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-800 font-bold text-base">
                Students ({filteredStudents.length})
              </Text>
              <Text className="text-gray-500 text-xs italic">
                Tap status to change
              </Text>
            </View>

            <View className="flex-row flex-wrap mt-2 pt-2 border-t border-gray-100">
              {["present", "absent", "late"].map((status) => (
                <View key={status} className="mr-4 mb-1 flex-row items-center">
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: getStatusColor(status),
                      marginRight: 5,
                    }}
                  />
                  <Text className="text-xs text-gray-600 capitalize font-medium">
                    {status}
                  </Text>
                </View>
              ))}
            </View>
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
        message={`Failed to load students: ${
          studentsError.message || "Unknown error"
        }`}
        onRetry={refetchStudents}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) =>
          item._id?.toString() || Math.random().toString()
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={<ListHeaderWithSearch />}
        ListEmptyComponent={
          <EmptyState message={getEmptyMessage()} icon={getEmptyIcon()} />
        }
        refreshing={studentsLoading && selectedClassId}
        onRefresh={selectedClassId ? refetchStudents : null}
      />

      {selectedClassId && filteredStudents.length > 0 && (
        <View className="p-4 bg-white border-t border-gray-200 absolute bottom-0 left-0 right-0 shadow-md">
          <TouchableOpacity
            className={`py-3.5 rounded-xl items-center ${
              isSubmitting || !selectedSubjectId || !selectedTeacherId
                ? "bg-blue-300"
                : "bg-blue-600"
            }`}
            onPress={handleSavePeriodAttendance}
            disabled={isSubmitting || !selectedSubjectId || !selectedTeacherId}
          >
            <Text className="text-white font-bold text-base">
              {isSubmitting
                ? "Saving..."
                : !selectedSubjectId
                ? "Select Subject to Continue"
                : !selectedTeacherId
                ? "Select Teacher to Continue"
                : `Save Period ${periodIndex} Attendance`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PeriodAttendanceScreen;