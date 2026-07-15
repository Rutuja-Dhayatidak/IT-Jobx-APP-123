import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface AuthRequiredModalProps {
  visible: boolean;
  message: string;
  onLogin: () => void;
  onRegister: () => void;
  onCancel: () => void;
  isDarkTheme?: boolean;
}

export default function AuthRequiredModal({
  visible,
  message,
  onLogin,
  onRegister,
  onCancel,
  isDarkTheme = false,
}: AuthRequiredModalProps) {
  const containerBg = isDarkTheme ? '#1E293B' : '#FFFFFF';
  const textColor = isDarkTheme ? '#F8FAFC' : '#0F172A';
  const subTextColor = isDarkTheme ? '#94A3B8' : '#64748B';
  const buttonBorder = isDarkTheme ? '#334155' : '#E2E8F0';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: containerBg }]}>
          <Text style={[styles.title, { color: textColor }]}>Authentication Required</Text>
          <Text style={[styles.message, { color: subTextColor }]}>{message}</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: buttonBorder }]}
            onPress={onRegister}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: textColor }]}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: width - 48,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});
