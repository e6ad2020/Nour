import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

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
  }, []);

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
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      </Animated.View>
      <Animated.View style={[styles.welcomeContainer, welcomeAnimatedStyle]}>
        <Text style={styles.welcomeText}>Welcome user 👋</Text>
      </Animated.View>
      
      <Animated.View style={[styles.scanCard, scanCardAnimatedStyle]}>
        <Feather name="camera" size={60} color="#333D47" />
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/directions')}
        >
          <Text style={styles.scanButtonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
    backgroundColor: colors.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 30,
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
  },
  scanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  scanButton: {
    backgroundColor: colors.tint,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
  },
});