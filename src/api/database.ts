import { api } from './client';
import {
  DatabaseItem,
  UserDatabase,
  DatabaseRequest,
  RequestDatabaseData,
} from '../types';

export const databaseApi = {
  // Get all preloaded databases
  async getPreloadedDatabases() {
    return api.get<{ databases: DatabaseItem[] }>('/api/databases/preloaded');
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
