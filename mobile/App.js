import './global.css';
import { useState } from 'react';
import { View } from 'react-native';
import { vars } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import IntroScreen from './src/screens/IntroScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useThemeVars, useColorSchemeSetting } from './src/lib/useTheme';
import { useReminderSync } from './src/lib/useReminderSync';
import { useAttendancePresence } from './src/lib/useAttendancePresence';
import { useStore } from './src/store/useStore';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const hasSeenOnboarding = useStore((s) => s.settings.hasSeenOnboarding);
  const setHasSeenOnboarding = useStore((s) => s.setHasSeenOnboarding);
  const themeVars = useThemeVars();
  const scheme = useColorSchemeSetting();
  useReminderSync();
  useAttendancePresence();

  return (
    // vars()'s actual payload lives in a side-table keyed by object identity,
    // read only by components NativeWind's babel/interop wraps (plain RN core
    // components like View/Text). GestureHandlerRootView is a third-party
    // component NativeWind never registers, so vars() applied there was a
    // silent no-op — every themed value fell back to its hardcoded default,
    // which is why dark mode, font size, and font family all did nothing.
    // Putting it on this plain <View> instead is what actually wires it up.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[{ flex: 1 }, vars(themeVars)]}>
        <SafeAreaProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <View style={{ flex: 1, backgroundColor: scheme === 'dark' ? '#131314' : '#FFFFFF' }}>
            {showIntro ? (
              <IntroScreen onFinish={() => setShowIntro(false)} />
            ) : !hasSeenOnboarding ? (
              <OnboardingScreen onFinish={() => setHasSeenOnboarding(true)} />
            ) : (
              <RootNavigator />
            )}
          </View>
        </SafeAreaProvider>
      </View>
    </GestureHandlerRootView>
  );
}
