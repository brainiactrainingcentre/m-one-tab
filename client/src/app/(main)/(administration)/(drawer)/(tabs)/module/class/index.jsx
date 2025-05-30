import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetClassesQuery } from '@/src/redux/services/auth';

const ClassListScreen = () => {
  const { data: classes, isLoading, error, refetch } = useGetClassesQuery();

  const renderClassItem = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-2xl shadow-md p-4 mb-4 flex-row justify-between items-center"
      onPress={() => router.push(`/(administration)/(drawer)/(tabs)/module/class/${item._id}`)}
    >
      <View>
        <Text className="text-lg font-bold">{item.name} - {item.section}</Text>
        <Text className="text-gray-500 text-sm">{item.academicYear}</Text>
        <Text className="text-gray-500 text-sm">Subjects: {item.subjects?.length || 0}</Text>
        <Text className="text-gray-500 text-sm">Students: {item.students?.length || 0}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#4a90e2" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Classes</Text>
        <TouchableOpacity 
          className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.push('/(administration)/(drawer)/(tabs)/module/class/create')}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text className="text-white font-semibold ml-2">Add Class</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#4a90e2" className="mt-10" />
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-lg">Failed to load classes.</Text>
          <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg mt-4" onPress={refetch}>
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : classes?.data?.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="school-outline" size={64} color="#ccc" />
          <Text className="text-gray-600 text-lg mt-4">No classes found</Text>
        </View>
      ) : (
        <FlatList
          data={classes.data}
          renderItem={renderClassItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </View>
  );
};

export default ClassListScreen;
