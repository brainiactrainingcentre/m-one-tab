import React from 'react'
import { Stack } from 'expo-router'
const studentModulLayout = () => {
  return <Stack screenOptions={{headerShown:false}}>
   <Stack.Screen name='index'/>
   <Stack.Screen name='AttendanceModule'/>
  </Stack>
}

export default studentModulLayout