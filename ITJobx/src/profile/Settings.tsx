import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
interface SettingsProps {
  onBackPress: () => void;
  isDarkTheme: boolean;
  onToggleTheme: (value: boolean) => void;
  onNavigateTo?: (screen: any) => void;
}

const ChevronIcon = ({ isDark }: { isDark: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill={isDark ? '#64748B' : '#94A3B8'} />
  </Svg>
);

const BellIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1-1.5-1s-1.5.17-1.5 1v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="#2563EB" />
  </Svg>
);

const KeyIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#2563EB" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#EF4444" />
  </Svg>
);

const PaletteIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.02 9 9 9a1.5 1.5 0 0 0 1.5-1.5c0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#2563EB" />
  </Svg>
);

export default function Settings({ onBackPress, isDarkTheme, onToggleTheme, onNavigateTo }: SettingsProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Options Container */}
        <View style={styles.optionsContainer}>
          {/* Notification Settings */}
          <TouchableOpacity
            style={[styles.optionRow, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
            activeOpacity={0.7}
            onPress={() => onNavigateTo && onNavigateTo('notification_settings')}
          >
            <View style={[styles.iconContainer, { backgroundColor: dynamicStyles.iconBgBlue }]}>
              <BellIcon />
            </View>
            <Text style={[styles.optionTitle, { color: dynamicStyles.textColor }]}>Notification Settings</Text>
            <ChevronIcon isDark={isDarkTheme} />
          </TouchableOpacity>

          {/* Password Manager */}
          <TouchableOpacity
            style={[styles.optionRow, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
            activeOpacity={0.7}
            onPress={() => onNavigateTo && onNavigateTo('password_manager')}
          >
            <View style={[styles.iconContainer, { backgroundColor: dynamicStyles.iconBgBlue }]}>
              <KeyIcon />
            </View>
            <Text style={[styles.optionTitle, { color: dynamicStyles.textColor }]}>Password Manager</Text>
            <ChevronIcon isDark={isDarkTheme} />
          </TouchableOpacity>

          {/* Theme Toggler Option */}
          <View style={[styles.optionRow, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
            <View style={[styles.iconContainer, { backgroundColor: dynamicStyles.iconBgBlue }]}>
              <PaletteIcon />
            </View>
            <Text style={[styles.optionTitle, { color: dynamicStyles.textColor }]}>Dark Mode</Text>
            <Switch
              value={isDarkTheme}
              onValueChange={onToggleTheme}
              trackColor={{ false: '#767577', true: '#22C55E' }}
              thumbColor={isDarkTheme ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>

          {/* Delete Account */}
          <TouchableOpacity
            style={[styles.optionRow, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <TrashIcon />
            </View>
            <Text style={[styles.optionTitle, { color: '#EF4444' }]}>Delete Account</Text>
            <ChevronIcon isDark={isDarkTheme} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});

// Dynamic themes configurations
const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  cardBg: '#131A2E',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  iconBgBlue: 'rgba(37, 99, 235, 0.1)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  iconBgBlue: 'rgba(37, 99, 235, 0.05)',
};
