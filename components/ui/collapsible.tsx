import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { Accordion } from 'heroui-native/accordion';
import { Text } from 'heroui-native/text';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  return (
    <Accordion selectionMode="single" isCollapsible style={styles.container}>
      <Accordion.Item value="1" className="border-0">
        <Accordion.Trigger className="flex-row items-center py-2 gap-2">
          <Accordion.Indicator />
          <Text.Heading type="h4" style={styles.title}>{title}</Text.Heading>
        </Accordion.Trigger>
        <Accordion.Content style={styles.content}>
          <View>{children}</View>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cairo',
    color: '#333D47',
  },
  content: {
    marginTop: 6,
    paddingLeft: 24,
  },
});
