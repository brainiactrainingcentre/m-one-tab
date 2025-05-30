import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateParentMutation } from "@/src/redux/services/auth";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';

const ParentSchema = Yup.object().shape({
  fatherName: Yup.string().required("Father name is required"),
  motherName: Yup.string().required("Mother name is required"),
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

const SectionHeader = ({ title, icon }) => (
  <View className="flex-row items-center mb-3 mt-1 border-b border-gray-200 pb-2">
    <MaterialIcons name={icon} size={24} color="#3b82f6" />
    <Text className="text-lg font-bold ml-2 text-blue-600">
      {title}
    </Text>
  </View>
);

const ParentForm = () => {
  const [createParent, { isLoading }] = useCreateParentMutation();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({
    parent: true,
    contact: true,
    children: true,
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
      try {
        await createParent(values).unwrap();
        Alert.alert(
          "Success",
          "Parent form submitted successfully!",
          [
            { 
              text: "Go to Students Dashboard", 
              onPress: () => router.replace('/(module)/students')
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

  const handleChildrenCodeChange = (index) => (value) => {
    const newChildrenCodes = [...values.childrenCode];
    newChildrenCodes[index] = value;
    setFieldValue("childrenCode", newChildrenCodes);
  };

  const handleAddChildrenCode = () => {
    setFieldValue("childrenCode", [...values.childrenCode, ""]);
  };

  const handleRemoveChildCode = (index) => {
    if (values.childrenCode.length > 1) {
      const newChildrenCodes = [...values.childrenCode];
      newChildrenCodes.splice(index, 1);
      setFieldValue("childrenCode", newChildrenCodes);
    }
  };

  return (
    <SafeAreaView className="bg-gray-50 flex-1">
      <ScrollView>
        <View className="px-4 py-6 bg-white shadow-sm mb-4">
          <Text className="text-center text-3xl font-bold text-blue-700">
            Parent Registration
          </Text>
          <Text className="text-center text-gray-500 mt-1">
            Complete parent information and link to student accounts
          </Text>
        </View>

        <View className="px-4 pb-10">
          {/* Parent Information Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('parent')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Parent Information" icon="people" />
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
                      name="fatherName"
                      value={values.fatherName}
                      onChangeText={handleChange("fatherName")}
                      onBlur={handleBlur("fatherName")}
                      placeholder="Enter father's name"
                      labelName="Father's Name"
                      error={touched.fatherName && errors.fatherName}
                      style={{ color: "black" }}
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="motherName"
                      value={values.motherName}
                      onChangeText={handleChange("motherName")}
                      placeholder="Enter mother's name"
                      labelName="Mother's Name"
                      error={errors.motherName}
                      style={{ color: "black" }}
                    />
                  </View>
                </View>
                
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="email"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      placeholder="Enter email address"
                      labelName="Email Address"
                      error={errors.email}
                      style={{ color: "black" }}
                      keyboardType="email-address"
                    />
                  </View>
                  <View className="w-1/2 pl-1">
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
                <View className="flex-row justify-between">
                  <View className="w-1/2 pr-1">
                    <InputField
                      name="contactNumber"
                      value={values.contactNumber}
                      onChangeText={handleChange("contactNumber")}
                      placeholder="Enter contact number"
                      labelName="Primary Contact"
                      error={errors.contactNumber}
                      style={{ color: "black" }}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View className="w-1/2 pl-1">
                    <InputField
                      name="alternateNumber"
                      value={values.alternateNumber}
                      onChangeText={handleChange("alternateNumber")}
                      placeholder="Enter emergency contact"
                      labelName="Emergency Contact"
                      error={errors.alternateNumber}
                      style={{ color: "black" }}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                
                <InputField
                  name="address"
                  value={values.address}
                  onChangeText={handleChange("address")}
                  placeholder="Enter complete address"
                  labelName="Residential Address"
                  error={errors.address}
                  style={{ color: "black" }}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
            )}
          </View>

          {/* Children Information Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
            <TouchableOpacity 
              onPress={() => toggleSection('children')}
              className="flex-row justify-between items-center"
            >
              <SectionHeader title="Link Children" icon="child-care" />
              <MaterialIcons 
                name={expandedSections.children ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#3b82f6" 
              />
            </TouchableOpacity>
            
            {expandedSections.children && (
              <View className="mt-2">
                {values.childrenCode.map((code, index) => (
                  <View key={index} className="flex-row items-center">
                    <View className="flex-1">
                      <InputField
                        name={`childrenCode${index}`}
                        value={code}
                        onChangeText={handleChildrenCodeChange(index)}
                        placeholder="Enter student ID"
                        labelName={`Student ID ${index + 1}`}
                        error={errors.childrenCode && errors.childrenCode[index]}
                        style={{ color: "black" }}
                      />
                    </View>
                    {values.childrenCode.length > 1 && (
                      <TouchableOpacity 
                        onPress={() => handleRemoveChildCode(index)}
                        className="ml-2 mt-4 bg-red-100 p-2 rounded-full"
                      >
                        <MaterialIcons name="remove-circle-outline" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Button to add more children codes */}
                <TouchableOpacity 
                  onPress={handleAddChildrenCode}
                  className="flex-row items-center justify-center mt-2 mb-2 bg-blue-50 p-3 rounded-lg"
                >
                  <MaterialIcons name="add-circle-outline" size={20} color="#3b82f6" />
                  <Text className="ml-2 text-blue-700 font-medium">
                    Add Another Student
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View className="mt-6">
            <MyButton 
              title={isLoading ? "Submitting..." : "Submit Parent Form"} 
              onPress={handleSubmit}
              disabled={isLoading}
            />
          </View>

          <View className="mt-6 mb-4 bg-blue-50 p-4 rounded-lg">
            <View className="flex-row items-center">
              <MaterialIcons name="info" size={20} color="#3b82f6" />
              <Text className="ml-2 text-blue-700 font-medium">Important Information</Text>
            </View>
            <Text className="mt-2 text-blue-600">
              Please ensure all student IDs are entered correctly to properly link parent and student accounts in the system.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentForm;