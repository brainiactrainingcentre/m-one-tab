import { View, Text, ScrollView } from "react-native";
import React from "react";
import AttandecePage from "@/src/components/attendance/AttandecPage";

const AttendanceModule = () => {
  return (
    <ScrollView>
      <AttandecePage />
    </ScrollView>
  );
};
export default AttendanceModule;