import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGetStudentQuery, useUpdateStudentMutation } from '@/src/redux/services/auth';
import { router } from 'expo-router';
import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import DropdownField from "@/src/components/atoms/DropdownField";
import DateField from "@/src/components/atoms/DateField";

export default function EditStudentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  
  const { 
    data: studentData, 
    isLoading: isLoadingStudent, 
    isError: isStudentError 
  } = useGetStudentQuery(id);
  
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  
  // Form state
  const [formData, setFormData] = useState({
    // User info
    name: '',
    email: '',
    
    // Student ID info
    studentId: '',
    rollNumber: '',
    
    // Personal info
    dateOfBirth: new Date(),
    gender: '',
    bloodGroup: '',
    address: '',
    contactNumber: '',
    religion: '',
    caste: '',
    socialCategory: '',
    minorityStatus: false,
    hasDisability: false,
    disabilityDetails: '',
    rteAdmission: false,
    
    // Educational info
    previousSchoolName: '',
    previousClassPassed: '',
    previousClassMarks: '',
    admissionClass: '',
    
    // Class info
    classId: null,
    section: '',
    academicYear: '',
    
    // Guardian info
    parentId: null,
    guardianContact: '',
    
    // Logistics
    modeOfTransport: '',
    medicalIssues: '',
    admissionDate: new Date(),
  });
  
  const [errors, setErrors] = useState({});

  // Form options for dropdowns
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];
  
  const religionOptions = [
    { label: 'Hindu', value: 'hindu' },
    { label: 'Muslim', value: 'muslim' },
    { label: 'Christian', value: 'christian' },
    { label: 'Sikh', value: 'sikh' },
    { label: 'Buddhist', value: 'buddhist' },
    { label: 'Jain', value: 'jain' },
    { label: 'Other', value: 'other' }
  ];
  
  const socialCategoryOptions = [
    { label: 'General', value: 'general' },
    { label: 'OBC', value: 'obc' },
    { label: 'SC', value: 'sc' },
    { label: 'ST', value: 'st' }
  ];
  
  const transportOptions = [
    { label: 'School Van', value: 'school_van' },
    { label: 'Self Arrangement', value: 'self_arrangement' },
    { label: 'Public Transport', value: 'public_transport' },
    { label: 'Walking', value: 'walking' }
  ];

  // Load student data when available
  useEffect(() => {
    if (studentData?.data) {
      const student = studentData.data;
      setFormData({
        name: student.userId?.name || '',
        email: student.userId?.email || '',
        studentId: student.studentId || '',
        rollNumber: student.rollNumber || '',
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : new Date(),
        gender: student.gender || '',
        bloodGroup: student.bloodGroup || '',
        address: student.address || '',
        contactNumber: student.contactNumber || '',
        religion: student.religion || '',
        caste: student.caste || '',
        socialCategory: student.socialCategory || '',
        minorityStatus: student.minorityStatus || false,
        hasDisability: student.hasDisability || false,
        disabilityDetails: student.disabilityDetails || '',
        rteAdmission: student.rteAdmission || false,
        previousSchoolName: student.previousSchoolName || '',
        previousClassPassed: student.previousClassPassed || '',
        previousClassMarks: student.previousClassMarks || '',
        admissionClass: student.admissionClass || '',
        classId: student.classId || null,
        section: student.section || '',
        academicYear: student.academicYear || '',
        parentId: student.parentId || null,
        guardianContact: student.guardianContact || '',
        modeOfTransport: student.modeOfTransport || '',
        medicalIssues: student.medicalIssues || '',
        admissionDate: student.admissionDate ? new Date(student.admissionDate) : new Date(),
      });
    }
  }, [studentData]);
  
  // Prepare data for API submission
  const prepareDataForSubmission = () => {
    // Create a copy of formData
    const dataToSubmit = { ...formData };
    
    // Convert empty strings for ObjectId fields to null to prevent MongoDB errors
    if (!dataToSubmit.classId) dataToSubmit.classId = null;
    if (!dataToSubmit.parentId) dataToSubmit.parentId = null;
    
    // Ensure numeric fields are numbers
    if (dataToSubmit.previousClassMarks) {
      dataToSubmit.previousClassMarks = Number(dataToSubmit.previousClassMarks);
    }
    
    return dataToSubmit;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.studentId) newErrors.studentId = 'Student ID is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Prepare data
      const dataToSubmit = prepareDataForSubmission();
      
      // Log what's being sent (for debugging)
      console.log('Submitting student data:', dataToSubmit);
      
      // Submit to API
      await updateStudent({ id, ...dataToSubmit }).unwrap();
      router.push(`/(administration)/(drawer)/(tabs)/module/students/${id}`);
      Alert.alert('Success', 'Student updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update student');
      console.error('Failed to update student:', error);
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  if (isLoadingStudent) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading student data...</Text>
      </View>
    );
  }
  
  if (isStudentError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading student data</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Student</Text>
      
      {/* User ID Information Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <InputField
          labelName="Student Name"
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
          placeholder="Enter student name"
          error={errors.name}
        />
        
        <InputField
          labelName="Email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        
        <InputField
          labelName="Student ID"
          value={formData.studentId}
          onChangeText={(value) => handleChange('studentId', value)}
          placeholder="Enter student ID"
          error={errors.studentId}
        />
        
        <InputField
          labelName="Roll Number"
          value={formData.rollNumber}
          onChangeText={(value) => handleChange('rollNumber', value)}
          placeholder="Enter roll number"
        />
      </View>
      
      {/* Personal Information Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <DateField
          labelName="Date of Birth"
          value={formData.dateOfBirth}
          onChange={(value) => handleChange('dateOfBirth', value)}
        />
        
        <DropdownField
          labelName="Gender"
          value={formData.gender}
          options={genderOptions}
          onValueChange={(value) => handleChange('gender', value)}
          placeholder="Select gender"
        />
        
        <InputField
          labelName="Blood Group"
          value={formData.bloodGroup}
          onChangeText={(value) => handleChange('bloodGroup', value)}
          placeholder="Enter blood group"
        />
        
        <InputField
          labelName="Contact Number"
          value={formData.contactNumber}
          onChangeText={(value) => handleChange('contactNumber', value)}
          placeholder="Enter contact number"
          keyboardType="phone-pad"
        />
        
        <InputField
          labelName="Guardian Contact"
          value={formData.guardianContact}
          onChangeText={(value) => handleChange('guardianContact', value)}
          placeholder="Enter guardian contact number"
          keyboardType="phone-pad"
        />
        
        <InputField
          labelName="Address"
          value={formData.address}
          onChangeText={(value) => handleChange('address', value)}
          placeholder="Enter address"
          multiline={true}
          numberOfLines={4}
        />
      </View>
      
      {/* Social and Category Information */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Social Information</Text>
        
        <DropdownField
          labelName="Religion"
          value={formData.religion}
          options={religionOptions}
          onValueChange={(value) => handleChange('religion', value)}
          placeholder="Select religion"
        />
        
        <InputField
          labelName="Caste"
          value={formData.caste}
          onChangeText={(value) => handleChange('caste', value)}
          placeholder="Enter caste"
        />
        
        <DropdownField
          labelName="Social Category"
          value={formData.socialCategory}
          options={socialCategoryOptions}
          onValueChange={(value) => handleChange('socialCategory', value)}
          placeholder="Select social category"
        />
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Minority Status</Text>
          <Switch
            value={formData.minorityStatus}
            onValueChange={(value) => handleChange('minorityStatus', value)}
          />
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Has Disability</Text>
          <Switch
            value={formData.hasDisability}
            onValueChange={(value) => handleChange('hasDisability', value)}
          />
        </View>
        
        {formData.hasDisability && (
          <InputField
          labelName="Disability Details"
            value={formData.disabilityDetails}
            onChangeText={(value) => handleChange('disabilityDetails', value)}
            placeholder="Enter disability details"
            multiline={true}
          />
        )}
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>RTE Admission</Text>
          <Switch
            value={formData.rteAdmission}
            onValueChange={(value) => handleChange('rteAdmission', value)}
          />
        </View>
      </View>
      
      {/* Educational Information */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Educational Information</Text>
        
        <InputField
          labelName="Previous School Name"
          value={formData.previousSchoolName}
          onChangeText={(value) => handleChange('previousSchoolName', value)}
          placeholder="Enter previous school name"
        />
        
        <InputField
          labelName="Previous Class Passed"
          value={formData.previousClassPassed}
          onChangeText={(value) => handleChange('previousClassPassed', value)}
          placeholder="Enter previous class passed"
        />
        
        <InputField
          labelName="Previous Class Marks"
          value={formData.previousClassMarks ? formData.previousClassMarks.toString() : ''}
          onChangeText={(value) => handleChange('previousClassMarks', value)}
          placeholder="Enter previous class marks"
          keyboardType="numeric"
        />
        
        <InputField
          labelName="Admission Class"
          value={formData.admissionClass}
          onChangeText={(value) => handleChange('admissionClass', value)}
          placeholder="Enter admission class"
        />
        
        <InputField
          labelName="Current Class ID"
          value={formData.classId || ''}
          onChangeText={(value) => handleChange('classId', value ? value : null)}
          placeholder="Enter current class ID (leave empty if none)"
        />
        
        <InputField
          labelName="Section"
          value={formData.section}
          onChangeText={(value) => handleChange('section', value)}
          placeholder="Enter section"
        />
        
        <InputField
          labelName="Academic Year"
          value={formData.academicYear}
          onChangeText={(value) => handleChange('academicYear', value)}
          placeholder="Enter academic year"
        />
      </View>
      
      {/* Logistics Information */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Logistics Information</Text>
        
        <DropdownField
          labelName="Mode of Transport"
          value={formData.modeOfTransport}
          options={transportOptions}
          onValueChange={(value) => handleChange('modeOfTransport', value)}
          placeholder="Select mode of transport"
        />
        
        <InputField
          labelName="Medical Issues"
          value={formData.medicalIssues}
          onChangeText={(value) => handleChange('medicalIssues', value)}
          placeholder="Enter medical issues if any"
          multiline={true}
        />
        
        <DateField
          labelName="Admission Date"
          value={formData.admissionDate}
          onChange={(value) => handleChange('admissionDate', value)}
        />
      </View>
      
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <MyButton
          title={isUpdating ? "Updating..." : "Update Student"}
          onPress={handleSubmit}
          disabled={isUpdating}
          primary
        />
        
        <MyButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          secondary
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#ff0000',
    marginTop: 4,
    fontSize: 14,
  },
});