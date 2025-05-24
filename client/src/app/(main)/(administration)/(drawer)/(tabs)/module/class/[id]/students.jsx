import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useGetStudentsByClassQuery,
  useGetAllStudentsQuery,
  useAddStudentToClassMutation,
  useRemoveStudentFromClassMutation,
} from '@/src/redux/services/auth';
import { Button, Card, Checkbox, Searchbar } from 'react-native-paper';
import Toast from 'react-native-toast-message';

const ClassStudentsScreen = () => {
  const { id: classId } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const { data: classData, isLoading: isClassLoading, refetch: refetchClassData } = useGetStudentsByClassQuery(classId);
  const { data: studentsData, isLoading: isStudentsLoading } = useGetAllStudentsQuery();
  const [addStudentToClass, { isLoading: isAdding }] = useAddStudentToClassMutation();
  const [removeStudentFromClass, { isLoading: isRemoving }] = useRemoveStudentFromClassMutation();

  // Safe fallback for class students and all students
  const classStudents = Array.isArray(classData?.data?.students) ? classData.data.students : [];
  const allStudents = Array.isArray(studentsData?.data) ? studentsData.data : [];

  // Get students not yet in the class
  const getAvailableStudents = () => {
    const classStudentIds = classStudents.map((student) => student?._id || '');
    return allStudents.filter((student) => student?._id && !classStudentIds.includes(student._id));
  };

  const filteredAvailableStudents = getAvailableStudents().filter((student) => {
    // Safety checks for name and rollNumber properties
    const studentName = student?.name || '';
    const rollNumber = student?.rollNumber || '';
    
    return studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectStudent = (studentId) => {
    if (!studentId) return;
    
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  useEffect(() => {
    // Reset selected students when available students change
    setSelectedStudents([]);
  }, [classData, studentsData]);

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) return;

    try {
      const promises = selectedStudents.map((studentId) =>
        addStudentToClass({ classId, studentId }).unwrap()
      );
      await Promise.all(promises);

      Toast.show({
        type: 'success',
        text1: 'Students Added',
        text2: 'Students have been added to the class successfully.',
      });

      setSelectedStudents([]);
      // Refetch instead of navigation to update the UI
      refetchClassData();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Add Students',
        text2: error?.data?.message || error?.message || 'An error occurred while adding students.',
      });
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!studentId) return;
    
    try {
      await removeStudentFromClass({ classId, studentId }).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Student Removed',
        text2: 'Student has been removed from the class.',
      });

      // Refetch instead of navigation to update the UI
      refetchClassData();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Remove Student',
        text2: error?.data?.message || error?.message || 'An error occurred while removing the student.',
      });
    }
  };

  if (isClassLoading || isStudentsLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-base text-blue-500 mr-4">← Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Manage Class Students</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Current Students */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">Current Students</Text>
            <Text className="text-gray-500 text-sm">Total: {classStudents.length}</Text>
          </View>

          {classStudents.length > 0 ? (
            classStudents.map((student) => {
              // Skip rendering if student object is invalid
              if (!student || !student._id) return null;
              
              return (
                <View
                  key={student._id}
                  className="flex-row justify-between items-center py-3 border-b border-gray-100"
                >
                  <View>
                    <Text className="text-base font-medium">
                      {student.name || student.userId?.name || "Unnamed Student"}
                    </Text>
                    {(student.rollNumber || student.studentId || student.userId?.studentId) && (
                      <Text className="text-sm text-gray-500 mt-0.5">
                        Roll/Admission Id: {student.rollNumber || student.studentId || student.userId?.studentId || "N/A"}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    className="p-1"
                    onPress={() => handleRemoveStudent(student._id)}
                    disabled={isRemoving}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={22}
                      color="#de3730"
                    />
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text className="text-sm text-gray-400 italic text-center py-3">No students enrolled</Text>
          )}
        </View>

        {/* Add Students */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">Add Students</Text>
          </View>

          <Searchbar
            placeholder="Search students by name or roll number"
            onChangeText={(text) => setSearchQuery(text || '')}
            value={searchQuery}
            className="mb-4 rounded-lg"
          />

          {filteredAvailableStudents.length === 0 ? (
            <Text className="text-sm text-gray-400 italic text-center py-3">
              {searchQuery.length > 0 
                ? "No matching students found. Try another search term."
                : "No students available to add."}
            </Text>
          ) : (
            <View className="mb-4">
              {filteredAvailableStudents.map((student) => {
                // Skip rendering if student object is invalid
                if (!student || !student._id) return null;
                
                return (
                  <TouchableOpacity
                    key={student._id}
                    onPress={() => handleSelectStudent(student._id)}
                    className={`flex-row justify-between items-center py-3 border-b border-gray-100 ${
                      selectedStudents.includes(student._id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Checkbox
                        status={selectedStudents.includes(student._id) ? 'checked' : 'unchecked'}
                        onPress={() => handleSelectStudent(student._id)}
                      />
                      <View className="ml-2">
                        <Text className="text-base font-medium">
                          {student.name || student.userId?.name || "Unnamed Student"}
                        </Text>
                        {(student.rollNumber || student.studentId || student.userId?.studentId) && (
                          <Text className="text-sm text-gray-500 mt-0.5">
                            Roll/Admission Id: {student.rollNumber || student.studentId || student.userId?.studentId || "N/A"}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleAddStudents}
            loading={isAdding}
            disabled={isAdding || selectedStudents.length === 0}
            className="mt-2"
          >
            Add Selected Students ({selectedStudents.length})
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default ClassStudentsScreen;