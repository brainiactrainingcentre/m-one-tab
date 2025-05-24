import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const InputField = ({
  labelName = "Input Label",
  placeholder = "Enter here...",
  secureTextEntry = false,
  keyboardType = "default",
  onChangeText,
  onBlur,
  value,
  error, // New error prop
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Floating Label */}
      <Text
        style={[
          styles.label,
          {
            top: isFocused || value ? -20 : -10,
          },
        ]}
      >
        {labelName}
      </Text>

      {/* Gradient Border */}
      <LinearGradient
        colors={error ? ["#ff4d4d", "#ff4d4d"] : ["#4f5bd5", "#fa7e1e", "#d62976", "#962fbf", "#feda75"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientBorder, error && styles.errorBorder]}
      >
        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onBlur={(e) => {
              setIsFocused(false);
              if (onBlur) onBlur(e); 
            }}
            onFocus={() => setIsFocused(true)}
            placeholder={!isFocused && !value ? placeholder : ""}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            placeholderTextColor="#999"
          />

          {/* Password Visibility Toggle */}
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible((prev) => !prev)}
            >
              <Ionicons name={isPasswordVisible ? "eye" : "eye-off"} size={24} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 20,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    color: "#000",
    zIndex: 10,
    left: 20,
    paddingHorizontal: 0,
  },
  gradientBorder: {
    padding: 1,
    borderRadius: 25,
  },
  inputContainer: {
    backgroundColor: "white",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    width: "100%",
    color: "#000",
    fontSize: 16,
    backgroundColor: "transparent",
    height: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 12,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  errorBorder: {
    borderColor: "red",
  },
});

export default InputField;
