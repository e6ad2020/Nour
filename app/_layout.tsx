import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { useEffect } from 'react';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { I18nManager, Platform } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
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

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    primary: Colors.dark.tint,
    text: Colors.dark.text,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { fontsLoaded, fontError } = useLoadFonts();

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
      <ThemeProvider value={colorScheme === 'dark' ? MyDarkTheme : MyLightTheme}>
        <Stack
          screenOptions={{
            cardStyleInterpolator: CardStyleInterpolators.forFade,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="camera" options={{ headerShown: false }} />
          <Stack.Screen name="results" options={{ headerShown: false }} />
          <Stack.Screen name="analysing" options={{ headerShown: false }} />
          <Stack.Screen name="directions" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}