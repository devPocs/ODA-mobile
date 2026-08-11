import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api';
import { MainStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'OTPValidation'>;

export default function OTPValidationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleValidate = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP from your email');
      return;
    }

    setLoading(true);
    try {
      await authApi.validateOTP(otp);
      setValidated(true);
    } catch (error) {
      Alert.alert('Invalid OTP', error instanceof Error ? error.message : 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validated) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 justify-center items-center p-8">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
            <Text className="text-4xl">🎉</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
            Subscription Activated!
          </Text>
          <Text className="text-gray-500 text-sm text-center mb-8">
            Welcome to your 365-day full access. Enjoy ODA!
          </Text>
          <TouchableOpacity
            className="bg-primary py-4 px-10 rounded-xl"
            onPress={() => navigation.navigate('Tabs', { screen: 'Databases' })}
          >
            <Text className="text-white font-bold text-base">Start Exploring</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
          <TouchableOpacity className="mb-8" onPress={() => navigation.goBack()}>
            <Text className="text-primary font-semibold">← Back</Text>
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-gray-800 mb-3">Verify OTP</Text>
          <Text className="text-gray-500 text-sm mb-8">
            Enter the 6-digit code sent to your email address after payment.
          </Text>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-800 mb-2">OTP Code</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-2xl bg-gray-50 text-gray-800 text-center tracking-widest"
              placeholderTextColor="#9CA3AF"
              placeholder="000000"
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className={`bg-primary p-4 rounded-xl items-center ${loading ? 'opacity-60' : ''}`}
            onPress={handleValidate}
            disabled={loading}
          >
            <Text className="text-white text-base font-bold">
              {loading ? 'Validating...' : 'Activate Subscription'}
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-xs text-gray-400 mt-6">
            Didn't get the OTP? Go back and check that your payment was completed, then check your email inbox (including spam folder).
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
