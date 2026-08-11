import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { MainTabParamList } from './types';
import DatabasesScreen from '../screens/DatabasesScreen';
import MyDatabasesScreen from '../screens/MyDatabasesScreen';
import RequestDatabaseScreen from '../screens/RequestDatabaseScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8B2635',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tab.Screen
        name="Databases"
        component={DatabasesScreen}
        options={{
          tabBarLabel: 'Databases',
          tabBarIcon: ({ color, size }) => (
            <Icon name="server-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyDatabases"
        component={MyDatabasesScreen}
        options={{
          tabBarLabel: 'My Databases',
          tabBarIcon: ({ color, size }) => (
            <Icon name="folder-open-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RequestDatabase"
        component={RequestDatabaseScreen}
        options={{
          tabBarLabel: 'Request',
          tabBarIcon: ({ color, size }) => (
            <Icon name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          tabBarLabel: 'Feedback',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chatbox-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
