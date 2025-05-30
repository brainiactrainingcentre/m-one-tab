import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGetStudentQuery, useUpdateStudentMutation } from '@/src/redux/services/auth';
import { router } from 'expo-router';
import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import DropdownField from "@/src/components/atoms/DropdownField";
import DateField from "@/src/components/atoms/DateField";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

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
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    personal: true,
    social: true,
    educational: true,
    logistics: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
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

  // Section header component
  const SectionHeader = ({ title, icon }) => (
    <View className="flex-row items-center mb-3 mt-1 border-b border-gray-200 pb-2">
      <MaterialIcons name={icon} size={24} color="#3b82f6" />
      <Text className="text-lg font-bold ml-2 text-blue-600">
        {title}
      </Text>
    </View>
  );

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
      router.push(`/(module)/students/${id}`);
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
      <View className="flex-1 justify-center items-center p-5">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-base text-gray-600">Loading student data...</Text>
      </View>
    );
  }
  
  if (isStudentError) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-base text-red-600">Error loading student data</Text>
        <TouchableOpacity 
          className="mt-6 bg-blue-600 py-3 px-6 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView className="bg-gray-50 flex-1">
      <ScrollView>
        <View className="px-4 py-6 bg-white shadow-sm mb-4">
          <Text className="text-center text-3xl font-bold text-blue-700">
            Edit Student
          </Text>
          <Text className="text-center text-gray-500 mt-1">
            Update student information and details
          </Text>
        </View>

        <View className="px-4 pb-10">
          {/* Basic Information Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('basic')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Basic Information" icon="person" />
              <MaterialIcons 
                name={expandedSections.basic ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#3b82f6" 
              />
            </TouchableOpacity>
            
            {expandedSections.basic && (
              <View className="mt-2">
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      labelName="Student Name"
                      value={formData.name}
                      onChangeText={(value) => handleChange('name', value)}
                      placeholder="Enter student name"
                      error={errors.name}
                      style={{ color: "black" }}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      labelName="Email"
                      value={formData.email}
                      onChangeText={(value) => handleChange('email', value)}
                      placeholder="Enter email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={errors.email}
                      style={{ color: "black" }}
                    />
                  </View>
                </View>
                
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      labelName="Student ID"
                      value={formData.studentId}
                      onChangeText={(value) => handleChange('studentId', value)}
                      placeholder="Enter student ID"
                      error={errors.studentId}
                      style={{ color: "black" }}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      labelName="Roll Number"
                      value={formData.rollNumber}
                      onChangeText={(value) => handleChange('rollNumber', value)}
                      placeholder="Enter roll number"
                      style={{ color: "black" }}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Personal Information Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('personal')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Personal Information" icon="face" />
              <MaterialIcons 
                name={expandedSections.personal ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#3b82f6" 
              />
            </TouchableOpacity>
            
            {expandedSections.personal && (
              <View className="mt-2">
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <DateField
                      labelName="Date of Birth"
                      value={formData.dateOfBirth}
                      onChange={(value) => handleChange('dateOfBirth', value)}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <DropdownField
                      labelName="Gender"
                      value={formData.gender}
                      options={genderOptions}
                      onValueChange={(value) => handleChange('gender', value)}
                      placeholder="Select gender"
                    />
                  </View>
                </View>
                
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      labelName="Blood Group"
                      value={formData.bloodGroup}
                      onChangeText={(value) => handleChange('bloodGroup', value)}
                      placeholder="Enter blood group"
                      style={{ color: "black" }}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      labelName="Contact Number"
                      value={formData.contactNumber}
                      onChangeText={(value) => handleChange('contactNumber', value)}
                      placeholder="Enter contact number"
                      keyboardType="phone-pad"
                      style={{ color: "black" }}
                    />
                  </View>
                </View>
                
                <InputField
                  labelName="Guardian Contact"
                  value={formData.guardianContact}
                  onChangeText={(value) => handleChange('guardianContact', value)}
                  placeholder="Enter guardian contact number"
                  keyboardType="phone-pad"
                  style={{ color: "black" }}
                />
                
                <InputField
                  labelName="Address"
                  value={formData.address}
                  onChangeText={(value) => handleChange('address', value)}
                  placeholder="Enter address"
                  multiline={true}
                  numberOfLines={3}
                  style={{ color: "black" }}
                />
              </View>
            )}
          </View>

          {/* Social Information Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('social')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Social Information" icon="groups" />
              <MaterialIcons 
                name={expandedSections.social ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#3b82f6" 
              />
            </TouchableOpacity>
            
            {expandedSections.social && (
              <View className="mt-2">
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <DropdownField
                      labelName="Religion"
                      value={formData.religion}
                      options={religionOptions}
                      onValueChange={(value) => handleChange('religion', value)}
                      placeholder="Select religion"
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      labelName="Caste"
                      value={formData.caste}
                      onChangeText={(value) => handleChange('caste', value)}
                      placeholder="Enter caste"
                      style={{ color: "black" }}
                    />
                  </View>
                </View>
                
                <DropdownField
                  labelName="Social Category"
                  value={formData.socialCategory}
                  options={socialCategoryOptions}
                  onValueChange={(value) => handleChange('socialCategory', value)}
                  placeholder="Select social category"
                />
                
                <View className="flex-row justify-between items-center mt-3 mb-3 border-b border-gray-100 pb-3">
                  <Text className="font-medium text-gray-700">Minority Status</Text>
                  <TouchableOpacity
                    onPress={() => handleChange('minorityStatus', !formData.minorityStatus)}
                    className={`py-2 px-3 rounded-lg ${formData.minorityStatus ? 'bg-blue-100' : 'bg-gray-100'}`}
                  >
                    <Text className={`${formData.minorityStatus ? 'text-blue-700' : 'text-gray-600'}`}>
                      {formData.minorityStatus ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row justify-between items-center mb-3 border-b border-gray-100 pb-3">
                  <Text className="font-medium text-gray-700">Has Disability</Text>
                  <TouchableOpacity
                    onPress={() => handleChange('hasDisability', !formData.hasDisability)}
                    className={`py-2 px-3 rounded-lg ${formData.hasDisability ? 'bg-blue-100' : 'bg-gray-100'}`}
                  >
                    <Text className={`${formData.hasDisability ? 'text-blue-700' : 'text-gray-600'}`}>
                      {formData.hasDisability ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {formData.hasDisability && (
                  <InputField
                    labelName="Disability Details"
                    value={formData.disabilityDetails}
                    onChangeText={(value) => handleChange('disabilityDetails', value)}
                    placeholder="Enter disability details"
                    multiline={true}
                    style={{ color: "black" }}
                  />
                )}
                
                <View className="flex-row justify-between items-center mb-1 pb-1">
                  <Text className="font-medium text-gray-700">RTE Admission</Text>
                  <TouchableOpacity
                    onPress={() => handleChange('rteAdmission', !formData.rteAdmission)}
                    className={`py-2 px-3 rounded-lg ${formData.rteAdmission ? 'bg-blue-100' : 'bg-gray-100'}`}
                  >
                    <Text className={`${formData.rteAdmission ? 'text-blue-700' : 'text-gray-600'}`}>
                      {formData.rteAdmission ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Educational Information */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('educational')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Educational Information" icon="school" />
              <MaterialIcons 
                name={expandedSections.educational ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#3b82f6" 
              />
            </TouchableOpacity>
            
            {expandedSections.educational && (
              <View className="mt-2">
                <InputField
                  labelName="Previous School Name"
                  value={formData.previousSchoolName}
                  onChangeText={(value) => handleChange('previousSchoolName', value)}
                  placeholder="Enter previous school name"
                  style={{ color: "black" }}
                />
                
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      labelName="Previous Class Passed"
                      value={formData.previousClassPassed}
                      onChangeText={(value) => handleChange('previousClassPassed', value)}
                      placeholder="Enter previous class"
                      style={{ color: "black" }}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      labelName="Previous Class Marks"
                      value={formData.previousClassMarks ? formData.previousClassMarks.toString() : ''}
                      onChangeText={(value) => handleChange('previousClassMarks', value)}
                      placeholder="Enter marks"
                      keyboardType="numeric"
                      style={{ color: "black" }}
                    />
                  </View>
                </View>
                
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      labelName="Admission Class"
                      value={formData.admissionClass}
                      onChangeText={(value) => handleChange('admissionClass', value)}
                      placeholder="Enter admission class"
                      style={{ color: "black" }}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      labelName="Current Class ID"
                      value={formData.classId || ''}
                      onChangeText={(value) => handleChange('classId', value ? value : null)}
                      placeholder="Enter current class ID"
                      style={{ color: "black" }}
                    />
                  </View>
                </View>
                
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      labelName="Section"
                      value={formData.section}
                      onChangeText={(value) => handleChange('section', value)}
                      placeholder="Enter section"
                      style={{ color: "black" }}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      labelName="Academic Year"
                      value={formData.academicYear}
                      onChangeText={(value) => handleChange('academicYear', value)}
                      placeholder="Enter academic year"
                      style={{ color: "black" }}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Logistics Information */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('logistics')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Logistics Information" icon="directions-bus" />
              <MaterialIcons 
                name={expandedSections.logistics ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#3b82f6" 
              />
            </TouchableOpacity>
            
            {expandedSections.logistics && (
              <View className="mt-2">
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
                  style={{ color: "black" }}
                />
                
                <DateField
                  labelName="Admission Date"
                  value={formData.admissionDate}
                  onChange={(value) => handleChange('admissionDate', value)}
                />
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View className="mt-6">
            <MyButton 
              title={isUpdating ? "Updating..." : "Update Student"}
              onPress={handleSubmit}
              disabled={isUpdating}
            />
          </View>
          
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mt-4 p-4 rounded-lg bg-gray-100 flex-row justify-center"
          >
            <MaterialIcons name="arrow-back" size={20} color="#4b5563" />
            <Text className="ml-2 text-gray-700 font-medium">Cancel and Go Back</Text>
          </TouchableOpacity>

          <View className="mt-6 mb-4 bg-blue-50 p-4 rounded-lg">
            <View className="flex-row items-center">
              <MaterialIcons name="info" size={20} color="#3b82f6" />
              <Text className="ml-2 text-blue-700 font-medium">Important Information</Text>
            </View>
            <Text className="mt-2 text-blue-600">
              Always verify student information with official documents. Any changes made here will be reflected across the entire system.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}