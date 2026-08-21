import { Colors } from '@/constants/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

const onboardingData = [
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

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    router.push('/camera');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="chevron-left" size={28} color="#333D47" />
      </TouchableOpacity>
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
            <MaterialCommunityIcons name={item.icon} size={200} color={colors.tint} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
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
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>Start scan</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
        
      }
    })
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Cairo',
    color: '#333D47',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
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
  nextButton: {
    backgroundColor: colors.tint,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
  },
});