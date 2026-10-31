import { NativeModules, Platform } from 'react-native';

// Set per Android flavor in android/app/build.gradle (productFlavors) and read
// through AppConfigModule. Falls back to live if the module isn't there.
const appConfig: { apiBaseUrl?: string; flavor?: string } = NativeModules.AppConfig ?? {};

// iOS debug builds test against the MySQL backend on Vercel; release builds stay on live
const IOS_DEV_API_URL = 'https://oda-mono-be.vercel.app';

export const API_BASE_URL =
  appConfig.apiBaseUrl ??
  (Platform.OS === 'ios' && __DEV__ ? IOS_DEV_API_URL : 'https://api.odagateway.com');

/** true for the "ODA Test" build, which uses Paystack test mode. */
export const IS_TEST_BUILD = appConfig.flavor === 'staging';
