import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormik } from "formik";
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
    <SafeAreaView className="bg-white flex-1">
      <ScrollView>
        <View>
          <Text className="font-pbold text-[25px] my-1 text-center">
            Teacher Form
          </Text>

          {submissionError && (
            <View className="bg-red-100 border border-red-400 p-3 mb-4 rounded">
              <Text className="text-red-800">{submissionError}</Text>
            </View>
          )}

          {/* Basic Information Section */}
          <Text className="font-pbold text-[18px] mt-2 mb-4">
            Basic Information
          </Text>

          <View className="flex-row justify-between">
            <View style={{ width: "25%" }}>
              <DropdownField
                name="title"
                options={titileOptions}
                value={values.title}
                onValueChange={(values) => setFieldValue("title", values)}
                placeholder="Mr/Mrs/Dr)"
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

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <InputField
                name="employeeId"
                value={values.employeeId}
                onChangeText={handleChange("employeeId")}
                placeholder="Enter employee ID"
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
                placeholder="Enter password"
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
            placeholder="Enter email"
            labelName="Email"
            error={errors.email}
            style={{ color: "black" }}
          />

          {/* Personal Information Section */}
          <Text className="font-pbold text-[18px] mt-2 mb-4">
            Personal Information
          </Text>

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <InputField
                name="qualification"
                value={values.qualification}
                onChangeText={handleChange("qualification")}
                placeholder="Enter qualification"
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
          <View className="flex-row justify-between">
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
          {/* Contact Information Section */}
          <Text className="font-pbold text-[18px] mt-2 mb-4">
            Contact Information
          </Text>

          <InputField
            name="contactNumber"
            value={values.contactNumber}
            onChangeText={handleChange("contactNumber")}
            placeholder="Enter contact number"
            labelName="Contact Number"
            error={errors.contactNumber}
            style={{ color: "black" }}
          />

          <InputField
            name="address"
            value={values.address}
            onChangeText={handleChange("address")}
            placeholder="Enter address"
            labelName="Address"
            error={errors.address}
            style={{ color: "black" }}
          />

          {/* Professional Information Section */}
          <Text className="font-pbold text-[18px] mt-2 mb-4">
            Professional Information
          </Text>

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <DropdownField
                name="designation"
                options={designationTypeOption}
                value={values.designation}
                onValueChange={(value) => setFieldValue("designation", value)}
                placeholder="Enter designation"
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
                style={{ color: "black" }}
              />
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <DropdownField
                options={staffTypeOptions}
                name="staffType"
                value={values.staffType}
                onValueChange={(value) => setFieldValue("staffType", value)}
                placeholder="Select staff type"
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
                placeholder="Select profession type"
                labelName="Profession Type"
                error={errors.professionType}
              />
            </View>
          </View>

          <View className="flex-row justify-between">
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
            placeholder="Enter salary amount"
            labelName="Salary"
            keyboardType="numeric"
            error={errors.salary}
            style={{ color: "black" }}
          />

          {/* Marital Information Section */}
          <Text className="font-pbold text-[18px] mt-2 mb-4">
            Marital Information
          </Text>

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <DropdownField
                options={maritalStatusOptions}
                name="maritalStatus"
                value={values.maritalStatus}
                onValueChange={(value) => setFieldValue("maritalStatus", value)}
                placeholder="Select marital status"
                labelName="Marital Status"
                error={errors.maritalStatus}
              />
            </View>
            <View className="w-[48%]">
              <InputField
                name="spouseName"
                value={values.spouseName}
                onChangeText={handleChange("spouseName")}
                placeholder="Enter spouse name"
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
            placeholder="Enter spouse contact number"
            labelName="Spouse Contact Number"
            error={errors.spouseContactNumber}
            style={{ color: "black" }}
          />

          {/* ID Information Section */}
          <Text className="font-pbold text-[18px] mt-2 mb-4">
            ID Information
          </Text>

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <InputField
                name="aadharNumber"
                value={values.aadharNumber}
                onChangeText={handleChange("aadharNumber")}
                placeholder="Enter Aadhar number"
                labelName="Aadhar Number"
                error={errors.aadharNumber}
                style={{ color: "black" }}
              />
            </View>
            <View className="w-[48%]">
              <InputField
                name="panNumber"
                value={values.panNumber}
                onChangeText={handleChange("panNumber")}
                placeholder="Enter PAN number"
                labelName="PAN Number"
                error={errors.panNumber}
                style={{ color: "black" }}
              />
            </View>
          </View>

          {/* Bank Details Section */}
          <Text className="font-pbold text-[18px] mt-2 mb-4">Bank Details</Text>

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <InputField
                name="accountNumber"
                value={values.accountNumber}
                onChangeText={handleChange("accountNumber")}
                placeholder="Enter account number"
                labelName="Account Number"
                error={errors.accountNumber}
                style={{ color: "black" }}
              />
            </View>
            <View className="w-[48%]">
              <InputField
                name="ifscCode"
                value={values.ifscCode}
                onChangeText={handleChange("ifscCode")}
                placeholder="Enter IFSC code"
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
            placeholder="Enter bank name"
            labelName="Bank Name"
            error={errors.bankName}
            style={{ color: "black" }}
          />

          {/* References Section */}
          <Text className="font-pbold text-[18px] mt-2 mb-4">References</Text>

          {/* Handle subjects codes */}
          <View>
            {values.subjectsCode.map((code, index) => (
              <InputField
                key={index}
                name={`subjectsCode${index}`}
                value={code}
                onChangeText={handleSubjectsCodeChange(index)}
                placeholder={`Enter subject code ${index + 1}`}
                labelName={`Subject Code ${index + 1}`}
                error={errors.subjectsCode && errors.subjectsCode[index]}
                style={{ color: "black" }}
              />
            ))}
            <Pressable onPress={handleAddSubjectsCode}>
              <Text className="text-primary font-pbold mb-2 -mt-3 text-right mr-2">
                Add More
              </Text>
            </Pressable>
          </View>

          {/* Handle class codes */}
          <View>
            {values.classCode.map((code, index) => (
              <InputField
                key={index}
                name={`classCode${index}`}
                value={code}
                onChangeText={handleClassCodeChange(index)}
                placeholder={`Enter class code ${index + 1}`}
                labelName={`Class Code ${index + 1}`}
                error={errors.classCode && errors.classCode[index]}
                style={{ color: "black" }}
              />
            ))}
            <Pressable onPress={handleAddClassCode}>
              <Text className="text-primary font-pbold -mt-3 text-right mr-2">
                Add More 
              </Text>
            </Pressable>
          </View>

          {/* Submit Button */}
          <View className="mt-8 mb-8 mx-8">
            <MyButton
              title={isLoading ? "Submitting..." : "Submit"}
              onPress={handleSubmit}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeacherForm;
