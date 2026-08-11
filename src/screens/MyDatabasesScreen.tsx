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
import { useIsFocused } from '@react-navigation/native';
import { databaseApi } from '../api';
import { UserDatabase } from '../types';
import MyDatabaseCard from '../components/MyDatabaseCard';

export default function MyDatabasesScreen() {
  const [databases, setDatabases] = useState<UserDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      Alert.alert('Error', 'Failed to load your databases');
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
            Alert.alert('Success', `'${database.databaseId.name}' removed from your databases`);
          } catch (error) {
            console.error('Failed to remove database:', error);
            Alert.alert('Error', 'Failed to remove database');
          }
        },
      },
    ]);
  };

  const handleOpenDatabase = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open database');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMyDatabases();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8B2635" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">My Databases</Text>
        <Text className="text-sm text-gray-600 mt-1">{databases.length} databases</Text>
      </View>

      <FlatList
        data={databases}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MyDatabaseCard
            database={item}
            onRemovePress={handleRemoveDatabase}
            onOpenPress={handleOpenDatabase}
          />
        )}
        contentContainerStyle={{ padding: 14 }}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B2635"
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
    </SafeAreaView>
  );
}
