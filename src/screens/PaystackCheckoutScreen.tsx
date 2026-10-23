import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { paymentApi } from '../api';
import { toast } from '../utils/toast';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'PaystackCheckout'>;
type Route = RouteProp<MainStackParamList, 'PaystackCheckout'>;

// Paystack sends the customer to the API's callback_url (the web app's
// /payment/callback page) when checkout ends. We catch that navigation here
// instead of loading the page, and confirm the payment ourselves — the same
// thing the web callback page does.
const isCallbackUrl = (url: string) => url.includes('/payment/callback');

type Phase = 'checkout' | 'confirming' | 'unconfirmed';

export default function PaystackCheckoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { redirectUrl, transactionId } = useRoute<Route>().params;
  const [phase, setPhase] = useState<Phase>('checkout');
  const [message, setMessage] = useState('');
  const confirming = useRef(false);

  const confirmPayment = useCallback(async () => {
    if (confirming.current) return;
    confirming.current = true;
    setPhase('confirming');
    try {
      await paymentApi.confirm(transactionId);
      toast.success('Your OTP has been sent to your registered email.', 'Payment Successful!');
      navigation.replace('OTPValidation');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not confirm your payment.');
      setPhase('unconfirmed');
    } finally {
      confirming.current = false;
    }
  }, [navigation, transactionId]);

  const handleRequest = (request: ShouldStartLoadRequest | WebViewNavigation) => {
    const { url } = request;
    if (isCallbackUrl(url)) {
      confirmPayment();
      return false;
    }
    // Bank apps, USSD (tel:) and intent links can't load in a WebView
    if (!/^https?:/i.test(url)) {
      Linking.openURL(url).catch(() => toast.error('Unable to open that payment option'));
      return false;
    }
    return true;
  };

  if (phase !== 'checkout') {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center p-6">
        {phase === 'confirming' ? (
          <>
            <ActivityIndicator size="large" color="#A13D3D" />
            <Text className="text-gray-800 text-base font-semibold mt-4">Confirming your payment…</Text>
            <Text className="text-gray-500 text-sm text-center mt-2">
              This can take up to a minute for bank transfers.
            </Text>
          </>
        ) : (
          <>
            <Text className="text-gray-800 text-base font-semibold text-center mb-2">
              Payment not confirmed yet
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-6">{message}</Text>
            <TouchableOpacity className="bg-primary py-3 px-8 rounded-lg mb-3" onPress={confirmPayment}>
              <Text className="text-white font-semibold">Check again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border border-primary py-3 px-8 rounded-lg mb-3"
              onPress={() => navigation.replace('OTPValidation')}
            >
              <Text className="text-primary font-semibold">I have my OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 px-8" onPress={() => navigation.goBack()}>
              <Text className="text-primary font-semibold">Back</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-base font-bold text-gray-800">Secure payment</Text>
        <TouchableOpacity onPress={confirmPayment}>
          <Text className="text-primary font-semibold">I've paid</Text>
        </TouchableOpacity>
      </View>
      <WebView
        source={{ uri: redirectUrl }}
        onShouldStartLoadWithRequest={handleRequest}
        // Android doesn't call onShouldStartLoadWithRequest for some redirects
        onNavigationStateChange={(nav) => {
          if (isCallbackUrl(nav.url)) confirmPayment();
        }}
        startInLoadingState
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#A13D3D" />
          </View>
        )}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
      />
    </SafeAreaView>
  );
}
