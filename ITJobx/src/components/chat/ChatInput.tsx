import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSendPress: () => void;
  onAttachmentPress?: () => void;
  isDarkTheme?: boolean;
}

const SendIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={color} />
  </Svg>
);

const ClipIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5a3 3 0 006 0V5a4 4 0 00-8 0v12.5a5.5 5.5 0 0011 0V6h-1.5z" fill={color} />
  </Svg>
);

export default function ChatInput({ value, onChangeText, onSendPress, onAttachmentPress, isDarkTheme = false }: ChatInputProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;
  const isSendDisabled = !value.trim();

  return (
    <View style={[styles.outerContainer, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <View style={[styles.pillInputContainer, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.borderColor }]}>
        {/* Attachment clip icon on the left inside the pill */}
        <TouchableOpacity
          onPress={onAttachmentPress || (() => {})}
          style={styles.attachmentButton}
          activeOpacity={0.7}
          accessibilityLabel="Add attachment"
        >
          <ClipIcon color={isDarkTheme ? '#94A3B8' : '#8892B0'} />
        </TouchableOpacity>

        {/* TextInput in the middle of the pill */}
        <TextInput
          style={[styles.input, { color: dynamicStyles.textColor }]}
          placeholder="Type your message..."
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={2000}
        />
      </View>

      {/* Blue circular send button on the right */}
      <TouchableOpacity
        onPress={onSendPress}
        style={[styles.sendButton, isSendDisabled && styles.sendButtonDisabled]}
        disabled={isSendDisabled}
        activeOpacity={0.8}
        accessibilityLabel="Send message"
      >
        <SendIcon color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12, // SafeArea buffer for bottom inputs
  },
  pillInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  attachmentButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1C64F2', // Deep vibrant blue matching image
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#1C64F2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#93C5FD', // Light blue when disabled
    shadowOpacity: 0,
    elevation: 0,
  },
});

const darkStyles = {
  backgroundColor: '#0F172A',
  inputBg: '#1E293B',
  textColor: '#F8FAFC',
  borderColor: 'rgba(255, 255, 255, 0.08)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  inputBg: '#FFFFFF',
  textColor: '#1E293B',
  borderColor: '#E5E7EB',
};
