import React from 'react';
import { type TextProps } from 'react-native';
import { Text as HeroText } from 'heroui-native/text';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const heroType = type === 'title' ? 'h1' : type === 'subtitle' ? 'h2' : type === 'defaultSemiBold' ? 'h4' : 'body';

  return (
    <HeroText
      type={heroType}
      style={[{ color }, style]}
      {...rest}
    />
  );
}
