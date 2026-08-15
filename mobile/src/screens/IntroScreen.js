import { useEffect, useRef } from 'react';
import { Animated, Text, Image, StyleSheet, Easing } from 'react-native';

export default function IntroScreen({ onFinish }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1, duration: 350, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, 750);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <Text style={styles.title}>Attendance Marker</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F1F1F',
  },
});
