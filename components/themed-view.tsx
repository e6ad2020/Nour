import React from 'react';
import { type ViewProps } from 'react-native';
import { Surface, type SurfaceRootProps } from 'heroui-native/surface';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: SurfaceRootProps['variant'];
};

export function ThemedView({ style, lightColor, darkColor, variant = 'default', ...otherProps }: ThemedViewProps) {
  const themeBg = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const customBg = lightColor || darkColor ? themeBg : undefined;

  return (
    <Surface
      variant={variant}
      style={[customBg ? { backgroundColor: customBg } : undefined, style]}
      {...otherProps}
    />
  );
}
