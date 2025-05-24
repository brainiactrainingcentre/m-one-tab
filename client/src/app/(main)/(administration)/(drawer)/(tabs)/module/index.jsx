import { View } from "react-native"; 
import React from "react"; 
import { ScrollView } from "react-native-gesture-handler"; 
import Module from "@/src/components/studentHome/Module"; 
import imagePath from "@/src/utils/constants/imagePath"; 
import { useRouter } from "expo-router";

const modules = [
  { title: "AttendanceModule", icon: imagePath.icon13, route: "(administration)/(drawer)/(tabs)/module/AttendanceModule" },
  { title: "Attendance", icon: imagePath.icon13, route: "(administration)/(drawer)/(tabs)/module/Attendance" },
  { title: "Student", icon: imagePath.icon13, route: "(administration)/(drawer)/(tabs)/module/students" },
  { title: "Admission", icon: imagePath.icon13, route: "(administration)/(drawer)/(tabs)/module/AdmissionModule" },
  { title: "Academic Plan", icon: imagePath.icon13, route: "(administration)/(drawer)/(tabs)/module/AcademicPlanModule" },
  { title: "Teacher", icon: imagePath.icon13, route: "(administration)/(drawer)/(tabs)/module/teacher" },
  { title: "class", icon: imagePath.icon13, route: "(administration)/(drawer)/(tabs)/module/class" },
  { title: "Result Analysis", icon: imagePath.icon13, route: "(administration)/(drawer)/(tabs)/module/ResultAnalysisModule" },
  { title: "Online Exam", icon: imagePath.icon13, route: "(administration)/(drawer)/(tabs)/module/OnlineExamModule" },
  { title: "Assignment", icon: imagePath.icon13, route: "(administration)/(drawer)/(tabs)/module/AssignmentModule" },
  { title: "Fee", icon: imagePath.fee, route: "(administration)/(drawer)/(tabs)/module/FeeModule" },
];

const ModulesScreen = () => {
  const router = useRouter();
  
  const handleModulePress = (route) => {
    if (route) router.push(route);
  };
  
  return (
    <ScrollView>
      <View className="flex flex-row flex-wrap justify-center">
        {modules.map((module, index) => (
          <Module
            key={index}
            title={module.title}
            subtext=""
            icon={module.icon}
            onPress={() => handleModulePress(module.route)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default ModulesScreen;
