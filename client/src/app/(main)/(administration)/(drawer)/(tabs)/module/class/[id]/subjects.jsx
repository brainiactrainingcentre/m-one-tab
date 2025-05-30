import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetClassByIdQuery, useUpdateClassSubjectsMutation, useDeleteClassSubjectsMutation } from '@/src/redux/services/auth';
import { useGetSubjectsQuery } from '@/src/redux/services/auth';
import { Button, Card, Checkbox, List, Searchbar } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';


const ClassSubjectsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  
  const { data: classData, isLoading: isClassLoading } = useGetClassByIdQuery(id);
  const { data: subjectsData, isLoading: isSubjectsLoading } = useGetSubjectsQuery();
  const [updateClassSubjects, { isLoading: isUpdating }] = useUpdateClassSubjectsMutation();
  const [deleteClassSubjects, { isLoading: isDeleting }] = useDeleteClassSubjectsMutation();

  useEffect(() => {
    if (classData?.data?.subjects && subjectsData) {
      // Get IDs of subjects already in the class
      const classSubjectIds = classData.data.subjects.map(subject => subject._id);
      setSelectedSubjects(classSubjectIds);
      
      // Filter subjects not yet in the class
      const notInClassSubjects = subjectsData.filter(
        subject => !classSubjectIds.includes(subject._id)
      );
      setAvailableSubjects(notInClassSubjects);
    }
  }, [classData, subjectsData]);

  const filteredAvailableSubjects = availableSubjects.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSubject = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const handleAddSubjects = async () => {
    try {
      // Get new subjects to add (those in selectedSubjects but not in class)
      const classSubjectIds = classData.data.subjects.map(subject => subject._id);
      const newSubjectIds = selectedSubjects.filter(id => !classSubjectIds.includes(id));
      
      if (newSubjectIds.length === 0) {
        Alert.alert('No Changes', 'No new subjects selected to add.');
        return;
      }
      
      // FIXED: Changed from subjects to subjectIds to match API endpoint
      await updateClassSubjects({ id, subjectIds: newSubjectIds }).unwrap();
      
      Alert.alert('Subjects Added', 'Subjects have been added to the class successfully.');
      
      // Refetch class data
      router.replace(`(administration)/(drawer)/(tabs)/module/class/${id}`);
    } catch (error) {
      console.error('Add subjects error:', error);
      Alert.alert('Failed to Add Subjects', error.message || 'An error occurred while adding subjects.');
    }
  };

  const handleRemoveSubjects = async (subjectId) => {
    try {
      console.log('Removing subject:', subjectId);
      // FIXED: Make sure we're passing the subjectIds property correctly
      const result = await deleteClassSubjects({ 
        id, 
        subjectIds: [subjectId] 
      }).unwrap();
      
      console.log('Delete result:', result);
      
      Toast.show({
        type: 'success',
        text1: 'Subject Removed',
        text2: 'Subject has been removed from the class.'
      });
      
      // Refetch class data
      router.replace(`/classes/${id}/subjects`);
    } catch (error) {
      console.error('Delete error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Remove Subject',
        text2: error.message || 'An error occurred while removing the subject.'
      });
    }
  };

  if (isClassLoading || isSubjectsLoading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Class Subjects</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Subjects */}
        <Card style={styles.card}>
          <Card.Title title="Current Subjects" />
          <Card.Content>
            {classData?.data?.subjects.length === 0 ? (
              <Text style={styles.emptyText}>No subjects assigned to this class yet.</Text>
            ) : (
              classData?.data?.subjects.map((subject) => (
                <List.Item
                  key={subject._id}
                  title={subject.name}
                  description={`Code: ${subject.code}`}
                  right={(props) => (
                    <TouchableOpacity 
                      onPress={() => handleRemoveSubjects(subject._id)}
                      disabled={isDeleting}
                    >
                      <List.Icon {...props} icon="delete" color="#ff6961" />
                    </TouchableOpacity>
                  )}
                  style={styles.listItem}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* Add Subjects */}
        <Card style={styles.card}>
          <Card.Title title="Add Subjects" />
          <Card.Content>
            <Searchbar
              placeholder="Search subjects"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />

            {filteredAvailableSubjects.length === 0 ? (
              <Text style={styles.emptyText}>No subjects available to add.</Text>
            ) : (
              filteredAvailableSubjects.map((subject) => (
                <List.Item
                  key={subject._id}
                  title={subject.name}
                  description={`Code: ${subject.code}`}
                  onPress={() => handleSelectSubject(subject._id)}
                  left={() => (
                    <Checkbox
                      status={selectedSubjects.includes(subject._id) ? 'checked' : 'unchecked'}
                      onPress={() => handleSelectSubject(subject._id)}
                    />
                  )}
                  style={styles.listItem}
                />
              ))
            )}

            <Button
              mode="contained"
              onPress={handleAddSubjects}
              loading={isUpdating}
              disabled={isUpdating || selectedSubjects.length === 0}
              style={styles.addButton}
            >
              Add Selected Subjects
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007bff',
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  addButton: {
    marginTop: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ClassSubjectsScreen;