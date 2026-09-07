import React from 'react';
import { PlatformPressable } from 'expo-router/react-navigation';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: any) {
  const { pressColor, hoverEffect, ...rest } = props;
  return (
    <PlatformPressable
      {...rest}
      pressColor={typeof pressColor === 'string' ? pressColor : undefined}
      hoverEffect={hoverEffect && typeof hoverEffect.color === 'string' ? hoverEffect : undefined}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
