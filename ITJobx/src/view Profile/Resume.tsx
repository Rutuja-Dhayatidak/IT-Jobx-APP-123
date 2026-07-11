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
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { viewProfileService } from '../services/viewProfile';
import { jobService } from '../services/job';
import { pick, errorCodes, isErrorWithCode } from '@react-native-documents/picker';

interface ResumeProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

// Upload/Browse Document Icon
const UploadIcon = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 9h-3v3h-2v-3H8V9h3V6h2v3h3v2z" fill="#2563EB" />
  </Svg>
);

export default function Resume({ onBackPress, isDarkTheme = true }: ResumeProps) {
  const [resumeUrl, setResumeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await viewProfileService.getProfile();
        if (data && data.success && data.profile) {
          setResumeUrl(data.profile.resumeUrl || '');
        }
      } catch (err: any) {
        console.error('Error fetching resume:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await viewProfileService.updateProfile({ resumeUrl });
      if (data && data.success) {
        Alert.alert('Success', 'Resume updated successfully!');
        onBackPress();
      } else {
        Alert.alert('Error', 'Failed to update resume.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update resume.');
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentPick = async () => {
    try {
      const pickResults = await pick({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
      });
      const res = pickResults[0];
      
      setSaving(true);
      
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? res.uri : res.uri.replace('file://', ''),
        type: res.type || 'application/pdf',
        name: res.name || 'resume.pdf',
      } as any);

      const uploadRes = await jobService.uploadResume(formData);

      if (uploadRes && uploadRes.success) {
        setResumeUrl(uploadRes.resumeUrl);
        Alert.alert('Success', 'Resume uploaded and profile updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to upload resume to server.');
      }
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        console.log('User cancelled document picker');
      } else {
        Alert.alert('Error', err.message || 'Failed to select and upload document.');
      }
    } finally {
      setSaving(false);
    }
  };

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBackPress}
          style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Resume/CV</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Upload Box */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Upload Resume/CV</Text>
              <TouchableOpacity
                style={[styles.uploadBox, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                activeOpacity={0.8}
                onPress={handleDocumentPick}
              >
                <UploadIcon />
                <Text style={[styles.uploadText, { color: dynamicStyles.textColor }]}>Browse File</Text>
              </TouchableOpacity>
            </View>

            {/* Resume URL TextInput */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Or Paste Resume/CV Link</Text>
              <TextInput
                style={{
                  height: 52,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  backgroundColor: dynamicStyles.inputBg,
                  color: dynamicStyles.textColor,
                  borderColor: dynamicStyles.inputBorder
                }}
                value={resumeUrl}
                onChangeText={setResumeUrl}
                placeholder="Enter Resume URL"
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

        <View style={{ height: 40 }} />
      </ScrollView>
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
    marginBottom: 16,
  },
  uploadBox: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
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
    marginTop: 24,
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
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
};
