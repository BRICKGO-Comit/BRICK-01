import 'react-native-url-polyfill/auto';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

import { useColorScheme } from '@/components/useColorScheme';
import AppSplashScreen from '@/components/AppSplashScreen';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check initial session with a timeout race
    const checkSession = async () => {
      try {
        const { data } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]) as { data: { session: Session | null } };

        setSession(data.session);
      } catch (e) {
        // Fallback or assume public access first
        console.log('Session check timed out or failed', e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [session, segments, loading]);

  const theme = DefaultTheme;

  // Determine if we should show the splash screen overlay
  // Show it if:
  // 1. Still loading the initial session check
  // 2. OR User is NOT logged in AND NOT on an auth screen (waiting for redirect to login)
  const isSplashVisible = loading || (!session && segments[0] !== '(auth)');

  return (
    <ThemeProvider value={theme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
        </Stack>

        {loading && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
            <AppSplashScreen />
          </View>
        )}
      </View>
    </ThemeProvider>
  );
}
