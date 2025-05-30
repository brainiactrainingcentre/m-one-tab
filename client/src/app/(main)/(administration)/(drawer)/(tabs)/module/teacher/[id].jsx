import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetTeacherQuery, useGetTeacherClassesQuery, useGetTeacherSubjectsQuery, useDeleteTeacherMutation } from '@/src/redux/services/auth';

const TeacherDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const { data: teacher, isLoading: isLoadingTeacher } = useGetTeacherQuery(id);
  const { data: classes, isLoading: isLoadingClasses } = useGetTeacherClassesQuery(id);
  const { data: subjects, isLoading: isLoadingSubjects } = useGetTeacherSubjectsQuery(id);
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();
  
  const handleEdit = () => {
    router.push(`/(administration)/(drawer)/(tabs)/module/teacher/edit/${id}`);
  };
  
  const handleDelete = () => {
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
              await deleteTeacher(id).unwrap();
              Alert.alert("Success", "Teacher deleted successfully");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete teacher");
              console.error(error);
            }
          }
        }
      ]
    );
  };
  
  const handleBack = () => {
    router.back();
  };
  
  if (isLoadingTeacher || isLoadingClasses || isLoadingSubjects) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  // Keep the same data access pattern that's working in your current code
  const teacherData = teacher?.data;
  
  if (!teacherData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Teacher not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Format dates helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teacher Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
            <Ionicons name="pencil" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
            <Ionicons name="trash" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>
              {teacherData.title ? `${teacherData.title} ` : ''}{teacherData.userId.name}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Employee ID:</Text>
            <Text style={styles.infoValue}>{teacherData.employeeId}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{teacherData.userId.email}</Text>
          </View>
          {teacherData.gender && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>
                {teacherData.gender.charAt(0).toUpperCase() + teacherData.gender.slice(1)}
              </Text>
            </View>
          )}
          {teacherData.dateOfBirth && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date of Birth:</Text>
              <Text style={styles.infoValue}>{formatDate(teacherData.dateOfBirth)}</Text>
            </View>
          )}
          {teacherData.fatherName && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Father's Name:</Text>
              <Text style={styles.infoValue}>{teacherData.fatherName}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Qualification:</Text>
            <Text style={styles.infoValue}>{teacherData.qualification}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Contact:</Text>
            <Text style={styles.infoValue}>{teacherData.contactNumber}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{teacherData.address}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Joining Date:</Text>
            <Text style={styles.infoValue}>{formatDate(teacherData.joiningDate)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Salary:</Text>
            <Text style={styles.infoValue}>₹{teacherData.salary}</Text>
          </View>
          {teacherData.maritalStatus && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Marital Status:</Text>
              <Text style={styles.infoValue}>{teacherData.maritalStatus}</Text>
            </View>
          )}
          {teacherData.spouseName && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Spouse Name:</Text>
              <Text style={styles.infoValue}>{teacherData.spouseName}</Text>
            </View>
          )}
          {teacherData.spouseContactNumber && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Spouse Contact:</Text>
              <Text style={styles.infoValue}>{teacherData.spouseContactNumber}</Text>
            </View>
          )}
        </View>
        
        {/* Professional Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          {teacherData.designation && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Designation:</Text>
              <Text style={styles.infoValue}>{teacherData.designation}</Text>
            </View>
          )}
          {teacherData.department && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Department:</Text>
              <Text style={styles.infoValue}>{teacherData.department}</Text>
            </View>
          )}
          {teacherData.staffType && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Staff Type:</Text>
              <Text style={styles.infoValue}>{teacherData.staffType}</Text>
            </View>
          )}
          {teacherData.professionType && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Profession Type:</Text>
              <Text style={styles.infoValue}>{teacherData.professionType}</Text>
            </View>
          )}
          {teacherData.retireDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Retirement Date:</Text>
              <Text style={styles.infoValue}>{formatDate(teacherData.retireDate)}</Text>
            </View>
          )}
        </View>
        
        {/* Banking & ID Information Section */}
        {(teacherData.aadharNumber || teacherData.panNumber || teacherData.bankName || 
         teacherData.accountNumber || teacherData.ifscCode) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Banking & ID Information</Text>
            {teacherData.aadharNumber && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Aadhar Number:</Text>
                <Text style={styles.infoValue}>{teacherData.aadharNumber}</Text>
              </View>
            )}
            {teacherData.panNumber && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>PAN Number:</Text>
                <Text style={styles.infoValue}>{teacherData.panNumber}</Text>
              </View>
            )}
            {teacherData.bankName && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Bank Name:</Text>
                <Text style={styles.infoValue}>{teacherData.bankName}</Text>
              </View>
            )}
            {teacherData.accountNumber && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Account Number:</Text>
                <Text style={styles.infoValue}>{teacherData.accountNumber}</Text>
              </View>
            )}
            {teacherData.ifscCode && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>IFSC Code:</Text>
                <Text style={styles.infoValue}>{teacherData.ifscCode}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Subjects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subjects</Text>
          {teacherData.subjects && teacherData.subjects.length > 0 ? (
            teacherData.subjects.map(subject => (
              <View key={subject._id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{subject.name}</Text>
                <Text style={styles.listItemSubtitle}>Code: {subject.code}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No subjects assigned</Text>
          )}
        </View>
        
        {/* Classes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classes</Text>
          {teacherData.classes && teacherData.classes.length > 0 ? (
            teacherData.classes.map(classItem => (
              <View key={classItem._id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{classItem.name}</Text>
                <Text style={styles.listItemSubtitle}>Class ID: {classItem.classId}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No classes assigned</Text>
          )}
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
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
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#1976D2',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  listItemDescription: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    padding: 16,
  },
});

export default TeacherDetailScreen;