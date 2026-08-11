import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseApi } from '../api';

export default function RequestDatabaseScreen() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !url) {
      Alert.alert('Error', 'Please fill in database name and URL');
      return;
    }

    setLoading(true);
    try {
      await databaseApi.requestDatabase({
        name,
        url,
        description: description || undefined,
      });

      Alert.alert(
        'Success',
        'Database request submitted successfully. Our team will review it.',
        [
          {
            text: 'OK',
            onPress: () => {
              setName('');
              setUrl('');
              setDescription('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="px-5 py-4 bg-white border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">Request a New Database</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Our team reviews and approves new entries regularly.
            </Text>
          </View>

          <View className="p-5">
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Name of Database *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800"
                placeholderTextColor="#9CA3AF"
                placeholder="e.g., PubMed, JSTOR"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Database URL *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800"
                placeholderTextColor="#9CA3AF"
                placeholder="https://example.com"
                value={url}
                onChangeText={setUrl}
                keyboardType="url"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Description (Optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800 h-[100px] pt-3"
                placeholderTextColor="#9CA3AF"
                placeholder="Brief description of the database..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              className={`bg-primary p-4 rounded-lg items-center mt-2.5 ${loading ? 'opacity-60' : ''}`}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text className="text-white text-base font-semibold">
                {loading ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
