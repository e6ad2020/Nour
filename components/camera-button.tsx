import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native/button';

export function CameraButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="md"
      isIconOnly
      className="rounded-full"
      onPress={() => router.push('/camera')}
    >
      <MaterialIcons name="photo-camera" size={24} color="#007bff" />
    </Button>
  );
}
