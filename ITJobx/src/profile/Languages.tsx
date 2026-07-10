import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import FadeInView from '../components/FadeInView';

interface LanguagesProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

// Custom Radio Button Component
const RadioButton = ({ selected }: { selected: boolean }) => (
  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
    {selected && <View style={styles.radioInner} />}
  </View>
);

export default function Languages({ onBackPress, isDarkTheme = false }: LanguagesProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  // List of languages from user screenshot
  const languageList = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'Germany' },
    { code: 'it', name: 'Italian' },
    { code: 'ko', name: 'Korean' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russia' },
    { code: 'es', name: 'Spanish' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'bn', name: 'Bengali' },
    { code: 'he', name: 'Hebrew' },
    { code: 'ur', name: 'Urdu' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'nl', name: 'Dutch' },
  ];

  // Selected language state (default: English)
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />
      
      <FadeInView style={{ flex: 1 }}>
        {/* Header Row */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Language</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Scrollable Language List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {languageList.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageRow,
                  { borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' },
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedLanguage(lang.code)}
              >
                <RadioButton selected={isSelected} />
                <Text style={[styles.languageName, { color: isSelected ? '#2563EB' : dynamicStyles.textColor, fontWeight: isSelected ? '600' : 'normal' }]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  languageName: {
    fontSize: 16,
    marginLeft: 16,
  },
  // Radio button styles
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
});

const darkStyles = {
  backgroundColor: '#0F172A',
  buttonBg: '#1E293B',
  buttonBorder: 'rgba(255, 255, 255, 0.1)',
  textColor: '#FFFFFF',
};

const lightStyles = {
  backgroundColor: '#FFFFFF',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  textColor: '#1E293B',
};
