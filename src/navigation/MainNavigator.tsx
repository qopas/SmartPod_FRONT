// src/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS } from '../constants/colors';

// Import screens
import DashboardScreen from '../screens/home/DashboardScreen';
import AnalyticsNavigator from './AnalyticsNavigator';
import PlantDetailScreen from '../screens/home/PlantDetailScreen';

// Placeholder components for other tabs
const PlantsScreen = () => <Text>Plants Screen (Coming Soon)</Text>;
const SettingsScreen = () => <Text>Settings Screen (Coming Soon)</Text>;

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        }
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="PlantDetail" 
        component={PlantDetailScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🌱</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsNavigator} 
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;