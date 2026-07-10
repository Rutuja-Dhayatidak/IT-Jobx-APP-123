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

interface ForgotPasswordProps {
  onBackPress: () => void;
  onSendPress: (email: string) => void;
}

export default function ForgotPassword({ onBackPress, onSendPress }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');

  const handleSend = () => {
    if (email.trim()) {
      onSendPress(email.trim());
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Lorem Ipsum is simply dummy text printing typesetting industry.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
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

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.sendButton, !email.trim() && styles.disabledButton]}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!email.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Go Back To Log In */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onBackPress} activeOpacity={0.7}>
              <Text style={styles.footerText}>
                Go Back To <Text style={styles.loginHighlight}>Log In</Text>
              </Text>
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
    filter: Platform.OS === 'ios' ? 'blur(40px)' : undefined, // blur filter is iOS only for standard React Native View styling, we rely on opacity/radius
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
    marginBottom: 24,
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
  sendButton: {
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
  sendButtonText: {
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
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  loginHighlight: {
    color: '#22C55E',
    fontWeight: 'bold',
  },
});
