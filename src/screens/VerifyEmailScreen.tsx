import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api';
import { AuthStackParamList } from '../navigation/types';
import Logo from '../components/Logo';
import { toast } from '../utils/toast';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type Route = RouteProp<AuthStackParamList, 'VerifyEmail'>;

// Shown after sign-up, like the web app's /verify-email page. The link in the
// email opens in the browser; the user then comes back and logs in.
export default function VerifyEmailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { email } = useRoute<Route>().params;
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
  }, []);

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

  const handleResend = async () => {
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View className="items-center mb-8">
          <Logo height={88} showTagline />
        </View>

        <Text className="text-2xl font-bold text-gray-800 mb-3">Check your email</Text>
        <Text className="text-gray-600 text-base mb-1">We sent a verification link to</Text>
        <Text className="text-gray-800 text-base font-semibold mb-4">{email}</Text>
        <Text className="text-gray-600 text-sm mb-8">
          Open the link to verify your account, then come back here and log in. It expires in
          24 hours. Can't find it? Check your spam folder.
        </Text>

        <TouchableOpacity
          className="bg-primary p-4 rounded-lg items-center"
          onPress={() => navigation.replace('Login', { email })}
        >
          <Text className="text-white text-base font-semibold">I've verified, log in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`border border-primary p-4 rounded-lg items-center mt-3 ${(isResending || resendCooldown > 0) ? 'opacity-50' : ''}`}
          onPress={handleResend}
          disabled={isResending || resendCooldown > 0}
        >
          <Text className="text-primary text-base font-semibold">
            {isResending
              ? 'Sending...'
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend verification email'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
