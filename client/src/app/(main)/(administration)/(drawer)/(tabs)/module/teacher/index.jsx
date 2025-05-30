import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetAllTeachersQuery, useDeleteTeacherMutation } from '@/src/redux/services/auth';

const TeacherListScreen = () => {
  const router = useRouter();
  const { data: teachers, isLoading, refetch } = useGetAllTeachersQuery();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();
  
  const handleAddTeacher = () => {
    router.push('/(administration)/(drawer)/(tabs)/module/teacher/create');
  };
  
  const handleViewTeacher = (teacherId) => {
    router.push(`/(administration)/(drawer)/(tabs)/module/teacher/${teacherId}`);
  };
  
  const handleEditTeacher = (teacherId) => {
    router.push(`/(administration)/(drawer)/(tabs)/module/teacher/edit/${teacherId}`);
  };
  
  const handleDeleteTeacher = async (teacherId) => {
    Alert.alert(
      "Delete Teacher",
      "Are you sure you want to delete this teacher?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTeacher(teacherId).unwrap();
              refetch();
              Alert.alert("Success", "Teacher deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete teacher");
              console.error(error);
            }
          }
        }
      ]
    );
  };
  
  const renderTeacherItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => handleViewTeacher(item._id)}
      >
        <View>
          
          <Text style={styles.name}>{item.userId.name}</Text>
          <Text style={styles.details}>ID: {item.employeeId}</Text>
          <Text style={styles.details}>Qualification: {item.qualification}</Text>
          <Text style={styles.details}>Designation: {item.designation}</Text>
          {/* <Text style={styles.details}>
            Subjects: {item.subjects.map(subject => subject.name).join(', ')}
          </Text> */}
        </View>
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => handleEditTeacher(item._id)}
        >
          <Ionicons name="pencil" size={20} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => handleDeleteTeacher(item._id)}
        >
          <Ionicons name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teachers</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTeacher}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Teacher</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={teachers?.data || []}
        renderItem={renderTeacherItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No teachers found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  details: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 8,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
});

export default TeacherListScreen;