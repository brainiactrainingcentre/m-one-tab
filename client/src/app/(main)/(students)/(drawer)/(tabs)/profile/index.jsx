import { View, Text } from 'react-native'
import React from 'react'
import ChangePassword from '@/src/components/common/ChangePassword'

const profile = () => {
  return (
    <View>
      <Text>Student profile</Text>
      <ChangePassword/>
    </View>
  )
}

export default profile