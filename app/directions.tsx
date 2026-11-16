import { Colors } from '@/constants/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { ComponentProps, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';

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

export default function DirectionsScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [carouselWidth, setCarouselWidth] = useState(windowWidth);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % onboardingData.length;
      scrollViewRef.current?.scrollTo({ x: nextIndex * carouselWidth, animated: true });
      setCurrentIndex(nextIndex);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, carouselWidth]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (carouselWidth <= 0) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.max(0, Math.min(onboardingData.length - 1, Math.round(contentOffsetX / carouselWidth)));
    setCurrentIndex(index);
  };

  const handleCarouselLayout = (event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width;
    if (measuredWidth > 0 && Math.abs(measuredWidth - carouselWidth) > 1) {
      setCarouselWidth(measuredWidth);
    }
  };

  const handleNext = () => {
    router.push('/camera');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={26} color="#333D47" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.carouselWrapper} onLayout={handleCarouselLayout}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          snapToInterval={carouselWidth}
          decelerationRate="fast"
          disableIntervalMomentum
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentContainerStyle={styles.scrollContent}
        >
          {onboardingData.map((item, index) => (
            <View key={index} style={[styles.slide, { width: carouselWidth }]}>
              <Card className="w-full max-w-sm p-6 items-center justify-center rounded-3xl bg-surface shadow-sm border border-border">
                <Card.Header className="w-full items-center mb-4">
                  <MaterialCommunityIcons name={item.icon} size={150} color={colors.tint} />
                  <Card.Title className="text-2xl font-bold font-cairo text-foreground text-center mt-3" style={styles.centeredText}>
                    {item.title}
                  </Card.Title>
                </Card.Header>
                <Card.Body className="w-full items-center">
                  <Card.Description className="text-base font-cairo text-muted text-center px-2 leading-relaxed" style={styles.centeredText}>
                    {item.subtitle}
                  </Card.Description>
                </Card.Body>
              </Card>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <View className="flex-row justify-center items-center gap-2">
          {onboardingData.map((_, index) => (
            <View
              key={index}
              className={
                currentIndex === index
                  ? 'w-6 h-2 rounded-full bg-accent'
                  : 'w-2 h-2 rounded-full bg-border'
              }
            />
          ))}
        </View>

        <Button
          variant="primary"
          size="lg"
          style={styles.startButton}
          onPress={handleNext}
        >
          <Button.Label style={styles.startButtonLabel}>
            Start scan
          </Button.Label>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  carouselWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  centeredText: {
    textAlign: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: 24,
    paddingTop: 12,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  startButton: {
    paddingHorizontal: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonLabel: {
    textAlign: 'center',
  },
});