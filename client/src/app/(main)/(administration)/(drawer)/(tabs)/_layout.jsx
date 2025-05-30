import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const LayoutTabs = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0D0169', 
          // borderRadius: 30,
          // height: 70, 
          // position: 'relative',
          // bottom: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 10,
          alignItems: 'center', 
          justifyContent: 'center',
          paddingTop:10,
          marginLeft:5,
          marginRight:5,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 5, 
        },
        tabBarShowLabel: false, 
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#B0B0E0',
        headerShown: false,
      }}
    >
      {/* Home Tab
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={22} color={color} />
          ),
        }}
      /> */}

      {/* Modules Tab */}
      <Tabs.Screen
        name="module"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="th-large" size={22} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-circle" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default LayoutTabs;
