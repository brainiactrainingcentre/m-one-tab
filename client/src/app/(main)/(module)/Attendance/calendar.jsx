import { View, Text, ScrollView } from "react-native";
import React from "react";
import AttandecePage from "@/src/components/attendance/AttandecPage";
const calendar = () => {
  return (
    <ScrollView>
          <AttandecePage />
        </ScrollView>
  )
}

export default calendar