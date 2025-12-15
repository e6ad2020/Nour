
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

export default function AnalysingScreen() {
  const params = useLocalSearchParams();
  const [percentage, setPercentage] = useState(0);
  const progress = useSharedValue(0);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useFocusEffect(
    useCallback(() => {
      let interval: NodeJS.Timeout;
      setPercentage(0);

      interval = setInterval(() => {
        setPercentage(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);

      return () => clearInterval(interval);
    }, [])
  );

  useEffect(() => {
    if (percentage === 100) {
      router.replace({ pathname: '/results', params: { images: params.images } });
    }
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => {
    progress.value = withTiming(percentage, { duration: 50 });
    return {};
  });

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#333D47" />
        </TouchableOpacity>
      </View>
      <View style={styles.analysingButton}>
        <Text style={styles.analysingText}>Analysing</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.percentageContainer}>
          <Animated.Text style={[styles.percentageNumber, animatedStyle]}>{percentage}</Animated.Text>
          <Text style={styles.percentageSymbol}>%</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
  },
  backButton: {
    padding: 8,
  },
  analysingButton: {
    backgroundColor: colors.tint,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 20,
    marginBottom: 40,
  },
  analysingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  percentageNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
    color: '#333D47',
  },
  percentageSymbol: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
    color: '#333D47',
  },
});
