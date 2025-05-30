import { View } from "react-native"; 
import React from "react"; 
import { ScrollView } from "react-native-gesture-handler"; 
import Module from "@/src/components/studentHome/Module"; 
import imagePath from "@/src/utils/constants/imagePath"; 
import { useRouter } from "expo-router";
const modules = [
  { title: "Attendance", icon: imagePath.icon13, route: "(students)/(drawer)/(tabs)/module/AttendanceModule" },
  { title: "Admission", icon: imagePath.icon13, route: "(students)/(drawer)/(tabs)/module/working" },
  { title: "Academic Plan", icon: imagePath.icon13, route: "(students)/(drawer)/(tabs)/module/working" },
  { title: "LMS", icon: imagePath.icon13, route: "(students)/(drawer)/(tabs)/module/working" },
  { title: "Library", icon: imagePath.icon13, route: "(students)/(drawer)/(tabs)/module/working" },
  { title: "Result Analysis", icon: imagePath.icon13, route: "(students)/(drawer)/(tabs)/module/working" },
  { title: "Online Exam", icon: imagePath.icon13, route: "(students)/(drawer)/(tabs)/module/working" },
  { title: "Assignment", icon: imagePath.icon13, route: "(students)/(drawer)/(tabs)/module/working" },
  { title: "Fee", icon: imagePath.fee, route: "(students)/(drawer)/(tabs)/module/working" },
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