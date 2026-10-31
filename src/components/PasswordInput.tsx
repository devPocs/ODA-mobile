import React, { useState } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = Omit<TextInputProps, 'secureTextEntry'> & {
  className?: string;
};

// Password field with an eye toggle that reveals or hides what was typed.
export default function PasswordInput({ className = '', ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="relative justify-center">
      <TextInput
        {...props}
        className={`${className} pr-12`}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity
        className="absolute right-0 h-full px-3 justify-center"
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}
