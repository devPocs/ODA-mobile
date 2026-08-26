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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi, institutionsApi } from '../api';
import { AuthStackParamList } from '../navigation/types';
import { Institution } from '../types';
import Logo from '../components/Logo';
import InstitutionPicker from '../components/InstitutionPicker';
import { toast } from '../utils/toast';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(true);

  useEffect(() => {
    institutionsApi
      .getAll()
      .then((response) => {
        setInstitutions(response.data?.institutions || []);
      })
      .catch(() => {
        toast.error('Failed to load institutions list');
      })
      .finally(() => setInstitutionsLoading(false));
  }, []);

  const handleRegister = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !institution.trim() ||
      !password
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (phone.length < 10) {
      toast.error('Phone number must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ firstName, lastName, email, phone, institution, password });
      toast.success(
        'A verification email has been sent to your inbox. Please verify your email before logging in.',
        'Account Created!'
      );
      navigation.navigate('Login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred', 'Registration Failed');
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
        <View className="items-center mb-10">
          <Logo height={88} />
          <Text className="text-sm text-gray-500 mt-2">Start your 7-day free trial</Text>
        </View>

        <View className="w-full">
          <Text className="text-2xl font-bold text-gray-800 mb-8">Create Account</Text>

          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-800 mb-2">First Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50 text-gray-800"
                placeholderTextColor="#9CA3AF"
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
                editable={!loading}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Last Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50 text-gray-800"
                placeholderTextColor="#9CA3AF"
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
                editable={!loading}
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-2">Email</Text>
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

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-2">Phone Number</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50 text-gray-800"
              placeholderTextColor="#9CA3AF"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-2">Institution</Text>
            <InstitutionPicker
              institutions={institutions}
              value={institution}
              onSelect={setInstitution}
              loading={institutionsLoading}
              disabled={loading}
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-2">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50 text-gray-800"
              placeholderTextColor="#9CA3AF"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className={`bg-primary p-4 rounded-lg items-center mt-2 ${loading ? 'opacity-60' : ''}`}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white text-base font-semibold">
              {loading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text className="text-center mt-5 text-gray-600 text-sm">
              Already have an account?{' '}
              <Text className="text-primary font-semibold">Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
