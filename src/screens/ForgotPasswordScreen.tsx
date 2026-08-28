import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { AuthStackParamList } from '../navigation/types';
import Logo from '../components/Logo';
import { toast } from '../utils/toast';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (error) {
      // API always returns success even if email doesn't exist (security)
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View className="items-center mb-8">
          <Logo height={88} showTagline />
        </View>
        <TouchableOpacity
          className="mb-8"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-primary font-semibold">← Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-800 mb-3">Forgot Password</Text>

        {!sent ? (
          <>
            <Text className="text-gray-500 text-sm mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Email Address</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50 text-gray-800"
                placeholderTextColor="#9CA3AF"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              className={`bg-primary p-4 rounded-lg items-center ${loading ? 'opacity-60' : ''}`}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text className="text-white text-base font-semibold">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="bg-green-50 border border-green-200 rounded-xl p-6 items-center">
            <Text className="text-green-800 font-bold text-lg mb-2">Email Sent</Text>
            <Text className="text-green-700 text-sm text-center mb-6">
              If an account exists with this email, you will receive password reset instructions shortly.
            </Text>
            <TouchableOpacity
              className="bg-primary px-6 py-3 rounded-lg"
              onPress={() => navigation.navigate('Login')}
            >
              <Text className="text-white font-semibold">Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
