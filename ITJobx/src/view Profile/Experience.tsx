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
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { viewProfileService } from '../services/viewProfile';

interface ExperienceProps {
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

export default function Experience({ onBackPress, isDarkTheme = true }: ExperienceProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [industry, setIndustry] = useState('IT and Software');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState('Full-Time');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showJobTypeDropdown, setShowJobTypeDropdown] = useState(false);

  const months = ['Dec 2020', 'Jan 2021', 'Feb 2021', 'Mar 2021', 'Select'];
  const industries = ['IT and Software', 'Finance', 'Healthcare', 'Education'];
  const jobTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await viewProfileService.getProfile();
        if (data && data.success && data.profile && data.profile.experience && data.profile.experience.length > 0) {
          const exp = data.profile.experience[0];
          setJobTitle(exp.role || '');
          setCompany(exp.company || '');
          setDescription(exp.responsibilities || '');
          
          if (exp.duration) {
            const parts = exp.duration.split(' - ');
            if (parts.length > 0) setFromMonth(parts[0]);
            if (parts.length > 1) {
              setToMonth(parts[1]);
              setCurrentlyWorking(parts[1] === 'Present');
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching experience:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!jobTitle || !company) {
      Alert.alert('Error', 'Job Title and Company are required.');
      return;
    }
    try {
      setSaving(true);
      const updatedExp = {
        company,
        role: jobTitle,
        duration: currentlyWorking ? `${fromMonth} - Present` : `${fromMonth} - ${toMonth}`,
        responsibilities: description
      };
      
      const data = await viewProfileService.updateProfile({ experience: [updatedExp] });
      if (data && data.success) {
        Alert.alert('Success', 'Experience updated successfully!');
        onBackPress();
      } else {
        Alert.alert('Error', 'Failed to update experience.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update experience.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this experience entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const data = await viewProfileService.updateProfile({ experience: [] });
              if (data && data.success) {
                Alert.alert('Deleted', 'Experience entry removed.');
                onBackPress();
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete experience.');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
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
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Experience</Text>
          <TouchableOpacity 
            style={[styles.deleteButton, { borderColor: dynamicStyles.buttonBorder }]} 
            activeOpacity={0.7}
            onPress={handleDelete}
          >
            <TrashIcon />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Job Title */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Job Title</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={jobTitle}
                  onChangeText={setJobTitle}
                  placeholder="Enter Job Title"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Company */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Company</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="Enter Company"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Date Input Row */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>From</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                    value={fromMonth === 'Select' ? '' : fromMonth}
                    onChangeText={setFromMonth}
                    placeholder="e.g. Dec 2020"
                    placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                  />
                </View>
 
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>To</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder },
                      currentlyWorking && { opacity: 0.5 }
                    ]}
                    value={currentlyWorking ? 'Present' : (toMonth === 'Select' ? '' : toMonth)}
                    onChangeText={setToMonth}
                    placeholder="e.g. Mar 2021"
                    placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                    editable={!currentlyWorking}
                  />
                </View>
              </View>

              {/* Currently Working Toggle */}
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: dynamicStyles.textColor }]}>Currently working here</Text>
                <Switch
                  value={currentlyWorking}
                  onValueChange={setCurrentlyWorking}
                  trackColor={{ false: '#767577', true: '#2563EB' }}
                  thumbColor={currentlyWorking ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>

              {/* Industry */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Industry</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                  onPress={() => setShowIndustryDropdown(!showIndustryDropdown)}
                >
                  <Text style={{ color: dynamicStyles.textColor }}>{industry}</Text>
                  <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
                {showIndustryDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                    {industries.map((ind) => (
                      <TouchableOpacity key={ind} style={styles.dropdownItem} onPress={() => { setIndustry(ind); setShowIndustryDropdown(false); }}>
                        <Text style={{ color: dynamicStyles.textColor }}>{ind}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Description */}
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

              {/* Job Type */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Job Type</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                  onPress={() => setShowJobTypeDropdown(!showJobTypeDropdown)}
                >
                  <Text style={{ color: dynamicStyles.textColor }}>{jobType}</Text>
                  <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
                {showJobTypeDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                    {jobTypes.map((jt) => (
                      <TouchableOpacity key={jt} style={styles.dropdownItem} onPress={() => { setJobType(jt); setShowJobTypeDropdown(false); }}>
                        <Text style={{ color: dynamicStyles.textColor }}>{jt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
