import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Spinner } from 'heroui-native/spinner';
import { Text } from 'heroui-native/text';

export default function AnalysingScreen() {
  const params = useLocalSearchParams();
  const [percentage, setPercentage] = useState(0);
  const progress = useSharedValue(0);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useFocusEffect(
    useCallback(() => {
      let interval: ReturnType<typeof setInterval>;
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
  }, [percentage, params.images]);

  const animatedStyle = useAnimatedStyle(() => {
    progress.value = withTiming(percentage, { duration: 50 });
    return {};
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          onPress={() => router.push('/')}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <Feather name="chevron-left" size={28} color="#333D47" />
        </Button>
      </View>

      {/* Main Centered Content */}
      <View style={styles.centerContent}>
        {/* Status Badge */}
        <Chip
          variant="primary"
          color="accent"
          size="lg"
          className="px-8 py-3 mb-8 shadow-sm self-center"
        >
          Analysing
        </Chip>

        {/* Progress Card */}
        <Card className="w-72 h-72 items-center justify-center rounded-3xl bg-surface shadow-md border border-border">
          <Card.Body className="items-center justify-center p-6 w-full gap-4">
            <View style={styles.percentageRow}>
              <Animated.Text style={[styles.percentageNumber, animatedStyle]}>
                {percentage}
              </Animated.Text>
              <Text.Heading type="h2" style={styles.percentageSymbol}>
                %
              </Text.Heading>
            </View>
            <Spinner color="default" size="lg" className="mt-2" />
          </Card.Body>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -40,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageNumber: {
    fontSize: 76,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
    color: '#333D47',
    textAlign: 'center',
    includeFontPadding: false,
  },
  percentageSymbol: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
    color: '#007bff',
    marginLeft: 4,
    includeFontPadding: false,
  },
});
