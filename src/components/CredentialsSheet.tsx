import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import PasswordInput from './PasswordInput';
import { DatabaseCredentials } from '../types';

interface CredentialsSheetProps {
  visible: boolean;
  databaseName: string;
  // "add": saving a login is optional, as on the web's add dialog.
  // "manage": edit or remove the saved login of a database already added.
  mode: 'add' | 'manage';
  initial?: DatabaseCredentials;
  loadingInitial?: boolean;
  onSubmit: (credentials?: DatabaseCredentials) => Promise<void>;
  onRemove?: () => Promise<void>;
  onClose: () => void;
}

// Bottom sheet for a database's login. The API encrypts it before storing.
export default function CredentialsSheet({
  visible,
  databaseName,
  mode,
  initial,
  loadingInitial = false,
  onSubmit,
  onRemove,
  onClose,
}: CredentialsSheetProps) {
  const [saveLogin, setSaveLogin] = useState(mode === 'manage');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSaveLogin(mode === 'manage');
    setUsername(initial?.username ?? '');
    setPassword(initial?.password ?? '');
  }, [visible, mode, initial]);

  const missingFields = saveLogin && (!username.trim() || !password.trim());

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = () =>
    run(() =>
      onSubmit(saveLogin ? { username: username.trim(), password: password.trim() } : undefined)
    );

  const inputClass = 'border border-gray-300 rounded-lg p-3 text-base bg-gray-50 text-gray-800';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-white rounded-t-2xl p-5 pb-10">
          <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={2}>
            {mode === 'add' ? `Add ${databaseName}` : `Login for ${databaseName}`}
          </Text>

          {loadingInitial ? (
            <ActivityIndicator className="my-8" size="large" color="#A13D3D" />
          ) : (
            <>
              {mode === 'add' ? (
                <View className="flex-row items-center justify-between mt-3 mb-4">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-semibold text-gray-800">Save login details</Text>
                    <Text className="text-xs text-gray-500">
                      Keep this database's username and password for quick access
                    </Text>
                  </View>
                  <Switch
                    value={saveLogin}
                    onValueChange={setSaveLogin}
                    trackColor={{ true: '#A13D3D' }}
                    disabled={busy}
                  />
                </View>
              ) : (
                <Text className="text-xs text-gray-500 mt-1 mb-4">
                  The username and password you use on this database's own site.
                </Text>
              )}

              {saveLogin && (
                <>
                  <Text className="text-sm font-semibold text-gray-800 mb-2">Username</Text>
                  <TextInput
                    className={`${inputClass} mb-4`}
                    placeholderTextColor="#9CA3AF"
                    placeholder="Database username or email"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!busy}
                  />
                  <Text className="text-sm font-semibold text-gray-800 mb-2">Password</Text>
                  <PasswordInput
                    className={inputClass}
                    placeholderTextColor="#9CA3AF"
                    placeholder="Database password"
                    value={password}
                    onChangeText={setPassword}
                    editable={!busy}
                  />
                  <Text className="text-xs text-gray-500 mt-2 mb-2">
                    Encrypted and stored securely.
                  </Text>
                </>
              )}

              <TouchableOpacity
                className={`bg-primary p-4 rounded-lg items-center mt-4 ${(busy || missingFields) ? 'opacity-50' : ''}`}
                onPress={handleSubmit}
                disabled={busy || missingFields}
              >
                <Text className="text-white text-base font-semibold">
                  {busy ? 'Saving...' : mode === 'add' ? 'Add database' : 'Save login'}
                </Text>
              </TouchableOpacity>

              {onRemove && (
                <TouchableOpacity
                  className={`border border-primary p-4 rounded-lg items-center mt-3 ${busy ? 'opacity-50' : ''}`}
                  onPress={() => run(onRemove)}
                  disabled={busy}
                >
                  <Text className="text-primary text-base font-semibold">Remove saved login</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity className="p-3 items-center mt-2" onPress={onClose} disabled={busy}>
            <Text className="text-gray-600 font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
