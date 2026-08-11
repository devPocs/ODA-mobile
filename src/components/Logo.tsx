import React from 'react';
import { Image } from 'react-native';

interface LogoProps {
  height?: number;
}

export default function Logo({ height = 48 }: LogoProps) {
  return (
    <Image
      source={require('../assets/oda_logo.png')}
      style={{ height, aspectRatio: 1 }}
      resizeMode="contain"
    />
  );
}
