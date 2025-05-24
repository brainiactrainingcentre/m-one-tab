import React from 'react'
import { Stack } from 'expo-router'

const StudetProfileLayout = () => {
  return (
    <Stack  screenOptions={{headerShown:false}}>
        <Stack.Screen name='index'  />
    </Stack>
  )
}

export default StudetProfileLayout