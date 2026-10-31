import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import { useIsFocused } from '@react-navigation/native';
import { databaseApi } from '../api';
import { UserDatabase, DatabaseCredentials } from '../types';
import MyDatabaseCard from '../components/MyDatabaseCard';
import CredentialsSheet from '../components/CredentialsSheet';
import Logo from '../components/Logo';
import AccessBanner from '../components/AccessBanner';
import { toast } from '../utils/toast';

export default function MyDatabasesScreen() {
  const [databases, setDatabases] = useState<UserDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // The database whose login sheet is open, and its saved login once fetched
  const [managing, setManaging] = useState<UserDatabase | null>(null);
  const [savedLogin, setSavedLogin] = useState<DatabaseCredentials | undefined>();
  const [loadingLogin, setLoadingLogin] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      console.log('[MyDatabases] Screen focused, reloading data...');
      loadMyDatabases();
    }
  }, [isFocused]);

  const loadMyDatabases = async () => {
    try {
      console.log('[MyDatabases] Fetching user databases from API...');
      const response = await databaseApi.getUserDatabases();
      console.log('[MyDatabases] API response:', JSON.stringify(response, null, 2));

      if (response.data?.databases) {
        console.log(`[MyDatabases] Found ${response.data.databases.length} databases`);
        setDatabases(response.data.databases);
      } else {
        console.log('[MyDatabases] No databases found in response');
        setDatabases([]);
      }
    } catch (error) {
      console.error('[MyDatabases] Error loading databases:', error);
      toast.error('Failed to load your databases');
      setDatabases([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveDatabase = async (database: UserDatabase) => {
    Alert.alert('Remove Database', `Remove '${database.databaseId.name}' from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await databaseApi.removeUserDatabase(database._id);
            setDatabases(databases.filter((db) => db._id !== database._id));
            toast.success(`'${database.databaseId.name}' removed from your databases`);
          } catch (error) {
            console.error('Failed to remove database:', error);
            toast.error('Failed to remove database');
          }
        },
      },
    ]);
  };

  const handleOpenDatabase = async (database: UserDatabase) => {
    const url = database.databaseId.url;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        toast.error('Cannot open this URL');
        return;
      }
      // Copy the saved password first, as the web app does, so it's ready to
      // paste on the database's login page
      if (database.hasCredentials) {
        try {
          const response = await databaseApi.getDatabaseCredentials(database._id);
          if (response.data?.password) {
            Clipboard.setString(response.data.password);
            toast.success(
              response.data.username ? `Username: ${response.data.username}` : 'Paste it on the login page',
              'Password copied'
            );
          }
        } catch {
          // Open the database anyway; "Saved login" explains a failed load
        }
      }
      await Linking.openURL(url);
    } catch (error) {
      toast.error('Failed to open database');
    }
  };

  const setHasCredentials = (id: string, hasCredentials: boolean) =>
    setDatabases((prev) => prev.map((db) => (db._id === id ? { ...db, hasCredentials } : db)));

  const handleManageLogin = async (database: UserDatabase) => {
    setManaging(database);
    setSavedLogin(undefined);
    if (!database.hasCredentials) return;
    setLoadingLogin(true);
    try {
      const response = await databaseApi.getDatabaseCredentials(database._id);
      setSavedLogin(response.data);
    } catch (error) {
      // 409: saved under an old key and cleared by the API; ask for it again
      setHasCredentials(database._id, false);
      toast.error(error instanceof Error ? error.message : 'Could not load your saved login');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleSaveLogin = async (credentials?: DatabaseCredentials) => {
    if (!managing || !credentials) return;
    try {
      await databaseApi.updateDatabaseCredentials(managing._id, credentials);
      setHasCredentials(managing._id, true);
      setManaging(null);
      toast.success('Login saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save login');
    }
  };

  const handleRemoveLogin = async () => {
    if (!managing) return;
    try {
      await databaseApi.removeDatabaseCredentials(managing._id);
      setHasCredentials(managing._id, false);
      setManaging(null);
      toast.success('Saved login removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove saved login');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMyDatabases();
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
      <View className="px-5 py-6 bg-white border-b border-gray-200">
        <Logo height={70} />
        <Text className="text-2xl font-bold text-gray-800 mt-3 mb-1">My Databases</Text>
        <Text className="text-sm text-gray-600">{databases.length} databases</Text>
      </View>

      <AccessBanner />

      <FlatList
        data={databases}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MyDatabaseCard
            database={item}
            onRemovePress={handleRemoveDatabase}
            onOpenPress={handleOpenDatabase}
            onLoginPress={handleManageLogin}
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
            <Text className="text-lg font-semibold text-gray-800 mb-2">No databases added yet</Text>
            <Text className="text-sm text-gray-600">
              Go to Databases tab to add some
            </Text>
          </View>
        }
      />

      <CredentialsSheet
        visible={!!managing}
        databaseName={managing?.databaseId.name ?? ''}
        mode="manage"
        initial={savedLogin}
        loadingInitial={loadingLogin}
        onSubmit={handleSaveLogin}
        onRemove={managing?.hasCredentials ? handleRemoveLogin : undefined}
        onClose={() => setManaging(null)}
      />
    </SafeAreaView>
  );
}
