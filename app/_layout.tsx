import '../global.css';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { I18nManager } from 'react-native';
import { Uniwind } from 'uniwind';

import { useLoadFonts } from '@/hooks/use-load-fonts';
import { Colors } from '@/constants/theme';

setBackgroundColorAsync('transparent');

I18nManager.forceRTL(false);
I18nManager.allowRTL(false);

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    primary: Colors.light.tint,
    text: Colors.light.text,
  },
};

export default function RootLayout() {
  const { fontsLoaded, fontError } = useLoadFonts();

  useEffect(() => {
    // Explicitly lock Uniwind theme to light mode to match Nour's light design
    Uniwind.setTheme('light');
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <HeroUINativeProvider>
        <ThemeProvider value={MyLightTheme}>
          <Stack
            screenOptions={{
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="camera" options={{ headerShown: false }} />
            <Stack.Screen name="results" options={{ headerShown: false }} />
            <Stack.Screen name="analysing" options={{ headerShown: false }} />
            <Stack.Screen name="directions" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}