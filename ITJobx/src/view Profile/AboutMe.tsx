import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { viewProfileService } from '../services/viewProfile';
import Svg, { Path } from 'react-native-svg';

// Chevron Icon
const ChevronIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill={color} />
  </Svg>
);

interface AboutMeProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

export default function AboutMe({ onBackPress, isDarkTheme = true }: AboutMeProps) {
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [prefRole, setPrefRole] = useState('');
  const [prefLocation, setPrefLocation] = useState('');
  const [prefJobType, setPrefJobType] = useState('Full-Time');
  const [prefSalary, setPrefSalary] = useState('');
  const [showPrefJobTypeDropdown, setShowPrefJobTypeDropdown] = useState(false);
  const jobTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await viewProfileService.getProfile();
        if (data && data.success && data.profile) {
          setBio(data.profile.about || '');

          if (data.profile.job_preferences) {
            setPrefRole(data.profile.job_preferences.role || '');
            setPrefLocation(data.profile.job_preferences.location || '');
            setPrefJobType(data.profile.job_preferences.type || 'Full-Time');
            setPrefSalary(data.profile.job_preferences.salary || '');
          } else {
            setPrefRole(Array.isArray(data.profile.preferredRoles) ? data.profile.preferredRoles.join(', ') : '');
            setPrefLocation(Array.isArray(data.profile.preferredLocations) ? data.profile.preferredLocations.join(', ') : '');
            setPrefJobType(data.profile.preferredJobType || 'Full-Time');
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile in AboutMe:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const rolesArray = prefRole.split(',').map(s => s.trim()).filter(Boolean);
      const locationsArray = prefLocation.split(',').map(s => s.trim()).filter(Boolean);

      const data = await viewProfileService.updateProfile({ 
        about: bio,
        job_preferences: {
          role: prefRole,
          location: prefLocation,
          type: prefJobType,
          salary: prefSalary
        },
        preferredRoles: rolesArray,
        preferredLocations: locationsArray,
        preferredJobType: prefJobType
      });
      if (data && data.success) {
        Alert.alert('Success', 'About me & preferences updated successfully!');
        onBackPress();
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>About Me</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Bio Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>About Me</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={bio}
                  onChangeText={(text) => {
                    if (text.length <= 1000) {
                      setBio(text);
                    }
                  }}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  placeholder="Enter Text Here"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
                <Text style={[styles.counterText, { color: dynamicStyles.labelColor }]}>
                  {bio.length}/1000
                </Text>
              </View>

              {/* Job Preferences Section */}
              <View style={[styles.cardSeparator, { backgroundColor: dynamicStyles.dividerColor, marginVertical: 20 }]} />
              <Text style={[styles.sectionHeading, { color: dynamicStyles.textColor, marginBottom: 16 }]}>Job Preferences</Text>

              {/* Preferred Role */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Preferred Role(s) (comma separated)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={prefRole}
                  onChangeText={setPrefRole}
                  placeholder="e.g. Full Stack Developer, React Native Developer"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Preferred Location */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Preferred Location(s) (comma separated)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={prefLocation}
                  onChangeText={setPrefLocation}
                  placeholder="e.g. Pune, Mumbai, Remote"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Preferred Job Type */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Preferred Job Type</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                  onPress={() => setShowPrefJobTypeDropdown(!showPrefJobTypeDropdown)}
                >
                  <Text style={{ color: dynamicStyles.textColor }}>{prefJobType}</Text>
                  <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
                {showPrefJobTypeDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                    {jobTypes.map((jt) => (
                      <TouchableOpacity key={jt} style={styles.dropdownItem} onPress={() => { setPrefJobType(jt); setShowPrefJobTypeDropdown(false); }}>
                        <Text style={{ color: dynamicStyles.textColor }}>{jt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Preferred Salary */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Preferred Salary Budget</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={prefSalary}
                  onChangeText={setPrefSalary}
                  placeholder="e.g. 12 LPA"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity 
                style={[styles.saveButton, saving && { opacity: 0.7 }]} 
                activeOpacity={0.8} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    height: 52,
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
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardSeparator: {
    height: 1,
    width: '100%',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textArea: {
    height: 200,
    paddingVertical: 14,
  },
  counterText: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
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
  dividerColor: 'rgba(255, 255, 255, 0.05)',
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
  dividerColor: '#E2E8F0',
};
