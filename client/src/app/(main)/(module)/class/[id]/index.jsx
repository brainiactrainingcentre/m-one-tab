import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetClassByIdQuery,
  useRemoveStudentFromClassMutation,
  useDeleteClassMutation,
} from "@/src/redux/services/auth";

const ClassDetailScreen = () => {
  // Use useRouter hook from expo-router
  const navigation = useRouter();
  const { id } = useLocalSearchParams();
  const {
    data: classResponse,
    isLoading,
    error,
    refetch,
  } = useGetClassByIdQuery(id);
  const [removeStudent, { isLoading: isRemoving }] =
    useRemoveStudentFromClassMutation();
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  // Extract class details from the response
  const classDetails = classResponse?.data;

  const handleRemoveStudent = (studentId) => {
    Alert.alert(
      "Remove Student",
      "Are you sure you want to remove this student from the class?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeStudent({ classId: id, studentId });
              refetch();
            } catch (error) {
              Alert.alert("Error", "Failed to remove student");
            }
          },
        },
      ]
    );
  };

  const handleDeleteClass = () => {
    Alert.alert(
      "Delete Class",
      "Are you sure you want to delete this class? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClass(id);
              navigation.replace("/(module)/class");
            } catch (error) {
              Alert.alert("Error", "Failed to delete class");
            }
          },
        },
      ]
    );
  };

  const renderPeriod = (period) => {
    const teacherName = period.teacher?.userId?.name;
    const employeeId = period.teacher?.employeeId;

    return (
      <View key={period._id} className="border-l-3 border-l-secondary-100 pl-3 py-2 mb-2 bg-gray-50 rounded">
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm font-semibold text-black-100">
            {period.startTime} - {period.endTime}
          </Text>
        </View>
        <View className="mt-0.5">
          <Text className="text-base font-medium">
            {period.subject?.name || period.subject || "No Subject"}
          </Text>
          <Text className="text-xs text-gray-500">{period.subject?.code || ""}</Text>
          <Text className="text-xs text-gray-500 italic mt-0.5">
            {teacherName
              ? `Teacher: ${teacherName} (${employeeId})`
              : period.teacher
              ? "Teacher info unavailable"
              : "No teacher assigned"}
          </Text>
        </View>
      </View>
    );
  };
  

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4C37EE" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-base text-error mb-4">Failed to load class details</Text>
        <TouchableOpacity className="bg-secondary-100 px-5 py-2.5 rounded-lg" onPress={refetch}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!classDetails) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-base text-error mb-4">No class data found</Text>
        <TouchableOpacity
          className="bg-secondary-100 px-5 py-2.5 rounded-lg"
          onPress={() => navigation.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const navigateTo = (path) => {
    navigation.push(path);
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Class Header */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-xl p-4 mb-4 shadow">
          <View>
            <Text className="text-2xl font-bold mb-1">
              {classDetails.name} - Section {classDetails.section}
            </Text>
            <Text className="text-sm text-gray-500 mb-1">Class ID: {classDetails.classId}</Text>
            <Text className="text-sm text-gray-500 mb-1">
              Academic Year: {classDetails.academicYear}
            </Text>
          </View>

          <View className="flex-row mt-3">
            <TouchableOpacity
              className="flex-row items-center py-2 px-4 rounded-lg bg-secondary-100 mr-3"
              onPress={() => 
                navigateTo(`/(module)/class/${id}/edit`)
              }
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-1">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-2 px-4 rounded-lg bg-error mr-3"
              onPress={handleDeleteClass}
              disabled={isDeleting}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-1">
                {isDeleting ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Class Statistics */}
        <View className="bg-white p-4 rounded-2xl shadow mb-4">
          <Text className="text-lg font-semibold mb-2 text-black-100">Class Statistics</Text>
          <View className="flex-row justify-between mb-4">
            <View className="w-[48%]">
              <Text className="text-sm text-gray-500 mb-1">Total Students</Text>
              <Text className="text-lg font-bold text-black-100">
                {classDetails?.students?.length || 0}
              </Text>
            </View>
            <View className="w-[48%]">
              <Text className="text-sm text-gray-500 mb-1">Total Subjects</Text>
              <Text className="text-lg font-bold text-black-100">
                {classDetails?.subjects?.length || 0}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="w-[48%]">
              <Text className="text-sm text-gray-500 mb-1">Class Teacher</Text>
              <Text className="text-lg font-bold text-black-100">
                {classDetails?.classTeacher?.userId?.name || "Not assigned"}
              </Text>
            </View>
            <View className="w-[48%]">
              <Text className="text-sm text-gray-500 mb-1">Teachers</Text>
              <Text className="text-lg font-bold text-black-100">
                {classDetails?.subjects
                  ?.flatMap((subject) => subject.teachers || [])
                  ?.filter(
                    (value, index, self) => self.indexOf(value) === index
                  )?.length || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Subjects Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">Subjects</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() =>
                navigateTo(`/(module)/class/${id}/subjects`)
              }
            >
              <Text className="text-secondary-100 font-semibold text-sm">Manage</Text>
              <Ionicons name="chevron-forward" size={16} color="#4C37EE" />
            </TouchableOpacity>
          </View>

          {classDetails.subjects?.length > 0 ? (
            <View className="flex-row flex-wrap">
              {classDetails.subjects.map((subject) => (
                <View key={subject._id} className="bg-navy-100 rounded-lg py-2 px-3 mr-2 mb-2">
                  <Text className="text-secondary-100 font-medium">{subject.name}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{subject.code}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-gray-400 italic text-center py-3">No subjects assigned</Text>
          )}
        </View>

        {/* Class Schedule Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">Class Schedule</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() =>
                navigateTo(`/(module)/class/${id}/schedule`)
              }
            >
              <Text className="text-secondary-100 font-semibold text-sm">Manage</Text>
              <Ionicons name="chevron-forward" size={16} color="#4C37EE" />
            </TouchableOpacity>
          </View>

          {classDetails.schedule?.length > 0 ? (
            classDetails.schedule.map((daySchedule) => (
              <View key={daySchedule._id} className="mb-4">
                <Text className="text-base font-semibold text-black-100 bg-navy-100 py-1.5 px-3 rounded-md mb-2">
                  {daySchedule.day}
                </Text>

                {daySchedule.periods?.length > 0 ? (
                  daySchedule.periods.map((period) => renderPeriod(period))
                ) : (
                  <Text className="text-sm text-gray-400 italic text-center py-3">No periods scheduled</Text>
                )}
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-400 italic text-center py-3">No schedule available</Text>
          )}
        </View>

        {/* Teachers Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">Teachers</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() =>
                navigateTo(`/(module)/class/${id}/teachers`)
              }
            >
              <Text className="text-secondary-100 font-semibold text-sm">Manage</Text>
              <Ionicons name="chevron-forward" size={16} color="#4C37EE" />
            </TouchableOpacity>
          </View>

          {classDetails.Teacher?.length > 0 ? (
            classDetails.Teacher.map((teacher, index) => (
              <View key={index} className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <View>
                  <Text className="text-base font-medium">
                    {teacher.userId?.name || "Unknown Teacher"}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {teacher.employeeId || "No ID"}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-400 italic text-center py-3">No teachers assigned</Text>
          )}
        </View>

        {/* Students Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">Students</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() =>
                navigateTo(`/(module)/class/${id}/students`)
              }
            >
              <Text className="text-secondary-100 font-semibold text-sm">Add Students</Text>
              <Ionicons name="chevron-forward" size={16} color="#4C37EE" />
            </TouchableOpacity>
          </View>

          {classDetails.students?.length > 0 ? (
            classDetails.students.map((student, index) => (
              <View
                key={typeof student === "object" ? student._id : student}
                className="flex-row justify-between items-center py-3 border-b border-gray-100"
              >
                <View>
                  <Text className="text-base font-medium">
                    {typeof student === "object"
                      ? student.name ||
                        student.userId?.name ||
                        "Unnamed Student"
                      : `Student ID: ${student}`}
                  </Text>

                  {typeof student === "object" &&
                    (student.studentId || student.userId?.studentId) && (
                      <Text className="text-sm text-gray-500 mt-0.5">
                        Roll/Admission Id:{" "}
                        {student.studentId || student.userId?.studentId}
                      </Text>
                    )}
                </View>
                <TouchableOpacity
                  className="p-1"
                  onPress={() =>
                    handleRemoveStudent(
                      typeof student === "object" ? student._id : student
                    )
                  }
                  disabled={isRemoving}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color="#de3730"
                  />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-400 italic text-center py-3">No students enrolled</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ClassDetailScreen;