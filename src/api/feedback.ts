import { api } from './client';
import { FeedbackData } from '../types';

export const feedbackApi = {
  async submitFeedback(data: FeedbackData) {
    return api.post('/api/feedback', data);
  },
};
