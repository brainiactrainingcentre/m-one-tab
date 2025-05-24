import React from "react";
import { View, Text, Image } from "react-native";
const Summry = () => {
  return (
    <View
      style={{
        backgroundColor: "#AAC4AB",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <View>
        <img></img>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Text
          style={{
            fontSize: 15,
          }}
        >
          Present
        </Text>
        <Text
          style={{
            fontSize: 12,
          }}
        >
          1 Days
        </Text>
      </View>
    </View>
  );
};
export default Summry;
