import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import Logo from '../components/Logo';
import { toast } from '../utils/toast';
import { paymentApi } from '../api';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Subscribe'>;

const features = [
  '365-day full access',
  '160+ curated research databases',
  'Secure credential vault',
  'Institutional resource access',
  'Priority support',
];

export default function SubscribeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [initializing, setInitializing] = useState(false);
  const [checking, setChecking] = useState(false);
  // A checkout the user started but that hasn't been confirmed yet
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      paymentApi.getPendingTransactionId().then(setPendingTransactionId).catch(() => {});
    }, [])
  );

  const handlePay = async () => {
    setInitializing(true);
    try {
      const response = await paymentApi.initialize();
      const { transactionId, redirectUrl } = response.data || {};
      if (!redirectUrl || !transactionId) {
        toast.error('Payment could not be started. Please try again.');
        return;
      }
      // Checkout opens inside the app, which then confirms the payment itself
      navigation.navigate('PaystackCheckout', { redirectUrl, transactionId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start payment');
    } finally {
      setInitializing(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!pendingTransactionId) return;
    setChecking(true);
    try {
      await paymentApi.confirm(pendingTransactionId, { timeoutMs: 10_000 });
      setPendingTransactionId(null);
      toast.success('Your OTP has been sent to your registered email.', 'Payment Successful!');
      navigation.navigate('OTPValidation');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not confirm your payment');
      setPendingTransactionId(await paymentApi.getPendingTransactionId());
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <View className="items-center mb-6">
          <Logo height={72} />
        </View>
        <TouchableOpacity className="mb-6" onPress={() => navigation.goBack()}>
          <Text className="text-primary font-semibold">← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="bg-primary rounded-2xl p-6 mb-6 items-center">
          <Text className="text-white text-xs font-bold mb-2">ODA SUBSCRIPTION</Text>
          <Text className="text-white text-4xl font-bold mb-1">₦1,000</Text>
          <Text className="text-white/70 text-sm">one-time payment · 365-day access</Text>
        </View>

        {/* Features */}
        <View className="bg-white rounded-xl p-5 mb-6">
          <Text className="text-base font-bold text-gray-800 mb-4">What you get</Text>
          {features.map((f) => (
            <View key={f} className="flex-row items-center mb-3">
              <View className="w-5 h-5 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Text className="text-primary text-xs font-bold">✓</Text>
              </View>
              <Text className="text-gray-700 text-sm">{f}</Text>
            </View>
          ))}
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          className={`bg-primary py-4 rounded-xl items-center mb-4 ${(initializing || checking) ? 'opacity-60' : ''}`}
          onPress={handlePay}
          disabled={initializing || checking}
        >
          <Text className="text-white text-base font-bold">
            {initializing ? 'Starting payment...' : 'Pay ₦1,000 with Paystack'}
          </Text>
        </TouchableOpacity>

        {pendingTransactionId && (
          <TouchableOpacity
            className={`border border-primary py-3 rounded-xl items-center mb-4 ${checking ? 'opacity-60' : ''}`}
            onPress={handleCheckStatus}
            disabled={checking || initializing}
          >
            <Text className="text-primary font-semibold">
              {checking ? 'Checking payment...' : 'Paid already? Check payment status'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Already paid section */}
        <View className="bg-white rounded-xl p-5 items-center">
          <Text className="text-gray-600 text-sm mb-1 font-semibold">Already paid?</Text>
          <Text className="text-gray-400 text-xs text-center mb-4">
            An OTP was sent to your email. Enter it below to activate your subscription.
          </Text>
          <TouchableOpacity
            className="border border-primary py-3 px-8 rounded-lg"
            onPress={() => navigation.navigate('OTPValidation')}
          >
            <Text className="text-primary font-semibold">Enter OTP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
