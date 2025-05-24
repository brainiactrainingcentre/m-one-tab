import Events from "@/src/components/card/events";
import Fees from "@/src/components/card/fees";
import LearningCard from "@/src/components/card/learningCard";
import Header from "@/src/components/common/HeaderHomePage";
import UserNameCard from "@/src/components/common/userNameCard";
import LearningSystem from "@/src/components/studentHome/learningSystem";
import Assignments from "@/src/components/studentHome/Assigments";
import Certificate from "@/src/components/studentHome/Certificate";
import LeaderPointes from "@/src/components/studentHome/leaderPointes";
import Mentoring from "@/src/components/studentHome/mentoring";
import Notices from "@/src/components/studentHome/Notices";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import imagePath from "@/src/utils/constants/imagePath";

// Reusable Section Component
const Section = ({ title, children }) => (
  <View>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Header />
        <UserNameCard name="Harendra Ranjan" num="STBLA889" />

        <Section >
          <Assignments title="Total Assignments" num="0" />
        </Section>

        <LearningCard />

        <Section title="Learning Management System (LMS)">
          <LearningSystem
            title="Get Certified→"
            num="Enhance Your Skills"
            icon={imagePath.email_icon}
            
          />
        </Section>
        

        <Section title="Fees">
          <Fees num1="0" num2="2" num3="1" />
        </Section>

        <Section title="Events">
          <Events
            date="19th Jun, 2025"
            title="Lorem ipsum dolor sit amet consectetur."
          />
        </Section>

        <Section title="Mentoring">
          <Mentoring />
        </Section>

        <Section title="Certificate">
          <Certificate />
        </Section>

        <Section title="Leader Points">
          <LeaderPointes Pointe="0" />
        </Section>

        <Section title="Notices">
          <Notices />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollViewContent: {
    paddingBottom: 20, 
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 24, 
    marginVertical: 14,
    textAlign: "center",
  },
});

export default HomeScreen;
