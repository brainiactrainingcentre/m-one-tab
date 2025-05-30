import { View, Text, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateStudentMutation } from "@/src/redux/services/auth";
import { Link, useRouter } from "expo-router";
import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";


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
  parentId: Yup.string(),
  address: Yup.string().required("Address is required"),
  // contactNumber: Yup.string().required("Contact number is required"),
  // guardianContact: Yup.string().required("Guardian contact is required"),
  // bloodGroup: Yup.string().required("Blood group is required"),
  academicYear: Yup.string().required("Academic year is required"),
});

const initialValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  password: "",
  email: "",
  studentId: "",
  dateOfBirth: "",
  gender: "",
  classCode: "",
  section: "",
  parentId: "",
  address: "",
  contactNumber: "",
  guardianContact: "",
  bloodGroup: "",
  academicYear: "",
};

const StudentAdmissionForm = () => {
  const [createStudendt] = useCreateStudentMutation();
  const router = useRouter();
  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: AdmissionSchema,
    onSubmit: async (values) => {
      await createStudendt(values);
      console.log("Submitted Values:", values);
      router.navigate('/(main)/(teachers)/(teacherDrawer)/(teacherTabs)/module/ParentForm')
      // resetForm();
    },
  });
  return (
    <SafeAreaView className="bg-white">
      <ScrollView>
        <View className="flex justify-center mb-5 mx-1">
          <Text className="text my-5 text-center text-3xl font-pbold">
            Admission Form
          </Text>
          <View className="8">
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
                name="dateOfBirth"
                value={values.dateOfBirth}
                onChangeText={handleChange("dateOfBirth")}
                placeholder="YYYY-MM-DD"
                labelName="Date of Birth"
                error={errors.dateOfBirth}
              />
            </View>
          </View>
          <View className="flex-row justify-between mt-3">
            <View className="w-1/2 pr-2 ">
              <InputField
                name="gender"
                value={values.gender}
                onChangeText={handleChange("gender")}
                placeholder="Enter gender"
                labelName="Gender"
                error={errors.gender}
              />
            </View>
            <View className="w-1/2 pr-2">
              <InputField
                name="classCode"
                value={values.classCode}
                onChangeText={handleChange("classCode")}
                placeholder="Enter class code"
                labelName="Class Code"
                error={errors.classCode}
              />
            </View>
          </View>
          <View className="flex-row justify-between">
            <View className="w-1/2 pr-2">
              <InputField
                name="address"
                value={values.address}
                onChangeText={handleChange("address")}
                placeholder="Enter address"
                labelName="Address"
                error={errors.address}
              />
            </View>
            <View className="w-1/2 pr-2">
              <InputField
                name="contactNumber"
                value={values.contactNumber}
                onChangeText={handleChange("contactNumber")}
                placeholder="Enter contact number"
                keyboardType="phone-pad"
                labelName="Contact Number"
                error={errors.contactNumber}
              />
            </View>
          </View>
          <View className="flex-row justify-between">
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
            <View className="w-1/2 pr-2">
              <InputField
                name="parentId"
                value={values.parentId}
                onChangeText={handleChange("parentId")}
                placeholder="Enter parent ID"
                labelName="Parent ID"
                error={errors.parentId}
              />
            </View>
          </View>
          <View className="flex-row justify-between">
            <View className="w-1/2 pr-2">
              <InputField
                name="guardianContact"
                value={values.guardianContact}
                onChangeText={handleChange("guardianContact")}
                placeholder="Enter guardian contact number"
                keyboardType="phone-pad"
                labelName="Guardian Contact"
                error={errors.guardianContact}
              />
            </View>
            <View className="w-1/2 pr-2">
              <InputField
                name="bloodGroup"
                value={values.bloodGroup}
                onChangeText={handleChange("bloodGroup")}
                placeholder="Enter blood group"
                labelName="Blood Group"
                error={errors.bloodGroup}
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
          <View>
            <MyButton title="Submit Admission Form" onPress={handleSubmit} />
          </View>
          <View>
            <Text>
              Go to fill the parent form{" "}
              <Link href="../module/ParentForm">
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