import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const DateField = ({
  label = "Date",
  value,
  onChange,
  error,
  formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View className="mb-4 ">
      <Text className=" bg-white text-base  mb-2 absolute top-1 left-5  z-10 -mt-5">
        {label}
      </Text>
      <LinearGradient
        colors={
          error
            ? ["#ff4d4d", "#ff4d4d"]
            : ["#4f5bd5", "#fa7e1e", "#d62976", "#962fbf", "#feda75"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientBorder, error && styles.errorBorder]}
      >
        <View>
          <TouchableOpacity
            className="flex-row justify-between items-center border border-gray-300 p-3 bg-white rounded-3xl h-14"
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formatDate(value)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#555" />
          </TouchableOpacity>
          {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
          {showDatePicker && (
            <DateTimePicker
              value={value}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
};


const styles = StyleSheet.create({
 
  gradientBorder: {
    padding: 1,
    borderRadius: 25,
  },
  
  errorBorder: {
    borderColor: "red",
  },
});

export default DateField;
