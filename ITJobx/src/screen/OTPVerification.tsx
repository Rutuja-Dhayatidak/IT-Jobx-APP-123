import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';

import FadeInView from '../components/FadeInView';
import { authService } from '../services/authService';

const { width, height } = Dimensions.get('window');

interface OTPVerificationProps {
  email: string;
  onBackPress: () => void;
  onVerifyPress: (token: string) => void;
}

export default function OTPVerification({ email, onBackPress, onVerifyPress }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    if (cleanText && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(60);
      Alert.alert('Info', 'Check your email for the OTP code.');
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      setLoading(true);
      try {
        const response = await authService.verifyOtp(email, otpCode);
        Alert.alert('Success', 'Verification successful!');
        if (onVerifyPress) {
          onVerifyPress(response.token);
        }
      } catch (error: any) {
        Alert.alert('Verification Failed', error.message || 'Invalid or expired OTP');
      } finally {
        setLoading(false);
      }
    }
  };

  const isOtpComplete = otp.every((val) => val !== '');

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
            <Text style={styles.title}>Enter Your OTP</Text>
            <Text style={styles.subtitle}>
              Lorem Ipsum is simply dummy text printing typesetting industry.
            </Text>
          </View>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((value, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputsRef.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  value !== '' && styles.otpInputFilled,
                  index === otp.findIndex((v) => v === '') && styles.otpInputActive,
                ]}
                value={value}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Countdown / Resend text */}
          <View style={styles.timerContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend Code In <Text style={styles.highlightText}>{timer} Sec</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, (!isOtpComplete || loading) && styles.disabledButton]}
            onPress={handleVerify}
            activeOpacity={0.8}
            disabled={!isOtpComplete || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 160,
  },
  otpInput: {
    width: 60,
    height: 60,
    backgroundColor: '#131A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: '#22C55E',
  },
  otpInputActive: {
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 36,
  },
  timerText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  highlightText: {
    color: '#22C55E',
    fontWeight: 'bold',
  },
  resendText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  verifyButton: {
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
  },
  disabledButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.4)',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
