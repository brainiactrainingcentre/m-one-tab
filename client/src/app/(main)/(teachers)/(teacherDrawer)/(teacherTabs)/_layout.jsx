import { View, Text } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const TeacherTab = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0D0169',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#bbb',
        headerShown: false, // Global header hiding (should work)
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          headerShown: false, // Ensure no header
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="module" 
        options={{ 
          title: 'Modules',
          headerShown: false, // Ensure no header
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="th-large" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="create" 
        options={{ 
          title: 'Create',
          headerShown: false, // Ensure no header
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="plus-circle" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          headerShown: false, // Ensure no header
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
};

export default TeacherTab;
