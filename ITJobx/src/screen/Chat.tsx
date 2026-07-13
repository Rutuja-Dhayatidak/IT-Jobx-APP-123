import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FadeInView from '../components/FadeInView';

interface ChatProps {
  onBackPress?: () => void;
  onNavigateToTab?: (tab: 'home' | 'portfolio' | 'saved' | 'chat' | 'profile') => void;
  isDarkTheme?: boolean;
}

// Custom SVG Icons
const SearchIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill={color} />
  </Svg>
);

const SendIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={color} />
  </Svg>
);

const BackIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={color} />
  </Svg>
);

export default function Chat({ onBackPress, onNavigateToTab, isDarkTheme = false }: ChatProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  
  // Selected conversation state for detail modal
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const chatScrollViewRef = useRef<ScrollView>(null);

  // Mock Conversations List
  const [conversations, setConversations] = useState<any[]>([
    {
      id: '1',
      name: 'WorknAI Recruiters',
      logo: 'W.',
      logoBg: '#EF4444',
      lastMessage: 'Your application for Full Stack Developer is accepted! Can you join a call tomorrow at 10 AM?',
      time: '10:42 AM',
      unreadCount: 1,
      messages: [
        { id: 'm1', sender: 'them', text: 'Hi candidate, thanks for applying!', time: 'Yesterday' },
        { id: 'm2', sender: 'me', text: 'Thank you! Excited for the opportunity.', time: 'Yesterday' },
        { id: 'm3', sender: 'them', text: 'Your application for Full Stack Developer is accepted! Can you join a call tomorrow at 10 AM?', time: '10:42 AM' },
      ]
    },
    {
      id: '2',
      name: 'BrioSoft HR Team',
      logo: 'B.',
      logoBg: '#3B82F6',
      lastMessage: 'Please share your updated portfolio for review.',
      time: '9:15 AM',
      unreadCount: 0,
      messages: [
        { id: 'm1', sender: 'them', text: 'Hi, we reviewed your resume.', time: 'Monday' },
        { id: 'm2', sender: 'them', text: 'Please share your updated portfolio for review.', time: '9:15 AM' },
      ]
    },
    {
      id: '3',
      name: 'Google India Careers',
      logo: 'G.',
      logoBg: '#EA4335',
      lastMessage: 'The technical round results will be declared by Monday.',
      time: 'Yesterday',
      unreadCount: 2,
      messages: [
        { id: 'm1', sender: 'them', text: 'Hello, your first round is scheduled.', time: 'Last Week' },
        { id: 'm2', sender: 'me', text: 'Great, thanks for the update.', time: 'Last Week' },
        { id: 'm3', sender: 'them', text: 'Hope the interview went well.', time: 'Yesterday' },
        { id: 'm4', sender: 'them', text: 'The technical round results will be declared by Monday.', time: 'Yesterday' },
      ]
    },
    {
      id: '4',
      name: 'Amazon Jobs Team',
      logo: 'A.',
      logoBg: '#FF9900',
      lastMessage: 'Thank you for your interest. Unfortunately, we went ahead with another candidate.',
      time: '2 days ago',
      unreadCount: 0,
      messages: [
        { id: 'm1', sender: 'them', text: 'Thanks for submitting the test.', time: '3 days ago' },
        { id: 'm2', sender: 'them', text: 'Thank you for your interest. Unfortunately, we went ahead with another candidate.', time: '2 days ago' },
      ]
    }
  ]);

  // Handle sending a new message in conversation modal
  const handleSendMessage = () => {
    if (!typedMessage.trim() || !selectedChat) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: typedMessage.trim(),
      time: 'Just Now'
    };

    const updatedChats = conversations.map(chat => {
      if (chat.id === selectedChat.id) {
        const updatedMsgs = [...chat.messages, newMessage];
        return {
          ...chat,
          lastMessage: newMessage.text,
          time: 'Just Now',
          messages: updatedMsgs
        };
      }
      return chat;
    });

    setConversations(updatedChats);
    setSelectedChat({
      ...selectedChat,
      lastMessage: newMessage.text,
      time: 'Just Now',
      messages: [...selectedChat.messages, newMessage]
    });
    setTypedMessage('');
  };

  // Auto-scroll chat details to bottom when new message arrives or modal opens
  useEffect(() => {
    if (chatScrollViewRef.current) {
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [selectedChat?.messages]);

  // Filtered Chats
  const filteredChats = conversations.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'unread') {
      return matchesSearch && chat.unreadCount > 0;
    }
    return matchesSearch;
  });

  // Open Chat Detail & Reset Unread Count
  const handleOpenChat = (chat: any) => {
    setSelectedChat(chat);
    // Reset unread count for this chat
    setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />
      <FadeInView style={{ flex: 1 }}>

        {/* Header Row */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Inbox Chats</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
            <SearchIcon color={isDarkTheme ? '#94A3B8' : '#64748B'} />
            <TextInput
              style={[styles.searchInput, { color: dynamicStyles.textColor }]}
              placeholder="Search chat or company..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'all'
                ? styles.activeFilterChip
                : { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }
            ]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === 'all' ? styles.activeFilterChipText : { color: dynamicStyles.textColor }]}>
              All Messages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'unread'
                ? styles.activeFilterChip
                : { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }
            ]}
            onPress={() => setActiveFilter('unread')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === 'unread' ? styles.activeFilterChipText : { color: dynamicStyles.textColor }]}>
              Unread
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chat List */}
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: isDarkTheme ? '#94A3B8' : '#64748B' }]}>
                No messages found.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chatCard,
                { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder },
                item.unreadCount > 0 && styles.unreadChatHighlight
              ]}
              onPress={() => handleOpenChat(item)}
              activeOpacity={0.9}
            >
              {/* Logo Avatar */}
              <View style={[styles.logoContainer, { backgroundColor: item.logoBg }]}>
                <Text style={styles.logoText}>{item.logo}</Text>
              </View>

              {/* Text Information */}
              <View style={styles.chatDetails}>
                <View style={styles.chatHeaderRow}>
                  <Text style={[styles.chatName, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={2}>
                  {item.lastMessage}
                </Text>
              </View>

              {/* Unread badge & arrow */}
              <View style={styles.badgeWrapper}>
                {item.unreadCount > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                  </View>
                ) : (
                  <Text style={styles.chevronArrow}>›</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Spacing for Bottom Tab Navigation */}
        <View style={{ height: 100 }} />
      </FadeInView>

      {/* Interactive Chat Details Modal */}
      <Modal
        visible={selectedChat !== null}
        animationType="slide"
        onRequestClose={() => setSelectedChat(null)}
        statusBarTranslucent
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: dynamicStyles.backgroundColor }]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: dynamicStyles.dividerColor }]}>
              <TouchableOpacity
                onPress={() => setSelectedChat(null)}
                style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
                activeOpacity={0.7}
              >
                <BackIcon color={dynamicStyles.textColor} />
              </TouchableOpacity>
              
              <View style={[styles.modalAvatar, { backgroundColor: selectedChat?.logoBg }]}>
                <Text style={styles.logoText}>{selectedChat?.logo}</Text>
              </View>

              <View style={styles.modalTitleWrapper}>
                <Text style={[styles.modalName, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                  {selectedChat?.name}
                </Text>
                <Text style={styles.modalStatus}>Recruiter • Online</Text>
              </View>
            </View>

            {/* Conversation Messages */}
            <ScrollView
              ref={chatScrollViewRef}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedChat?.messages.map((msg: any) => {
                const isMe = msg.sender === 'me';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.bubbleWrapper,
                      isMe ? styles.bubbleRight : styles.bubbleLeft
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isMe
                          ? styles.messageBubbleMe
                          : { backgroundColor: isDarkTheme ? '#1E293B' : '#F1F5F9' }
                      ]}
                    >
                      <Text style={[styles.messageText, isMe ? styles.messageTextMe : { color: dynamicStyles.textColor }]}>
                        {msg.text}
                      </Text>
                      <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
                        {msg.time}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Bottom Message Input Bar */}
            <View style={[styles.inputRow, { borderTopColor: dynamicStyles.dividerColor, backgroundColor: dynamicStyles.backgroundColor }]}>
              <TextInput
                style={[styles.messageInput, { color: dynamicStyles.textColor, backgroundColor: isDarkTheme ? '#1E293B' : '#F1F5F9' }]}
                placeholder="Type your message..."
                placeholderTextColor="#94A3B8"
                value={typedMessage}
                onChangeText={setTypedMessage}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                activeOpacity={0.8}
              >
                <SendIcon color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  unreadChatHighlight: {
    borderColor: '#3B82F6',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  chatDetails: {
    flex: 1,
    marginLeft: 16,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  lastMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  badgeWrapper: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  chevronArrow: {
    color: '#94A3B8',
    fontSize: 22,
    fontWeight: '200',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  modalTitleWrapper: {
    marginLeft: 12,
    flex: 1,
  },
  modalName: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalStatus: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 1,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageListContent: {
    paddingVertical: 20,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  bubbleLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageBubbleMe: {
    backgroundColor: '#2563EB',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'right',
  },
  messageTimeMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageTimeThem: {
    color: '#94A3B8',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  messageInput: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

const darkStyles = {
  backgroundColor: '#0F172A',
  textColor: '#F8FAFC',
  cardBg: '#1E293B',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  buttonBg: '#1E293B',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  dividerColor: 'rgba(255, 255, 255, 0.05)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  dividerColor: '#E2E8F0',
};
