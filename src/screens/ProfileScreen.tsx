import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api';
import { UserProfile, TrialStatus } from '../types';
import { MainStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!trialStatus) return;

    // Count down to subscription end if subscribed, otherwise trial end
    const endDateStr = trialStatus.isSubscribed && trialStatus.subscriptionEndDate
      ? trialStatus.subscriptionEndDate
      : trialStatus.trialEndDate;

    if (!endDateStr) return;

    const timer = setInterval(() => {
      const distance = new Date(endDateStr).getTime() - Date.now();
      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [trialStatus]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileResponse, statusResponse] = await Promise.all([
        authApi.getProfile(),
        authApi.getTrialStatus(),
      ]);
      if (profileResponse.data?.user) setProfile(profileResponse.data.user);
      if (statusResponse.data) setTrialStatus(statusResponse.data);
    } catch (error) {
      Alert.alert('Error', `Failed to load profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => authApi.logout(),
      },
    ]);
  };

  const getStatusLabel = (): { label: string; color: string; detail: string } => {
    if (!trialStatus) return { label: 'Loading...', color: '#666', detail: '' };
    if (trialStatus.isSubscribed && !trialStatus.subscriptionExpired) {
      return {
        label: 'SUBSCRIBED',
        color: '#16a34a',
        detail: `365-day access · ${trialStatus.subscriptionDaysRemaining} days left`,
      };
    }
    if (trialStatus.isTrialActive) {
      return {
        label: 'FREE TRIAL',
        color: '#d97706',
        detail: `${trialStatus.daysRemaining} day${trialStatus.daysRemaining !== 1 ? 's' : ''} remaining`,
      };
    }
    return { label: 'EXPIRED', color: '#dc2626', detail: 'Subscribe to regain access' };
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8B2635" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-base text-gray-600 mb-4">Failed to load profile</Text>
        <TouchableOpacity
          className="bg-white px-6 py-3 rounded-lg border border-primary"
          onPress={loadProfile}
        >
          <Text className="text-primary font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = getStatusLabel();
  const showSubscribeButton = !trialStatus?.isSubscribed || trialStatus?.subscriptionExpired;
  const showCountdown = trialStatus?.canAccessApp;
  const endDateStr = trialStatus?.isSubscribed && trialStatus?.subscriptionEndDate
    ? trialStatus.subscriptionEndDate
    : trialStatus?.trialEndDate;

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <ScrollView>
        {/* Header */}
        <View className="bg-white items-center py-8 border-b border-gray-200">
          <View className="w-24 h-24 rounded-full bg-primary justify-center items-center mb-4">
            <Text className="text-4xl font-bold text-white">
              {(profile.firstName || profile.name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-1" selectable>
            {profile.name || `${profile.firstName} ${profile.lastName}`}
          </Text>
          <Text className="text-sm text-gray-500">{profile.email}</Text>
        </View>

        {/* Info Section */}
        <View className="bg-white mt-4 py-4">
          {[
            { label: 'Full Name', value: profile.name || `${profile.firstName} ${profile.lastName}` },
            { label: 'Email Address', value: profile.email },
            { label: 'Phone Number', value: profile.phone },
            { label: 'Institution', value: profile.institution },
            {
              label: 'Member Since',
              value: profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'N/A',
            },
          ].map(({ label, value }) => (
            <View key={label} className="px-4 py-3 bg-gray-50 rounded-lg mx-4 mb-3">
              <Text className="text-xs text-gray-500 mb-1">{label}</Text>
              <Text className="text-sm font-semibold text-gray-800" selectable>
                {value || 'N/A'}
              </Text>
            </View>
          ))}
        </View>

        {/* Subscription Card */}
        <View className="bg-primary m-4 p-5 rounded-xl">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs font-bold text-white">SUBSCRIPTION STATUS</Text>
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-xs font-bold text-white">{status.label}</Text>
            </View>
          </View>
          <Text className="text-white/70 text-xs mb-4">{status.detail}</Text>

          {showCountdown && endDateStr && (
            <>
              <Text className="text-xs font-bold text-white text-center mb-3">
                {trialStatus?.isSubscribed ? 'SUBSCRIPTION EXPIRES IN' : 'TRIAL EXPIRES IN'}
              </Text>
              <View className="flex-row justify-center items-center mb-2">
                {[
                  { value: countdown.days, unit: 'DAYS' },
                  { value: countdown.hours, unit: 'HRS' },
                  { value: countdown.minutes, unit: 'MINS' },
                  { value: countdown.seconds, unit: 'SECS' },
                ].map(({ value, unit }, i) => (
                  <React.Fragment key={unit}>
                    {i > 0 && <Text className="text-2xl font-bold text-white mx-1">:</Text>}
                    <View className="items-center">
                      <View className="bg-white/20 px-3 py-2 rounded-md min-w-[48px] items-center">
                        <Text className="text-2xl font-bold text-white">
                          {value.toString().padStart(2, '0')}
                        </Text>
                      </View>
                      <Text className="text-[9px] font-semibold text-white/70 mt-1">{unit}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </>
          )}

          {showSubscribeButton && (
            <TouchableOpacity
              className="bg-white mt-4 py-3 rounded-lg items-center"
              onPress={() => navigation.navigate('Subscribe')}
            >
              <Text className="text-primary font-bold">
                {trialStatus?.subscriptionExpired ? 'Renew — ₦1,000' : 'Subscribe — ₦1,000'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Change Password */}
        <View className="bg-white mx-4 mb-4 p-5 rounded-xl">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-bold text-gray-800">Change Password</Text>
            <TouchableOpacity onPress={() => setShowPasswords(!showPasswords)}>
              <Text className="text-sm text-primary font-medium">
                {showPasswords ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-3">
            <Text className="text-xs text-gray-500 mb-1">Current Password</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 text-sm bg-gray-50"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showPasswords}
              editable={!changingPassword}
            />
          </View>

          <View className="mb-3">
            <Text className="text-xs text-gray-500 mb-1">New Password</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 text-sm bg-gray-50"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPasswords}
              editable={!changingPassword}
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-1">Confirm New Password</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 text-sm bg-gray-50"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPasswords}
              editable={!changingPassword}
            />
          </View>

          <TouchableOpacity
            className={`bg-primary py-3 rounded-lg items-center ${changingPassword ? 'opacity-60' : ''}`}
            onPress={handleChangePassword}
            disabled={changingPassword}
          >
            <Text className="text-white font-semibold">
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-white mx-4 mb-8 p-4 rounded-lg items-center border border-primary"
          onPress={handleLogout}
        >
          <Text className="text-primary text-base font-semibold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
