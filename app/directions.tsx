import { Colors } from '@/constants/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { ComponentProps, useEffect, useRef, useState } from 'react';
import { Dimensions, NativeSyntheticEvent, NativeScrollEvent, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Surface } from 'heroui-native/surface';

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
    <Surface variant="default" style={styles.container}>
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        className="absolute top-12 left-5 z-20 w-11 h-11 rounded-full items-center justify-center"
        onPress={() => router.back()}
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
                <MaterialCommunityIcons name={item.icon} size={150} color={colors.tint} />
                <Card.Title className="text-2xl font-bold font-cairo text-foreground text-center mt-3">
                  {item.title}
                </Card.Title>
              </Card.Header>
              <Card.Body className="items-center">
                <Card.Description className="text-base font-cairo text-muted text-center px-2 leading-relaxed">
                  {item.subtitle}
                </Card.Description>
              </Card.Body>
            </Card>
          </View>
        ))}
      </ScrollView>

      <View className="absolute bottom-40 left-0 right-0 flex-row justify-center items-center gap-2">
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
        className="absolute bottom-20 self-center px-12"
        onPress={handleNext}
      >
        Start scan
      </Button>
    </Surface>
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
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});