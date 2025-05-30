import { View, Text, ScrollView } from "react-native";
import React from "react";
import imagePath from "@/src/utils/constants/imagePath";
import { useRouter } from "expo-router";
import Module from "@/src/components/studentHome/Module"; // Assuming you have a Module component

const teacherModules = [
  { title: "Attendance", icon: imagePath.icon13, route: "(teachers)/(teacherDrawer)/(teacherTabs)/module/AttendanceModule" },
  { title: "Admission Form", icon: imagePath.icon13, route: "(teachers)/(teacherDrawer)/(teacherTabs)/module/AdmissionModule" },
  { title: "Academic Plan", icon: imagePath.icon13, route: "(teachers)/(teacherDrawer)/(teacherTabs)/module/AcademicPlanModule" },
  { title: "LMS", icon: imagePath.icon13, route: "(teachers)/(teacherDrawer)/(teacherTabs)/module/LMSModule" },
  { title: "Library", icon: imagePath.icon13, route: "(teachers)/(teacherDrawer)/(teacherTabs)/module/LibraryModule" },
  { title: "Result Analysis", icon: imagePath.icon13, route: "(teachers)/(teacherDrawer)/(teacherTabs)/module/ResultAnalysisModule" },
  { title: "Online Exam", icon: imagePath.icon13, route: "(teachers)/(teacherDrawer)/(teacherTabs)/module/OnlineExamModule" },
  { title: "Assignment", icon: imagePath.icon13, route: "(teachers)/(teacherDrawer)/(teacherTabs)/module/AssignmentModule" },
  { title: "Fee", icon: imagePath.fee, route: "(teachers)/(teacherDrawer)/(teacherTabs)/module/FeeModule" },
];

const TeacherModulesScreen = () => {
  const router = useRouter();

  const handleModulePress = (route) => {
    if (route) router.push(route);
  };

  return (
    <ScrollView>
      <View className="p-4">
        <Text className="text-xl font-bold text-center mb-4">Teacher Modules</Text>
        <View className="flex flex-row flex-wrap justify-center">
          {teacherModules.map((module, index) => (
            <Module
              key={index}
              title={module.title}
              icon={module.icon}
              onPress={() => handleModulePress(module.route)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default TeacherModulesScreen;
