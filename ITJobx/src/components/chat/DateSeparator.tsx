import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface DateSeparatorProps {
  dateString: string;
  isDarkTheme?: boolean;
}

export default function DateSeparator({ dateString, isDarkTheme = false }: DateSeparatorProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: dynamicStyles.lineColor }]} />
      <View style={[styles.badge, { backgroundColor: dynamicStyles.badgeBg }]}>
        <Text style={[styles.text, { color: dynamicStyles.textColor }]}>{dateString}</Text>
      </View>
      <View style={[styles.line, { backgroundColor: dynamicStyles.lineColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    paddingHorizontal: 20,
  },
  line: {
    flex: 1,
    height: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

const darkStyles = {
  lineColor: 'rgba(255, 255, 255, 0.05)',
  badgeBg: '#1E293B',
  textColor: '#94A3B8',
};

const lightStyles = {
  lineColor: '#E2E8F0',
  badgeBg: '#F1F5F9',
  textColor: '#64748B',
};
