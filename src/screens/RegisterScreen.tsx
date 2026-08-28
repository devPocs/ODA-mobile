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
import { z } from 'zod';
import { authApi, institutionsApi } from '../api';
import { AuthStackParamList } from '../navigation/types';
import { Institution } from '../types';
import Logo from '../components/Logo';
import InstitutionPicker from '../components/InstitutionPicker';
import { toast } from '../utils/toast';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

// Mirrors the API's registerSchema (auth.validator.ts) so the app rejects
// the same inputs before ever making the request, with the same messages.
const registerSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters long'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters long'),
  email: z.string().trim().email({ message: 'Please provide a valid email address' }),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 characters long'),
  institution: z.string().trim().min(2, 'Please select your institution'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof registerSchema>, string>>;

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
    const result = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      phone,
      institution,
      password,
    });

    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      toast.error('Please fix the highlighted fields');
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await authApi.register(result.data);
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
          <Logo height={88} showTagline />
          <Text className="text-sm text-gray-500 mt-2">Start your 7-day free trial</Text>
        </View>

        <View className="w-full">
          <Text className="text-2xl font-bold text-gray-800 mb-8">Create Account</Text>

          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-800 mb-2">First Name</Text>
              <TextInput
                className={`border rounded-lg p-3 text-base bg-gray-50 text-gray-800 ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                placeholderTextColor="#9CA3AF"
                placeholder="First name"
                value={firstName}
                onChangeText={(v) => {
                  setFirstName(v);
                  setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                }}
                editable={!loading}
              />
              {fieldErrors.firstName && (
                <Text className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Last Name</Text>
              <TextInput
                className={`border rounded-lg p-3 text-base bg-gray-50 text-gray-800 ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                placeholderTextColor="#9CA3AF"
                placeholder="Last name"
                value={lastName}
                onChangeText={(v) => {
                  setLastName(v);
                  setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                }}
                editable={!loading}
              />
              {fieldErrors.lastName && (
                <Text className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</Text>
              )}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-2">Email</Text>
            <TextInput
              className={`border rounded-lg p-3 text-base bg-gray-50 text-gray-800 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholderTextColor="#9CA3AF"
              placeholder="Enter your email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {fieldErrors.email && <Text className="text-red-500 text-xs mt-1">{fieldErrors.email}</Text>}
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-2">Phone Number</Text>
            <TextInput
              className={`border rounded-lg p-3 text-base bg-gray-50 text-gray-800 ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholderTextColor="#9CA3AF"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              keyboardType="phone-pad"
              editable={!loading}
            />
            {fieldErrors.phone && <Text className="text-red-500 text-xs mt-1">{fieldErrors.phone}</Text>}
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-2">Institution</Text>
            <InstitutionPicker
              institutions={institutions}
              value={institution}
              onSelect={(name) => {
                setInstitution(name);
                setFieldErrors((prev) => ({ ...prev, institution: undefined }));
              }}
              loading={institutionsLoading}
              disabled={loading}
              error={!!fieldErrors.institution}
            />
            {fieldErrors.institution && (
              <Text className="text-red-500 text-xs mt-1">{fieldErrors.institution}</Text>
            )}
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-2">Password</Text>
            <TextInput
              className={`border rounded-lg p-3 text-base bg-gray-50 text-gray-800 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholderTextColor="#9CA3AF"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              secureTextEntry
              editable={!loading}
            />
            {fieldErrors.password && (
              <Text className="text-red-500 text-xs mt-1">{fieldErrors.password}</Text>
            )}
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
