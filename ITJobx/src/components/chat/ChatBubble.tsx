import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ChatMessage } from '../../types/chat.types';

interface ChatBubbleProps {
  item: ChatMessage;
  isDarkTheme?: boolean;
}

const CheckIcon = ({ color, read }: { color: string; read: boolean }) => {
  if (read) {
    // Double checkmark (read/delivered)
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17l-5.66-5.66-1.41 1.41 7.07 7.07 12-12-1.42-1.42z" fill={color} />
      </Svg>
    );
  }
  // Single checkmark (sent)
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={color} />
    </Svg>
  );
};

const RobotIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2a2 2 0 012 2h3a2 2 0 012 2v2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2V6a2 2 0 012-2h3a2 2 0 012-2zm0 2.5a.5.5 0 100 1 .5.5 0 000-1zM9 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7.5 16.5a.5.5 0 000 1h9a.5.5 0 000-1h-9z"
      fill={color}
    />
  </Svg>
);

export default function ChatBubble({ item, isDarkTheme = false }: ChatBubbleProps) {
  const isMe = item.senderType === 'candidate';
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  // Format message timestamp
  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.bubbleWrapper, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
      {/* Bot Avatar beside bot/support messages */}
      {!isMe && (
        <View style={styles.botAvatar}>
          <RobotIcon color="#0B47A9" />
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          isMe
            ? styles.messageBubbleMe
            : { backgroundColor: isDarkTheme ? '#1E293B' : '#FFFFFF', borderColor: dynamicStyles.borderColor }
        ]}
      >
        <Text style={[styles.messageText, isMe ? styles.messageTextMe : { color: dynamicStyles.textColor }]}>
          {item.message}
        </Text>
        
        {/* Time stamp inside the bubble at bottom-right */}
        <View style={styles.bubbleFooter}>
          <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
            {formatTime(item.createdAt)}
          </Text>
          {isMe && (
            <View style={styles.statusIcon}>
              <CheckIcon
                color={item.status === 'read' ? '#93C5FD' : 'rgba(255, 255, 255, 0.7)'}
                read={item.status === 'read' || item.status === 'delivered'}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
    width: '100%',
  },
  bubbleLeft: {
    justifyContent: 'flex-start',
    paddingLeft: 4,
  },
  bubbleRight: {
    justifyContent: 'flex-end',
    paddingRight: 4,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(11, 71, 169, 0.1)',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleMe: {
    backgroundColor: '#1C64F2', // Blue matching image
    borderColor: '#1C64F2',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  messageTime: {
    fontSize: 10,
    fontWeight: '500',
  },
  messageTimeMe: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageTimeThem: {
    color: '#94A3B8',
  },
  statusIcon: {
    marginLeft: 4,
  },
});

const darkStyles = {
  textColor: '#F8FAFC',
  borderColor: 'rgba(255, 255, 255, 0.08)',
};

const lightStyles = {
  textColor: '#1F2937', // Dark gray
  borderColor: '#E5E7EB',
};
