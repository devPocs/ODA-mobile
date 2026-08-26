import { api } from './client';
import { PaymentInitResponse } from '../types';

export const paymentApi = {
  async initialize() {
    return api.post<PaymentInitResponse>('/api/payment/initialize');
  },
};
