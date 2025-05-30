import React from "react";
import { View, Text, Image } from "react-native";

const StudentAttendance = ({ bgColor, name, status, textdetails }) => {
  return (
    <View className="flex-row items-center rounded-lg p-3 my-1 mx-4" style={{ backgroundColor: bgColor }}>
      
      {/* Profile Image Placeholder */}
      <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center mr-3">
        <Image className="w-10 h-10 rounded-full" />
      </View>

      {/* Student Details */}
      <View className="flex-1">
        <Text className="text-xs text-gray-600">Adm No.: 1299 | Roll No.: N/A</Text>
        <Text className="text-lg font-bold text-black">{name}</Text>
        <Text className="text-xs text-gray-500">{textdetails}</Text>
      </View>

      {/* Attendance Status */}
      <View
        className={`px-5 py-2 rounded-md ${
          status === "P" ? "bg-green-300" : "bg-pink-300"
        }`}
      >
        <Text className="text-lg font-bold text-black">{status}</Text>
      </View>

    </View>
  );
};

export default StudentAttendance;
