import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native/button';

export function CameraButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      isIconOnly
      style={styles.container}
      onPress={() => router.push('/camera')}
    >
      <MaterialIcons name="camera" size={24} color="#333D47" />
    </Button>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
