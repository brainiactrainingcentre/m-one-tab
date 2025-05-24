// app/students/index.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useGetAllStudentsQuery, useDeleteStudentMutation } from '@/src/redux/services/auth';

const StudentListScreen = () => {
  const { data, isLoading, isError, refetch } = useGetAllStudentsQuery();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (data?.data) {
      setStudents(Array.isArray(data.data) ? data.data : []);
    }
  }, [data]);

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Student",
      "Are you sure you want to delete this student?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteStudent(id);
              refetch();
            } catch (error) {
              Alert.alert("Error", "Failed to delete student");
            }
          }
        }
      ]
    );
  };

  const filteredStudents = students.filter(student => 
    student?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow">
      <View className="mb-3">
        <Text className="text-lg font-bold mb-1">{item.userId?.name || 'Unknown'}</Text>
        <Text className="text-gray-600">Roll No: {item.studentId || 'N/A'}</Text>
        <Text className="text-gray-600">Class: {item.classId?.name || 'N/A'}</Text>
        <Text className="text-gray-600">Contact: {item.contactNumber || 'N/A'}</Text>
      </View>
      <View className="flex-row justify-end">
        <TouchableOpacity 
          className="bg-blue-500 py-1.5 px-3 rounded mr-2"
          onPress={() => router.push(`/(administration)/(drawer)/(tabs)/module/students/${item._id}`)}
        >
          <Text className="text-white font-medium text-xs">View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-yellow-500 py-1.5 px-3 rounded mr-2"
          onPress={() => router.push(`/(administration)/(drawer)/(tabs)/module/students/edit/${item._id}`)}
        >
          <Text className="text-white font-medium text-xs">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-red-500 py-1.5 px-3 rounded"
          onPress={() => handleDelete(item._id)}
          disabled={isDeleting}
        >
          <Text className="text-white font-medium text-xs">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
        <Text className="mt-3 text-base">Loading students...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-base text-red-600 mb-4">Error loading students</Text>
        <TouchableOpacity 
          className="bg-blue-500 py-2 px-4 rounded"
          onPress={refetch}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Student List</Text>
        <TouchableOpacity 
          className="bg-blue-500 py-2 px-4 rounded"
          onPress={() => router.push('/(administration)/(drawer)/(tabs)/module/students/create')}
        >
          <Text className="text-white font-semibold"> + Add Student</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="bg-white p-3 rounded-lg mb-4 border border-gray-300"
        placeholder="Search by name or roll number"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {filteredStudents.length > 0 ? (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-gray-600">No students found</Text>
        </View>
      )}
    </View>
  );
};

export default StudentListScreen;
