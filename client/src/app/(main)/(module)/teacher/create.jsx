import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormik } from "formik";
import { MaterialIcons } from "@expo/vector-icons";
import * as Yup from "yup";
import { useCreateTeacherMutation } from "@/src/redux/services/auth";
import DropdownField from "@/src/components/atoms/DropdownField";
import DateField from "@/src/components/atoms/DateField";
import Validation from "@/src/utils/helper/validation";
import OptionArray from "@/src/utils/Arrays/optionArray";

const {
  genderOptions,
  maritalStatusOptions,
  staffTypeOptions,
  professionTypeOptions,
  titileOptions,
  designationTypeOption,
  staffDepartmentOptions,
} = OptionArray;

const initialValues = {
  name: "",
  email: "",
  password: "",
  employeeId: "",

  // Personal Information
  title: "",
  gender: "",
  dateOfBirth: new Date(),
  fatherName: "",
  qualification: "",

  // Contact Information
  contactNumber: "",
  address: "",

  // Professional Information
  designation: "",
  department: "",
  staffType: "",
  professionType: "",
  joiningDate: new Date(),
  retireDate: new Date(),
  salary: "",

  // Marital Information
  maritalStatus: "",
  spouseName: "",
  spouseContactNumber: "",

  // ID Information
  aadharNumber: "",
  panNumber: "",

  // Bank Details
  accountNumber: "",
  ifscCode: "",
  bankName: "",

  // References
  subjectsCode: [""],
  classCode: [""],
};

// Format date as YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Section component with toggle functionality
const FormSection = ({ title, icon, children, initiallyExpanded = true }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  
  return (
    <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <TouchableOpacity 
        className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200"
        onPress={() => setExpanded(!expanded)}
      >
        <View className="flex-row items-center">
          <MaterialIcons name={icon} size={24} color="#3B82F6" className="mr-2" />
          <Text className="font-bold text-[18px] text-[#3B82F6] ml-2">{title}</Text>
        </View>
        <MaterialIcons 
          name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={24} 
          color="#3B82F6" 
        />
      </TouchableOpacity>
      {expanded && (
        <View className="p-4">
          {children}
        </View>
      )}
    </View>
  );
};

// Custom toggle component
const CustomToggle = ({ value, onToggle, labelOn = "Yes", labelOff = "No" }) => {
  return (
    <TouchableOpacity 
      className={`flex-row items-center justify-center rounded-full px-4 py-2 ${value ? 'bg-[#3B82F6]' : 'bg-gray-300'}`}
      onPress={onToggle}
    >
      <Text className={`font-medium ${value ? 'text-white' : 'text-gray-700'}`}>
        {value ? labelOn : labelOff}
      </Text>
    </TouchableOpacity>
  );
};

// Add More button component
const AddMoreButton = ({ onPress, text = "Add More" }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="flex-row items-center justify-end py-2"
  >
    <MaterialIcons name="add-circle" size={18} color="#3B82F6" />
    <Text className="text-[#3B82F6] font-bold ml-1">{text}</Text>
  </TouchableOpacity>
);

const TeacherForm = () => {
  const [createTeacher, { isLoading }] = useCreateTeacherMutation();
  const [submissionError, setSubmissionError] = useState(null);
  const { TeacherSchema } = Validation;
  
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues,
    validationSchema: TeacherSchema,
    onSubmit: async (values) => {
      try {
        // Clean up any empty strings in arrays
        const cleanedValues = {
          ...values,
          // Filter out any empty values in arrays
          subjectsCode: values.subjectsCode.filter(
            (code) => code.trim() !== ""
          ),
          classCode: values.classCode.filter((code) => code.trim() !== ""),
          // Convert salary to number as backend expects
          salary: Number(values.salary),
        };

        console.log("Submitting values:", cleanedValues);

        const response = await createTeacher(cleanedValues).unwrap();
        console.log("Success response:", response);

        Alert.alert("Success", "Teacher created successfully!");
        resetForm();
        setSubmissionError(null);
      } catch (error) {
        console.error("Submission error:", error);
        setSubmissionError(
          error.data?.message || "An error occurred while creating the teacher"
        );
        Alert.alert("Error", error.data?.message || "Failed to create teacher");
      }
    },
  });

  const handleSubjectsCodeChange = (index) => (value) => {
    const newSubjectsCodes = [...values.subjectsCode];
    newSubjectsCodes[index] = value;
    setFieldValue("subjectsCode", newSubjectsCodes);
  };

  const handleAddSubjectsCode = () => {
    setFieldValue("subjectsCode", [...values.subjectsCode, ""]);
  };

  const handleClassCodeChange = (index) => (value) => {
    const newClassCodes = [...values.classCode];
    newClassCodes[index] = value;
    setFieldValue("classCode", newClassCodes);
  };

  const handleAddClassCode = () => {
    setFieldValue("classCode", [...values.classCode, ""]);
  };

  return (
    <SafeAreaView className="bg-gray-100 flex-1">
      <ScrollView>
        <View className="p-4">
          {/* Header */}
          <View className="mb-6 items-center">
            <Text className="font-bold text-[28px] text-[#3B82F6]">
              Teacher Registration
            </Text>
            <Text className="text-gray-500 text-[16px]">
              Create a new teacher profile
            </Text>
          </View>

          {submissionError && (
            <View className="bg-red-100 border border-red-400 p-4 mb-4 rounded-lg">
              <View className="flex-row items-center">
                <MaterialIcons name="error" size={24} color="#EF4444" />
                <Text className="text-red-800 font-medium ml-2">{submissionError}</Text>
              </View>
            </View>
          )}

          {/* Basic Information Section */}
          <FormSection title="Basic Information" icon="person" initiallyExpanded={true}>
            <View className="flex-row justify-between mb-4">
              <View style={{ width: "25%" }}>
                <DropdownField
                  name="title"
                  options={titileOptions}
                  value={values.title}
                  onValueChange={(values) => setFieldValue("title", values)}
                  placeholder="Title"
                  labelName="Title"
                  error={errors.title}
                />
              </View>
              <View style={{ width: "72%" }}>
                <InputField
                  name="name"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  placeholder="Enter full name"
                  labelName="Full Name"
                  error={errors.name}
                  style={{ color: "black" }}
                />
              </View>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="w-[48%]">
                <InputField
                  name="employeeId"
                  value={values.employeeId}
                  onChangeText={handleChange("employeeId")}
                  placeholder="E.g., TCH0001"
                  labelName="Employee ID"
                  error={errors.employeeId}
                  style={{ color: "black" }}
                />
              </View>
              <View className="w-[48%]">
                <InputField
                  name="password"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  placeholder="8+ characters"
                  labelName="Password"
                  secureTextEntry={true}
                  error={errors.password}
                  style={{ color: "black" }}
                />
              </View>
            </View>
            
            <InputField
              name="email"
              value={values.email}
              onChangeText={handleChange("email")}
              placeholder="example@school.edu"
              labelName="Email"
              error={errors.email}
              style={{ color: "black" }}
            />
          </FormSection>

          {/* Personal Information Section */}
          <FormSection title="Personal Information" icon="badge" initiallyExpanded={true}>
            <View className="flex-row justify-between mb-4">
              <View className="w-[48%]">
                <InputField
                  name="qualification"
                  value={values.qualification}
                  onChangeText={handleChange("qualification")}
                  placeholder="E.g., M.Ed, Ph.D"
                  labelName="Qualification"
                  error={errors.qualification}
                  style={{ color: "black" }}
                />
              </View>
              <View className="w-[48%]">
                <DropdownField
                  options={genderOptions}
                  name="gender"
                  value={values.gender}
                  onValueChange={(value) => setFieldValue("gender", value)}
                  placeholder="Select gender"
                  labelName="Gender"
                  error={errors.gender}
                />
              </View>
            </View>
            
            <View className="flex-row justify-between mb-4">
              <View className="w-[48%]">
                <DateField
                  labelName="Date of Birth"
                  value={values.dateOfBirth}
                  onChange={(date) => setFieldValue("dateOfBirth", date)}
                  error={errors.dateOfBirth}
                  formatDate={formatDateToYYYYMMDD}
                />
              </View>
              <View className="w-[48%]">
                <InputField
                  name="fatherName"
                  value={values.fatherName}
                  onChangeText={handleChange("fatherName")}
                  placeholder="Enter father's name"
                  labelName="Father's Name"
                  error={errors.fatherName}
                  style={{ color: "black" }}
                />
              </View>
            </View>
          </FormSection>
          
          {/* Contact Information Section */}
          <FormSection title="Contact Information" icon="contact-phone" initiallyExpanded={true}>
            <InputField
              name="contactNumber"
              value={values.contactNumber}
              onChangeText={handleChange("contactNumber")}
              placeholder="10-digit mobile number"
              labelName="Contact Number"
              error={errors.contactNumber}
              style={{ color: "black" }}
              keyboardType="numeric"
            />

            <InputField
              name="address"
              value={values.address}
              onChangeText={handleChange("address")}
              placeholder="Enter complete address"
              labelName="Address"
              error={errors.address}
              style={{ color: "black" }}
              multiline={true}
              numberOfLines={3}
            />
          </FormSection>

          {/* Professional Information Section */}
          <FormSection title="Professional Information" icon="work" initiallyExpanded={false}>
            <View className="flex-row justify-between mb-4">
              <View className="w-[48%]">
                <DropdownField
                  name="designation"
                  options={designationTypeOption}
                  value={values.designation}
                  onValueChange={(value) => setFieldValue("designation", value)}
                  placeholder="Select role"
                  labelName="Designation"
                  error={errors.designation}
                />
              </View>
              <View className="w-[48%]">
                <DropdownField
                  name="department"
                  value={values.department}
                  options={staffDepartmentOptions}
                  onValueChange={(value) => setFieldValue("department", value)}
                  placeholder="Select department"
                  labelName="Department"
                  error={errors.department}
                />
              </View>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="w-[48%]">
                <DropdownField
                  options={staffTypeOptions}
                  name="staffType"
                  value={values.staffType}
                  onValueChange={(value) => setFieldValue("staffType", value)}
                  placeholder="Select type"
                  labelName="Staff Type"
                  error={errors.staffType}
                />
              </View>
              <View className="w-[48%]">
                <DropdownField
                  options={professionTypeOptions}
                  name="professionType"
                  value={values.professionType}
                  onValueChange={(value) =>
                    setFieldValue("professionType", value)
                  }
                  placeholder="Select profession"
                  labelName="Profession Type"
                  error={errors.professionType}
                />
              </View>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="w-[48%]">
                <DateField
                  labelName="Joining Date"
                  value={values.joiningDate}
                  onChange={(date) => setFieldValue("joiningDate", date)}
                  error={errors.joiningDate}
                  formatDate={formatDateToYYYYMMDD}
                />
              </View>
              <View className="w-[48%]">
                <DateField
                  labelName="Retire Date"
                  value={values.retireDate}
                  onChange={(date) => setFieldValue("retireDate", date)}
                  error={errors.retireDate}
                  formatDate={formatDateToYYYYMMDD}
                />
              </View>
            </View>

            <InputField
              name="salary"
              value={values.salary}
              onChangeText={handleChange("salary")}
              placeholder="Enter annual salary amount"
              labelName="Salary"
              keyboardType="numeric"
              error={errors.salary}
              style={{ color: "black" }}
            />
          </FormSection>

          {/* Marital Information Section */}
          <FormSection title="Marital Information" icon="family-restroom" initiallyExpanded={false}>
            <View className="flex-row justify-between mb-4">
              <View className="w-[48%]">
                <DropdownField
                  options={maritalStatusOptions}
                  name="maritalStatus"
                  value={values.maritalStatus}
                  onValueChange={(value) => setFieldValue("maritalStatus", value)}
                  placeholder="Select status"
                  labelName="Marital Status"
                  error={errors.maritalStatus}
                />
              </View>
              <View className="w-[48%]">
                <InputField
                  name="spouseName"
                  value={values.spouseName}
                  onChangeText={handleChange("spouseName")}
                  placeholder="If applicable"
                  labelName="Spouse Name"
                  error={errors.spouseName}
                  style={{ color: "black" }}
                />
              </View>
            </View>

            <InputField
              name="spouseContactNumber"
              value={values.spouseContactNumber}
              onChangeText={handleChange("spouseContactNumber")}
              placeholder="If applicable"
              labelName="Spouse Contact Number"
              error={errors.spouseContactNumber}
              style={{ color: "black" }}
              keyboardType="numeric"
            />
          </FormSection>

          {/* ID Information Section */}
          <FormSection title="ID Information" icon="card-membership" initiallyExpanded={false}>
            <View className="flex-row justify-between mb-4">
              <View className="w-[48%]">
                <InputField
                  name="aadharNumber"
                  value={values.aadharNumber}
                  onChangeText={handleChange("aadharNumber")}
                  placeholder="12-digit Aadhar"
                  labelName="Aadhar Number"
                  error={errors.aadharNumber}
                  style={{ color: "black" }}
                  keyboardType="numeric"
                />
              </View>
              <View className="w-[48%]">
                <InputField
                  name="panNumber"
                  value={values.panNumber}
                  onChangeText={handleChange("panNumber")}
                  placeholder="10-digit PAN"
                  labelName="PAN Number"
                  error={errors.panNumber}
                  style={{ color: "black" }}
                />
              </View>
            </View>
          </FormSection>

          {/* Bank Details Section */}
          <FormSection title="Bank Details" icon="account-balance" initiallyExpanded={false}>
            <View className="flex-row justify-between mb-4">
              <View className="w-[48%]">
                <InputField
                  name="accountNumber"
                  value={values.accountNumber}
                  onChangeText={handleChange("accountNumber")}
                  placeholder="Enter account number"
                  labelName="Account Number"
                  error={errors.accountNumber}
                  style={{ color: "black" }}
                  keyboardType="numeric"
                />
              </View>
              <View className="w-[48%]">
                <InputField
                  name="ifscCode"
                  value={values.ifscCode}
                  onChangeText={handleChange("ifscCode")}
                  placeholder="E.g., SBIN0001234"
                  labelName="IFSC Code"
                  error={errors.ifscCode}
                  style={{ color: "black" }}
                />
              </View>
            </View>

            <InputField
              name="bankName"
              value={values.bankName}
              onChangeText={handleChange("bankName")}
              placeholder="E.g., State Bank of India"
              labelName="Bank Name"
              error={errors.bankName}
              style={{ color: "black" }}
            />
          </FormSection>

          {/* References Section */}
          <FormSection title="Teaching References" icon="menu-book" initiallyExpanded={false}>
            {/* Handle subjects codes */}
            <View className="mb-2">
              <Text className="font-medium text-gray-600 mb-2">Subject Codes</Text>
              
              {values.subjectsCode.map((code, index) => (
                <InputField
                  key={index}
                  name={`subjectsCode${index}`}
                  value={code}
                  onChangeText={handleSubjectsCodeChange(index)}
                  placeholder={`E.g., MATH${index + 1}, SCI${index + 1}`}
                  labelName={`Subject Code ${index + 1}`}
                  error={errors.subjectsCode && errors.subjectsCode[index]}
                  style={{ color: "black" }}
                />
              ))}
              
              <AddMoreButton onPress={handleAddSubjectsCode} text="Add Subject Code" />
            </View>

            {/* Handle class codes */}
            <View className="mt-4">
              <Text className="font-medium text-gray-600 mb-2">Class Codes</Text>
              
              {values.classCode.map((code, index) => (
                <InputField
                  key={index}
                  name={`classCode${index}`}
                  value={code}
                  onChangeText={handleClassCodeChange(index)}
                  placeholder={`E.g., CL-${index + 1}, SEC-${index + 1}`}
                  labelName={`Class Code ${index + 1}`}
                  error={errors.classCode && errors.classCode[index]}
                  style={{ color: "black" }}
                />
              ))}
              
              <AddMoreButton onPress={handleAddClassCode} text="Add Class Code" />
            </View>
          </FormSection>

          {/* Help Information */}
          <View className="bg-blue-50 rounded-lg p-4 mb-6">
            <View className="flex-row items-start">
              <MaterialIcons name="info" size={24} color="#3B82F6" className="mt-1" />
              <View className="ml-2 flex-1">
                <Text className="font-bold text-[#3B82F6] mb-1">Important Information</Text>
                <Text className="text-gray-700">
                  All fields marked with an asterisk (*) are mandatory. You can save this form and 
                  complete it later. For assistance, please contact the admin at support@school.edu
                </Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <View className="my-6 mx-4">
            <TouchableOpacity
              className={`rounded-lg py-4 items-center justify-center ${isLoading ? 'bg-blue-300' : 'bg-[#3B82F6]'}`}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <View className="flex-row items-center">
                {isLoading ? (
                  <MaterialIcons name="hourglass-bottom" size={24} color="white" />
                ) : (
                  <MaterialIcons name="check-circle" size={24} color="white" />
                )}
                <Text className="text-white font-bold text-lg ml-2">
                  {isLoading ? "Processing..." : "Submit Registration"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeacherForm;