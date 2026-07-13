import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ScrollView, View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface QuickActionChipsProps {
  onChipPress: (action: string) => void;
  isDarkTheme?: boolean;
}

// Icons matching the image
const DocIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill={color} />
  </Svg>
);

const UserIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={color} />
  </Svg>
);

const SearchIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill={color} />
  </Svg>
);

export default function QuickActionChips({ onChipPress, isDarkTheme = false }: QuickActionChipsProps) {
  const chips = [
    { label: 'Application Status', icon: <DocIcon color="#3B82F6" /> },
    { label: 'Resume Help', icon: <DocIcon color="#3B82F6" /> },
    { label: 'Interview Support', icon: <UserIcon color="#3B82F6" /> },
    { label: 'Job Search', icon: <SearchIcon color="#3B82F6" /> },
  ];

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {chips.map((chip, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.chipButton, { backgroundColor: dynamicStyles.chipBg, borderColor: dynamicStyles.borderColor }]}
          onPress={() => onChipPress(chip.label)}
          activeOpacity={0.8}
        >
          <View style={styles.chipContent}>
            {chip.icon}
            <Text style={[styles.chipText, { color: dynamicStyles.textColor }]}>
              {chip.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginVertical: 4,
    overflow: 'visible',
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1.5,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

const darkStyles = {
  chipBg: '#1E293B',
  borderColor: 'rgba(255, 255, 255, 0.05)',
  textColor: '#F8FAFC',
};

const lightStyles = {
  chipBg: '#FFFFFF',
  borderColor: '#E2E8F0',
  textColor: '#1E293B',
};
