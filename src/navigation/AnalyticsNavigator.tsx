// src/navigation/AnalyticsNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import analytics screens
import PlantAnalyticsDashboard from '../screens/analytics/PlantAnalyticsDashboard';
import HistoricalDataScreen from '../screens/home/HistoricalDataScreen';

const Stack = createStackNavigator();

const AnalyticsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnalyticsDashboard" component={PlantAnalyticsDashboard} />
      <Stack.Screen name="HistoricalData" component={HistoricalDataScreen} />
    </Stack.Navigator>
  );
};

export default AnalyticsNavigator;