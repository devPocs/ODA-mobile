import { api } from './client';
import { Institution } from '../types';

export const institutionsApi = {
  async getAll() {
    return api.get<{ institutions: Institution[]; count: number }>('/api/institutions');
  },
};
