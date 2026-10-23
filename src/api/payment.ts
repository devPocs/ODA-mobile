import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiRequestError } from './client';
import { PaymentInitResponse } from '../types';

// The last checkout the user started, so "Check payment status" can confirm it
// later if they left before it was confirmed.
const PENDING_PAYMENT_KEY = 'pendingPaymentTransactionId';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const paymentApi = {
  async initialize() {
    const response = await api.post<PaymentInitResponse>('/api/payment/create-intent', {
      gateway: 'paystack',
    });
    if (response.data?.transactionId) {
      await AsyncStorage.setItem(PENDING_PAYMENT_KEY, response.data.transactionId);
    }
    return response;
  },

  async verify(transactionId: string) {
    return api.post<{ payment: { id: string; status: string }; otp: { expiresAt: string } }>(
      '/api/payment/verify',
      { transactionId, gateway: 'paystack', gatewayReference: transactionId }
    );
  },

  /** Emails a fresh OTP to a subscriber who has paid but not activated yet. */
  async resendOTP() {
    return api.post<{ expiresAt: string }>('/api/otp/resend');
  },

  getPendingTransactionId() {
    return AsyncStorage.getItem(PENDING_PAYMENT_KEY);
  },

  /**
   * Verifies the payment, retrying while Paystack still reports it as in
   * progress (409) or the network blips. Resolves once it's confirmed — the
   * OTP has then been emailed. Rejects if Paystack reports it failed, or if it
   * isn't confirmed within `timeoutMs` (the webhook can still complete it).
   */
  async confirm(transactionId: string, { timeoutMs = 60_000, intervalMs = 3_000 } = {}) {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      try {
        const response = await paymentApi.verify(transactionId);
        await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
        return response;
      } catch (error) {
        const status = error instanceof ApiRequestError ? error.status : undefined;
        const retryable = status === undefined || status === 409 || status >= 500;
        if (!retryable) {
          if (status === 400) await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
          throw error;
        }
        if (Date.now() + intervalMs > deadline) {
          throw new Error(
            "We haven't received confirmation from Paystack yet. If you were charged, your OTP will be emailed to you shortly."
          );
        }
        await sleep(intervalMs);
      }
    }
  },
};
