import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Institution } from '../types';

interface InstitutionPickerProps {
  institutions: Institution[];
  value: string;
  onSelect: (name: string) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
}

export default function InstitutionPicker({
  institutions,
  value,
  onSelect,
  loading,
  disabled,
  error,
}: InstitutionPickerProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return institutions;
    return institutions.filter((i) => i.name.toLowerCase().includes(q));
  }, [institutions, search]);

  return (
    <>
      <TouchableOpacity
        className={`border rounded-lg p-3 bg-gray-50 ${error ? 'border-red-500' : 'border-gray-300'}`}
        onPress={() => setVisible(true)}
        disabled={disabled || loading}
      >
        <Text
          className={value ? 'text-base text-gray-800' : 'text-base text-gray-400'}
          numberOfLines={1}
        >
          {loading ? 'Loading institutions…' : value || 'Select your institution'}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-800">Select Institution</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text className="text-primary font-semibold">Close</Text>
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50 text-gray-800"
              placeholderTextColor="#9CA3AF"
              placeholder="Search institutions..."
              value={search}
              onChangeText={setSearch}
              autoFocus
              autoCapitalize="none"
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                className="px-4 py-3 border-b border-gray-100"
                onPress={() => {
                  onSelect(item.name);
                  setSearch('');
                  setVisible(false);
                }}
              >
                <Text className="text-base text-gray-800">{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="p-8 items-center">
                <Text className="text-sm text-gray-500">No institutions match your search</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}
