import { View, Text, ScrollView, Switch } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateStudentMutation } from "@/src/redux/services/auth";
import { Link, useRouter } from "expo-router";
import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import DropdownField from "@/src/components/atoms/DropdownField";
import DateField from "@/src/components/atoms/DateField";

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

const StudentAdmissionForm = () => {
  const [createStudent] = useCreateStudentMutation();
  const router = useRouter();
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
        console.log("Submitted Values:", values);
        router.navigate(
          "/(main)/(administration)/(drawer)/(tabs)/module/students/ParentForm"
        );
        resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  // Toggle switch handlers
  const handleToggleSwitch = (fieldName) => (value) => {
    setFieldValue(fieldName, value);
  };

  return (
    <SafeAreaView className="bg-white">
      <ScrollView>
        <View className="flex justify-center mb-5 mx-1">
          <Text className="text my-5 text-center text-3xl font-pbold">
            Admission Form
          </Text>

          {/* Personal Information Section */}
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2 text-blue-600">
              Personal Information
            </Text>
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
              <View className="w-1/2 ">
                <InputField
                  name="middleName"
                  value={values.middleName}
                  onChangeText={handleChange("middleName")}
                  placeholder="Enter middle name (optional)"
                  labelName="Middle Name"
                />
              </View>
              <View className="w-1/2 pl-2">
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
              <View className="w-1/2 ">
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
              <View className="w-1/2 pl-2">
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
              <View className="w-1/2 pr-2">
                <InputField
                  name="studentId"
                  value={values.studentId}
                  onChangeText={handleChange("studentId")}
                  placeholder="Enter student ID"
                  labelName="Student ID"
                  error={errors.studentId}
                />
              </View>
              <View className="w-1/2 pr-2">
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
              <View className="w-1/2 pr-2">
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
              <View className="w-1/2 pr-2">
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
              <View className="w-1/2 pr-2">
                <InputField
                  name="bloodGroup"
                  value={values.bloodGroup}
                  onChangeText={handleChange("bloodGroup")}
                  placeholder="Enter blood group"
                  labelName="Blood Group"
                />
              </View>
              <View className="w-1/2 pr-2">
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

          {/* Demographic Information Section - New */}
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2 text-blue-600">
              Demographic Information
            </Text>
            <View className="flex-row justify-between">
              <View className="w-1/2 pr-2">
                <DropdownField
                  name="religion"
                  value={values.religion}
                  onValueChange={(value) => setFieldValue("religion", value)}
                  options={religionOptions}
                  labelName="Religion"
                />
              </View>
              <View className="w-1/2 pr-2">
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
              <View className="w-1/2 pr-2">
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
              <View className="w-1/2 pr-2 mt-2">
                <Text className="text-gray-700 mb-1">Minority Status</Text>
                <View className="flex-row items-center">
                  <Switch
                    value={values.minorityStatus}
                    onValueChange={handleToggleSwitch("minorityStatus")}
                    trackColor={{ false: "#d1d5db", true: "#4f46e5" }}
                  />
                  <Text className="ml-2">
                    {values.minorityStatus ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="w-1/2 pr-2 mt-2">
                <Text className="text-gray-700 mb-1">Disability</Text>
                <View className="flex-row items-center">
                  <Switch
                    value={values.hasDisability}
                    onValueChange={handleToggleSwitch("hasDisability")}
                    trackColor={{ false: "#d1d5db", true: "#4f46e5" }}
                  />
                  <Text className="ml-2">
                    {values.hasDisability ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
              <View className="w-1/2 pr-2 mt-2">
                <Text className="text-gray-700 mb-1">RTE Admission</Text>
                <View className="flex-row items-center">
                  <Switch
                    value={values.rteAdmission}
                    onValueChange={handleToggleSwitch("rteAdmission")}
                    trackColor={{ false: "#d1d5db", true: "#4f46e5" }}
                  />
                  <Text className="ml-2">
                    {values.rteAdmission ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
            </View>
            {values.hasDisability && (
              <View>
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

          {/* Educational Information Section */}
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2 text-blue-600">
              Educational Information
            </Text>
            <View className="flex-row justify-between">
              <View className="w-1/2 pr-2">
                <InputField
                  name="classCode"
                  value={values.classCode}
                  onChangeText={handleChange("classCode")}
                  placeholder="Enter class code"
                  labelName="Admission Class"
                  error={errors.classCode}
                />
              </View>
              <View className="w-1/2 pr-2">
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
              <View className="w-1/2 pr-2">
                <InputField
                  name="previousSchoolName"
                  value={values.previousSchoolName}
                  onChangeText={handleChange("previousSchoolName")}
                  placeholder="Enter previous school"
                  labelName="Previous School"
                />
              </View>
              <View className="w-1/2 pr-2">
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
              <View className="w-1/2 pr-2">
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
              <View className="w-1/2 pr-2">
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

          {/* Contact Information Section */}
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2 text-blue-600">
              Contact Information
            </Text>
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
              <View className="w-1/2 pr-2">
                <InputField
                  name="contactNumber"
                  value={values.contactNumber}
                  onChangeText={handleChange("contactNumber")}
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                  labelName="Contact Number"
                />
              </View>
              <View className="w-1/2 pr-2">
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

          {/* Parent/Guardian Information Section */}
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2 text-blue-600">
              Parent/Guardian Information
            </Text>
            <View className="flex-row justify-between">
              <View className="w-1/2 pr-2">
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
              <View className="w-1/2 pr-2">
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

          {/* Submit Button */}
          <View className="mt-6">
            <MyButton title="Submit Admission Form" onPress={handleSubmit} />
          </View>

          <View className="mt-4 mb-10">
            <Text>
              Go to fill the parent form{" "}
              <Link href="../students/ParentForm">
                <Text style={{ color: "blue" }}>here</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentAdmissionForm;
