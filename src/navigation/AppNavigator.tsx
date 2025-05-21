// src/navigation/AppNavigator.tsx
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import DeviceNavigator from './DeviceNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator} 
          />
        ) : null}
        <Stack.Screen 
          name="Main" 
          component={MainNavigator} 
        />
        <Stack.Screen 
          name="DeviceSetup" 
          component={DeviceNavigator} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;