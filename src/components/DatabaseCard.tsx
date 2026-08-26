import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { DatabaseItem } from '../types';

interface DatabaseCardProps {
  database: DatabaseItem;
  onAddPress: (database: DatabaseItem) => void;
  isAdded?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 28 - 8) / 2; // (screen - padding - gap) / 2 columns

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function DatabaseCard({ database, onAddPress, isAdded }: DatabaseCardProps) {
  return (
    <View
      className="bg-white rounded-xl p-3 mb-4 shadow-sm border border-gray-100 mx-1"
      style={{ width: cardWidth, minHeight: 150 }}
    >
      {/* Content wrapper with flex-1 to push button down */}
      <View className="flex-1">
        <View className="flex-row gap-3">
          {/* Left: Logo */}
          <View className="w-16 h-16 flex-shrink-0">
            {database.logo ? (
              <Image
                source={{ uri: database.logo }}
                className="w-full h-full rounded-lg"
                resizeMode="contain"
              />
            ) : (
              <View className="w-full h-full rounded-full bg-primary justify-center items-center">
                <Text className="text-white text-lg font-bold">{getInitials(database.name)}</Text>
              </View>
            )}
          </View>

          {/* Right: Content */}
          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-900 uppercase mb-1" numberOfLines={2}>
              {database.name}
            </Text>
            {database.category && (
              <Text className="text-[10px] text-primary mb-1 uppercase">{database.category}</Text>
            )}
            {database.description && (
              <Text className="text-[10px] text-gray-500 leading-[14px]" numberOfLines={2}>
                {database.description}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Button always at bottom */}
      <TouchableOpacity
        className={`mt-3 py-1.5 rounded-full items-center border ${isAdded ? 'bg-gray-200 border-gray-300' : 'bg-white border-primary'}`}
        onPress={() => onAddPress(database)}
        disabled={isAdded}
      >
        <Text className={`text-[10px] font-semibold ${isAdded ? 'text-gray-600' : 'text-primary'}`}>
          {isAdded ? 'Added' : 'Add Database'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
