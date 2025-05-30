import { View, Text, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import imagePath from "@/src/utils/constants/imagePath";
import InputField from "@/src/components/atoms/inputField";
import { useFormik } from "formik";
import * as Yup from "yup";
import MyButton from "@/src/components/atoms/myButton";
import { Link, useRouter } from "expo-router";
import { useVerifyEmailMutation } from "@/src/redux/services/auth";

// Validation schema
const verifyEmailSchema = Yup.object().shape({
  tenantId: Yup.string().required("Organization ID is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  otp: Yup.string()
    .required("OTP is required")
    .min(4, "OTP must be at least 4 digits")
    .max(8, "OTP cannot exceed 8 digits"),
});

const initialValues = {
  tenantId: "",
  email: "",
  otp: "",
};

const EmailVerify = () => {
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const { values, errors, touched, handleChange, handleSubmit, handleBlur } = useFormik({
    initialValues,
    validationSchema: verifyEmailSchema,
    onSubmit: async (values) => {
      try {
        setIsProcessing(true);
        console.log("Verifying email for:", values.email, "Tenant:", values.tenantId);
        
        const response = await verifyEmail({
          tenantId: values.tenantId.trim(),
          email: values.email.trim(),
          otp: values.otp.trim(),
        }).unwrap();
        
        console.log("Verification response:", response);
        
        if (response?.success || response?.status === "success") {
          Alert.alert(
            "Email Verified Successfully",
            "Your email has been verified. You can now login with your credentials.",
            [
              {
                text: "Go to Login",
                onPress: () => router.push("/login")
              }
            ]
          );
        } else {
          throw new Error(response?.message || "Email verification failed");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        let errorMessage = "Something went wrong during verification";
        
        if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Handle specific verification errors
        if (errorMessage.toLowerCase().includes('otp')) {
          errorMessage = "Invalid or expired OTP. Please check your code and try again.";
        } else if (errorMessage.toLowerCase().includes('tenant')) {
          errorMessage = "Invalid organization ID. Please check and try again.";
        }
        
        Alert.alert("Verification Failed", errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
  });

  const combinedLoading = isLoading || isProcessing;

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="flex-1 bg-white">
        <Image
          source={imagePath.login}
          className="h-98 mb-8"
          resizeMode="cover"
          accessible={true}
          accessibilityLabel="Email verification illustration"
        />
        
        <View className="mb-5 mx-12">
          <Text className="text-2xl font-bold text-center mb-6 text-gray-800">
            Verify Your Email
          </Text>
          
          <Text className="text-center text-gray-600 mb-6">
            Please enter your organization ID, email, and the OTP sent to your email address.
          </Text>

          <View className="mb-5">
            <InputField
              id="tenantId"
              name="tenantId"
              value={values.tenantId}
              onChangeText={handleChange("tenantId")}
              onBlur={handleBlur("tenantId")}
              labelName="Organization ID"
              placeholder="Enter your organization ID"
              autoCapitalize="none"
              error={touched.tenantId && errors.tenantId}
              editable={!combinedLoading}
              accessibilityLabel="Organization ID input field"
            />
          </View>

          <View className="mb-5">
            <InputField
              id="email"
              name="email"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              labelName="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCapitalize="none"
              error={touched.email && errors.email}
              editable={!combinedLoading}
              accessibilityLabel="Email input field"
            />
          </View>

          <View className="mb-5">
            <InputField
              id="otp"
              name="otp"
              value={values.otp}
              onChangeText={handleChange("otp")}
              onBlur={handleBlur("otp")}
              labelName="OTP"
              placeholder="Enter OTP"
              keyboardType="numeric"
              maxLength={8}
              error={touched.otp && errors.otp}
              editable={!combinedLoading}
              accessibilityLabel="OTP input field"
            />
          </View>

          <View className="flex mb-5 items-center">
            {combinedLoading ? (
              <View className="mb-4">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="text-center mt-2 text-gray-600">
                  Verifying your email...
                </Text>
              </View>
            ) : (
              <MyButton 
                title="Verify Email" 
                onPress={handleSubmit}
                disabled={combinedLoading}
                accessibilityLabel="Verify email button"
                accessibilityHint="Press to verify your email with the OTP"
              />
            )}

            <Text className="font-bold mt-5">
              Already verified? <Link href="/login" className="text-blue-600">Login</Link>
            </Text>
            
            <Text className="font-bold mt-2">
              Need to sign up? <Link href="/signup" className="text-blue-600">Sign Up</Link>
            </Text>
            
            <Text className="font-bold mt-2">
              Forgot <Link href="/forgot-password" className="text-blue-600">Password</Link>?
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default EmailVerify;