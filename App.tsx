import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { RootNavigator } from './src/navigation/RootNavigator';
import './global.css';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
      <Toast />
    </SafeAreaProvider>
  );
}

export default App;
