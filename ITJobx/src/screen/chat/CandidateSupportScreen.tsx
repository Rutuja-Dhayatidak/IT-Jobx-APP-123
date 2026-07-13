import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useChat } from '../../hooks/useChat';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import QuickActionChips from '../../components/chat/QuickActionChips';
import TypingIndicator from '../../components/chat/TypingIndicator';
import DateSeparator from '../../components/chat/DateSeparator';
import EmptyChatState from '../../components/chat/EmptyChatState';
import Svg, { Path } from 'react-native-svg';

interface CandidateSupportScreenProps {
  onBackPress?: () => void;
  isDarkTheme?: boolean;
}

const WarningIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill={color} />
  </Svg>
);

export default function CandidateSupportScreen({ onBackPress, isDarkTheme = false }: CandidateSupportScreenProps) {
  const {
    conversation,
    messages,
    loading,
    refreshing,
    isTyping,
    error,
    onRefresh,
    loadMoreMessages,
    sendMessage,
    retryMessage,
    requestAgentTransfer,
    setClientTypingStatus,
    retryInit,
  } = useChat();

  const [inputText, setInputText] = React.useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Auto scroll to bottom on message updates
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isTyping]);

  // Handle send action
  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
    setClientTypingStatus(false);
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    setClientTypingStatus(text.trim().length > 0);
  };

  // Handle predefined quick action click
  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  // Render date separators dynamically (Today / Yesterday / Older)
  const renderMessageItem = ({ item, index }: { item: any; index: number }) => {
    const prevItem = index > 0 ? messages[index - 1] : null;
    const showSeparator = !prevItem ||
      new Date(item.createdAt).toDateString() !== new Date(prevItem.createdAt).toDateString();

    const getDateLabel = (isoString: string) => {
      const msgDate = new Date(isoString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (msgDate.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (msgDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
      <View key={item._id}>
        {showSeparator && (
          <DateSeparator dateString={getDateLabel(item.createdAt)} isDarkTheme={isDarkTheme} />
        )}
        <ChatBubble item={item} isDarkTheme={isDarkTheme} />
      </View>
    );
  };

  // 1. Loading State
  if (loading && messages.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
        <ChatHeader onBackPress={onBackPress} isDarkTheme={isDarkTheme} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={[styles.loadingText, { color: dynamicStyles.textColor }]}>Connecting to support...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Error State
  if (error && messages.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
        <ChatHeader onBackPress={onBackPress} isDarkTheme={isDarkTheme} />
        <View style={styles.centerContainer}>
          <WarningIcon color="#EF4444" />
          <Text style={[styles.errorText, { color: dynamicStyles.textColor }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryInit} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <ChatHeader onBackPress={onBackPress} isDarkTheme={isDarkTheme} />

      <KeyboardAvoidingView
        style={[
          styles.keyboardView,
          { paddingBottom: keyboardVisible ? 0 : (Platform.OS === 'ios' ? 90 : 80) }
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >


        {/* Message Thread */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={<EmptyChatState isDarkTheme={isDarkTheme} />}
          ListFooterComponent={isTyping ? <TypingIndicator isDarkTheme={isDarkTheme} /> : null}
        />

        {/* Action triggers: Quick Action Chips */}
        {conversation?.status === 'bot' && (
          <QuickActionChips onChipPress={handleQuickAction} isDarkTheme={isDarkTheme} />
        )}



        {/* Input Bar */}
        <ChatInput
          value={inputText}
          onChangeText={handleTextChange}
          onSendPress={handleSend}
          isDarkTheme={isDarkTheme}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  keyboardView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  bannerContainer: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  agentRequestBanner: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  agentRequestBannerText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
});

const darkStyles = {
  backgroundColor: '#0F172A',
  textColor: '#F8FAFC',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#1E293B',
};
