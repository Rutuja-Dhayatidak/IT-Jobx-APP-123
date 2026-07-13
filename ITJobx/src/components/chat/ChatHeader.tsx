import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChatHeaderProps {
  onBackPress?: () => void;
  onMenuPress?: () => void;
  isDarkTheme?: boolean;
}

const BackIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={color} />
  </Svg>
);

const MenuIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill={color} />
  </Svg>
);

const RobotIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2a2 2 0 012 2h3a2 2 0 012 2v2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2V6a2 2 0 012-2h3a2 2 0 012-2zm0 2.5a.5.5 0 100 1 .5.5 0 000-1zM9 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7.5 16.5a.5.5 0 000 1h9a.5.5 0 000-1h-9z"
      fill={color}
    />
  </Svg>
);

export default function ChatHeader({ onBackPress, onMenuPress, isDarkTheme = false }: ChatHeaderProps) {
  const containerBg = '#0B47A9'; // Vivid deep blue from image

  return (
    <View style={[styles.headerContainer, { backgroundColor: containerBg }]}>
      <View style={styles.topRow}>
        {onBackPress && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <BackIcon color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Bot Avatar with white border */}
        <View style={styles.avatarContainer}>
          <View style={styles.botIconCircle}>
            <RobotIcon color="#0B47A9" />
          </View>
          <View style={styles.onlineBadge} />
        </View>

        {/* Title Details */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Candidate Support</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.subtitleText}>Online now</Text>
          </View>
        </View>

        {onMenuPress && (
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.menuButton}
            activeOpacity={0.7}
            accessibilityLabel="Open options menu"
          >
            <MenuIcon color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  botIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E', // Bright green online dot
    borderWidth: 2,
    borderColor: '#0B47A9',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  menuButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
