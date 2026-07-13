import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';

interface TypingIndicatorProps {
  isDarkTheme?: boolean;
}

export default function TypingIndicator({ isDarkTheme = false }: TypingIndicatorProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createAnimation(dot1, 0);
    const anim2 = createAnimation(dot2, 150);
    const anim3 = createAnimation(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <View style={styles.container}>
      <View style={styles.botAvatar}>
        <Text style={styles.botAvatarText}>🤖</Text>
      </View>
      
      <View style={[styles.bubble, { backgroundColor: dynamicStyles.bubbleBg, borderColor: dynamicStyles.borderColor }]}>
        <Animated.View style={[styles.dot, { backgroundColor: dynamicStyles.dotColor, transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.dot, { backgroundColor: dynamicStyles.dotColor, transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.dot, { backgroundColor: dynamicStyles.dotColor, transform: [{ translateY: dot3 }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingLeft: 20,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  botAvatarText: {
    fontSize: 14,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 60,
    height: 36,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});

const darkStyles = {
  bubbleBg: '#1E293B',
  borderColor: 'rgba(255, 255, 255, 0.05)',
  dotColor: '#94A3B8',
};

const lightStyles = {
  bubbleBg: '#FFFFFF',
  borderColor: '#E2E8F0',
  dotColor: '#1C64F2',
};
