import React, { useState } from "react";
import { View, Image, Text, Alert, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import InputField from "@/src/components/atoms/inputField";
import imagePath from "@/src/utils/constants/imagePath";
import DividerWithText from "@/src/components/atoms/dividerWithText";
import MyButton from "@/src/components/atoms/myButton";
import { Link, useRouter } from "expo-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLoginUserMutation } from "@/src/redux/services/auth";
import { setCredentials } from "@/src/redux/slices/authSlice";
import { loginAndPersist } from "@/src/redux/thunks/authThunks";
import DropdownField from "@/src/components/atoms/DropdownField";

const tenantOptions = [
  { label: "onetab", value: "onetab" },
  { label: "Org B", value: "org_b" },
  { label: "Org C", value: "org_c" },
];

const loginSchema = Yup.object().shape({
  tenantId: Yup.string().required("Organization ID is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const initialValues = {
  tenantId: "",
  email: "",
  password: "",
};

const Login = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [navigating, setNavigating] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const { values, errors, handleChange, handleSubmit, touched, handleBlur,setFieldValue, } =
    useFormik({
      initialValues,
      validationSchema: loginSchema,
      onSubmit: async (values) => {
        try {
          setNavigating(true);

          console.log(
            "Login attempt for:",
            values.email,
            "Tenant:",
            values.tenantId
          );

          // Pass tenantId along with login credentials
          const result = await loginUser({
            tenantId: values.tenantId.trim(),
            email: values.email.trim(),
            password: values.password,
          }).unwrap();

          if (result.status === "success") {
            const { user, token } = result;
            console.log("Login successful for:", values.email);
            console.log("User data:", JSON.stringify(user));
            console.log("Token exists:", !!token);
            console.log("Tenant ID:", values.tenantId);

            // Use the thunk to handle login and persistence with tenant ID
            await dispatch(
              loginAndPersist({
                user,
                token,
                tenantId: values.tenantId.trim(),
              })
            );

            console.log("Redux state updated with tenant information");

            // Navigate with a small delay to ensure state updates
            console.log("Preparing to navigate...");
            setTimeout(() => {
              try {
                console.log("Navigating to Authentication...");
                router.replace("/authentication");
              } catch (navError) {
                console.error("Navigation error:", navError);
                Alert.alert(
                  "Navigation Error",
                  "Could not navigate to the next screen"
                );
                setNavigating(false);
              }
            }, 1000);
          } else {
            console.log("Login returned success:false");
            Alert.alert("Login Failed", "Invalid response from server");
            setNavigating(false);
          }
        } catch (error) {
          console.error("Login error:", JSON.stringify(error));
          let errorMessage = "Something went wrong";

          if (error.data?.message) {
            errorMessage = error.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          // Handle specific tenant-related errors
          if (errorMessage.toLowerCase().includes("tenant")) {
            errorMessage = "Invalid organization ID or organization not found";
          }

          Alert.alert("Login Failed", errorMessage);
          setNavigating(false);
        }
      },
    });

  // Combined loading state
  const isProcessing = isLoading || navigating;

  return (
    <View className="flex-1 bg-white">
      <Image
        source={imagePath.login}
        className="h-98 mb-8"
        resizeMode="cover"
      />

      <View className="mb-5 mx-12">
        <View className="mb-5">
          <DropdownField
            name="tenantId"
            value={values.tenantId}
            onValueChange={(value) => setFieldValue("tenantId", value)}
            options={tenantOptions}
            labelName="Organization ID"
            error={touched.tenantId && errors.tenantId}
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
            labelName="Enter your email"
            error={touched.email && errors.email}
            editable={!isProcessing}
          />
        </View>

        <View className="mb-5">
          <InputField
            id="password"
            name="password"
            value={values.password}
            onChangeText={handleChange("password")}
            onBlur={handleBlur("password")}
            placeholder="Enter your password"
            secureTextEntry={!isPasswordVisible}
            textContentType="password"
            labelName="Enter your password"
            error={touched.password && errors.password}
            editable={!isProcessing}
          />
        </View>

        <View className="flex mb-5 items-center">
          {isProcessing ? (
            <View className="mb-2">
              <ActivityIndicator size="large" color="#0000ff" />
              <Text className="text-center mt-2">
                {navigating ? "Logging in..." : "Processing..."}
              </Text>
            </View>
          ) : (
            <MyButton
              title="Login"
              onPress={handleSubmit}
              disabled={isProcessing}
            />
          )}

          <Text className="font-bold mt-5">
            Don't have an account? <Link href="/signup">Sign up</Link>
          </Text>

          <Text className="font-bold mt-2">
            Forgot your <Link href="/forgot-password">password</Link>?
          </Text>
        </View>

        <DividerWithText />

        <View className="mt-5 flex flex-row gap-4">
          <MyButton
            icon={imagePath.googleIcon}
            title="Google"
            onPress={() => console.log("Google Button Pressed")}
            disabled={isProcessing}
          />
          <MyButton
            title="Facebook"
            onPress={() => console.log("Facebook Button Pressed")}
            disabled={isProcessing}
          />
        </View>
      </View>
    </View>
  );
};

export default Login;
