import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormik } from "formik";
import * as Yup from "yup";

const TeacherSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  middleName: Yup.string(),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  employeeId: Yup.string().required("Employee ID is required"),
  qualification: Yup.string().required("Qualification is required"),
  subjectsCode: Yup.array().of(Yup.string().required("Subject code is required")),
  classCode: Yup.array().of(Yup.string().required("Class code is required")),
  contactNumber: Yup.string().required("Contact number is required"),
  address: Yup.string().required("Address is required"),
  joiningDate: Yup.string().required("Joining date is required"),
  salary: Yup.number().required("Salary is required").positive("Salary must be a positive number"),
});

const initialValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  password: "",
  employeeId: "",
  qualification: "",
  subjectsCode: [""],
  classCode: [""],
  contactNumber: "",
  address: "",
  joiningDate: "",
  salary: "",
};

const TeacherForm = () => {
  // You can use createTeacherMutation if you have it
  // const [createTeacher] = useCreateTeacherMutation();

  const { values, errors, handleChange, handleSubmit, setFieldValue, resetForm } = useFormik({
    initialValues,
    validationSchema: TeacherSchema,
    onSubmit: async (values) => {
      // If you have the mutation, use it
      // await createTeacher(values);
      console.log("Submitted Values:", values);
      resetForm();
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
          <InputField
            name="firstName"
            value={values.firstName}
            onChangeText={handleChange("firstName")}
            placeholder="Enter first name"
            labelName="First Name"
            error={errors.firstName}
            style={{ color: "black" }}
          />
          <InputField
            name="middleName"
            value={values.middleName}
            onChangeText={handleChange("middleName")}
            placeholder="Enter middle name"
            labelName="Middle Name"
            error={errors.middleName}
            style={{ color: "black" }}
          />
          <InputField
            name="lastName"
            value={values.lastName}
            onChangeText={handleChange("lastName")}
            placeholder="Enter last name"
            labelName="Last Name"
            error={errors.lastName}
            style={{ color: "black" }}
          />
          <InputField
            name="email"
            value={values.email}
            onChangeText={handleChange("email")}
            placeholder="Enter email"
            labelName="Email"
            error={errors.email}
            style={{ color: "black" }}
          />
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
          <InputField
            name="employeeId"
            value={values.employeeId}
            onChangeText={handleChange("employeeId")}
            placeholder="Enter employee ID"
            labelName="Employee ID"
            error={errors.employeeId}
            style={{ color: "black" }}
          />
          <InputField
            name="qualification"
            value={values.qualification}
            onChangeText={handleChange("qualification")}
            placeholder="Enter qualification"
            labelName="Qualification"
            error={errors.qualification}
            style={{ color: "black" }}
          />
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
          <InputField
            name="joiningDate"
            value={values.joiningDate}
            onChangeText={handleChange("joiningDate")}
            placeholder="YYYY-MM-DD"
            labelName="Joining Date"
            error={errors.joiningDate}
            style={{ color: "black" }}
          />
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

          {/* Handle subjects codes */}
          <View className="mt-4 mb-2">
            <Text className="text-lg font-bold mb-2">Subject Codes</Text>
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
            <MyButton
              title="Add More Subject Code"
              onPress={handleAddSubjectsCode}
            />
          </View>

          {/* Handle class codes */}
          <View className="mt-4 mb-2">
            <Text className="text-lg font-bold mb-2">Class Codes</Text>
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
            <MyButton
              title="Add More Class Code"
              onPress={handleAddClassCode}
            />
          </View>

          {/* Submit Button */}
          <View className="my-4">
            <MyButton title="Submit" onPress={handleSubmit} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeacherForm;