import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
    // Shared value for scale
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const [showAttentionMap, setShowAttentionMap] = useState(false);

    // Simple pinch gesture to test
    const pinchGesture = Gesture.Pinch()
        .onBegin(() => {
            savedScale.value = scale.value;
        })
        .onUpdate((event) => {
            // Directly apply the new scale based on the pinch
            const newScale = savedScale.value * event.scale;
            // Limit between 1x and 5x zoom
            scale.value = Math.min(Math.max(1, newScale), 5);
        })
        .onEnd(() => {
            // If scale went below 1, reset to 1
            if (scale.value < 1) {
                scale.value = withTiming(1);
            }
        });

    // Animated style for the image
    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    // Reset scale when closing
    const handleClose = () => {
        scale.value = withTiming(1);
        setShowAttentionMap(false);
        onClose();
    };

    if (!imageUrl) {
        return null;
    }

    const imageSource = showAttentionMap && imageIndex < attentionMaps.length
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
                {/* Close button */}
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Feather name="x" size={30} color="white" />
                </TouchableOpacity>

                {/* Attention map toggle button */}
                <TouchableOpacity 
                    style={styles.attentionButton} 
                    onPress={() => setShowAttentionMap(prev => !prev)}
                >
                    <Text style={styles.attentionButtonText}>
                        {showAttentionMap ? 'Original Image' : 'Attention Map'}
                    </Text>
                </TouchableOpacity>

                {/* Simple pinch-only gesture for testing */}
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
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 2,
    },
    attentionButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    attentionButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    image: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
});