import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import { useAuthStore } from '../src/store/authStore';

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [loaded] = useFonts({
    'AnonymousPro-Bold': require('@assets/fonts/AnonymousPro-Bold.ttf'),
  });

  useEffect(() => {
    const initializeApp = async () => {
      if (loaded) {
        // Hide the Expo splash screen
        await ExpoSplashScreen.hideAsync();
        
        // If we're not already in a route group, go to splash
        if (!segments[0]) {
          console.log('Navigating to splash screen');
          router.replace('/(splash)');
        }
      }
    };

    initializeApp();
  }, [loaded, segments]);

  useEffect(() => {
    // Handle authentication routing
    if (!isLoading) {
      if (isAuthenticated && segments[0] !== '(tabs)') {
        console.log('User authenticated, navigating to tabs');
        router.replace('/(tabs)');
      } else if (!isAuthenticated && segments[0] === '(tabs)') {
        console.log('User not authenticated, navigating to auth');
        router.replace('/(auth)');
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
