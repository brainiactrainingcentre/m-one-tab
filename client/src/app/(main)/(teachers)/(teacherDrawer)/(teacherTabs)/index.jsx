import { View, Text, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/src/components/common/HeaderHomePage";
import UserNameCard from "@/src/components/common/userNameCard";
import Fees from "@/src/components/card/fees";
import Certificate from "@/src/components/studentHome/Certificate";
import Events from "@/src/components/card/events";

const index = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <Header />
        <UserNameCard name="Jeet Kumar Sir" num="DAV101" />
        <Fees num1="0" num2="2" num3="1" />
        <Events
          date="19th Jun, 2025"
          title="Lorem ipsum dolor sit amet consectetur."
        />
        <Certificate />
      </ScrollView>
    </SafeAreaView>
  );
};

export default index;
