import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateParentMutation } from "@/src/redux/services/auth";
import { useRouter } from "expo-router";

const ParentSchema = Yup.object().shape({
  fatherName: Yup.string().required("father name is required"),
  motherName: Yup.string().required("mother name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  occupation: Yup.string().required("Occupation is required"),
  contactNumber: Yup.string().required("Contact number is required"),
  alternateNumber: Yup.string(),
  address: Yup.string().required("Address is required"),
  childrenCode: Yup.array().of(
    Yup.string().required("Children code is required")
  ),
});

const initialValues = {
  fatherName: "",
  motherName: "",
  email: "",
  occupation: "",
  contactNumber: "",
  alternateNumber: "",
  address: "",
  childrenCode: [""],
};

const ParentForm = () => {
  const [createParent] = useCreateParentMutation();
  const router= useRouter()
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues,
    validationSchema: ParentSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      await createParent(values).unwrap();;
      resetForm();
      router.replace('/(main)/(administration)/(drawer)/(tabs)/module/students')
    },
  });

  const handleChildrenCodeChange = (index) => (value) => {
    const newChildrenCodes = [...values.childrenCode];
    newChildrenCodes[index] = value;
    setFieldValue("childrenCode", newChildrenCodes);
  };

  const handleAddChildrenCode = () => {
    setFieldValue("childrenCode", [...values.childrenCode, ""]);
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView>
        <View className="mx-2">
          <View>
            <Text className="my-5 font-pbold text-center text-[25px]">
              Parent form{" "}
            </Text>
          </View>
          <InputField
            name="fatherName"
            value={values.fatherName}
            onChangeText={handleChange("fatherName")}
            onBlur={handleBlur("fatherName")} 
            placeholder="Enter first name"
            labelName="Father Name"
            error={touched.fatherName && errors.fatherName} 
            style={{ color: "black" }}
          />
          
            
              <InputField
                name="motherName"
                value={values.motherName}
                onChangeText={handleChange("motherName")}
                placeholder="Enter last name"
                labelName="Mother Name"
                error={errors.motherName}
                style={{ color: "black" }}
              />
            
          <View className="flex-row justify-between">
            <View className="w-[49%] mr-1">
              <InputField
                name="email"
                value={values.email}
                onChangeText={handleChange("email")}
                placeholder="Enter email"
                labelName="Email"
                error={errors.email}
                style={{ color: "black" }}
              />
            </View>
            <View className="w-[49%] ml-1">
              <InputField
                name="occupation"
                value={values.occupation}
                onChangeText={handleChange("occupation")}
                placeholder="Enter occupation"
                labelName="Occupation"
                error={errors.occupation}
                style={{ color: "black" }}
              />
            </View>
          </View>
          <View className="flex-row justify-between">
            <View className="w-[49%] mr-1">
              <InputField
                name="contactNumber"
                value={values.contactNumber}
                onChangeText={handleChange("contactNumber")}
                placeholder="Enter contact number"
                labelName="Contact Number"
                error={errors.contactNumber}
                style={{ color: "black" }}
              />
            </View>
            <View className="w-[49%] ml-1">
              <InputField
                name="alternateNumber"
                value={values.alternateNumber}
                onChangeText={handleChange("alternateNumber")}
                placeholder="Enter alternate number"
                labelName="Emergency Contact"
                error={errors.alternateNumber}
                style={{ color: "black" }}
              />
            </View>
          </View>
          <InputField
            name="address"
            value={values.address}
            onChangeText={handleChange("address")}
            placeholder="Enter address"
            labelName="Address"
            error={errors.address}
            style={{ color: "black" }}
          />

          {/* Handle children codes */}
          {values.childrenCode.map((code, index) => (
            <InputField
              key={index}
              name={`childrenCode${index}`}
              value={code}
              onChangeText={handleChildrenCodeChange(index)}
              placeholder={`Enter children code ${index + 1}`}
              labelName={`StudentId ${index + 1}`}
              error={errors.childrenCode && errors.childrenCode[index]}
              style={{ color: "black" }}
            />
          ))}

          {/* Button to add more children codes */}
          <Pressable onPress={handleAddChildrenCode}>
            <Text className=" text-primary font-pbold mb-6 -mt-3 text-right mr-2 ">
              Add More field for Student Id
            </Text>
          </Pressable>

          {/* Submit Button */}
          <MyButton title="Submit" onPress={handleSubmit} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentForm;
