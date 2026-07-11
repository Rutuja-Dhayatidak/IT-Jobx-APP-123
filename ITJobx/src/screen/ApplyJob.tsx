import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import FadeInView from '../components/FadeInView';
import { jobService } from '../services/job';
import { viewProfileService } from '../services/viewProfile';
import LottieView from 'lottie-react-native';
import { pick, errorCodes, isErrorWithCode } from '@react-native-documents/picker';

const { width } = Dimensions.get('window');

interface ApplyJobProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
  jobTitle?: string;
  jobId?: string;
  onGoToApplication: () => void;
}

// Upload Icon
const UploadIcon = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="2" width="16" height="20" rx="3" fill="#2563EB" opacity={0.15} />
    <Path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 12h-3v3h-2v-3H8v-2h3V9h2v3h3v2z" fill="#2563EB" />
  </Svg>
);

// Large Congratulations Check Icon
const CongratulationsCheckIcon = () => (
  <View style={styles.checkWrapper}>
    <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
      <Circle cx="60" cy="60" r="50" fill="#2563EB" />
      <Path
        d="M48 68.17l-12.17-12.17L31.66 60l16.34 16.34L83 41.66l-4.17-4.17L48 68.17z"
        fill="#FFFFFF"
      />
    </Svg>
  </View>
);

export default function ApplyJob({ onBackPress, isDarkTheme = false, jobTitle = "Software Developer", jobId, onGoToApplication }: ApplyJobProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [additionalText, setAdditionalText] = useState('');

  // States for API interaction
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await viewProfileService.getProfile();
        if (data && data.success && data.profile) {
          const userObj = data.profile.userId;
          if (userObj) {
            setFullName(`${userObj.firstName || ''} ${userObj.lastName || ''}`.trim());
            setEmail(userObj.email || '');
          }
          if (data.profile.resumeUrl) {
            setResumeUrl(data.profile.resumeUrl);
            setResumeName('profile_resume.pdf');
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile for apply job:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUploadResume = async () => {
    try {
      const pickResults = await pick({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
      });
      const res = pickResults[0];
      
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? res.uri : res.uri.replace('file://', ''),
        type: res.type || 'application/pdf',
        name: res.name || 'resume.pdf',
      } as any);

      const uploadRes = await jobService.uploadResume(formData);

      if (uploadRes && uploadRes.success) {
        setResumeUrl(uploadRes.resumeUrl);
        setResumeName(res.name || 'resume.pdf');
        Alert.alert('Success', 'Resume uploaded successfully!');
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
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!resumeUrl) {
      Alert.alert('Error', 'Please upload or provide a resume/CV.');
      return;
    }
    if (!jobId) {
      Alert.alert('Error', 'Job ID is missing.');
      return;
    }

    try {
      setSubmitting(true);
      const data = await jobService.applyJob(jobId, resumeUrl, additionalText);

      if (data && data.success) {
        setIsSubmitted(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to submit application.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  // If successfully submitted, render the Congratulations screen
  if (isSubmitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
        <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />
        
        <FadeInView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setIsSubmitted(false)}
              style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
            </TouchableOpacity>
            <View style={{ width: 44 }} />
            <View style={{ width: 44 }} />
          </View>

          {/* Success Content */}
          <View style={styles.successContent}>
            <CongratulationsCheckIcon />
            <Text style={[styles.successTitle, { color: dynamicStyles.textColor }]}>Congratulations!</Text>
            <Text style={[styles.successSubtitle, { color: isDarkTheme ? '#94A3B8' : '#64748B' }]}>
              Your Application has been Successfully Sent!{"\n"}
              You can check your Application on the menu Profile.
            </Text>
          </View>

          {/* Bottom Sticky Action Buttons */}
          <View style={[styles.successFooter, { backgroundColor: dynamicStyles.backgroundColor }]}>
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.8}
              onPress={onGoToApplication}
            >
              <Text style={styles.submitButtonText}>Go to My Application</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.7}
              onPress={onBackPress}
            >
              <Text style={[styles.cancelButtonText, { color: isDarkTheme ? '#3B82F6' : '#2563EB' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </FadeInView>
      </SafeAreaView>
    );
  }

  // Otherwise, render the form input screen
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />

      <FadeInView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Apply for Job</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Scrollable Form Container */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40, flex: 1 }} />
        ) : (
          <>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.textColor }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  placeholder="John Doe"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.textColor }]}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  placeholder="example@gmail.com"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* CV / Resume Upload */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.textColor }]}>Upload CV/Resume</Text>
                <TouchableOpacity
                  style={[
                    styles.uploadArea,
                    { backgroundColor: dynamicStyles.uploadBg, borderColor: resumeName ? '#2563EB' : dynamicStyles.uploadBorder }
                  ]}
                  activeOpacity={0.8}
                  onPress={handleUploadResume}
                >
                  <UploadIcon />
                  <Text style={[styles.uploadText, { color: '#2563EB' }]}>
                    {resumeName ? resumeName : 'Browse File'}
                  </Text>
                  {resumeName && (
                    <Text style={styles.uploadSubtext}>Click to replace file</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Cover / Add Text */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.textColor }]}>Add Text</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }
                  ]}
                  placeholder="Write Something here.."
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={additionalText}
                  onChangeText={setAdditionalText}
                />
              </View>
            </ScrollView>

            {/* Bottom Sticky Submit Button */}
            <View style={[styles.footer, { backgroundColor: dynamicStyles.backgroundColor, borderTopColor: dynamicStyles.buttonBorder }]}>
              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
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
    paddingBottom: 100, // Safe padding for sticky footer button
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  uploadArea: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  textArea: {
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Success congratulations page styles
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  checkWrapper: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  successFooter: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 8,
  },
  cancelButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

const darkStyles = {
  backgroundColor: '#0F172A',
  buttonBg: '#1E293B',
  buttonBorder: 'rgba(255, 255, 255, 0.1)',
  textColor: '#FFFFFF',
  inputBg: '#1E293B',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  uploadBg: 'rgba(37, 99, 235, 0.05)',
  uploadBorder: 'rgba(255, 255, 255, 0.1)',
};

const lightStyles = {
  backgroundColor: '#FFFFFF',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  textColor: '#1E293B',
  inputBg: '#F8FAFC',
  inputBorder: '#E2E8F0',
  uploadBg: '#F8FAFC',
  uploadBorder: '#E2E8F0',
};
