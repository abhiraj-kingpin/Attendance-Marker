import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, Easing } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = [
  {
    icon: 'document-scanner',
    title: 'Scan your timetable',
    description:
      "Point your camera at a printed timetable — subjects, teachers, and rooms are picked out automatically. Text recognition runs on your phone; the photo never leaves it.",
  },
  {
    icon: 'picture-as-pdf',
    title: 'Upload your syllabus',
    description:
      'Paste the text or upload a PDF and it’s split into units automatically, so you can track what’s been covered as you go.',
  },
  {
    icon: 'location-on',
    title: "Never forget to mark attendance",
    description:
      'Turn on Partial or Automatic mode in Settings, and the app can gently prompt you to confirm attendance when you’re near college during a scheduled class. It only ever asks — it never marks anything silently.',
  },
  {
    icon: 'trending-up',
    title: 'See if you’re on track',
    description:
      'Once your syllabus is in, the app estimates which unit your class should be on by now — so you always know if you’re ahead or behind.',
  },
  {
    icon: 'calculate',
    title: 'Track your GPA',
    description:
      'Enter your marks each semester for an instant SGPA/CGPA under GGSIPU’s Ordinance 11 grading, plus a quick cross-check against the real portal.',
  },
  {
    icon: 'check-circle',
    title: "You're all set",
    description:
      'Everything you enter stays on this device — no account, no backend, nothing shared with anyone. Let’s add your first subject.',
  },
];

function StepIcon({ name, color, background }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <View className="items-center justify-center mb-8" style={{ width: 140, height: 140 }}>
      <Animated.View
        className="items-center justify-center rounded-full"
        style={{ width: 140, height: 140, backgroundColor: background, transform: [{ scale }] }}
      >
        <MaterialIcons name={name} size={64} color={color} />
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen({ onFinish }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const isLast = index === STEPS.length - 1;

  function goTo(i) {
    scrollRef.current?.scrollTo({ x: i * SCREEN_WIDTH, animated: true });
    setIndex(i);
  }

  function handleScrollEnd(e) {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setIndex(newIndex);
  }

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="flex-row justify-end px-5 pt-2">
        <TouchableOpacity onPress={onFinish} accessibilityRole="button" className="px-3 py-2 min-h-11 justify-center">
          <Text className="text-sm font-medium text-on-surface-tertiary">Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {STEPS.map((step, i) => (
          <View key={i} style={{ width: SCREEN_WIDTH }} className="flex-1 items-center justify-center px-8">
            <StepIcon name={step.icon} color={colors.gBlue} background={colors.gBlueContainer} />
            <Text className="text-xl font-semibold text-on-surface text-center mb-3">{step.title}</Text>
            <Text className="text-sm text-on-surface-secondary text-center leading-5">{step.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row justify-center gap-2 mb-6">
        {STEPS.map((_, i) => (
          <View
            key={i}
            className="rounded-full"
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              backgroundColor: i === index ? colors.gBlue : colors.outlineVariant,
            }}
          />
        ))}
      </View>

      <View className="px-5" style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}>
        <TouchableOpacity
          onPress={() => (isLast ? onFinish() : goTo(index + 1))}
          className="bg-g-blue rounded-full py-3.5 items-center"
          accessibilityRole="button"
        >
          <Text className="text-white font-medium">{isLast ? 'Get started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
