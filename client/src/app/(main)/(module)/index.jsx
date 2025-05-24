import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { logout } from "@/src/redux/slices/authSlice";

// Header Component
const Header = ({ router, dispatch }) => (
  <View className="px-4 py-6 bg-indigo-700 flex-row justify-between items-center">
    <View>
      <Text className="text-2xl font-bold text-white">
        School Dashboard
      </Text>
      <Text className="text-sm text-indigo-100">
        Welcome back, Admin
      </Text>
    </View>
    <TouchableOpacity
      className="flex-row items-center bg-indigo-800 py-2 px-4 rounded-lg"
      onPress={() => {
        dispatch(logout());
        router.push("/(auth)/login");
      }}
    >
      <Ionicons
        name="log-out-outline"
        size={22}
        color="#fff"
        style={{ marginRight: 6 }}
      />
      <Text className="text-white font-medium">Log Out</Text>
    </TouchableOpacity>
  </View>
);

// Module Component
const Module = ({ title, iconName, onPress }) => (
  <TouchableOpacity
    className="w-40 h-40 m-2 bg-white rounded-xl shadow-md items-center justify-center"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="items-center p-4">
      <View className="bg-indigo-100 rounded-full p-3 mb-3">
        <Ionicons name={iconName} size={28} color="#4f46e5" />
      </View>
      <Text className="text-center font-medium text-gray-800">{title}</Text>
    </View>
  </TouchableOpacity>
);

// Module Data
const modules = [
  { title: "Attendance", iconName: "calendar", route: "/(module)/Attendance" },
  { title: "Admission", iconName: "person-add", route: "/(module)/Admission" },
  { title: "Students", iconName: "people", route: "/(module)/students" },
  { title: "Academic Plan", iconName: "book", route: "/(module)/AcademicPlan" },
  { title: "Teachers", iconName: "school", route: "/(module)/teacher" },
  { title: "Classes", iconName: "easel", route: "/(module)/class" },
  {
    title: "Result Analysis",
    iconName: "analytics",
    route: "/(module)/ResultAnalysis",
  },
  {
    title: "Online Exam",
    iconName: "document-text",
    route: "/(module)/OnlineExam",
  },
  {
    title: "Assignments",
    iconName: "clipboard",
    route: "/(module)/Assignment",
  },
  { title: "Fees", iconName: "card", route: "/(module)/FeeModule" },
];

// Main Screen
const ModulesScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleModulePress = (route) => {
    if (route) router.push(route);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="light-content" backgroundColor="#4338ca" />
      <Header router={router} dispatch={dispatch} />
      
      <View className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
        <Text className="text-indigo-900 font-medium">Quick Access Modules</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row flex-wrap justify-center pt-4">
          {modules.map((module, index) => (
            <Module
              key={index}
              title={module.title}
              iconName={module.iconName}
              onPress={() => handleModulePress(module.route)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModulesScreen;