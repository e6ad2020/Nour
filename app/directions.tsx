import { Colors } from '@/constants/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { ComponentProps, useEffect, useRef, useState } from 'react';
import { Dimensions, NativeSyntheticEvent, NativeScrollEvent, Platform, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Text } from 'heroui-native/text';

const onboardingData: {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle: string;
}[] = [
  {
    icon: 'image-filter-center-focus-weak',
    title: 'Prepare the lens',
    subtitle: 'Ensure the lens is clean and free of any scratches or smudges. A clean lens is crucial for a clear image.',
  },
  {
    icon: 'camera-iris',
    title: 'Clean the camera',
    subtitle: 'Gently wipe the camera of your phone to ensure there are no fingerprints or dust particles obstructing the view.',
  },
  {
    icon: 'account-multiple',
    title: 'Position the patient',
    subtitle: 'Ask the patient to sit comfortably and look straight ahead. The camera should be held at eye level.',
  },
];

const { width } = Dimensions.get('window');

export default function DirectionsScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % onboardingData.length;
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    router.push('/camera');
  };

  return (
    <View style={styles.container}>
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Feather name="chevron-left" size={28} color="#333D47" />
      </Button>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {onboardingData.map((item, index) => (
          <View key={index} style={styles.slide}>
            <Card className="w-full max-w-sm p-6 items-center justify-center rounded-3xl bg-surface shadow-sm border border-border">
              <Card.Header className="items-center mb-4">
                <MaterialCommunityIcons name={item.icon} size={160} color={colors.tint} />
                <Text.Heading type="h2" style={styles.title}>
                  {item.title}
                </Text.Heading>
              </Card.Header>
              <Card.Body className="items-center">
                <Text.Paragraph style={styles.subtitle}>
                  {item.subtitle}
                </Text.Paragraph>
              </Card.Body>
            </Card>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>

      <Button
        variant="primary"
        size="lg"
        className="absolute bottom-20 self-center px-12"
        onPress={handleNext}
      >
        Start scan
      </Button>
    </View>
  );
}

const getStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...Platform.select({
      android: {
        paddingBottom: 150,
      },
      ios: {
        paddingBottom: 150,
      },
      default: {
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
    padding: 8,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
    color: '#333D47',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Cairo',
    color: '#546E7A',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  pagination: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.tint,
  },
});