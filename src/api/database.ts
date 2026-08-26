import { api } from './client';
import {
  DatabaseItem,
  UserDatabase,
  DatabaseRequest,
  RequestDatabaseData,
  PaginationMeta,
} from '../types';

// Server caps the page size at 50 regardless of what's requested.
const MAX_PAGE_LIMIT = 50;

export const databaseApi = {
  // Get preloaded databases — paginated server-side (162+ total). `search`
  // filters by name server-side, so pagination stays correct for the filtered set.
  async getPreloadedDatabases(page = 1, limit = MAX_PAGE_LIMIT, search?: string) {
    return api.get<{ databases: DatabaseItem[]; pagination: PaginationMeta }>(
      '/api/databases/preloaded',
      { params: { page, limit, ...(search ? { search } : {}) } }
    );
  },

  // Get user's selected databases
  async getUserDatabases() {
    return api.get<{ databases: UserDatabase[] }>('/api/databases/user/databases');
  },

  // Request a new database
  async requestDatabase(data: RequestDatabaseData) {
    return api.post('/api/databases/request', data);
  },

  // Get user's pending database requests
  async getUserDatabaseRequests() {
    return api.get<DatabaseRequest[]>('/api/databases/pending');
  },

  // Select/add a database to user's list
  async selectDatabase(databaseId: string) {
    return api.post('/api/databases/user/databases/select', { databaseId });
  },

  // Remove database from user's list
  async removeUserDatabase(databaseId: string) {
    return api.delete(`/api/databases/user/databases/${databaseId}`);
  },
};
