import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import FadeInView from '../components/FadeInView';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  highlightedText?: string;
  normalTextBefore?: string;
  normalTextAfter?: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Discover Premium IT Opportunities',
    normalTextBefore: 'Discover ',
    highlightedText: 'Premium IT Opportunities',
    normalTextAfter: ' around the globe.',
    subtitle: 'Find your dream developer, designer, or product manager role from top-tier tech firms & startups.',
  },
  {
    id: '2',
    title: 'Showcase Your Tech Stack',
    normalTextBefore: 'Showcase ',
    highlightedText: 'Your Tech Stack',
    normalTextAfter: ' & get hired directly.',
    subtitle: 'Highlight your skills in React, Node, Python, Cloud computing, and get matched with tech recruiters directly.',
  },
  {
    id: '3',
    title: 'Finding Your Perfect Career Path Starts Here!',
    normalTextBefore: 'Finding ',
    highlightedText: 'Your Perfect Career',
    normalTextAfter: ' Path Starts Here!',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
  },
];

// Custom Spiral Circle Background Graphic
const SpiralCircle = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="50" fill="#F1F5F9" />
    <Path
      d="M50,50 C50,43 57,43 57,50 C57,60 43,60 43,50 C43,35 65,35 65,50 C65,70 35,70 35,50 C35,27 75,27 75,50 C75,80 25,80 25,50 C25,18 85,18 85,50"
      stroke="#FFFFFF"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
      opacity={0.8}
    />
  </Svg>
);

export default function OnboardingScreen({ onFinish, onSignInPress, onSkipPress }: { onFinish?: () => void; onSignInPress?: () => void; onSkipPress?: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else if (onFinish) {
      onFinish();
    }
  };

  const handleSkip = () => {
    if (onSkipPress) {
      onSkipPress();
    } else if (onFinish) {
      onFinish();
    } else {
      flatListRef.current?.scrollToIndex({
        index: SLIDES.length - 1,
        animated: true,
      });
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.infoSection}>
          <Text style={styles.heading}>
            {item.normalTextBefore}
            <Text style={styles.blueText}>{item.highlightedText}</Text>
            {item.normalTextAfter}
          </Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  const isSlide3 = currentIndex === 2;

  // Let's dynamically configure the tags above the headshots per slide
  const getTagsForSlide = () => {
    switch (currentIndex) {
      case 0:
        return { left: '#Remote', right: '#FullTime' };
      case 1:
        return { left: '#React', right: '#NodeJS' };
      default:
        return { left: '#Developer', right: '#Designer' };
    }
  };

  const tags = getTagsForSlide();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <FadeInView style={{ flex: 1 }}>

      {/* FIXED Background Swirl Graphics */}
      <View style={styles.backgroundGraphics}>
        {/* Top Right Swirl */}
        <View style={styles.topRightSwirl}>
          <SpiralCircle size={220} />
        </View>

        {/* Bottom Left Swirl */}
        <View style={styles.bottomLeftSwirl}>
          <SpiralCircle size={130} />
        </View>
      </View>

      {/* FIXED Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>J</Text>
          </View>
          <Text style={styles.logoText}>ITJob<Text style={styles.logoHighlight}>x</Text></Text>
        </View>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* FIXED Graphical Layout (Grayscale Images + Tag Pills) */}
      <View style={styles.graphicsContainer}>
        {/* Top-Left Leaf Image Container */}
        <View style={styles.imageWrapperLeft}>
          <View style={styles.leafFrameLeft}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&sat=-100' }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
          {/* Left Tag Pill Badge */}
          <View style={styles.developerPill}>
            <Text style={styles.developerText}>{tags.left}</Text>
          </View>
        </View>

        {/* Bottom-Right Leaf Image Container */}
        <View style={styles.imageWrapperRight}>
          <View style={styles.leafFrameRight}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&sat=-100' }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
          {/* Right Tag Pill Badge */}
          <View style={styles.designerPill}>
            <Text style={styles.designerText}>{tags.right}</Text>
          </View>
        </View>
      </View>

      {/* Sliding Text Section */}
      <View style={styles.sliderWrapper}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
        />
      </View>

      {/* FIXED Footers */}
      <View style={styles.footerSection}>
        {!isSlide3 ? (
          <View style={styles.footerControls}>
            {/* Pagination Dots */}
            <View style={styles.indicatorContainer}>
              {SLIDES.map((_, index) => {
                const isSelected = index === currentIndex;
                return (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      isSelected && styles.activeIndicator,
                    ]}
                  />
                );
              })}
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.startButton} activeOpacity={0.8} onPress={handleNext}>
              <Text style={styles.startButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.footerControls}>
            {/* Let's Get Started Button */}
            <TouchableOpacity style={styles.startButton} activeOpacity={0.8} onPress={onFinish}>
              <Text style={styles.startButtonText}>Let’s Get Started</Text>
            </TouchableOpacity>

            {/* Sign In Footer */}
            <TouchableOpacity style={styles.signInButton} activeOpacity={0.7} onPress={onSignInPress}>
              <Text style={styles.signInText}>
                Already have an account? <Text style={styles.signInHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </FadeInView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundGraphics: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  topRightSwirl: {
    position: 'absolute',
    top: -30,
    right: -40,
  },
  bottomLeftSwirl: {
    position: 'absolute',
    top: 360,
    left: -20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 24 : 45,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoIconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  logoHighlight: {
    color: '#2563EB',
  },
  skipButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },
  skipText: {
    color: '#64748B',
    fontSize: 19,
    fontWeight: 'bold',
  },
  graphicsContainer: {
    width: width,
    height: 300,
    position: 'relative',
    marginTop: 40,
    zIndex: 2,
  },
  imageWrapperLeft: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 2,
  },
  imageWrapperRight: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 3,
  },
  leafFrameLeft: {
    width: 170,
    height: 170,
    borderTopLeftRadius: 85,
    borderTopRightRadius: 85,
    borderBottomLeftRadius: 85,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#F1F5F9',
  },
  leafFrameRight: {
    width: 170,
    height: 170,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 85,
    borderBottomLeftRadius: 85,
    borderBottomRightRadius: 85,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#F1F5F9',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  developerPill: {
    position: 'absolute',
    bottom: 8,
    right: -6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  developerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  designerPill: {
    position: 'absolute',
    bottom: 8,
    left: -6,
    backgroundColor: '#FCD34D',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  designerText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sliderWrapper: {
    height: 200,
    marginTop: 35, // Increased margin to bring slider wrapper text lower!
    zIndex: 5,
  },
  slide: {
    width: width,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  infoSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 15, // Additional padding to push text down!
  },
  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 35,
    marginBottom: 12,
  },
  blueText: {
    color: '#2563EB',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  footerSection: {
    width: width,
    paddingHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 35,
    zIndex: 10,
  },
  footerControls: {
    width: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  indicator: {
    height: 4,
    width: 12,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#2563EB',
    width: 24,
  },
  startButton: {
    height: 54,
    backgroundColor: '#2563EB',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  signInText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  signInHighlight: {
    color: '#2563EB',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
