import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { useFormik } from "formik";
import * as Yup from "yup";

// Component imports
import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import DividerWithText from "@/src/components/atoms/dividerWithText";

// Constants and services
import imagePath from "@/src/utils/constants/imagePath";
import { useSignupUserMutation } from "@/src/redux/services/auth";

// Validation schema
const signupSchema = Yup.object().shape({
  tenantId: Yup.string()
    .required("Organization ID is required")
    .min(3, "Organization ID must be at least 3 characters")
    .trim(),
  name: Yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .trim(),
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required")
    .trim(),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
});

const initialValues = {
  tenantId: "",
  name: "",
  email: "",
  password: "",
};

/**
 * Signup Component for Multi-Tenant
 * Handles user registration with organization/tenant selection
 */
const Signup = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [createUser, { isLoading }] = useSignupUserMutation();
  const router = useRouter();

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  // Handle social signup
  const handleSocialSignup = useCallback((provider) => {
    // Implement social signup logic
    console.log(`${provider} signup requested`);
    Alert.alert(
      "Social Signup", 
      "Social signup will be available soon. Please use email signup for now."
    );
  }, []);

  // Form handling
  const { values, errors, touched, handleChange, handleSubmit, handleBlur } = useFormik({
    initialValues,
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      try {
        const response = await createUser({
          tenantId: values.tenantId.trim(),
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        }).unwrap();
        
        if (response?.success || response?.status === "success") {
          Alert.alert(
            "Registration Successful",
            "Your account has been created successfully. Please verify your email and then login with your credentials.",
            [
              { 
                text: "Verify Email", 
                onPress: () => router.push("/email-verify") 
              },
              { 
                text: "Go to Login", 
                onPress: () => router.push("/login") 
              }
            ]
          );
        } else {
          throw new Error(response?.message || "Registration failed");
        }
      } catch (error) {
        console.error("Signup error:", error);
        let errorMessage = "Something went wrong during registration";
        
        if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Handle specific tenant-related errors
        if (errorMessage.toLowerCase().includes('tenant')) {
          errorMessage = "Invalid organization ID or organization not available";
        }
        
        Alert.alert("Registration Failed", errorMessage);
      }
    },
  });

  // Social signup buttons
  const socialButtons = useMemo(() => {
    return (
      <View className="flex flex-row gap-4 justify-center">
        <MyButton
          icon={imagePath.googleIcon}
          title="Google"
          onPress={() => handleSocialSignup("Google")}
          accessibilityLabel="Sign up with Google"
          disabled={isLoading}
        />
        <MyButton
          title="Facebook"
          onPress={() => handleSocialSignup("Facebook")}
          accessibilityLabel="Sign up with Facebook"
          textStyle="text-white"
          disabled={isLoading}
        />
      </View>
    );
  }, [handleSocialSignup, isLoading]);

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <Image
        source={imagePath.login}
        className="h-96 mb-8"
        resizeMode="cover"
        accessible={true}
        accessibilityLabel="Signup page illustration"
      />

      <View className="mb-5 mx-6 md:mx-10">
        <View className="mb-5">
          <InputField
            id="tenantId"
            name="tenantId"
            value={values.tenantId}
            onChangeText={handleChange("tenantId")}
            onBlur={handleBlur("tenantId")}
            placeholder="Enter your organization ID"
            autoCapitalize="none"
            labelName="Organization ID"
            error={touched.tenantId && errors.tenantId}
            accessibilityLabel="Organization ID input field"
            editable={!isLoading}
          />
        </View>

        <View className="mb-5">
          <InputField
            id="name"
            name="name"
            value={values.name}
            onChangeText={handleChange("name")}
            onBlur={handleBlur("name")}
            placeholder="Enter your full name"
            keyboardType="default"
            autoCapitalize="words"
            textContentType="name"
            labelName="Full Name"
            error={touched.name && errors.name}
            accessibilityLabel="Full name input field"
            autoComplete="name"
            editable={!isLoading}
          />
        </View>

        <View className="mb-5">
          <InputField
            id="email"
            name="email"
            value={values.email}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            labelName="Email Address"
            error={touched.email && errors.email}
            accessibilityLabel="Email input field"
            autoComplete="email"
            editable={!isLoading}
          />
        </View>

        <View className="mb-5">
          <InputField
            id="password"
            name="password"
            value={values.password}
            onChangeText={handleChange("password")}
            onBlur={handleBlur("password")}
            placeholder="Create a password"
            secureTextEntry={!isPasswordVisible}
            textContentType="newPassword"
            labelName="Password"
            error={touched.password && errors.password}
            accessibilityLabel="Password input field"
            autoComplete="password-new"
            editable={!isLoading}
            rightIcon={
              <TouchableOpacity 
                onPress={togglePasswordVisibility} 
                accessibilityLabel="Toggle password visibility"
                disabled={isLoading}
              >
                <Text>{isPasswordVisible ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            }
          />
        </View>

        <View className="flex mb-5 items-center">
          <MyButton
            title="Sign Up"
            onPress={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
            accessibilityLabel="Sign up button"
            accessibilityHint="Press to create a new account"
          />

          <Text className="font-bold mt-5 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600">
              Login
            </Link>
          </Text>
        </View>

        <DividerWithText text="Or sign up with" />

        {socialButtons}
      </View>
    </ScrollView>
  );
};

export default Signup;