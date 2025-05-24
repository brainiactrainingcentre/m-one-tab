import { View, Text, ScrollView, Image, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import InputField from "../atoms/inputField";
import { useFormik } from "formik";
import { useChangePasswordMutation } from "@/src/redux/services/auth";
import imagePath from "@/src/utils/constants/imagePath";
import MyButton from "../atoms/myButton";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialValues = {
  password: "",
  confirmPassword: "",
};

const ChangePassword = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [token, setToken] = useState(null);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  // Retrieve token from AsyncStorage
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    fetchToken();
  }, []);

  const { values, errors, handleSubmit, handleChange } = useFormik({
    initialValues,
    onSubmit: async (values) => {

      if (!values.password || !values.confirmPassword) {
        Alert.alert("Error", "All fields are required");
        return;
      }
      if (values.password !== values.confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        return;
      }

      try {
        const response = await changePassword({ formdata: values, token }).unwrap();
        Alert.alert("Success", response.message);
      } catch (err) {
        Alert.alert("Error", err?.data?.message || "Something went wrong");
      }
    },
  });

  return (
    <ScrollView className="bg-white">
      <Image source={imagePath.login} className="h-98 mb-8" resizeMode="cover" />
      <View className="mb-5 mx-12">
        <View className="mb-5">
          <InputField
            id="password"
            name="password"
            value={values.password}
            onChangeText={handleChange("password")}
            placeholder="Enter your password"
            secureTextEntry={!isPasswordVisible}
            textContentType="password"
            labelName="Enter your password"
            error={errors.password}
          />
        </View>
        <View className="mb-5">
          <InputField
            id="confirmPassword"
            name="confirmPassword"
            value={values.confirmPassword}
            onChangeText={handleChange("confirmPassword")}
            placeholder="Enter your confirm password"
            secureTextEntry={!isPasswordVisible}
            textContentType="password"
            labelName="Confirm Password"
            error={errors.confirmPassword}
          />
        </View>
        <View className="flex mb-5 items-center">
          <MyButton title="Change Password" onPress={handleSubmit} disabled={isLoading} loading={isLoading} />
          <Text className="font-bold mt-5">
            Forgot <Link href="/signup">Password</Link>?
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ChangePassword;
