import React, { useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const DropdownField = ({
  labelName = "Dropdown Label",
  placeholder = "Select an option...",
  options = [],
  onValueChange,
  value,
  error,
  name
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Get the selected option text based on value
  const getSelectedText = () => {
    const selectedOption = options.find(option => option.value === value);
    return selectedOption ? selectedOption.label : "";
  };

  return (
    <View style={styles.container}>
      {/* Floating Label */}
      <Text
        style={[
          styles.label,
          {
            top: -10,
            fontSize: 12,
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
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.selectedText,
              { color: value ? "#000" : "#999" }
            ]}
          >
            {value ? getSelectedText() : placeholder}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color="#555"
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsOpen(false);
          setIsFocused(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setIsOpen(false);
            setIsFocused(false);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{labelName}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsOpen(false);
                  setIsFocused(false);
                }}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    value === option.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                    setIsFocused(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === option.value && styles.selectedOptionText
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={20} color="#2575fc" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 4,
  },
  gradientBorder: {
    padding: 1,
    borderRadius: 25,
  },
  inputContainer: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionsContainer: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#f7f7f7",
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    color: "#2575fc",
    fontWeight: "500",
  },
});

export default DropdownField;