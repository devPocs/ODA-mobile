import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Bottom Tabs
export type MainTabParamList = {
  Databases: undefined;
  MyDatabases: undefined;
  RequestDatabase: undefined;
  Feedback: undefined;
  Profile: undefined;
};

// Main Stack (wraps tabs + modal-style screens)
export type MainStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
  Subscribe: undefined;
  OTPValidation: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
