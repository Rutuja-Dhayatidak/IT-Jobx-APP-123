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

interface ProfileIncompleteModalProps {
  visible: boolean;
  message: string;
  onComplete: () => void;
  onCancel: () => void;
  isDarkTheme?: boolean;
}

export default function ProfileIncompleteModal({
  visible,
  message,
  onComplete,
  onCancel,
  isDarkTheme = false,
}: ProfileIncompleteModalProps) {
  const containerBg = isDarkTheme ? '#1E293B' : '#FFFFFF';
  const textColor = isDarkTheme ? '#F8FAFC' : '#0F172A';
  const subTextColor = isDarkTheme ? '#94A3B8' : '#64748B';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: containerBg }]}>
          <Text style={[styles.title, { color: textColor }]}>Profile Incomplete</Text>
          <Text style={[styles.message, { color: subTextColor }]}>{message}</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Complete Profile</Text>
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
