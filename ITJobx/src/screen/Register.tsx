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
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FadeInView from '../components/FadeInView';
import { authService } from '../services/authService';

interface RegisterProps {
  onLoginPress: () => void;
  onBackPress?: () => void;
  onRegisterSuccess?: (email: string) => void;
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

const AndroidIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#3DDC84">
    <Path d="M17.5 13.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-11 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm11.2-4.2l1.6-2.7c.1-.2 0-.5-.2-.6-.2-.1-.5 0-.6.2l-1.6 2.7C15.6 8.3 13.9 8 12 8c-1.9 0-3.6.3-4.9.9L5.5 6.2c-.1-.2-.4-.3-.6-.2-.2.1-.3.4-.2.6l1.6 2.7C4.1 10.9 2.5 13.3 2 16h20c-.5-2.7-2.1-5.1-4.3-7.1z" />
  </Svg>
);

const EyeIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#94A3B8" />
  </Svg>
);

const EyeOffIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.39 2.7-3.18 3.44-5.24-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.17c0-1.66-1.34-3-3-3l-.17.02z" fill="#94A3B8" />
  </Svg>
);

export default function Register({ onLoginPress, onBackPress, onRegisterSuccess }: RegisterProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignUp = async () => {
    setErrors({});
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!agree) {
      Alert.alert('Error', 'You must agree to the Terms & Conditions');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword: password,
        termsAccepted: agree,
      });

      Alert.alert('Success', 'OTP sent to your email.');
      if (onRegisterSuccess) {
        onRegisterSuccess(email.trim().toLowerCase());
      }
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        const validationErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          validationErrors[err.field] = err.message;
        });
        setErrors(validationErrors);
      } else {
        Alert.alert('Registration Failed', error.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Fill your information below or register with your social account.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* First Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Esther"
                placeholderTextColor="#64748B"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.firstName) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.firstName;
                      return copy;
                    });
                  }
                }}
              />
              {errors.firstName ? (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              ) : (
                <Text style={styles.helpText}>Must contain at least 2 characters (alphabets only)</Text>
              )}
            </View>
 
            {/* Last Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Howard"
                placeholderTextColor="#64748B"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.lastName) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.lastName;
                      return copy;
                    });
                  }
                }}
              />
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : (
                <Text style={styles.helpText}>Optional (alphabets only)</Text>
              )}
            </View>
 
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="example@gmail.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.email;
                      return copy;
                    });
                  }
                }}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : (
                <Text style={styles.helpText}>Enter a valid email address</Text>
              )}
            </View>
 
            {/* Phone Number Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="+918767605792"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errors.phone) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.phone;
                      return copy;
                    });
                  }
                }}
              />
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : (
                <Text style={styles.helpText}>Must be a 10-digit mobile number</Text>
              )}
            </View>
 
            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.passwordContainer, (errors.password || errors.confirmPassword) && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="***************"
                  placeholderTextColor="#64748B"
                  secureTextEntry={secureText}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password || errors.confirmPassword) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.password;
                        delete copy.confirmPassword;
                        return copy;
                      });
                    }
                  }}
                />
                <TouchableOpacity
                  onPress={() => setSecureText(!secureText)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  {secureText ? <EyeOffIconSvg /> : <EyeIconSvg />}
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : (
                <Text style={styles.helpText}>Min 8 characters (must include A-Z, a-z, 0-9 & special character)</Text>
              )}
            </View>

            {/* Agree to Terms Checkbox */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgree(!agree)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agree && styles.checkboxActive]}>
                  {agree && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.agreeText}>
                  Agree with <Text style={styles.termsHighlight}>Terms & Condition</Text>
                </Text>
              </TouchableOpacity>
            </View>

             {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, (!agree || loading) && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={!agree || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign-In */}
          <View style={styles.socialRow}>
            {/* Android */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <AndroidIcon />
            </TouchableOpacity>

            {/* Google */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <GoogleIcon />
            </TouchableOpacity>

            {/* Facebook */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <FacebookIcon />
            </TouchableOpacity>
          </View>

          {/* Footer Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.loginHighlight} onPress={onLoginPress}>
                Sign In
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
  agreeText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  termsHighlight: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  signUpButton: {
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
  signUpButtonDisabled: {
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    shadowColor: 'transparent',
    elevation: 0,
  },
  signUpButtonText: {
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
  loginHighlight: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  helpText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 2,
  },
});
