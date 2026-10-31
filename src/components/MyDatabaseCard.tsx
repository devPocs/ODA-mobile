import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { UserDatabase } from '../types';

interface MyDatabaseCardProps {
  database: UserDatabase;
  onRemovePress: (database: UserDatabase) => void;
  onOpenPress: (database: UserDatabase) => void;
  onLoginPress: (database: UserDatabase) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 28 - 8) / 2; // (screen - padding - gap) / 2 columns

export default function MyDatabaseCard({
  database,
  onRemovePress,
  onOpenPress,
  onLoginPress,
}: MyDatabaseCardProps) {
  return (
    <View
      className="bg-white rounded-xl p-3 mb-4 shadow-sm border border-gray-100 mx-1"
      style={{ width: cardWidth, minHeight: 150 }}
    >
      {/* Content wrapper with flex-1 to push buttons down */}
      <View className="flex-1">
        <View className="flex-row gap-3">
          {/* Left: Logo */}
          <View className="w-16 h-16 flex-shrink-0">
            {database.databaseId.logo ? (
              <Image
                source={{ uri: database.databaseId.logo }}
                className="w-full h-full rounded-lg"
                resizeMode="contain"
              />
            ) : (
              <View className="w-full h-full rounded-lg bg-primary justify-center items-center">
                <Text className="text-white text-2xl font-bold">
                  {database.databaseId.name.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          {/* Right: Content */}
          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-900 uppercase mb-1" numberOfLines={2}>
              {database.databaseId.name}
            </Text>
            {database.databaseId.category && (
              <Text className="text-[10px] text-primary mb-1 uppercase">
                {database.databaseId.category}
              </Text>
            )}
            {database.databaseId.description && (
              <Text className="text-[10px] text-gray-500 leading-[14px]" numberOfLines={2}>
                {database.databaseId.description}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Buttons always at bottom */}
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity
          className="flex-1 bg-primary py-1.5 rounded-full items-center"
          onPress={() => onOpenPress(database)}
        >
          <Text className="text-[10px] font-semibold text-white">Open</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-white border border-primary py-1.5 rounded-full items-center"
          onPress={() => onRemovePress(database)}
        >
          <Text className="text-[10px] font-semibold text-primary">Remove</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="mt-2 py-1.5 rounded-full items-center bg-gray-100"
        onPress={() => onLoginPress(database)}
      >
        <Text className="text-[10px] font-semibold text-gray-700">
          {database.hasCredentials ? 'Saved login' : 'Save login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
