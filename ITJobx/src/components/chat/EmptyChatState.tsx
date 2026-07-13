import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface EmptyChatStateProps {
  isDarkTheme?: boolean;
}

const EmptyChatIcon = ({ color }: { color: string }) => (
  <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
    <Path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" fill={color} />
  </Svg>
);

export default function EmptyChatState({ isDarkTheme = false }: EmptyChatStateProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <View style={styles.container}>
      <EmptyChatIcon color={isDarkTheme ? '#334155' : '#E2E8F0'} />
      <Text style={[styles.title, { color: dynamicStyles.titleColor }]}>Start a Conversation</Text>
      <Text style={[styles.subtitle, { color: dynamicStyles.subtitleColor }]}>
        Type a message below or select a quick action to start chatting with ITJobX Candidate Support.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});

const darkStyles = {
  titleColor: '#F8FAFC',
  subtitleColor: '#64748B',
};

const lightStyles = {
  titleColor: '#1E293B',
  subtitleColor: '#94A3B8',
};
