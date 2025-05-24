import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const TeacherModule = () => {
  return (
    <Stack screenOptions={{headerShown:false}}>
       <Stack.Screen name='index'/>
       <Stack.Screen name='AttendanceModule'/>
       <Stack.Screen name='AdmissionModule'/>
       <Stack.Screen name='LibraryModule'/>
       <Stack.Screen name='FeeModule'/>
       <Stack.Screen name='AssignmentModule'/>
       <Stack.Screen name='OnlineExamModule'/>
       <Stack.Screen name='ResultAnalysisModule'/>
       <Stack.Screen name='LMSModule'/>
       <Stack.Screen name='AcademicPlanModule'/>
       <Stack.Screen name='ParentForm'/>
      
      </Stack>
  )
}

export default TeacherModule