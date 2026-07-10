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
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

interface EducationProps {
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

// Upload Media Icon
const UploadIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 9h-3v3h-2v-3H8V9h3V6h2v3h3v2z" fill="#2563EB" />
  </Svg>
);

export default function Education({ onBackPress, isDarkTheme = true }: EducationProps) {
  const [course, setCourse] = useState('Computer Engineering');
  const [school, setSchool] = useState('Imaginaria University');
  const [fromMonth, setFromMonth] = useState('Dec 2020');
  const [toMonth, setToMonth] = useState('Select');
  const [graduated, setGraduated] = useState(true);
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');

  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const courses = ['Computer Engineering', 'Business Administration', 'Mechanical Engineering', 'Other'];
  const months = ['Dec 2020', 'Jan 2021', 'Feb 2021', 'Mar 2021', 'Select'];

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
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Education</Text>
          <TouchableOpacity style={[styles.deleteButton, { borderColor: dynamicStyles.buttonBorder }]} activeOpacity={0.7}>
            <TrashIcon />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Course */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Course</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
              onPress={() => setShowCourseDropdown(!showCourseDropdown)}
            >
              <Text style={{ color: dynamicStyles.textColor }}>{course}</Text>
              <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>
            {showCourseDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                {courses.map((c) => (
                  <TouchableOpacity key={c} style={styles.dropdownItem} onPress={() => { setCourse(c); setShowCourseDropdown(false); }}>
                    <Text style={{ color: dynamicStyles.textColor }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* School */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>School</Text>
            <TextInput
              style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
              value={school}
              onChangeText={setSchool}
              placeholder="Enter School"
              placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
            />
          </View>

          {/* Dates Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>From</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                onPress={() => setShowFromDropdown(!showFromDropdown)}
              >
                <Text style={{ color: dynamicStyles.textColor }}>{fromMonth}</Text>
                <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
              {showFromDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                  {months.map((m) => (
                    <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => { setFromMonth(m); setShowFromDropdown(false); }}>
                      <Text style={{ color: dynamicStyles.textColor }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>To</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                onPress={() => setShowToDropdown(!showToDropdown)}
              >
                <Text style={{ color: dynamicStyles.textColor }}>{toMonth}</Text>
                <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
              {showToDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                  {months.map((m) => (
                    <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => { setToMonth(m); setShowToDropdown(false); }}>
                      <Text style={{ color: dynamicStyles.textColor }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Graduated Toggle */}
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: dynamicStyles.textColor }]}>Graduated</Text>
            <Switch
              value={graduated}
              onValueChange={setGraduated}
              trackColor={{ false: '#767577', true: '#2563EB' }}
              thumbColor={graduated ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {/* Grade (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Grade (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
              value={grade}
              onChangeText={setGrade}
              placeholder="Enter Grade"
              placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
            />
          </View>

          {/* Description (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
              value={description}
              onChangeText={(text) => {
                if (text.length <= 200) {
                  setDescription(text);
                }
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Enter Description"
              placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
            />
            <Text style={[styles.counterText, { color: dynamicStyles.labelColor }]}>
              {description.length}/200
            </Text>
          </View>

          {/* Add Media (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Add Media (Optional)</Text>
            <TouchableOpacity
              style={[styles.uploadBox, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
              activeOpacity={0.8}
            >
              <UploadIcon />
            </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    paddingVertical: 14,
  },
  counterText: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },
  uploadBox: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
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
