import React from "react";
import { View, Text } from "react-native";
import MyButton from "../atoms/myButton";
const Mentoring = () => {
  return (
    <View
      style={{
        backgroundColor: "#0D0169",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
        margin: 20,
        marginLeft: "auto",
        marginRight: "auto",
        alignItems: "center",
        width: "98%",
    
      }}
    >
      <Text
        style={{
          fontSize: 35,
          fontWeight: "bold",
          width: 203,
          textAlign: "left",
          color: "#FFFFFF",
          marginBottom: 15,
        }}
      >
        Mentor not assigned
      </Text>
      <MyButton
        title="View all Session"
        backgroundColor="#FFFFFF"
        containerStyle={{
          width: 196,
          height: 58,
        }}
        textStyle={{
          fontSize: 20,
          color: "#000000",
        }}
      ></MyButton>
    </View>
  );
};
export default Mentoring;
