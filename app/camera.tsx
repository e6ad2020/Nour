import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Surface } from 'heroui-native/surface';
import { Alert } from 'heroui-native/alert';

interface NotificationProps {
  message: string;
  onHide: () => void;
}

const CameraAlert = ({ message, onHide }: NotificationProps) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(1, { duration: 400 });

    const timer = setTimeout(() => {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      setTimeout(onHide, 300);
    }, 2500);

    return () => clearTimeout(timer);
  }, [message, onHide, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.alertContainer, animatedStyle]}>
      <Alert status="accent" className="rounded-2xl shadow-lg border border-white/20">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title className="font-cairo text-white font-bold">{message}</Alert.Title>
        </Alert.Content>
      </Alert>
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
              setNotification(`Picture ${newImages.length} captured. ${3 - newImages.length} more to go.`);
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3 - capturedImages.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = [...capturedImages, ...result.assets.map(asset => asset.uri)];
      setCapturedImages(newImages);

      if (newImages.length < 3) {
        setNotification(`${newImages.length} images selected. ${3 - newImages.length} more to go.`);
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
        {/* Top Bar with Back Button and Capture Counter Chip */}
        <View style={styles.topBar} pointerEvents="box-none">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            className="w-11 h-11 rounded-full bg-black/40 items-center justify-center"
            onPress={() => router.push('/')}
          >
            <Feather name="chevron-left" size={28} color="white" />
          </Button>

          <Chip variant="primary" color="accent" size="md" className="shadow-lg">
            Captured {capturedImages.length}/3 images
          </Chip>

          <View style={{ width: 44 }} />
        </View>

        {/* Bottom Controls Bar with HeroUI Buttons */}
        <View style={styles.bottomBar}>
          {/* Gallery Button */}
          <Button
            variant="secondary"
            size="lg"
            isIconOnly
            className="w-14 h-14 rounded-full items-center justify-center shadow-lg bg-black/40 border border-white/20"
            onPress={pickImages}
          >
            <MaterialIcons name="photo-library" size={26} color="white" />
          </Button>

          {/* Shutter Button */}
          <Button
            variant="primary"
            size="lg"
            isIconOnly
            className="w-20 h-20 rounded-full border-4 border-white shadow-2xl items-center justify-center bg-accent"
            onPress={takePicture}
            isDisabled={!isCameraReady || isCapturing}
          >
            <MaterialIcons name="camera" size={36} color="white" />
          </Button>

          {/* Flip Camera Button */}
          <Button
            variant="secondary"
            size="lg"
            isIconOnly
            className="w-14 h-14 rounded-full items-center justify-center shadow-lg bg-black/40 border border-white/20"
            onPress={toggleCameraFacing}
          >
            <MaterialIcons name="flip-camera-ios" size={26} color="white" />
          </Button>
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
    ...StyleSheet.absoluteFillObject,
  },
  shutter: {
    ...StyleSheet.absoluteFillObject,
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
    paddingTop: 10,
    zIndex: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 30,
    zIndex: 2,
  },
  alertContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 100,
  },
});
