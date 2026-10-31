import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './client';
import {
  AuthResponse,
  RegisterData,
  LoginData,
  UserProfile,
  ProfileResponse,
  TrialStatus,
} from '../types';

export const authApi = {
  // Doesn't keep the token the API returns: storing it would sign the user in
  // (RootNavigator watches for it) before they've verified their email
  async register(data: RegisterData) {
    return api.post<AuthResponse>('/api/auth/register', data);
  },

  async login(data: LoginData) {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    if (response.data) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  async getProfile() {
    return api.get<ProfileResponse>('/api/auth/profile');
  },

  async getTrialStatus() {
    return api.get<TrialStatus>('/api/auth/trial-status');
  },

  async validateOTP(otp: string) {
    return api.post('/api/auth/validate-otp', { otp });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return api.put('/api/auth/change-password', { currentPassword, newPassword });
  },

  async resendVerificationEmail(email: string) {
    return api.post('/api/auth/resend-verification', { email });
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async getStoredUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};
