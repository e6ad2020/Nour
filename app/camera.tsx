import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Colors } from '@/constants/theme';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Surface } from 'heroui-native/surface';

interface NotificationProps {
  message: string;
  onHide: () => void;
}

const CameraAlert = ({ message, onHide }: NotificationProps) => {
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 350 });

    const timer = setTimeout(() => {
      translateY.value = withTiming(-60, { duration: 250, easing: Easing.in(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 250 }, () => {
        'worklet';
      });
      setTimeout(onHide, 260);
    }, 2800);

    return () => clearTimeout(timer);
  }, [message, onHide, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.alertContainer, animatedStyle]} pointerEvents="none">
      <View style={styles.alertCard}>
        <View style={styles.alertIconBadge}>
          <Feather name="check" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.alertText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [facing, setFacing] = useState<CameraType>('back');
  const [notification, setNotification] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useFocusEffect(
    useCallback(() => {
      return () => {
        setCapturedImages([]);
      };
    }, [])
  );

  if (!permission) {
    return <Surface variant="default" style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <Card className="p-6 items-center rounded-3xl bg-surface max-w-sm shadow-md border border-border">
          <Card.Header className="items-center mb-2">
            <Feather name="camera-off" size={48} color={colors.tint} />
            <Card.Title className="text-center font-bold font-cairo mt-3 text-foreground text-xl">
              Camera Access Required
            </Card.Title>
          </Card.Header>
          <Card.Body className="items-center w-full">
            <Card.Description className="text-center font-cairo text-muted mb-5 text-base">
              We need your permission to access the camera for eye screening.
            </Card.Description>
            <Button variant="primary" size="lg" className="w-full" onPress={requestPermission}>
              Grant Permission
            </Button>
          </Card.Body>
        </Card>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      const ref = cameraRef.current;
      setIsCapturing(true);
      setTimeout(async () => {
        try {
          if (!ref) return;
          const photo = await ref.takePictureAsync({ quality: 0.8 });
          if (photo) {
            const newImages = [...capturedImages, photo.uri];
            setCapturedImages(newImages);
            
            if (newImages.length < 3) {
              setNotification(`Photo ${newImages.length} captured. ${3 - newImages.length} more to go.`);
            } else {
              router.push({
                pathname: '/analysing',
                params: { images: JSON.stringify(newImages) }
              });
            }
          }
        } catch (error) {
          console.error("Error taking picture:", error);
          setNotification("Failed to capture image.");
        } finally {
          setIsCapturing(false);
        }
      }, 50);
    }
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setNotification('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3 - capturedImages.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = [...capturedImages, ...result.assets.map(asset => asset.uri)].slice(0, 3);
      setCapturedImages(newImages);

      if (newImages.length < 3) {
        setNotification(`${newImages.length} photos selected. ${3 - newImages.length} more to go.`);
      } else {
        router.push({
          pathname: '/analysing',
          params: { images: JSON.stringify(newImages) }
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      {Boolean(notification) && (
        <CameraAlert message={notification as string} onHide={() => setNotification(null)} />
      )}
      <CameraView 
        style={styles.camera} 
        ref={cameraRef} 
        facing={facing} 
        onCameraReady={() => setIsCameraReady(true)}
      />
      
      {isCapturing && <View style={styles.shutter} />}

      <SafeAreaView style={styles.overlaySafeArea} pointerEvents="box-none">
        {/* Top Bar with Back Button and Capture Counter */}
        <View style={styles.topBar} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.topBarCircleBtn}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
            accessibilityLabel="Back to home"
          >
            <Feather name="chevron-left" size={26} color="#FFFFFF" style={{ marginLeft: -2 }} />
          </TouchableOpacity>

          <Chip variant="primary" color="accent" size="md" className="shadow-lg">
            {capturedImages.length === 3 ? 'Screening Complete' : `Captured ${capturedImages.length}/3 images`}
          </Chip>

          <View style={{ width: 44 }} />
        </View>

        {/* Bottom Section: Preview Strip + Controls */}
        <View style={styles.bottomSection} pointerEvents="box-none">
          {/* Captured Photos Preview Strip */}
          <View style={styles.previewStripContainer}>
            <View style={styles.previewStripHeader}>
              <Text style={styles.previewStripTitle}>
                Captured Photos ({capturedImages.length}/3)
              </Text>
              {capturedImages.length > 0 && (
                <TouchableOpacity
                  onPress={() => setCapturedImages([])}
                  style={styles.resetButton}
                  activeOpacity={0.7}
                >
                  <Feather name="rotate-ccw" size={12} color="#CBD5E1" />
                  <Text style={styles.resetButtonText}>Retake All</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.slotsRow}>
              {[0, 1, 2].map((slotIndex) => {
                const imageUri = capturedImages[slotIndex];
                const isFilled = Boolean(imageUri);
                const isNext = slotIndex === capturedImages.length;

                return (
                  <View key={slotIndex} style={styles.slotWrapper}>
                    {isFilled ? (
                      <View style={styles.slotFilled}>
                        <Image source={{ uri: imageUri }} style={styles.slotImage} contentFit="cover" />
                        <View style={styles.slotBadge}>
                          <Feather name="check" size={10} color="#FFFFFF" />
                        </View>
                        <TouchableOpacity
                          style={styles.slotRemoveBtn}
                          onPress={() => {
                            setCapturedImages(prev => prev.filter((_, i) => i !== slotIndex));
                          }}
                          activeOpacity={0.8}
                          accessibilityLabel={`Remove image ${slotIndex + 1}`}
                        >
                          <Feather name="x" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={[styles.slotEmpty, isNext && styles.slotCurrent]}>
                        <Feather
                          name="camera"
                          size={18}
                          color={isNext ? '#38BDF8' : '#64748B'}
                        />
                        <Text style={[styles.slotNumber, isNext && styles.slotNumberCurrent]}>
                          {slotIndex + 1}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.bottomBar}>
            {/* Gallery Button */}
            <TouchableOpacity
              style={styles.controlCircleBtn}
              onPress={pickImages}
              activeOpacity={0.8}
              accessibilityLabel="Pick from gallery"
            >
              <MaterialIcons name="photo-library" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Shutter Button */}
            <TouchableOpacity
              style={[
                styles.shutterOuterRing,
                (!isCameraReady || isCapturing) && styles.shutterDisabled,
              ]}
              onPress={takePicture}
              disabled={!isCameraReady || isCapturing}
              activeOpacity={0.7}
              accessibilityLabel="Take picture"
            >
              <View style={styles.shutterInnerCircle}>
                <MaterialIcons name="camera" size={36} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Flip Camera Button */}
            <TouchableOpacity
              style={styles.controlCircleBtn}
              onPress={toggleCameraFacing}
              activeOpacity={0.8}
              accessibilityLabel="Switch camera facing"
            >
              <MaterialIcons name="flip-camera-ios" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    ...StyleSheet.absoluteFill,
  },
  shutter: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'black',
    zIndex: 10,
  },
  overlaySafeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    zIndex: 2,
  },
  topBarCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    zIndex: 2,
    gap: 16,
    paddingBottom: 20,
  },
  previewStripContainer: {
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  previewStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewStripTitle: {
    color: '#F8FAFC',
    fontFamily: 'Cairo',
    fontSize: 13,
    fontWeight: '700',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  resetButtonText: {
    color: '#CBD5E1',
    fontFamily: 'Cairo',
    fontSize: 11,
    fontWeight: '600',
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  slotWrapper: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 72,
  },
  slotEmpty: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  slotCurrent: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  slotNumber: {
    color: '#64748B',
    fontFamily: 'Cairo',
    fontSize: 11,
    fontWeight: '700',
  },
  slotNumberCurrent: {
    color: '#38BDF8',
  },
  slotFilled: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#10B981',
    position: 'relative',
  },
  slotImage: {
    width: '100%',
    height: '100%',
  },
  slotBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  controlCircleBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  shutterOuterRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  shutterInnerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  alertContainer: {
    position: 'absolute',
    top: 65,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    gap: 10,
    maxWidth: '92%',
  },
  alertIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    color: '#FFFFFF',
    fontFamily: 'Cairo',
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
});
