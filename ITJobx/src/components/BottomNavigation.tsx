import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Platform, Animated } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface BottomNavigationProps {
  activeTab: 'home' | 'portfolio' | 'saved' | 'chat' | 'profile';
  onTabPress: (tab: 'home' | 'portfolio' | 'saved' | 'chat' | 'profile') => void;
  onPlusPress?: () => void;
  isDarkTheme?: boolean;
}

// App-specific Icons
const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={color} />
  </Svg>
);

const PortfolioIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="14" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="2" />
  </Svg>
);

const BookmarkIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChatIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm0-3h12v2H6V6zm0 6h8v2H6v-2z" fill={color} />
  </Svg>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <Path d="M5 20a7 7 0 0114 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default function BottomNavigation({ activeTab, onTabPress, isDarkTheme = false }: BottomNavigationProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  // Map active tab to slot index for 5 tabs
  const tabIndexMap = {
    home: 0,
    portfolio: 1,
    saved: 2,
    chat: 3,
    profile: 4,
  };
  const activeIndex = tabIndexMap[activeTab];

  // Animated value for sliding transition
  const slideAnim = useRef(new Animated.Value(activeIndex)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      tension: 72,
      friction: 12,
    }).start();
  }, [activeIndex, slideAnim]);

  // Dimension calculations for centering active sliding pill background for 5 tabs
  const containerPadding = 12;
  const horizontalMargin = 16;
  const usableWidth = width - (horizontalMargin * 2) - (containerPadding * 2);
  const slotWidth = usableWidth / 5;
  const pillWidth = 78;

  // Interpolate slide transition translate position
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      (slotWidth - pillWidth) / 2,
      slotWidth + (slotWidth - pillWidth) / 2,
      slotWidth * 2 + (slotWidth - pillWidth) / 2,
      slotWidth * 3 + (slotWidth - pillWidth) / 2,
      slotWidth * 4 + (slotWidth - pillWidth) / 2,
    ],
  });

  const renderTab = (
    tabName: 'home' | 'portfolio' | 'saved' | 'chat' | 'profile',
    label: string,
    IconComponent: React.ComponentType<{ color: string }>
  ) => {
    const isActive = activeTab === tabName;

    return (
      <TouchableOpacity
        style={[styles.tabSlot, { width: slotWidth }]}
        onPress={() => onTabPress(tabName)}
        activeOpacity={0.8}
      >
        <View style={styles.contentContainer}>
          <IconComponent color={isActive ? "#FFFFFF" : dynamicStyles.inactiveIconColor} />
          {isActive && (
            <Text style={styles.activeText} numberOfLines={1}>
              {label}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: 'transparent' }]}>
      <View style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor, borderColor: dynamicStyles.borderColor }]}>
        
        {/* Animated Sliding Background Pill */}
        <Animated.View
          style={[
            styles.activePillBackground,
            {
              width: pillWidth,
              backgroundColor: dynamicStyles.activePillBg,
              transform: [{ translateX }],
            },
          ]}
        />

        {/* 5 Tab Slots */}
        {renderTab('home', 'home', HomeIcon)}
        {renderTab('portfolio', 'jobs', PortfolioIcon)}
        {renderTab('saved', 'save', BookmarkIcon)}
        {renderTab('chat', 'chat', ChatIcon)}
        {renderTab('profile', 'profile', ProfileIcon)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 68,
    borderRadius: 22,
    paddingHorizontal: 12,
    borderWidth: 1,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  activePillBackground: {
    position: 'absolute',
    height: 40,
    borderRadius: 14,
    left: 12, // Match container paddingHorizontal
  },
  tabSlot: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 8,
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 5,
    textTransform: 'lowercase',
  },
});

const darkStyles = {
  backgroundColor: '#131A2E',
  borderColor: 'rgba(255, 255, 255, 0.05)',
  activePillBg: '#1E293B',
  inactiveIconColor: '#64748B',
};

const lightStyles = {
  backgroundColor: '#FFFFFF',
  borderColor: '#E2E8F0',
  activePillBg: '#0F172A',
  inactiveIconColor: '#64748B',
};
