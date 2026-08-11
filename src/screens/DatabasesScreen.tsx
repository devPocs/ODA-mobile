import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { databaseApi, authApi } from '../api';
import { DatabaseItem } from '../types';
import DatabaseCard from '../components/DatabaseCard';
import Logo from '../components/Logo';

export default function DatabasesScreen() {
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [userDatabases, setUserDatabases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const isInitialMount = useRef(true);

  useEffect(() => {
    loadDatabases();
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

  const loadDatabases = async () => {
    try {
      const [dbResponse, userDbResponse] = await Promise.all([
        databaseApi.getPreloadedDatabases(),
        databaseApi.getUserDatabases(),
      ]);

      if (dbResponse.data?.databases) {
        setDatabases(dbResponse.data.databases);
      }

      if (userDbResponse.data?.databases) {
        const userDbIds = userDbResponse.data.databases.map(
          (db) => db.databaseId._id
        );
        setUserDatabases(userDbIds);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load databases');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  const handleAddDatabase = async (database: DatabaseItem) => {
    if (userDatabases.includes(database._id)) {
      Alert.alert('Info', 'Database already added to your list');
      return;
    }

    try {
      console.log('[Databases] Adding database:', database.name, database._id);
      const response = await databaseApi.selectDatabase(database._id);
      console.log('[Databases] Add database API response:', JSON.stringify(response, null, 2));

      // Update local state
      setUserDatabases([...userDatabases, database._id]);
      console.log('[Databases] Updated userDatabases state. Database added successfully');

      Alert.alert(
        'Success',
        `'${database.name}' has been added to your databases!`,
        [
          {
            text: 'View My Databases',
            onPress: () => {
              // User can manually navigate to My Databases tab
            },
          },
          {
            text: 'Add Another',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('[Databases] Failed to add database:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add database');
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

  const onRefresh = () => {
    setRefreshing(true);
    loadDatabases();
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
      <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b border-gray-200">
        <View className="gap-1">
          <Logo height={28} />
          <Text className="text-sm text-gray-600">Databases</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} className="p-2">
          <Text className="text-primary text-sm font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={databases}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DatabaseCard
            database={item}
            onAddPress={handleAddDatabase}
            isAdded={userDatabases.includes(item._id)}
          />
        )}
        contentContainerStyle={{ padding: 14 }}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A13D3D"
          />
        }
        ListEmptyComponent={
          <View className="p-10 items-center">
            <Text className="text-base text-gray-600">No databases available</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
