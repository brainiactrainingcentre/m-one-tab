import { View, Text, ScrollView, Switch, Alert, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateStudentMutation } from "@/src/redux/services/auth";
import { Link, useRouter } from "expo-router";
import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import DropdownField from "@/src/components/atoms/DropdownField";
import DateField from "@/src/components/atoms/DateField";
import { MaterialIcons } from '@expo/vector-icons';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AdmissionSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  middleName: Yup.string(),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  studentId: Yup.string().required("Student ID is required"),
  dateOfBirth: Yup.string().required("Date of Birth is required"),
  gender: Yup.string().required("Gender is required"),
  classCode: Yup.string().required("Class Code is required"),
  section: Yup.string().required("Section is required"),
  parentEmailId: Yup.string().email("Invalid email"),
  address: Yup.string().required("Address is required"),
  contactNumber: Yup.string(),
  guardianContact: Yup.string(),
  bloodGroup: Yup.string(),
  academicYear: Yup.string().required("Academic year is required"),
  // New schema validations
  religion: Yup.string(),
  caste: Yup.string(),
  socialCategory: Yup.string(),
  minorityStatus: Yup.boolean(),
  hasDisability: Yup.boolean(),
  disabilityDetails: Yup.string().when("hasDisability", {
    is: true,
    then: () =>
      Yup.string().required(
        "Disability details are required when disability is selected"
      ),
  }),
  rteAdmission: Yup.boolean(),
  previousSchoolName: Yup.string(),
  previousClassPassed: Yup.string(),
  previousClassMarks: Yup.number().positive("Marks must be positive"),
  modeOfTransport: Yup.string(),
  medicalIssues: Yup.string(),
  admissionDate: Yup.string(),
});

const initialValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  password: "",
  email: "",
  studentId: "",
  dateOfBirth: new Date(),
  gender: "",
  classCode: "",
  section: "",
  parentEmailId: "",
  address: "",
  contactNumber: "",
  guardianContact: "",
  bloodGroup: "",
  academicYear: "",
  rollNumber: "",
  // New fields
  religion: "",
  caste: "",
  socialCategory: "general",
  minorityStatus: false,
  hasDisability: false,
  disabilityDetails: "",
  rteAdmission: false,
  previousSchoolName: "",
  previousClassPassed: "",
  previousClassMarks: "",
  reportCardUpload: "",
  modeOfTransport: "self_arrangement",
  medicalIssues: "",
  admissionDate: new Date().toISOString().split("T")[0],
  siblingsInSchool: [],
};

// Options for dropdown fields
const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const religionOptions = [
  { label: "Hindu", value: "hindu" },
  { label: "Muslim", value: "muslim" },
  { label: "Christian", value: "christian" },
  { label: "Sikh", value: "sikh" },
  { label: "Buddhist", value: "buddhist" },
  { label: "Jain", value: "jain" },
  { label: "Other", value: "other" },
];

const socialCategoryOptions = [
  { label: "General", value: "general" },
  { label: "OBC", value: "obc" },
  { label: "SC", value: "sc" },
  { label: "ST", value: "st" },
];

const transportOptions = [
  { label: "School Van", value: "school_van" },
  { label: "Self Arrangement", value: "self_arrangement" },
  { label: "Public Transport", value: "public_transport" },
  { label: "Walking", value: "walking" },
];

const SectionHeader = ({ title, icon }) => (
  <View className="flex-row items-center mb-3 mt-1 border-b border-gray-200 pb-2">
    <MaterialIcons name={icon} size={24} color="#3b82f6" />
    <Text className="text-lg font-bold ml-2 text-blue-600">
      {title}
    </Text>
  </View>
);

const StudentAdmissionForm = () => {
  const [createStudent, { isLoading }] = useCreateStudentMutation();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    demographic: true,
    educational: true,
    contact: true,
    parent: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues,
    validationSchema: AdmissionSchema,
    onSubmit: async (values) => {
      try {
        await createStudent(values);
        Alert.alert(
          "Success",
          "Student form submitted successfully! Please proceed to fill the parent form.",
          [
            { 
              text: "Go to Parent Form", 
              onPress: () => router.navigate("/(module)/students/ParentForm") 
            },
            {
              text: "Stay on this page",
              style: "cancel"
            }
          ]
        );
        resetForm();
      } catch (error) {
        Alert.alert(
          "Error",
          "There was an error submitting the form. Please try again."
        );
        console.error("Error submitting form:", error);
      }
    },
  });

  // Toggle switch handlers
  const handleToggleSwitch = (fieldName) => (value) => {
    setFieldValue(fieldName, value);
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView className="bg-gray-50">
        <View className="px-4 py-6 bg-white shadow-sm mb-4">
          <Text className="text-center text-3xl font-bold text-blue-700">
            Student Admission
          </Text>
          <Text className="text-center text-gray-500 mt-1">
            Fill in all required details for new student registration
          </Text>
        </View>

        <View className="px-4 pb-10">
          {/* Personal Information Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('personal')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Personal Information" icon="person" />
              <MaterialIcons 
                name={expandedSections.personal ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#3b82f6" 
              />
            </TouchableOpacity>
            
            {expandedSections.personal && (
              <View className="mt-2">
                <View>
                  <InputField
                    name="firstName"
                    value={values.firstName}
                    onChangeText={handleChange("firstName")}
                    placeholder="Enter first name"
                    labelName="First Name"
                    error={errors.firstName}
                  />
                </View>
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="middleName"
                      value={values.middleName}
                      onChangeText={handleChange("middleName")}
                      placeholder="Enter middle name (optional)"
                      labelName="Middle Name"
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="lastName"
                      value={values.lastName}
                      onChangeText={handleChange("lastName")}
                      placeholder="Enter last name"
                      labelName="Last Name"
                      error={errors.lastName}
                    />
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="email"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      placeholder="Enter email"
                      keyboardType="email-address"
                      labelName="Email"
                      error={errors.email}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="password"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      placeholder="Enter password"
                      secureTextEntry
                      labelName="Password"
                      error={errors.password}
                    />
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="studentId"
                      value={values.studentId}
                      onChangeText={handleChange("studentId")}
                      placeholder="Enter student ID"
                      labelName="Student ID"
                      error={errors.studentId}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="rollNumber"
                      value={values.rollNumber}
                      onChangeText={handleChange("rollNumber")}
                      placeholder="Enter roll number"
                      labelName="Roll Number"
                    />
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <DateField
                      name="dateOfBirth"
                      value={new Date(values.dateOfBirth)}
                      onChange={(date) =>
                        setFieldValue("dateOfBirth", formatDate(date))
                      }
                      labelName="Date of Birth"
                      error={errors.dateOfBirth}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <DropdownField
                      name="gender"
                      value={values.gender}
                      onValueChange={(value) => setFieldValue("gender", value)}
                      options={genderOptions}
                      labelName="Gender"
                      error={errors.gender}
                    />
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="bloodGroup"
                      value={values.bloodGroup}
                      onChangeText={handleChange("bloodGroup")}
                      placeholder="Enter blood group"
                      labelName="Blood Group"
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="medicalIssues"
                      value={values.medicalIssues}
                      onChangeText={handleChange("medicalIssues")}
                      placeholder="If any medical issues"
                      labelName="Medical Issues"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Demographic Information Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('demographic')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Demographic Information" icon="groups" />
              <MaterialIcons 
                name={expandedSections.demographic ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#3b82f6" 
              />
            </TouchableOpacity>

            {expandedSections.demographic && (
              <View className="mt-2">
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <DropdownField
                      name="religion"
                      value={values.religion}
                      onValueChange={(value) => setFieldValue("religion", value)}
                      options={religionOptions}
                      labelName="Religion"
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="caste"
                      value={values.caste}
                      onChangeText={handleChange("caste")}
                      placeholder="Enter caste"
                      labelName="Caste"
                    />
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <DropdownField
                      name="socialCategory"
                      value={values.socialCategory}
                      onValueChange={(value) =>
                        setFieldValue("socialCategory", value)
                      }
                      options={socialCategoryOptions}
                      labelName="Social Category"
                    />
                  </View>
                  <View className="w-1/2 pl-1 mt-2">
                    <Text className="text-gray-700 mb-1 font-medium">Minority Status</Text>
                    <View className="flex-row items-center bg-gray-50 p-2 rounded-md">
                      <Switch
                        value={values.minorityStatus}
                        onValueChange={handleToggleSwitch("minorityStatus")}
                        trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                        thumbColor={values.minorityStatus ? "#1d4ed8" : "#f3f4f6"}
                      />
                      <Text className="ml-2 text-gray-800">
                        {values.minorityStatus ? "Yes" : "No"}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1 mt-2">
                    <Text className="text-gray-700 mb-1 font-medium">Disability</Text>
                    <View className="flex-row items-center bg-gray-50 p-2 rounded-md">
                      <Switch
                        value={values.hasDisability}
                        onValueChange={handleToggleSwitch("hasDisability")}
                        trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                        thumbColor={values.hasDisability ? "#1d4ed8" : "#f3f4f6"}
                      />
                      <Text className="ml-2 text-gray-800">
                        {values.hasDisability ? "Yes" : "No"}
                      </Text>
                    </View>
                  </View>
                  <View className="w-1/2 pl-1 mt-2">
                    <Text className="text-gray-700 mb-1 font-medium">RTE Admission</Text>
                    <View className="flex-row items-center bg-gray-50 p-2 rounded-md">
                      <Switch
                        value={values.rteAdmission}
                        onValueChange={handleToggleSwitch("rteAdmission")}
                        trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                        thumbColor={values.rteAdmission ? "#1d4ed8" : "#f3f4f6"}
                      />
                      <Text className="ml-2 text-gray-800">
                        {values.rteAdmission ? "Yes" : "No"}
                      </Text>
                    </View>
                  </View>
                </View>
                {values.hasDisability && (
                  <View className="mt-2">
                    <InputField
                      name="disabilityDetails"
                      value={values.disabilityDetails}
                      onChangeText={handleChange("disabilityDetails")}
                      placeholder="Enter disability details"
                      labelName="Disability Details"
                      error={errors.disabilityDetails}
                    />
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Educational Information Section */}
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
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="classCode"
                      value={values.classCode}
                      onChangeText={handleChange("classCode")}
                      placeholder="Enter class code"
                      labelName="Admission Class"
                      error={errors.classCode}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="section"
                      value={values.section}
                      onChangeText={handleChange("section")}
                      placeholder="Enter section"
                      labelName="Section"
                      error={errors.section}
                    />
                  </View>
                </View>
                <View>
                  <InputField
                    name="academicYear"
                    value={values.academicYear}
                    onChangeText={handleChange("academicYear")}
                    placeholder="Enter academic year"
                    labelName="Academic Year"
                    error={errors.academicYear}
                  />
                </View>
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="previousSchoolName"
                      value={values.previousSchoolName}
                      onChangeText={handleChange("previousSchoolName")}
                      placeholder="Enter previous school"
                      labelName="Previous School"
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="previousClassPassed"
                      value={values.previousClassPassed}
                      onChangeText={handleChange("previousClassPassed")}
                      placeholder="Enter previous class"
                      labelName="Previous Class Passed"
                    />
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="previousClassMarks"
                      value={values.previousClassMarks}
                      onChangeText={handleChange("previousClassMarks")}
                      placeholder="Enter previous marks"
                      labelName="Previous Class Marks"
                      keyboardType="numeric"
                      error={errors.previousClassMarks}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="admissionDate"
                      value={values.admissionDate}
                      onChangeText={handleChange("admissionDate")}
                      placeholder="YYYY-MM-DD"
                      labelName="Admission Date"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Contact Information Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('contact')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Contact Information" icon="contact-phone" />
              <MaterialIcons 
                name={expandedSections.contact ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#3b82f6" 
              />
            </TouchableOpacity>

            {expandedSections.contact && (
              <View className="mt-2">
                <View>
                  <InputField
                    name="address"
                    value={values.address}
                    onChangeText={handleChange("address")}
                    placeholder="Enter address"
                    labelName="Address"
                    error={errors.address}
                  />
                </View>
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="contactNumber"
                      value={values.contactNumber}
                      onChangeText={handleChange("contactNumber")}
                      placeholder="Enter contact number"
                      keyboardType="phone-pad"
                      labelName="Contact Number"
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <DropdownField
                      name="modeOfTransport"
                      value={values.modeOfTransport}
                      onValueChange={(value) =>
                        setFieldValue("modeOfTransport", value)
                      }
                      options={transportOptions}
                      labelName="Mode of Transport"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Parent/Guardian Information Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('parent')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Parent/Guardian Information" icon="family-restroom" />
              <MaterialIcons 
                name={expandedSections.parent ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#3b82f6" 
              />
            </TouchableOpacity>

            {expandedSections.parent && (
              <View className="mt-2">
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="parentEmailId"
                      value={values.parentEmailId}
                      onChangeText={handleChange("parentEmailId")}
                      placeholder="Enter parent email"
                      labelName="Parent Email"
                      keyboardType="email-address"
                      error={errors.parentEmailId}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="guardianContact"
                      value={values.guardianContact}
                      onChangeText={handleChange("guardianContact")}
                      placeholder="Enter guardian contact"
                      keyboardType="phone-pad"
                      labelName="Guardian Contact"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View className="mt-6">
            <MyButton 
              title={isLoading ? "Submitting..." : "Submit Admission Form"} 
              onPress={handleSubmit}
              disabled={isLoading}
            />
          </View>

          <View className="mt-6 mb-10 bg-blue-50 p-4 rounded-lg flex-row items-center justify-center">
            <MaterialIcons name="info" size={20} color="#3b82f6" />
            <Text className="ml-2 text-blue-700">
              After submitting this form, please complete the{" "}
              <Link href="../students/ParentForm">
                <Text className="font-bold text-blue-800 underline">Parent Form</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentAdmissionForm;