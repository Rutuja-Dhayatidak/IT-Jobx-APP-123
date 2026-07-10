import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';

import FadeInView from '../components/FadeInView';

const { width, height } = Dimensions.get('window');

interface ResetPasswordProps {
  onBackPress: () => void;
  onResetPress: (password: string) => void;
}

export default function ResetPassword({ onBackPress, onResetPress }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureNewText, setSecureNewText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);

  const handleReset = () => {
    if (newPassword && newPassword === confirmPassword) {
      onResetPress(newPassword);
    }
  };

  const isFormValid =
    newPassword.length >= 6 && newPassword === confirmPassword;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <FadeInView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
        {/* Glow Effects in Background */}
        <View style={styles.backgroundContainer}>
          <View style={[styles.glowCircle, { width: 300, height: 300, backgroundColor: 'rgba(34, 197, 94, 0.12)', top: -50, left: -50 }]} />
          <View style={[styles.glowCircle, { width: 250, height: 250, backgroundColor: 'rgba(59, 130, 246, 0.08)', bottom: 50, right: -50 }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header row with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBackPress} style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Heading */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Lorem Ipsum is simply dummy text printing typesetting industry.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="New Password"
                  placeholderTextColor="#64748B"
                  secureTextEntry={secureNewText}
                  autoCapitalize="none"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setSecureNewText(!secureNewText)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{secureNewText ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  placeholderTextColor="#64748B"
                  secureTextEntry={secureConfirmText}
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setSecureConfirmText(!secureConfirmText)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{secureConfirmText ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error messages helper */}
            {newPassword.length > 0 && newPassword.length < 6 && (
              <Text style={styles.errorText}>Password must be at least 6 characters.</Text>
            )}
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match.</Text>
            )}

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[styles.resetButton, !isFormValid && styles.disabledButton]}
              onPress={handleReset}
              activeOpacity={0.8}
              disabled={!isFormValid}
            >
              <Text style={styles.resetButtonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </FadeInView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: -1,
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    borderRadius: 150,
    opacity: 0.8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    marginTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#131A2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  backArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  titleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: {
    marginTop: 160,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  passwordContainer: {
    height: 56,
    backgroundColor: '#131A2E',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
  },
  eyeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
  },
  resetButton: {
    height: 54,
    backgroundColor: '#22C55E',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.4)',
    shadowOpacity: 0,
    elevation: 0,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
