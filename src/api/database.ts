import { api } from './client';
import {
  DatabaseItem,
  UserDatabase,
  DatabaseRequest,
  DatabaseCredentials,
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

  // Select/add a database to user's list, optionally saving its login (the
  // API encrypts it)
  async selectDatabase(databaseId: string, credentials?: DatabaseCredentials) {
    return api.post('/api/databases/user/databases/select', { databaseId, ...credentials });
  },

  // Remove database from user's list
  async removeUserDatabase(databaseId: string) {
    return api.delete(`/api/databases/user/databases/${databaseId}`);
  },

  // Saved login for one of the user's databases (by UserDatabase id)
  async getDatabaseCredentials(userDatabaseId: string) {
    return api.get<DatabaseCredentials>(`/api/databases/user/databases/${userDatabaseId}/credentials`);
  },

  async updateDatabaseCredentials(userDatabaseId: string, credentials: DatabaseCredentials) {
    return api.put(`/api/databases/user/databases/${userDatabaseId}/credentials`, credentials);
  },

  async removeDatabaseCredentials(userDatabaseId: string) {
    return api.delete(`/api/databases/user/databases/${userDatabaseId}/credentials`);
  },
};
