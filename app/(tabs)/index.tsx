import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Surface } from 'heroui-native/surface';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const welcomeOpacity = useSharedValue(0);
  const welcomeTranslateY = useSharedValue(20);
  const scanCardOpacity = useSharedValue(0);
  const scanCardTranslateY = useSharedValue(20);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoScale.value = withTiming(1, { duration: 500 });
    welcomeOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    welcomeTranslateY.value = withDelay(200, withTiming(0, { duration: 500 }));
    scanCardOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    scanCardTranslateY.value = withDelay(400, withTiming(0, { duration: 500 }));
  }, [logoOpacity, logoScale, welcomeOpacity, welcomeTranslateY, scanCardOpacity, scanCardTranslateY]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const welcomeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value,
    transform: [{ translateY: welcomeTranslateY.value }],
  }));

  const scanCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scanCardOpacity.value,
    transform: [{ translateY: scanCardTranslateY.value }],
  }));

  const styles = getStyles(colors);

  return (
    <Surface variant="default" style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      </Animated.View>
      
      <Animated.View style={[styles.welcomeContainer, welcomeAnimatedStyle]}>
        <Chip variant="primary" color="accent" size="md" className="shadow-sm">
          Welcome user 👋
        </Chip>
      </Animated.View>
      
      <Animated.View style={[styles.scanCardWrapper, scanCardAnimatedStyle]}>
        <Card className="p-7 items-center justify-center rounded-3xl bg-surface shadow-md border border-border">
          <Card.Body className="items-center w-full">
            <Feather name="camera" size={54} color={colors.tint} />
            <Card.Title className="text-xl font-bold font-cairo text-foreground mt-3 mb-1 text-center">
              Eye Screening
            </Card.Title>
            <Card.Description className="text-sm font-cairo text-muted mb-4 text-center px-2">
              Start a high-accuracy diabetic retinopathy retinal scan
            </Card.Description>
            <Button
              variant="primary"
              size="lg"
              className="mt-2 px-10 py-3.5 w-full"
              onPress={() => router.push('/directions')}
            >
              Get Started
            </Button>
          </Card.Body>
        </Card>
      </Animated.View>
    </Surface>
  );
}

const getStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 50,
  },
  logoContainer: {
    marginBottom: 10,
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
  },
  welcomeContainer: {
    marginBottom: 30,
  },
  scanCardWrapper: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
});