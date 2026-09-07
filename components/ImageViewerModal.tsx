import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Button } from 'heroui-native/button';
import { Chip } from 'heroui-native/chip';
import { CloseButton } from 'heroui-native/close-button';

const attentionMaps = [
  require('../imgs/img1.png'),
  require('../imgs/img2.png'),
  require('../imgs/img3.png'),
];

interface ImageViewerModalProps {
  visible: boolean;
  imageUrl: string | null;
  imageIndex: number;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function ImageViewerModal({ visible, imageUrl, imageIndex, onClose }: ImageViewerModalProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const [showAttentionMap, setShowAttentionMap] = useState(false);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(1, newScale), 5);
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1);
      }
    });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleClose = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withTiming(1);
    setShowAttentionMap(false);
    onClose();
  };

  if (!imageUrl) {
    return null;
  }

  const isAttentionMapAvailable = Boolean(showAttentionMap) && imageIndex < attentionMaps.length;
  const imageSource = isAttentionMapAvailable
    ? attentionMaps[imageIndex]
    : { uri: imageUrl };

  return (
    <Modal 
      visible={visible} 
      transparent={true} 
      animationType="fade" 
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <Button 
            variant="secondary"
            size="sm"
            className="bg-black/60 border border-white/20" 
            onPress={() => setShowAttentionMap(prev => !prev)}
          >
            {showAttentionMap ? 'Original' : 'Attention Map'}
          </Button>

          <Chip variant="primary" color="accent" size="sm" className="shadow-lg">
            Image {imageIndex + 1}
          </Chip>

          <CloseButton onPress={handleClose} />
        </View>

        <GestureDetector gesture={pinchGesture}>
          <View style={styles.imageContainer}>
            <Animated.Image
              source={imageSource}
              style={[styles.image, imageAnimatedStyle]}
              resizeMode="contain"
            />
          </View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
});