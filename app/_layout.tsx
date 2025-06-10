import { cleanupDataStore, initializeDataStore } from '@/src/store/dataStore';
import { useImagesStore } from '@/src/store/imgStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useAuthStore } from '../src/store/authStore';

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

const FIRST_LAUNCH_KEY = 'hasLaunchedBefore';
const DEV_SESSION_KEY = 'devSessionId';
const SPLASH_MINIMUM_DURATION = 2500; // Minimum time to show splash animation

export default function RootLayout() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [appReady, setAppReady] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [shouldShowSplash, setShouldShowSplash] = useState<boolean | null>(null);
  const [splashComplete, setSplashComplete] = useState(false);
  const [splashStartTime, setSplashStartTime] = useState<number | null>(null);
  const [loaded] = useFonts({
    'AnonymousPro-Bold': require('@assets/fonts/AnonymousPro-Bold.ttf'),
  });

  useEffect(() => {
    const initializeApp = async () => {
      if (loaded) {
        try {
          // Initialize Firebase Auth listener (only once)
          if (!authInitialized) {
            initializeAuth();
            setAuthInitialized(true);
          }
          // In development, treat each session as potentially first launch
          let isFirstLaunch = false;

          if (__DEV__) {
            // In development mode, ALWAYS show splash on fresh start
            // This triggers whenever you run expo start --clear or restart the dev server
            isFirstLaunch = true;

            console.log('🚀 DEV MODE - Always showing splash on dev restart');
          } else {
            // Production mode - normal first launch detection
            const hasLaunchedBefore = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
            isFirstLaunch = hasLaunchedBefore === null;

            console.log('🚀 PROD MODE - App Initialize:', {
              isFirstLaunch,
              hasLaunchedBefore,
              isAuthenticated,
            });

            // Mark as launched for future runs (only in production)
            if (isFirstLaunch) {
              await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
            }
          }

          // Show splash if first launch OR if not authenticated
          const showSplash = isFirstLaunch || !isAuthenticated;
          setShouldShowSplash(showSplash);

          if (showSplash) {
            setSplashStartTime(Date.now()); // Start splash timer
            console.log('⏰ Starting splash timer - First launch:', isFirstLaunch, 'Not authenticated:', !isAuthenticated, 'Dev mode:', __DEV__);
          } else {
            setSplashComplete(true); // Skip splash for authenticated returning users
            console.log('⏭️ Skipping splash for authenticated returning user');
          }

          // Hide the Expo splash screen
          await ExpoSplashScreen.hideAsync();

          // Mark app as ready after a small delay to ensure Slot is mounted
          setTimeout(() => {
            setAppReady(true);
          }, 100);
        } catch (error) {
          console.error('Error initializing app:', error);
          setShouldShowSplash(false);
          setSplashComplete(true);
          setAppReady(true);
        }
      }
    };

    initializeApp();

    return () => {
      cleanupDataStore();
      console.log('🧹 DataStore cleaned up');
    };
  }, [loaded]); // Remove isAuthenticated dependency to prevent multiple calls

  // Separate useEffect for loading Firebase data only when authenticated
  useEffect(() => {
    const loadFirebaseData = async () => {
      if (!loaded || !isAuthenticated || isLoading) {
        console.log('📦 Skipping Firebase data load:', { loaded, isAuthenticated, isLoading });
        return;
      }

      // Add a small delay to ensure Firebase Auth token has propagated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        console.log('📦 Starting Firebase data load for authenticated user...');
        await initializeDataStore();
        console.log('📦 Firebase data loaded');

        // Load images
        await useImagesStore.getState().loadImages();
        console.log('🖼️ Firebase images loaded');
      } catch (e) {
        console.error('🔥 Firebase load error:', e);
      }
    };

    loadFirebaseData();
  }, [isAuthenticated, isLoading, loaded]); // Only run when auth state changes

  // Handle splash completion
  useEffect(() => {
    if (shouldShowSplash && splashStartTime && !splashComplete) {
      const timer = setTimeout(() => {
        setSplashComplete(true);
        console.log('⏰ Splash timer completed');
      }, SPLASH_MINIMUM_DURATION);

      return () => clearTimeout(timer);
    }
  }, [shouldShowSplash, splashStartTime, splashComplete]);

  useEffect(() => {
    // Only handle navigation after app is ready, auth state is loaded, and splash requirements are met
    if (!appReady || isLoading || shouldShowSplash === null) {
      return;
    }

    // For splash users, wait for splash to complete
    if (shouldShowSplash && !splashComplete) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inSplashGroup = segments[0] === '(splash)';

    // console.log('🧭 Navigation check:', {
    //   isAuthenticated,
    //   shouldShowSplash,
    //   splashComplete,
    //   segments: segments[0],
    //   appReady,
    //   isLoading
    // });

    // Navigation logic
    if (shouldShowSplash && !splashComplete && !inSplashGroup) {
      // Show splash animation
      console.log('🎬 Showing splash animation');
      router.replace('/(splash)');
    } else if (isAuthenticated && !inTabsGroup) {
      // User is authenticated
      console.log('✅ User authenticated, navigating to tabs');
      router.replace('/(tabs)/home');
    } else if (!isAuthenticated && !inAuthGroup) {
      // User not authenticated
      console.log('🔐 User not authenticated, navigating to auth');
      router.replace('/(auth)');
    }
  }, [isAuthenticated, isLoading, segments, appReady, router, shouldShowSplash, splashComplete]);

  // Don't render anything until fonts are loaded and we know splash status
  if (!loaded || shouldShowSplash === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Slot />
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
