import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api';
import { TrialStatus } from '../types';
import { MainStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Paid but the emailed OTP hasn't been entered yet — the API blocks the app
// until it is, so this is the user's way to the OTP screen.
export const isAwaitingOTP = (s: TrialStatus | null) => !!s && s.hasPaidForOTP && !s.otpValidated;

/**
 * Shown above the database lists when the API is blocking access (trial over,
 * subscription expired, or payment made but OTP not entered), with a direct
 * way to subscribe or enter the OTP. Renders nothing while access is open.
 */
export default function AccessBanner({ onAccessChange }: { onAccessChange?: (canAccess: boolean) => void }) {
  const navigation = useNavigation<NavigationProp>();
  const [status, setStatus] = useState<TrialStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      authApi
        .getTrialStatus()
        .then((response) => {
          if (!response.data) return;
          setStatus(response.data);
          onAccessChange?.(response.data.canAccessApp && !isAwaitingOTP(response.data));
        })
        .catch(() => {});
    }, [onAccessChange])
  );

  // Paying during the trial leaves canAccessApp true (the trial is still
  // running), but the API blocks the app until the OTP is entered.
  const awaitingOTP = isAwaitingOTP(status);
  if (!status || (status.canAccessApp && !awaitingOTP)) return null;
  const title = awaitingOTP
    ? 'Payment received — activate your subscription'
    : status.subscriptionExpired
      ? 'Your subscription has expired'
      : 'Your free trial has ended';
  const detail = awaitingOTP
    ? 'Enter the 6-digit OTP we emailed you to unlock the databases.'
    : 'Subscribe to regain access. Already paid? Enter the OTP from your email.';

  return (
    <View className="mx-5 mt-3 p-4 rounded-xl bg-primary">
      <Text className="text-white font-bold text-sm mb-1">{title}</Text>
      <Text className="text-white/80 text-xs mb-3">{detail}</Text>
      <View className="flex-row gap-2">
        {!awaitingOTP && (
          <TouchableOpacity
            className="flex-1 bg-white py-2.5 rounded-lg items-center"
            onPress={() => navigation.navigate('Subscribe')}
          >
            <Text className="text-primary font-bold text-sm">
              {status.subscriptionExpired ? 'Renew — ₦1,000' : 'Subscribe — ₦1,000'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg items-center ${awaitingOTP ? 'bg-white' : 'border border-white'}`}
          onPress={() => navigation.navigate('OTPValidation')}
        >
          <Text className={`font-bold text-sm ${awaitingOTP ? 'text-primary' : 'text-white'}`}>Enter OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
