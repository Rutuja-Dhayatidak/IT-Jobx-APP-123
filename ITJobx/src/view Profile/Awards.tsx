import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface AwardsProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

// Trash Icon
const TrashIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#EF4444" />
  </Svg>
);

// Chevron Icon
const ChevronIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill={color} />
  </Svg>
);

export default function Awards({ onBackPress, isDarkTheme = true }: AwardsProps) {
  const [title, setTitle] = useState('Design Harmony Honor');
  const [organization, setOrganization] = useState('BrioSoft solutions');
  const [dateAwarded, setDateAwarded] = useState('July 2023');
  const [description, setDescription] = useState('');

  const [showDropdown, setShowDropdown] = useState(false);

  const dates = ['July 2023', 'August 2023', 'September 2023', 'Select'];

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Awards & Achievements</Text>
          <TouchableOpacity style={[styles.deleteButton, { borderColor: dynamicStyles.buttonBorder }]} activeOpacity={0.7}>
            <TrashIcon />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
            />
          </View>

          {/* Organization */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Organization</Text>
            <TextInput
              style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
              value={organization}
              onChangeText={setOrganization}
              placeholder="Organization"
              placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
            />
          </View>

          {/* Date Awarded */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Date Awarded</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={{ color: dynamicStyles.textColor }}>{dateAwarded}</Text>
              <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>
            {showDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                {dates.map((d) => (
                  <TouchableOpacity key={d} style={styles.dropdownItem} onPress={() => { setDateAwarded(d); setShowDropdown(false); }}>
                    <Text style={{ color: dynamicStyles.textColor }}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Description (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Add Text Here"
              placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={onBackPress}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
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
  deleteButton: {
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  dropdownMenu: {
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  textArea: {
    height: 100,
    paddingVertical: 14,
  },
  saveButton: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  labelColor: '#94A3B8',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  inputBg: '#131A2E',
  inputBorder: 'rgba(255, 255, 255, 0.05)',
  dropdownBg: '#131A2E',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  dropdownBg: '#FFFFFF',
};
