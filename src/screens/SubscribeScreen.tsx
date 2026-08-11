import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Subscribe'>;

const WEB_SUBSCRIBE_URL = 'https://oda-ochre.vercel.app/subscribe';

const features = [
  '365-day full access',
  '160+ curated research databases',
  'Secure credential vault',
  'Institutional resource access',
  'Priority support',
];

export default function SubscribeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handlePay = async () => {
    const supported = await Linking.canOpenURL(WEB_SUBSCRIBE_URL);
    if (supported) {
      await Linking.openURL(WEB_SUBSCRIBE_URL);
    } else {
      Alert.alert('Error', 'Unable to open payment page');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
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
          className="bg-primary py-4 rounded-xl items-center mb-4"
          onPress={handlePay}
        >
          <Text className="text-white text-base font-bold">Pay ₦1,000 via Browser</Text>
        </TouchableOpacity>

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
