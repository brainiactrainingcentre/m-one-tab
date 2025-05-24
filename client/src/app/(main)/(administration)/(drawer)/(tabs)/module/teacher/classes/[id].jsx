import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Checkbox, Button, Divider } from 'react-native-paper';
import { useGetTeacherQuery, useUpdateTeacherMutation } from '@/src/redux/services/auth';

const TeacherClassAssignment = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedClasses, setSelectedClasses] = useState([]);
  
  // API hooks
  const { data: teacherData, isLoading, error } = useGetTeacherQuery(id);
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  
  // Mock data for available classes (replace with actual API call)
  const [availableClasses, setAvailableClasses] = useState([
    { _id: '67e3cff2593000a77a720c07', name: 'Class 1A', section: 'A', grade: '1' },
    { _id: '67e414b703450b0090c1bd65', name: 'Class 1B', section: 'B', grade: '1' },
    { _id: '67e414b703450b0090c1bd66', name: 'Class 2A', section: 'A', grade: '2' },
    { _id: '67e414b703450b0090c1bd67', name: 'Class 2B', section: 'B', grade: '2' },
    { _id: '67e414b703450b0090c1bd68', name: 'Class 3A', section: 'A', grade: '3' },
  ]);

  useEffect(() => {
    if (teacherData && teacherData.data) {
      // Extract class IDs from teacher data
      setSelectedClasses(teacherData.data.classes || []);
    }
  }, [teacherData]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading teacher data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  const handleClassToggle = (classId) => {
    setSelectedClasses(prevSelected => 
      prevSelected.includes(classId)
        ? prevSelected.filter(id => id !== classId)
        : [...prevSelected, classId]
    );
  };

  const handleSave = async () => {
    try {
      // Create update payload
      const updateData = {
        id,
        classes: selectedClasses
      };
      
      await updateTeacher(updateData).unwrap();
      Alert.alert('Success', 'Class assignments updated successfully');
      router.back();
    } catch (err) {
      Alert.alert('Error', `Failed to update class assignments: ${err.message}`);
    }
  };

  const teacher = teacherData?.data;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Assign Classes</Text>
      
      <Card style={styles.teacherCard}>
        <Card.Content>
          <Text style={styles.teacherName}>{teacher?.userId?.name}</Text>
          <Text style={styles.teacherDetail}>ID: {teacher?.employeeId}</Text>
          <Text style={styles.teacherDetail}>Qualification: {teacher?.qualification}</Text>
        </Card.Content>
      </Card>
      
      <Text style={styles.sectionTitle}>Available Classes</Text>
      <View style={styles.classesList}>
        {availableClasses.map(classItem => (
          <View key={classItem._id} style={styles.classItem}>
            <View style={styles.classInfo}>
              <Text style={styles.className}>{classItem.name}</Text>
              <Text style={styles.classDetail}>Grade: {classItem.grade}, Section: {classItem.section}</Text>
            </View>
            <Checkbox
              status={selectedClasses.includes(classItem._id) ? 'checked' : 'unchecked'}
              onPress={() => handleClassToggle(classItem._id)}
            />
          </View>
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={() => router.back()}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSave}
          loading={isUpdating}
          disabled={isUpdating}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Save Assignments
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  teacherCard: {
    marginBottom: 24,
    borderRadius: 8,
    elevation: 3,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  teacherDetail: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  classesList: {
    marginBottom: 24,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  classDetail: {
    fontSize: 14,
    color: '#757575',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  button: {
    flex: 0.48,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
});

export default TeacherClassAssignment;