import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TABS } from '../lib/tabs';
import { useTheme } from '../lib/useTheme';
import TodayScreen from '../screens/TodayScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import SyllabusScreen from '../screens/SyllabusScreen';
import ExamsScreen from '../screens/ExamsScreen';
import GpaScreen from '../screens/GpaScreen';
import SetupScreen from '../screens/SetupScreen';

const SCREENS = {
  today: TodayScreen,
  attendance: AttendanceScreen,
  syllabus: SyllabusScreen,
  exams: ExamsScreen,
  gpa: GpaScreen,
  setup: SetupScreen,
};

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  const insets = useSafeAreaInsets();
  const { scheme, colors } = useTheme();
  const tabBarHeight = 56 + insets.bottom;

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.surfaceVariant,
      card: colors.surface,
      border: colors.outlineVariant,
      text: colors.onSurface,
      primary: colors.gBlue,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const tab = TABS.find((t) => t.key === route.name);
          return {
            headerShown: false,
            tabBarActiveTintColor: colors.gBlue,
            tabBarInactiveTintColor: colors.onSurfaceTertiary,
            tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
            tabBarStyle: {
              height: tabBarHeight,
              paddingTop: 8,
              paddingBottom: insets.bottom + 8,
              backgroundColor: colors.surface,
              borderTopColor: colors.outlineVariant,
            },
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={tab.icon} size={size ?? 24} color={color} />
            ),
            tabBarButton: (props) => <Pressable {...props} android_ripple={{ color: 'transparent' }} />,
          };
        }}
      >
        {TABS.map((tab) => (
          <Tab.Screen key={tab.key} name={tab.key} component={SCREENS[tab.key]} options={{ title: tab.label }} />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
