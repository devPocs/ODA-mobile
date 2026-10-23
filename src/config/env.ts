import { NativeModules } from 'react-native';

// Set per Android flavor in android/app/build.gradle (productFlavors) and read
// through AppConfigModule. Falls back to live if the module isn't there.
const appConfig: { apiBaseUrl?: string; flavor?: string } = NativeModules.AppConfig ?? {};

export const API_BASE_URL = appConfig.apiBaseUrl ?? 'https://api.odagateway.com';

/** true for the "ODA Test" build, which uses Paystack test mode. */
export const IS_TEST_BUILD = appConfig.flavor === 'staging';
