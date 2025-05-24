import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Checkbox, Button, Divider } from 'react-native-paper';
import { useGetTeacherQuery, useUpdateTeacherMutation } from '@/src/redux/services/auth';

const TeacherSubjectAssignment = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  
  // API hooks
  const { data: teacherData, isLoading, error } = useGetTeacherQuery(id);
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  
  // Mock data for available subjects (replace with actual API call)
  const [availableSubjects, setAvailableSubjects] = useState([
    { _id: '67e42a556feb028f219b09a6', name: 'Mathematics', code: 'MAT1A' },
    { _id: '67e42a556feb028f219b09ac', name: 'Mathematics', code: 'MAT1B' },
    { _id: '67e42a556feb028f219b09ad', name: 'English', code: 'ENG1A' },
    { _id: '67e42a556feb028f219b09ae', name: 'Science', code: 'SCI1A' },
    { _id: '67e42a556feb028f219b09af', name: 'History', code: 'HIS1A' },
  ]);

  useEffect(() => {
    if (teacherData && teacherData.data) {
      // Extract subject IDs from teacher data
      const subjectIds = teacherData.data.subjects.map(subject => subject._id);
      setSelectedSubjects(subjectIds);
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

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prevSelected => 
      prevSelected.includes(subjectId)
        ? prevSelected.filter(id => id !== subjectId)
        : [...prevSelected, subjectId]
    );
  };

  const handleSave = async () => {
    try {
      // Create update payload
      const updateData = {
        id,
        subjects: selectedSubjects
      };
      
      await updateTeacher(updateData).unwrap();
      Alert.alert('Success', 'Subject assignments updated successfully');
      router.back();
    } catch (err) {
      Alert.alert('Error', `Failed to update subject assignments: ${err.message}`);
    }
  };

  const teacher = teacherData?.data;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Assign Subjects</Text>
      
      <Card style={styles.teacherCard}>
        <Card.Content>
          <Text style={styles.teacherName}>{teacher?.userId?.name}</Text>
          <Text style={styles.teacherDetail}>ID: {teacher?.employeeId}</Text>
          <Text style={styles.teacherDetail}>Qualification: {teacher?.qualification}</Text>
        </Card.Content>
      </Card>
      
      <Text style={styles.sectionTitle}>Available Subjects</Text>
      <View style={styles.subjectsList}>
        {availableSubjects.map(subject => (
          <View key={subject._id} style={styles.subjectItem}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectCode}>Code: {subject.code}</Text>
            </View>
            <Checkbox
              status={selectedSubjects.includes(subject._id) ? 'checked' : 'unchecked'}
              onPress={() => handleSubjectToggle(subject._id)}
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
  subjectsList: {
    marginBottom: 24,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subjectCode: {
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

export default TeacherSubjectAssignment;