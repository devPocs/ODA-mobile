import { api } from './client';
import { PaymentInitResponse } from '../types';

export const paymentApi = {
  async initialize() {
    return api.post<PaymentInitResponse>('/api/payment/create-intent', {
      gateway: 'paystack',
    });
  },

  async verify(transactionId: string) {
    return api.post<{ payment: { id: string; status: string }; otp: { expiresAt: string } }>(
      '/api/payment/verify',
      { transactionId, gateway: 'paystack', gatewayReference: transactionId }
    );
  },
};
