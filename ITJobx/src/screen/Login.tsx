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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FadeInView from '../components/FadeInView';

interface LoginProps {
  onRegisterPress: () => void;
  onBackPress?: () => void;
  onLoginSuccess?: () => void;
  onForgotPasswordPress: () => void;
}

const GoogleIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

const FacebookIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#1877F2">
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </Svg>
);

const AppleIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.51 12.067 1.007 1.45 2.196 3.076 3.774 3.014 1.51-.058 2.08-.973 3.91-.973 1.815 0 2.355.973 3.93.935 1.606-.027 2.646-1.472 3.626-2.9 1.127-1.644 1.59-3.235 1.615-3.32-.036-.013-3.111-1.192-3.136-4.747-.025-2.964 2.427-4.383 2.53-4.448-1.39-2.033-3.535-2.256-4.29-2.308-2.015-.166-3.037.903-3.98.903zm2.593-4.526c.852-1.036 1.424-2.47 1.267-3.898-1.229.05-2.72.822-3.6 1.85-1.498 1.737-1.385 4.316-.242 5.06 1.346.084 2.69-.738 3.575-1.85a.7.7 0 0 0 0-.162z" />
  </Svg>
);

export default function Login({ onRegisterPress, onBackPress, onLoginSuccess, onForgotPasswordPress }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <FadeInView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header row with Back Button */}
            <View style={styles.header}>
              {onBackPress && (
                <TouchableOpacity onPress={onBackPress} style={styles.backButton} activeOpacity={0.7}>
                  <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Heading */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Login Now</Text>
              <Text style={styles.subtitle}>
                Lorem Ipsum is simply dummy text printing typesetting industry.
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="New Password"
                    placeholderTextColor="#64748B"
                    secureTextEntry={secureText}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureText(!secureText)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeIcon}>{secureText ? '👁️' : '🙈'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} onPress={onForgotPasswordPress}>
                  <Text style={styles.forgotText}>Forgot Password</Text>
                </TouchableOpacity>
              </View>

              {/* Log In Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={onLoginSuccess}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Sign-In */}
            <View style={styles.socialRow}>
              {/* Google */}
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <GoogleIcon />
              </TouchableOpacity>

              {/* Apple */}
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <AppleIcon />
              </TouchableOpacity>

              {/* Facebook */}
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <FacebookIcon />
              </TouchableOpacity>
            </View>

            {/* Footer Register Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't Have An Account?{' '}
                <Text style={styles.registerHighlight} onPress={onRegisterPress}>
                  Register
                </Text>
              </Text>
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
  scrollContent: {
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
    marginTop: 32,
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
  input: {
    height: 56,
    backgroundColor: '#131A2E',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  loginButton: {
    height: 54,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748B',
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#131A2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  registerHighlight: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});
