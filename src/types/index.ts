// API Response Types
export interface ApiError {
  status: string;
  message: string;
}

export interface ApiSuccessResponse<T = any> {
  status: string;
  message: string;
  data?: T;
}

// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  role: string;
  isTrialActive: boolean;
  trialEndDate?: string;
  hasPaidForOTP: boolean;
  otpValidated: boolean;
  subscriptionEndDate?: string | null;
  createdAt: string;
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  role: string;
  isTrialActive: boolean;
  trialEndDate?: string;
  hasPaidForOTP: boolean;
  otpValidated: boolean;
  subscriptionEndDate?: string | null;
  createdAt: string;
}

export interface ProfileResponse {
  user: UserProfile;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institution: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Database Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface DatabaseItem {
  _id: string;
  name: string;
  url: string;
  logo: string;
  category?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserDatabase {
  _id: string;
  databaseId: {
    _id: string;
    name: string;
    url: string;
    logo: string;
    category?: string;
    description?: string;
  };
  createdAt: string;
  lastAccessed: string;
}

export interface DatabaseRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    institution: string;
  };
  name: string;
  url: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface RequestDatabaseData {
  name: string;
  url: string;
  description?: string;
}

// Feedback Types
export interface FeedbackData {
  name: string;
  phone: string;
  email: string;
  institution: string;
  message: string;
}

// Institution — matches GET /api/institutions response
export interface Institution {
  _id: string;
  name: string;
  code?: string;
  country: string;
  type: string;
}

// Payment — matches POST /api/payment/initialize response (Paystack initialize-transaction shape)
export interface PaymentInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

// Trial / Subscription Status — matches GET /api/auth/trial-status response
export interface TrialStatus {
  isTrialActive: boolean;
  trialStartDate: string;
  trialEndDate: string;
  daysRemaining: number;
  hasPaidForOTP: boolean;
  otpValidated: boolean;
  isSubscribed: boolean;
  subscriptionEndDate: string | null;
  subscriptionExpired: boolean;
  subscriptionDaysRemaining: number;
  canAccessApp: boolean;
}
