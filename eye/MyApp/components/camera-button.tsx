
import * as React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function CameraButton() {
  const router = useRouter();

  return (
    <Pressable style={styles.container} onPress={() => router.push('/camera')}>
      <MaterialIcons name="camera" size={24} color="black" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
