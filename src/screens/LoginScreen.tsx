import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api';
import { AuthStackParamList } from '../navigation/types';
import Logo from '../components/Logo';
import PasswordInput from '../components/PasswordInput';
import { toast } from '../utils/toast';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Login'>>();
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setEmailNotVerified(false);
    setLoading(true);
    try {
      await authApi.login({ email, password });
      // RootNavigator detects token via interval and switches to MainStack
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      if (message === 'EMAIL_NOT_VERIFIED') {
        setEmailNotVerified(true);
      } else {
        toast.error(message, 'Login Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Enter your email address above first');
      return;
    }
    setIsResending(true);
    try {
      await authApi.resendVerificationEmail(email);
      toast.success('Verification email sent. Check your inbox.', 'Email Sent');
      startCooldown();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          <View className="items-center mb-10">
            <Logo height={96} showTagline />
          </View>

          <View className="w-full">
            <Text className="text-2xl font-bold text-gray-800 mb-8">Welcome Back</Text>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50 text-gray-800"
                placeholderTextColor="#9CA3AF"
                placeholder="Enter your email"
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailNotVerified(false); }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-800">Password</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text className="text-sm text-primary font-medium">Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <PasswordInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50 text-gray-800"
                placeholderTextColor="#9CA3AF"
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            {emailNotVerified && (
              <View className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <Text className="text-amber-800 font-semibold mb-1">Email not verified</Text>
                <Text className="text-amber-700 text-sm mb-3">
                  Please verify your email before logging in.
                </Text>
                <TouchableOpacity
                  className={`bg-amber-100 border border-amber-300 rounded-lg p-2 items-center ${(isResending || resendCooldown > 0) ? 'opacity-50' : ''}`}
                  onPress={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                >
                  <Text className="text-amber-800 font-semibold text-sm">
                    {isResending
                      ? 'Sending...'
                      : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend verification email'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              className={`bg-primary p-4 rounded-lg items-center mt-2 ${loading ? 'opacity-60' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white text-base font-semibold">
                {loading ? 'Signing in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <Text className="text-center mt-5 text-gray-600 text-sm">
                Don't have an account?{' '}
                <Text className="text-primary font-semibold">Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
