import ImageViewerModal from '@/components/ImageViewerModal';
import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { memo, useEffect, useState } from 'react';
import { FlatList, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data for the diabetic retinopathy screening results
const screeningData = [
  {
    id: '1',
    result: 'Diabetic Retinopathy Present',
    mainMedicalCause: 'Presence of microaneurysms, hemorrhages, and hard exudates indicative of moderate non-proliferative diabetic retinopathy (NPDR).',
    comment: 'The screening has detected signs of diabetic retinopathy. The highlighted areas on the attention maps indicate regions with retinal abnormalities.',
    medicalRecommendation: 'Urgent follow-up with an ophthalmologist is recommended for a comprehensive examination and to discuss a treatment plan. Strict control of blood glucose, blood pressure, and lipid levels is crucial.',
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ResultCard = ({ item, index, colors }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 200, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 200, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const styles = getStyles(colors);

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.cardRow}>
        <Feather name="check-circle" size={24} color={colors.tint} style={styles.icon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardLabel}>Result</Text>
          <Text style={styles.cardValue}>{item.result}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Feather name="info" size={24} color={colors.tint} style={styles.icon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardLabel}>Main Medical Cause</Text>
          <Text style={styles.cardValue}>{item.mainMedicalCause}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Feather name="message-circle" size={24} color={colors.tint} style={styles.icon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardLabel}>Comment</Text>
          <Text style={styles.cardValue}>{item.comment}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Feather name="clipboard" size={24} color={colors.tint} style={styles.icon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardLabel}>Medical Recommendation</Text>
          <Text style={styles.cardValue}>{item.medicalRecommendation}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const MemoizedImage = memo(({ uri, onPress }: { uri: string, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Image source={{ uri }} style={getStyles(Colors.light).previewImage} />
  </TouchableOpacity>
));

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-20);
  const buttonScale = useSharedValue(1);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);

  useEffect(() => {
    if (params.images) {
      try {
        const parsedImages = JSON.parse(params.images as string);
        setImages(Array.isArray(parsedImages) ? parsedImages : []);
      } catch (error) {
        console.error("Error parsing images:", error);
        setImages([]);
      }
    }
  }, [params.images]);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 500 });
    titleTranslateY.value = withTiming(0, { duration: 500 });
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>Diabetic Retinopathy Screening Results</Animated.Text>

        <FlatList
          data={screeningData}
          renderItem={({ item, index }) => <ResultCard item={item} index={index} colors={colors} />}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        <View style={styles.imagePreviewContainer}>
          <Text style={styles.imagePreviewTitle}>Captured Images</Text>
          <FlatList
            data={images}
            renderItem={({ item, index }) => (
              <MemoizedImage
                uri={item}
                onPress={() => {
                  setSelectedImage(item);
                  setSelectedImageIndex(index);
                  setIsModalVisible(true);
                }}
              />
            )}
            keyExtractor={item => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            initialNumToRender={3}
            windowSize={3}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        </View>
      </ScrollView>

      <AnimatedTouchableOpacity
        style={[styles.button, buttonAnimatedStyle]}
        onPressIn={() => buttonScale.value = withTiming(0.95)}
        onPressOut={() => buttonScale.value = withTiming(1)}
        onPress={() => router.push('/')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </AnimatedTouchableOpacity>

      <ImageViewerModal
        visible={isModalVisible}
        imageUrl={selectedImage}
        imageIndex={selectedImageIndex}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333D47',
    fontFamily: 'Cairo',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  icon: {
    marginRight: 15,
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#546E7A',
    fontFamily: 'Cairo',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    color: '#455A64',
    fontFamily: 'Cairo',
    lineHeight: 24,
  },
  imagePreviewContainer: {
    marginTop: 20,
  },
  imagePreviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
    marginBottom: 10,
    color: '#333D47',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  button: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: colors.tint,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cairo',
  },
});