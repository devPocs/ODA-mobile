import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import { MainTabs } from './MainTabs';
import SubscribeScreen from '../screens/SubscribeScreen';
import OTPValidationScreen from '../screens/OTPValidationScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="Subscribe" component={SubscribeScreen} />
      <Stack.Screen name="OTPValidation" component={OTPValidationScreen} />
    </Stack.Navigator>
  );
}
