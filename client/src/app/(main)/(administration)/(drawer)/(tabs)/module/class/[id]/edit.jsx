import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { useGetClassByIdQuery, useUpdateClassMutation } from '@/src/redux/services/auth';

const EditClassScreen = () => {
  // Get navigation context as a fallback
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { data: classData, isLoading: isLoadingClass } = useGetClassByIdQuery(id);
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    classId: '',
    academicYear: '',
  });
  
  const [errors, setErrors] = useState({});

  // Parse and set form data from API response
  useEffect(() => {
    if (classData?.data) {
      const { name, section, classId, academicYear } = classData.data;
      setFormData({
        name: name || '',
        section: section || '',
        classId: classId || '',
        academicYear: academicYear || '',
      });
    }
  }, [classData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.section.trim()) newErrors.section = 'Section is required';
    if (!formData.classId.trim()) newErrors.classId = 'Class ID is required';
    if (!formData.academicYear.trim()) newErrors.academicYear = 'Academic year is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      // Prepare the update data - preserve existing structure while updating form fields
      const updateData = {
        id,
        ...formData,
        // Preserve other fields from the original data
        subjects: classData?.data?.subjects || [],
        schedule: classData?.data?.schedule || [],
        students: classData?.data?.students || [],
        Teacher: classData?.data?.Teacher || []
      };
      
      await updateClass(updateData).unwrap();
      Alert.alert('Success', 'Class updated successfully', [{ 
        text: 'OK', 
        onPress: () => {
          try {
            router.back();
          } catch (e) {
            // Fallback to navigation if router fails
            if (navigation) {
              navigation.goBack();
            }
          }
        } 
      }]);
    } catch (error) {
      Alert.alert('Error', error?.data?.message || 'Failed to update class. Please try again.');
    }
  };
  
  const handleCancel = () => {
    try {
      router.back();
    } catch (e) {
      // Fallback to navigation if router fails
      if (navigation) {
        navigation.goBack();
      }
    }
  };
  
  if (isLoadingClass) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600">Loading class data...</Text>
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4">
          <View className="py-6">
            <Text className="text-xl font-bold text-gray-800 mb-6">Edit Class Information</Text>
            
            {/* Class Basic Information */}
            <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <Text className="text-lg font-semibold text-gray-700 mb-4">Basic Details</Text>
              
              {['name', 'section', 'classId', 'academicYear'].map((field, index) => (
                <View key={index} className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field === 'classId' ? 'Class ID' : field === 'academicYear' ? 'Academic Year' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </Text>
                  <TextInput
                    className="w-full px-3 py-2 bg-white rounded-md border border-gray-300"
                    value={formData[field]}
                    onChangeText={(value) => handleChange(field, value)}
                    placeholder={`Enter ${field === 'classId' ? 'Class ID' : field}`}
                    returnKeyType={index === 3 ? 'done' : 'next'}
                  />
                  {errors[field] && <Text className="mt-1 text-sm text-red-500">{errors[field]}</Text>}
                </View>
              ))}
            </View>
            
            {/* Additional Information (Read Only) */}
            <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <Text className="text-lg font-semibold text-gray-700 mb-2">Additional Information</Text>
              
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700">Subjects</Text>
                <Text className="text-gray-600">
                  {classData?.data?.subjects?.length > 0 
                    ? classData.data.subjects.map(subject => subject.name).join(', ')
                    : 'No subjects assigned'}
                </Text>
              </View>
              
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700">Number of Students</Text>
                <Text className="text-gray-600">{classData?.data?.students?.length || 0}</Text>
              </View>
              
              <View>
                <Text className="text-sm font-medium text-gray-700">Schedule</Text>
                <Text className="text-gray-600">
                  {classData?.data?.schedule?.length > 0 
                    ? `Schedule for ${classData.data.schedule.length} days` 
                    : 'No schedule created'}
                </Text>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity 
                className="bg-gray-200 px-6 py-3 rounded-md" 
                onPress={handleCancel} 
                disabled={isUpdating}
              >
                <Text className="text-gray-800 font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`px-6 py-3 rounded-md ${isUpdating ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                onPress={handleSubmit}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-medium ml-2">Updating...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-medium">Update Class</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditClassScreen;