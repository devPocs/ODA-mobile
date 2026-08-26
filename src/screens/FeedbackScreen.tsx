import React, { useState, useEffect } from 'react';
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
import { authApi, feedbackApi, institutionsApi } from '../api';
import { Institution } from '../types';
import Logo from '../components/Logo';
import InstitutionPicker from '../components/InstitutionPicker';
import { toast } from '../utils/toast';

export default function FeedbackScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(true);

  useEffect(() => {
    authApi.getProfile().then((response) => {
      const user = response.data?.user;
      if (!user) return;
      const fullName = user.name || `${user.firstName} ${user.lastName}`.trim();
      if (fullName) setName(fullName);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
      if (user.institution) setInstitution(user.institution);
    }).catch(() => {});

    institutionsApi
      .getAll()
      .then((response) => setInstitutions(response.data?.institutions || []))
      .catch(() => toast.error('Failed to load institutions list'))
      .finally(() => setInstitutionsLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!name || !phone || !email || !institution || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await feedbackApi.submitFeedback({ name, phone, email, institution, message });

      toast.success('Your feedback has been submitted. Our team will review it shortly.', 'Thank you');
      setMessage('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="px-5 py-4 bg-white border-b border-gray-200">
            <Logo height={40} />
            <Text className="text-2xl font-bold text-gray-800 mt-2">Feedback / Complaint</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Your details are prefilled from your profile — edit them if you're submitting on
              behalf of someone else.
            </Text>
          </View>

          <View className="p-5">
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Name *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800"
                placeholderTextColor="#9CA3AF"
                placeholder="Full name"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Phone Number *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800"
                placeholderTextColor="#9CA3AF"
                placeholder="e.g. 08012345678"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Email Address *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800"
                placeholderTextColor="#9CA3AF"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-2">
                Institution / Organization *
              </Text>
              <InstitutionPicker
                institutions={institutions}
                value={institution}
                onSelect={setInstitution}
                loading={institutionsLoading}
                disabled={loading}
              />
            </View>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Feedback / Complaint *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800 h-[120px] pt-3"
                placeholderTextColor="#9CA3AF"
                placeholder="Tell us what's on your mind..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              className={`bg-primary p-4 rounded-lg items-center mt-2.5 ${loading ? 'opacity-60' : ''}`}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text className="text-white text-base font-semibold">
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
