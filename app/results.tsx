import ImageViewerModal from '@/components/ImageViewerModal';
import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { memo, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { PressableFeedback } from 'heroui-native/pressable-feedback';
import { Surface } from 'heroui-native/surface';
import { Text as HeroText } from 'heroui-native/text';

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

interface ResultCardProps {
  item: typeof screeningData[0];
  index: number;
  colors: typeof Colors.light;
}

const ResultCard = ({ item, index, colors }: ResultCardProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 200, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 200, withTiming(0, { duration: 500 }));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const styles = getStyles(colors);

  return (
    <Animated.View style={[animatedStyle]}>
      <Card className="bg-surface rounded-2xl p-5 mb-5 shadow-sm border border-border">
        <Card.Header className="flex-row items-center mb-2 pb-2">
          <Feather name="check-circle" size={26} color={colors.tint} style={styles.icon} />
          <View style={styles.cardTextContainer}>
            <HeroText.Heading type="h4" className="text-foreground font-cairo font-bold text-base mb-1">
              Result
            </HeroText.Heading>
            <Chip variant="primary" color="accent" size="sm" className="self-start shadow-sm">
              {item.result}
            </Chip>
          </View>
        </Card.Header>

        <Separator className="my-3" />

        <Card.Body className="gap-3">
          <View style={styles.cardRow}>
            <Feather name="info" size={22} color={colors.tint} style={styles.icon} />
            <View style={styles.cardTextContainer}>
              <HeroText.Heading type="h4" className="text-foreground font-cairo font-bold text-base mb-0.5">
                Main Medical Cause
              </HeroText.Heading>
              <HeroText.Paragraph className="text-muted font-cairo text-sm leading-relaxed">
                {item.mainMedicalCause}
              </HeroText.Paragraph>
            </View>
          </View>

          <Separator className="my-2" />

          <View style={styles.cardRow}>
            <Feather name="message-circle" size={22} color={colors.tint} style={styles.icon} />
            <View style={styles.cardTextContainer}>
              <HeroText.Heading type="h4" className="text-foreground font-cairo font-bold text-base mb-0.5">
                Comment
              </HeroText.Heading>
              <HeroText.Paragraph className="text-muted font-cairo text-sm leading-relaxed">
                {item.comment}
              </HeroText.Paragraph>
            </View>
          </View>

          <Separator className="my-2" />

          <View style={styles.cardRow}>
            <Feather name="clipboard" size={22} color={colors.tint} style={styles.icon} />
            <View style={styles.cardTextContainer}>
              <HeroText.Heading type="h4" className="text-foreground font-cairo font-bold text-base mb-0.5">
                Medical Recommendation
              </HeroText.Heading>
              <HeroText.Paragraph className="text-muted font-cairo text-sm leading-relaxed">
                {item.medicalRecommendation}
              </HeroText.Paragraph>
            </View>
          </View>
        </Card.Body>
      </Card>
    </Animated.View>
  );
};

const MemoizedImage = memo(function MemoizedImage({ uri, onPress }: { uri: string; onPress: () => void }) {
  return (
    <PressableFeedback onPress={onPress}>
      <Image source={{ uri }} style={getStyles(Colors.light).previewImage} contentFit="cover" />
    </PressableFeedback>
  );
});
MemoizedImage.displayName = 'MemoizedImage';

function parseImagesParam(rawImages: unknown): string[] {
  if (!rawImages) return [];
  if (Array.isArray(rawImages)) {
    return (rawImages as any[]).map(img => String(img));
  }
  if (typeof rawImages === 'string') {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) return parsed.map(img => String(img));
      return [rawImages];
    } catch {
      return [rawImages];
    }
  }
  return [];
}

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const images = parseImagesParam(params.images);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-20);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 500 });
    titleTranslateY.value = withTiming(0, { duration: 500 });
  }, [titleOpacity, titleTranslateY]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  return (
    <Surface variant="default" style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={titleAnimatedStyle}>
            <HeroText.Heading type="h1" className="text-2xl font-bold font-cairo text-foreground text-center mb-5">
              Diabetic Retinopathy Screening Results
            </HeroText.Heading>
          </Animated.View>

          <FlatList
            data={screeningData}
            renderItem={({ item, index }) => <ResultCard item={item} index={index} colors={colors} />}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />

          <View style={styles.imagePreviewContainer}>
            <HeroText.Heading type="h2" className="text-xl font-bold font-cairo text-foreground mb-3">
              Captured Images ({images.length})
            </HeroText.Heading>
            {images.length > 0 ? (
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
                keyExtractor={(item, index) => `${item}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                initialNumToRender={3}
                windowSize={3}
                contentContainerStyle={{ paddingVertical: 4 }}
              />
            ) : (
              <View style={styles.noImagesBox}>
                <Feather name="image" size={24} color="#94A3B8" />
                <HeroText.Paragraph className="text-muted font-cairo text-sm mt-1">
                  No images captured for this session
                </HeroText.Paragraph>
              </View>
            )}
          </View>
        </ScrollView>

        <Button
          variant="primary"
          size="lg"
          className="bg-accent mx-5 mb-5 py-4"
          onPress={() => router.push('/')}
        >
          Back to Home
        </Button>

        <ImageViewerModal
          visible={isModalVisible}
          imageUrl={selectedImage}
          imageIndex={selectedImageIndex}
          onClose={() => setIsModalVisible(false)}
        />
      </SafeAreaView>
    </Surface>
  );
}

const getStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
  },
  imagePreviewContainer: {
    marginTop: 15,
  },
  previewImage: {
    width: 110,
    height: 110,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: '#F1F5F9',
  },
  noImagesBox: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});