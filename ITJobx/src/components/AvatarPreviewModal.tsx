import React, { useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface AvatarPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  imageUri: string | null | undefined;
  onUpdate: () => void;
  onDelete: () => void;
  isDarkTheme?: boolean;
}

export default function AvatarPreviewModal({
  visible,
  onClose,
  imageUri,
  onUpdate,
  onDelete,
  isDarkTheme = true,
}: AvatarPreviewModalProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: dynamicStyles.cardBg,
                  transform: [{ scale: scaleAnim }],
                  borderColor: dynamicStyles.borderColor,
                },
              ]}
            >
              {/* Floating Close Button */}
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: dynamicStyles.closeBtnBg }]}
                activeOpacity={0.7}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                    fill={dynamicStyles.iconColor}
                  />
                </Svg>
              </TouchableOpacity>

              {/* Large Image Preview with Shadow Glow */}
              <View style={[styles.imageContainer, { shadowColor: isDarkTheme ? '#3B82F6' : '#64748B', borderColor: dynamicStyles.imgBorder }]}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.largeImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.placeholderWrapper, { backgroundColor: dynamicStyles.placeholderBg }]}>
                    <Svg width={100} height={100} viewBox="0 0 24 24" fill={isDarkTheme ? '#3B82F6' : '#2563EB'}>
                      <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </Svg>
                  </View>
                )}
              </View>

              {/* Actions Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.updateBtn]}
                  onPress={() => {
                    onClose();
                    onUpdate();
                  }}
                  activeOpacity={0.8}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={styles.btnIcon}>
                    <Path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                      fill="#FFFFFF"
                    />
                  </Svg>
                  <Text style={styles.btnText}>Change Photo</Text>
                </TouchableOpacity>

                {imageUri ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn, { borderColor: dynamicStyles.dangerBorder }]}
                    onPress={() => {
                      onClose();
                      onDelete();
                    }}
                    activeOpacity={0.8}
                  >
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={styles.btnIcon}>
                      <Path
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                        fill="#EF4444"
                      />
                    </Svg>
                    <Text style={[styles.btnText, { color: '#EF4444' }]}>Delete Photo</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: width - 48,
    maxWidth: 360,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageContainer: {
    width: 230,
    height: 230,
    borderRadius: 115,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  updateBtn: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  btnIcon: {
    marginRight: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Outfit',
  },
});

const darkStyles = {
  cardBg: '#1E293B',
  borderColor: 'rgba(255, 255, 255, 0.08)',
  imgBorder: '#334155',
  closeBtnBg: 'rgba(255, 255, 255, 0.06)',
  iconColor: '#94A3B8',
  placeholderBg: '#0F172A',
  dangerBorder: 'rgba(239, 68, 68, 0.25)',
};

const lightStyles = {
  cardBg: '#FFFFFF',
  borderColor: 'rgba(0, 0, 0, 0.05)',
  imgBorder: '#E2E8F0',
  closeBtnBg: '#F1F5F9',
  iconColor: '#64748B',
  placeholderBg: '#F8FAFC',
  dangerBorder: 'rgba(239, 68, 68, 0.15)',
};
