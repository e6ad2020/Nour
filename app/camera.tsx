
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';

const Notification = ({ message, onHide, colors }) => {
  const translateX = useSharedValue(-300);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    translateX.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.exp) });
    scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) });

    const timer = setTimeout(() => {
      translateX.value = withTiming(-300, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
      setTimeout(onHide, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [message]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
    };
  });

  const styles = getStyles(colors);

  return (
    <Animated.View style={[styles.notification, animatedStyle]}>
      <Text style={styles.notificationText}>{message}</Text>
    </Animated.View>
  );
};

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [facing, setFacing] = useState('back');
  const [notification, setNotification] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);

  useFocusEffect(
    useCallback(() => {
      console.log('Camera screen focused');
      // Reset captured images when the screen is blurred
      return () => {
        console.log('Clearing captured images');
        setCapturedImages([]);
      };
    }, [])
  );

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      setIsCapturing(true);
      setTimeout(async () => {
        try {
          const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
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
      {notification && <Notification message={notification} onHide={() => setNotification(null)} colors={colors} />}
      <CameraView 
        style={styles.camera} 
        ref={cameraRef} 
        facing={facing} 
        onCameraReady={() => setIsCameraReady(true)}
      />
      
      {isCapturing && <View style={styles.shutter} />}

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Captured {capturedImages.length}/3 images</Text>
        <View style={styles.indicatorContainer}>
          <View style={[
            styles.indicator, 
            capturedImages.length >= 1 ? styles.activeIndicator : styles.inactiveIndicator
          ]} />
          <View style={[
            styles.indicator, 
            capturedImages.length >= 2 ? styles.activeIndicator : styles.inactiveIndicator
          ]} />
          <View style={[
            styles.indicator, 
            capturedImages.length >= 3 ? styles.activeIndicator : styles.inactiveIndicator
          ]} />
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={pickImages} style={styles.galleryButton}>
          <MaterialIcons name="photo-library" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={takePicture} style={styles.captureButton} disabled={!isCameraReady || isCapturing}>
          <MaterialIcons name="camera" size={36} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCameraFacing} style={styles.switchButton}>
          <MaterialIcons name="flip-camera-ios" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Cairo',
    marginBottom: 20,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  shutter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 10,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  
  button: {
    backgroundColor: colors.tint,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Cairo',
  },
  captureButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tint,
    borderRadius: 50,
    width: 80,
    height: 80,
    borderWidth: 4,
    borderColor: 'white',
  },
  switchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tint,
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  galleryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tint,
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  infoContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Cairo',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: colors.tint,
  },
  inactiveIndicator: {
    backgroundColor: '#ccc',
  },
  notification: {
    position: 'absolute',
    top: 120,
    left: 0,
    backgroundColor: colors.tint,
    padding: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 100,
  },
  notificationText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Cairo',
  },
});
