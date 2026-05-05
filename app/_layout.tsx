import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { auth } from '@/services/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    auth.restoreSession().then(user => {
      setLoggedIn(!!user);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEEEF8' }}>
        <ActivityIndicator size="large" color="#6C47FF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index"      options={{ headerShown: false }} />
          <Stack.Screen name="login"      options={{ headerShown: false }} />
          <Stack.Screen name="signup"     options={{ headerShown: false }} />
          <Stack.Screen name="(app)"      options={{ headerShown: false }} />
          <Stack.Screen name="lesson/[id]" options={{ headerShown: false }} />
        </Stack>

        {/* Auto-redirect returning users straight to home */}
        {loggedIn && <Redirect href="/home" />}

        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
