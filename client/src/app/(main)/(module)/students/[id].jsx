import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGetStudentQuery } from '@/src/redux/services/auth';

const StudentDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { data, isLoading, isError } = useGetStudentQuery(id);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (data?.success) {
      setStudent(data.data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
        <Text className="mt-3 text-base">Loading student information...</Text>
      </View>
    );
  }

  if (isError || !student) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-base text-red-600 mb-4">Student not found</Text>
        <TouchableOpacity
          className="bg-blue-500 py-2 px-4 rounded"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toDateString();
  };

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return "Not specified";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <TouchableOpacity 
          className="mb-4" 
          onPress={() => router.back()}
        >
          <Text className="text-blue-600 text-base font-semibold">← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Basic Student Profile */}
      <View className="mx-4 mb-4 bg-white rounded-lg p-4 shadow">
        <Text className="text-xl font-bold mb-4">Student Profile</Text>
        <View className="mb-4">
          <Text className="text-base font-semibold mb-2 pb-2 border-b border-gray-200">Personal Information</Text>
          <Text>Name: {student.userId?.name || "Not available"}</Text>
          <Text>Email: {student.userId?.email || "Not available"}</Text>
          <Text>Student ID: {student.studentId}</Text>
          <Text>Roll Number: {student.rollNumber || "Not assigned"}</Text>
          <Text>Class: {student.classId?.name || "Not assigned"}</Text>
          <Text>Section: {student.section || "Not assigned"}</Text>
          <Text>Academic Year: {student.academicYear || "Not specified"}</Text>
          <Text>Date of Birth: {formatDate(student.dateOfBirth)}</Text>
          <Text>Gender: {capitalize(student.gender)}</Text>
          <Text>Blood Group: {student.bloodGroup || "Not specified"}</Text>
        </View>

        {/* Demographic Information - New */}
        <View className="mb-4">
          <Text className="text-base font-semibold mb-2 pb-2 border-b border-gray-200">Demographic Information</Text>
          <Text>Religion: {capitalize(student.religion)}</Text>
          <Text>Caste: {capitalize(student.caste)}</Text>
          <Text>Social Category: {capitalize(student.socialCategory)}</Text>
          <Text>Minority Status: {student.minorityStatus ? "Yes" : "No"}</Text>
          <Text>Person with Disability: {student.hasDisability ? "Yes" : "No"}</Text>
          {student.hasDisability && <Text>Disability Details: {student.disabilityDetails || "Not specified"}</Text>}
          <Text>RTE Admission: {student.rteAdmission ? "Yes" : "No"}</Text>
        </View>

        {/* Contact Information */}
        <View className="mb-4">
          <Text className="text-base font-semibold mb-2 pb-2 border-b border-gray-200">Contact Information</Text>
          <Text>Address: {student.address || "Not specified"}</Text>
          <Text>Phone: {student.contactNumber || "Not specified"}</Text>
          <Text>Guardian Contact: {student.guardianContact || "Not specified"}</Text>
          {student.parentId && (
            <>
              <Text>Parent Name: {student.parentId.name || "Not specified"}</Text>
              <Text>Parent Email: {student.parentId.email || "Not specified"}</Text>
            </>
          )}
        </View>
      </View>

      {/* Educational History - New */}
      <View className="mx-4 mb-4 bg-white rounded-lg p-4 shadow">
        <Text className="text-xl font-bold mb-4">Educational History</Text>
        <Text>Previous School: {student.previousSchoolName || "Not specified"}</Text>
        <Text>Previous Class Passed: {student.previousClassPassed || "Not specified"}</Text>
        <Text>Previous Class Marks: {student.previousClassMarks || "Not specified"}</Text>
        <Text>Admission Class: {student.admissionClass || "Not specified"}</Text>
        <Text>Admission Date: {formatDate(student.admissionDate)}</Text>
      </View>

      {/* Logistical Information - New */}
      <View className="mx-4 mb-4 bg-white rounded-lg p-4 shadow">
        <Text className="text-xl font-bold mb-4">Logistics & Health</Text>
        <Text>Mode of Transport: {capitalize(student.modeOfTransport)}</Text>
        <Text>Medical Issues: {student.medicalIssues || "None specified"}</Text>
      </View>

      {/* Siblings Information - New */}
      <View className="mx-4 mb-4 bg-white rounded-lg p-4 shadow">
        <Text className="text-xl font-bold mb-4">Siblings in School</Text>
        {student.siblingsInSchool && student.siblingsInSchool.length > 0 ? (
          student.siblingsInSchool.map((sibling, index) => (
            <View key={index} className="mb-2 pb-2 border-b border-gray-100">
              <Text>Name: {sibling.name}</Text>
              <Text>Class: {sibling.class}</Text>
              <Text>Section: {sibling.section}</Text>
            </View>
          ))
        ) : (
          <Text className="text-center italic text-gray-600 py-2">No siblings registered</Text>
        )}
      </View>

      {/* Attendance Summary */}
      <View className="mx-4 mb-4 bg-white rounded-lg p-4 shadow">
        <Text className="text-xl font-bold mb-4">Attendance Summary</Text>
        {student.attendanceRecords && student.attendanceRecords.length > 0 ? (
          student.attendanceRecords.map((record, index) => (
            <Text key={index}>{record.date}: {record.status}</Text>
          ))
        ) : (
          <Text className="text-center italic text-gray-600 py-4">No attendance records available</Text>
        )}
      </View>

      {/* Fee Details */}
      <View className="mx-4 mb-8 bg-white rounded-lg p-4 shadow">
        <Text className="text-xl font-bold mb-4">Fee Details</Text>
        {student.feeCategory && (
          <Text className="mb-2">Fee Category: {student.feeCategory.name || "Standard"}</Text>
        )}
        {student.feeRecords && student.feeRecords.length > 0 ? (
          student.feeRecords.map((fee, index) => (
            <View key={index} className="mb-2">
              <Text>{fee.type}: ${fee.amount} - {fee.status}</Text>
            </View>
          ))
        ) : (
          <Text className="text-center italic text-gray-600 py-4">No fee records available</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default StudentDetailScreen;