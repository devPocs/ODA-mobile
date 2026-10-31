import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { databaseApi, authApi } from '../api';
import { DatabaseItem, DatabaseCredentials } from '../types';
import DatabaseCard from '../components/DatabaseCard';
import CredentialsSheet from '../components/CredentialsSheet';
import Logo from '../components/Logo';
import AccessBanner from '../components/AccessBanner';
import { toast } from '../utils/toast';

const PAGE_LIMIT = 50;
const SEARCH_DEBOUNCE_MS = 400;

export default function DatabasesScreen() {
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [userDatabases, setUserDatabases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  // The database whose "Add" sheet is open
  const [adding, setAdding] = useState<DatabaseItem | null>(null);
  const isFocused = useIsFocused();
  const isInitialMount = useRef(true);
  const isInitialSearchMount = useRef(true);
  // The first load fails while access is blocked; retry once it opens up
  const initialLoadFailed = useRef(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Skip the initial mount - only reload on subsequent focus events
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isFocused) {
      console.log('[Databases] Screen focused, reloading user databases...');
      loadUserDatabasesList();
    }
  }, [isFocused]);

  // Debounce the search box, then re-fetch page 1 for the new term
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (isInitialSearchMount.current) {
      isInitialSearchMount.current = false;
      return;
    }
    fetchDatabasesPage(1, search);
  }, [search]);

  const fetchDatabasesPage = async (pageToLoad: number, searchTerm: string) => {
    setPageLoading(true);
    try {
      const response = await databaseApi.getPreloadedDatabases(
        pageToLoad,
        PAGE_LIMIT,
        searchTerm || undefined
      );

      if (response.data?.databases) {
        setDatabases(response.data.databases);
        setPage(response.data.pagination?.page ?? pageToLoad);
        setTotalPages(response.data.pagination?.totalPages ?? 1);
      }
    } catch (error) {
      toast.error('Failed to load databases');
    } finally {
      setPageLoading(false);
    }
  };

  const applyUserDatabasesResponse = (userDbResponse: Awaited<ReturnType<typeof databaseApi.getUserDatabases>>) => {
    if (userDbResponse.data?.databases) {
      const userDbIds = userDbResponse.data.databases.map((db) => db.databaseId._id);
      setUserDatabases(userDbIds);
    }
  };

  const loadInitialData = async () => {
    try {
      const [dbResponse, userDbResponse] = await Promise.all([
        databaseApi.getPreloadedDatabases(1, PAGE_LIMIT),
        databaseApi.getUserDatabases(),
      ]);

      if (dbResponse.data?.databases) {
        setDatabases(dbResponse.data.databases);
        setPage(dbResponse.data.pagination?.page ?? 1);
        setTotalPages(dbResponse.data.pagination?.totalPages ?? 1);
      }
      if (userDbResponse.data?.databases) {
        setUserDatabases(userDbResponse.data.databases.map((db) => db.databaseId._id));
      }
      initialLoadFailed.current = false;
    } catch (error) {
      initialLoadFailed.current = true;
      toast.error(error instanceof Error ? error.message : 'Failed to load databases');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessChange = useCallback((canAccess: boolean) => {
    if (canAccess && initialLoadFailed.current) loadInitialData();
  }, []);

  const goToPage = (pageToLoad: number) => {
    if (pageToLoad < 1 || pageToLoad > totalPages || pageToLoad === page || pageLoading) {
      return;
    }
    fetchDatabasesPage(pageToLoad, search);
  };

  const loadUserDatabasesList = async () => {
    try {
      console.log('[Databases] Fetching updated user databases list...');
      const userDbResponse = await databaseApi.getUserDatabases();

      if (userDbResponse.data?.databases) {
        const userDbIds = userDbResponse.data.databases.map(
          (db) => db.databaseId._id
        );
        console.log('[Databases] Updated userDatabases:', userDbIds);
        setUserDatabases(userDbIds);
      } else {
        console.log('[Databases] No user databases found');
        setUserDatabases([]);
      }
    } catch (error) {
      console.error('[Databases] Failed to load user databases:', error);
    }
  };

  const handleVisitDatabase = async (database: DatabaseItem) => {
    try {
      const supported = await Linking.canOpenURL(database.url);
      if (supported) {
        await Linking.openURL(database.url);
      } else {
        toast.error('Cannot open this URL');
      }
    } catch (error) {
      toast.error('Failed to open database');
    }
  };

  const handleAddDatabase = (database: DatabaseItem) => {
    if (userDatabases.includes(database._id)) {
      toast.info('Database already added to your list');
      return;
    }
    setAdding(database);
  };

  const confirmAddDatabase = async (credentials?: DatabaseCredentials) => {
    if (!adding) return;
    const database = adding;
    try {
      console.log('[Databases] Adding database:', database.name, database._id);
      await databaseApi.selectDatabase(database._id, credentials);

      // Update local state
      setUserDatabases((prev) => [...prev, database._id]);
      setAdding(null);
      toast.success(
        credentials
          ? `'${database.name}' added with your saved login`
          : `'${database.name}' has been added to your databases!`
      );
    } catch (error) {
      console.error('[Databases] Failed to add database:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add database');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authApi.logout();
          // Navigation will be handled automatically by RootNavigator
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [, userDbResponse] = await Promise.all([
        fetchDatabasesPage(1, search),
        databaseApi.getUserDatabases(),
      ]);
      applyUserDatabasesResponse(userDbResponse);
    } catch (error) {
      toast.error('Failed to refresh databases');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#A13D3D" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex-row justify-between items-center px-5 pt-5 pb-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center gap-3 flex-1">
          <Logo height={96} />
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">Databases</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Access to curated databases</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} className="p-2">
          <Text className="text-primary text-sm font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>

      <AccessBanner onAccessChange={handleAccessChange} />

      <View className="px-5 py-3 bg-white border-b border-gray-200">
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-base bg-gray-50 text-gray-800"
          placeholderTextColor="#9CA3AF"
          placeholder="Search databases..."
          value={searchInput}
          onChangeText={setSearchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={databases}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DatabaseCard
            database={item}
            onAddPress={handleAddDatabase}
            onVisitPress={handleVisitDatabase}
            isAdded={userDatabases.includes(item._id)}
          />
        )}
        contentContainerStyle={{ padding: 14, flexGrow: 1 }}
        numColumns={2}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A13D3D"
          />
        }
        ListEmptyComponent={
          <View className="p-10 items-center">
            <Text className="text-base text-gray-600">
              {pageLoading ? '' : 'No databases found'}
            </Text>
          </View>
        }
      />

      {totalPages > 0 && (
        <View className="flex-row items-center justify-between px-5 py-3 bg-white border-t border-gray-200">
          <TouchableOpacity
            onPress={() => goToPage(page - 1)}
            disabled={page <= 1 || pageLoading}
            className={`px-4 py-2 rounded-lg border ${
              page <= 1 || pageLoading ? 'border-gray-200' : 'border-primary'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                page <= 1 || pageLoading ? 'text-gray-300' : 'text-primary'
              }`}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {pageLoading ? (
            <ActivityIndicator size="small" color="#A13D3D" />
          ) : (
            <Text className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => goToPage(page + 1)}
            disabled={page >= totalPages || pageLoading}
            className={`px-4 py-2 rounded-lg border ${
              page >= totalPages || pageLoading ? 'border-gray-200' : 'border-primary'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                page >= totalPages || pageLoading ? 'text-gray-300' : 'text-primary'
              }`}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <CredentialsSheet
        visible={!!adding}
        databaseName={adding?.name ?? ''}
        mode="add"
        onSubmit={confirmAddDatabase}
        onClose={() => setAdding(null)}
      />
    </SafeAreaView>
  );
}
