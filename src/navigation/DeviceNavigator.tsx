// src/navigation/DeviceNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import AddDeviceScreen from '../screens/device/AddDeviceScreen';
import ConfigureDeviceWifiScreen from '../screens/device/ConfigureDeviceWifiScreen';
import ConfigurePlantScreen from '../screens/device/ConfigurePlantScreen';
import DeviceSetupSuccessScreen from '../screens/device/DeviceSetupSuccessScreen';

const Stack = createStackNavigator();

const DeviceNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
      <Stack.Screen name="ConfigureDeviceWifi" component={ConfigureDeviceWifiScreen} />
      <Stack.Screen name="ConfigurePlant" component={ConfigurePlantScreen} />
      <Stack.Screen name="DeviceSetupSuccess" component={DeviceSetupSuccessScreen} />
    </Stack.Navigator>
  );
};

export default DeviceNavigator;