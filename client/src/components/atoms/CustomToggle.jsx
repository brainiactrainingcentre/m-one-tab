import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

/**
 * CustomToggle Component
 * 
 * A custom Yes/No toggle switch for forms
 * 
 * @param {boolean} value - The current value of the toggle (true/false)
 * @param {function} onToggle - Function to call when toggle is pressed
 * @param {object} style - Additional styles for the container
 */
const CustomToggle = ({ value, onToggle, style }) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.toggleContainer,
          { backgroundColor: value ? "#e6f3ff" : "#f5f5f5" }
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.option,
            value && styles.activeOption,
            value && { backgroundColor: "#007bff" }
          ]}
        >
          <Text style={[styles.text, value && styles.activeText]}>Yes</Text>
        </View>
        <View
          style={[
            styles.option,
            !value && styles.activeOption,
            !value && { backgroundColor: "#6c757d" }
          ]}
        >
          <Text style={[styles.text, !value && styles.activeText]}>No</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activeOption: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
  },
  activeText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CustomToggle;