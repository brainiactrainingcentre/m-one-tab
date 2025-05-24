import { ScrollView } from 'react-native';
import React from 'react';
import Login from './login';
const Index = () => {
  return (
    <ScrollView contentContainerStyle={{ 
      flexGrow: 1,
     }} className='bg-white'>
      <Login/>
    </ScrollView>
  );
}
export default Index;