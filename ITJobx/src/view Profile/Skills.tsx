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

interface SkillsProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

export default function Skills({ onBackPress, isDarkTheme = true }: SkillsProps) {
  const [inputValue, setInputValue] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await viewProfileService.getProfile();
        if (data && data.success && data.profile && data.profile.skills) {
          setSkills(data.profile.skills);
        }
      } catch (err: any) {
        console.error('Error fetching skills:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Auto-append any pending text in input value before saving
      let finalSkills = [...skills];
      if (inputValue.trim()) {
        const pending = inputValue
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !skills.includes(s));
        if (pending.length > 0) {
          finalSkills = [...finalSkills, ...pending];
        }
      }

      const data = await viewProfileService.updateProfile({ skills: finalSkills });
      if (data && data.success) {
        Alert.alert('Success', 'Skills updated successfully!');
        onBackPress();
      } else {
        Alert.alert('Error', 'Failed to update skills.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update skills.');
    } finally {
      setSaving(false);
    }
  };

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const handleAddSkill = () => {
    if (inputValue.trim()) {
      const newSkills = inputValue
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !skills.includes(s));
      
      if (newSkills.length > 0) {
        setSkills([...skills, ...newSkills]);
      }
      setInputValue('');
    }
  };

  const handleTextChange = (text: string) => {
    if (text.endsWith(',')) {
      const cleanText = text.substring(0, text.length - 1).trim();
      if (cleanText) {
        const parts = cleanText.split(',').map(s => s.trim()).filter(s => s.length > 0 && !skills.includes(s));
        if (parts.length > 0) {
          setSkills([...skills, ...parts]);
        }
      }
      setInputValue('');
    } else {
      setInputValue(text);
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills(skills.filter((skill) => skill !== skillToDelete));
  };

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
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Skills</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Skills Tags Container (Rendered ABOVE the input so they stay visible when keyboard is open!) */}
              <View style={styles.tagsContainer}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor, width: '100%', marginBottom: 12 }]}>
                  Added Skills ({skills.length})
                </Text>
                {skills.map((skill) => (
                  <View
                    key={skill}
                    style={[styles.tag, { backgroundColor: dynamicStyles.tagBg, borderColor: dynamicStyles.tagBorder }]}
                  >
                    <Text style={[styles.tagText, { color: dynamicStyles.textColor }]}>{skill}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteSkill(skill)}
                      style={styles.deleteTagButton}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteTagText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Skills Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Add Skill</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                    value={inputValue}
                    onChangeText={handleTextChange}
                    onSubmitEditing={handleAddSkill}
                    placeholder="Type skills (e.g. React, Node, Java)"
                    placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddSkill} activeOpacity={0.8}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  deleteTagButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 16,
    height: 16,
  },
  deleteTagText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
    marginTop: -2,
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
  tagBg: '#131A2E',
  tagBorder: 'rgba(255, 255, 255, 0.05)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  tagBg: '#F1F5F9',
  tagBorder: '#E2E8F0',
};
