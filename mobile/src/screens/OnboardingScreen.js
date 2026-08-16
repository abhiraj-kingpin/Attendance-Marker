import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, Easing } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// A small looping ripple, like a finger tapping the highlighted element —
// two rings expanding outward and fading, restarting on a delay.
function TapRipple({ color }) {
  const ripple = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ripple, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.delay(400),
        Animated.timing(ripple, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.8] });
  const opacity = ripple.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.55, 0.15, 0] });

  return (
    <View pointerEvents="none" style={{ position: 'absolute', right: -6, top: -6, width: 24, height: 24 }}>
      <Animated.View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: color,
          transform: [{ scale }],
          opacity,
        }}
      />
      <View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 5, top: 7, left: 7, backgroundColor: color }} />
    </View>
  );
}

// Wraps a mock UI fragment with a pulsing glow ring, so the step visibly
// points at "this is the real element you'll tap" rather than a generic
// icon floating on its own.
function Spotlight({ children, glowColor }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const shadowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] });

  return (
    <View className="items-center justify-center py-10">
      <Animated.View
        style={{
          borderRadius: 16,
          borderWidth: 2,
          borderColor: glowColor,
          shadowColor: glowColor,
          shadowOpacity,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        }}
      >
        <View style={{ position: 'relative' }}>
          {children}
          <TapRipple color={glowColor} />
        </View>
      </Animated.View>
    </View>
  );
}

function CalloutBubble({ text, colors }) {
  return (
    <View className="items-center px-6">
      <View className="rounded-2xl px-4 py-3 mb-2" style={{ backgroundColor: colors.gBlueContainer }}>
        <Text className="text-sm font-medium text-center" style={{ color: colors.gBlueDark }}>{text}</Text>
      </View>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderTopWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: colors.gBlueContainer,
        }}
      />
    </View>
  );
}

function MockPill({ label, active, colors }) {
  return (
    <View
      className="rounded-lg px-3 py-2.5 border min-w-20 items-center"
      style={{ backgroundColor: active ? colors.gBlueContainer : colors.surface, borderColor: active ? colors.gBlue : colors.outlineVariant }}
    >
      <Text className="text-xs font-medium" style={{ color: active ? colors.gBlueDark : colors.onSurfaceTertiary }}>{label}</Text>
    </View>
  );
}

function MockButton({ icon, label, colors }) {
  return (
    <View
      className="flex-row items-center justify-center gap-2 rounded-lg border py-3 px-4"
      style={{ borderColor: colors.outlineVariant, backgroundColor: colors.surface }}
    >
      <MaterialIcons name={icon} size={16} color={colors.gBlue} />
      <Text className="text-sm font-medium" style={{ color: colors.gBlue }}>{label}</Text>
    </View>
  );
}

export default function OnboardingScreen({ onFinish }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const STEPS = [
    {
      title: 'Scan your timetable',
      description: 'Text recognition runs on your phone — the photo never leaves it.',
      callout: 'Tap here to scan a printed timetable',
      mock: <MockButton icon="document-scanner" label="Scan a timetable photo" colors={colors} />,
    },
    {
      title: 'Upload your syllabus',
      description: 'It’s split into units automatically, so you can track what’s been covered.',
      callout: 'Tap here to upload a syllabus PDF',
      mock: <MockButton icon="picture-as-pdf" label="Or upload a PDF" colors={colors} />,
    },
    {
      title: "Never forget to mark attendance",
      description: 'It only ever prompts you to confirm — it never marks attendance silently.',
      callout: 'Turn on Partial or Automatic mode in Settings',
      mock: (
        <View className="flex-row gap-2">
          <MockPill label="Manual" colors={colors} />
          <MockPill label="Partial" active colors={colors} />
          <MockPill label="Automatic" colors={colors} />
        </View>
      ),
    },
    {
      title: "See if you're on track",
      description: 'Once your syllabus is in, it estimates which unit your class should be on by now.',
      callout: 'Check here on each subject’s Syllabus card',
      mock: (
        <View className="flex-row items-center gap-2 rounded-lg px-3 py-2.5" style={{ backgroundColor: colors.gGreenContainer }}>
          <MaterialIcons name="trending-up" size={16} color={colors.gGreenDark} />
          <Text className="text-xs font-medium" style={{ color: colors.gGreenDark }}>Expected around Unit 2. Right on pace.</Text>
        </View>
      ),
    },
    {
      title: 'Track your GPA',
      description: 'GGSIPU Ordinance 11 grading, plus a quick cross-check against the real portal.',
      callout: 'Tap here on the GPA tab',
      mock: <MockButton icon="sync" label="Cross-check with GGSIPU portal" colors={colors} />,
    },
    {
      title: "You're all set",
      description: 'Everything stays on this device — no account, no backend, nothing shared. Let’s add your first subject.',
      callout: null,
      mock: (
        <View className="items-center justify-center rounded-full" style={{ width: 96, height: 96, backgroundColor: colors.gGreenContainer }}>
          <MaterialIcons name="check-circle" size={48} color={colors.gGreenDark} />
        </View>
      ),
    },
  ];

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
    <View className="flex-1 bg-surface-variant" style={{ paddingTop: insets.top }}>
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
          <View key={i} style={{ width: SCREEN_WIDTH }} className="flex-1 px-8">
            <View className="flex-1 items-center justify-center">
              {step.callout && <CalloutBubble text={step.callout} colors={colors} />}
              <Spotlight glowColor={colors.gBlue}>{step.mock}</Spotlight>
            </View>
            <View className="mb-8">
              <Text className="text-xl font-semibold text-on-surface text-center mb-2">{step.title}</Text>
              <Text className="text-sm text-on-surface-secondary text-center leading-5">{step.description}</Text>
            </View>
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
