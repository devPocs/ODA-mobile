import React from 'react';
import { Image, View, Text } from 'react-native';

interface LogoProps {
  height?: number;
  showTagline?: boolean;
}

export default function Logo({ height = 48, showTagline }: LogoProps) {
  const image = (
    <Image
      source={require('../assets/oda_logo.png')}
      style={{ height, aspectRatio: 1 }}
      resizeMode="contain"
    />
  );

  if (!showTagline) {
    return image;
  }

  return (
    <View className="items-center">
      {image}
      <Text className="text-xs text-gray-500 mt-1 text-center">
        One Gateway. Unlimited Access. Maximum Value.
      </Text>
    </View>
  );
}
