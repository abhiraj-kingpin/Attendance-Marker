import { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, Switch, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import { useStore, initialState } from '../store/useStore';
import { useTheme } from '../lib/useTheme';
import { FONT_SCALES, FONT_FAMILIES, ACCENT_HUE_PRESETS, hslToHex } from '../lib/theme';
import { requestNotificationPermission, DEFAULT_REMINDER_HOUR } from '../lib/notifications';
import Card from './Card';
import HueSlider from './HueSlider';
import appConfig from '../../app.json';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'light-mode' },
  { value: 'dark', label: 'Dark', icon: 'dark-mode' },
];
const FONT_SCALE_OPTIONS = Object.entries(FONT_SCALES).map(([value, v]) => ({ value, label: v.label }));
const FONT_FAMILY_OPTIONS = Object.entries(FONT_FAMILIES).map(([value, v]) => ({ value, label: v.label }));
const ATTENDANCE_MODE_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'partial', label: 'Partial' },
  { value: 'automatic', label: 'Automatic' },
];
const DEFAULT_GEOFENCE_RADIUS_M = 150;

const SUPPORT_EMAIL = 'attendencemarker.help@gmail.com';
const ABOUT_MESSAGE =
  'Attendance Marker was built to help students stay on top of their attendance and build the discipline that comes with showing up consistently — a small tool for everyone using it and supporting that habit.\n\n' +
  "Everything you do in this app — every class you mark, every note, every setting — stays on your device. Nothing is sent anywhere, and none of it is ever visible to the developer or anyone else. It's yours alone.";

function SettingsCard({ icon, title, hint, children }) {
  return (
    <Card className="p-4 mb-3">
      <View className="flex-row items-center gap-2 mb-0.5">
        <MaterialIcons name={icon} size={17} color="#4285F4" />
        <Text className="text-sm font-semibold text-on-surface">{title}</Text>
      </View>
      {hint && <Text className="text-xs text-on-surface-tertiary mb-3">{hint}</Text>}
      {!hint && <View className="mb-2.5" />}
      {children}
    </Card>
  );
}

function PillGroup({ options, value, onChange, wrap = false }) {
  const { colors } = useTheme();
  return (
    <View className={wrap ? 'flex-row flex-wrap gap-2' : 'flex-row gap-2'}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`${wrap ? '' : 'flex-1'} rounded-lg px-2 py-2.5 border min-h-11 items-center justify-center`}
            style={[
              wrap && { width: '48%' },
              {
                backgroundColor: active ? colors.gBlueContainer : colors.surface,
                borderColor: active ? colors.gBlue : colors.outlineVariant,
              },
            ]}
          >
            {opt.icon && (
              <MaterialIcons
                name={opt.icon}
                size={16}
                color={active ? colors.gBlueDark : colors.onSurfaceTertiary}
                style={{ marginBottom: 2 }}
              />
            )}
            <Text
              className="text-xs font-medium text-center"
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ color: active ? colors.gBlueDark : colors.onSurfaceTertiary }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function HuePresetRow({ presets, hue, onPick, noneActive, onNone }) {
  return (
    <View className="flex-row flex-wrap gap-3 mb-3">
      {onNone && (
        <TouchableOpacity
          onPress={onNone}
          accessibilityRole="button"
          accessibilityLabel="No tint"
          className="items-center justify-center rounded-full bg-surface-variant-2 border border-outline-variant"
          style={{ width: 32, height: 32 }}
        >
          {noneActive && <MaterialIcons name="check" size={16} color="#5F6368" />}
          {!noneActive && <MaterialIcons name="block" size={14} color="#9AA0A6" />}
        </TouchableOpacity>
      )}
      {presets.map((p) => {
        const active = !noneActive && hue === p.hue;
        const swatch = hslToHex(p.hue, 74, 55);
        return (
          <TouchableOpacity
            key={p.label}
            onPress={() => onPick(p.hue)}
            accessibilityRole="button"
            accessibilityLabel={p.label}
            className="items-center justify-center rounded-full"
            style={{ width: 32, height: 32, backgroundColor: swatch }}
          >
            {active && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ColorPicker({ presets, hue, onChange, allowNone, colors }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View>
      <HuePresetRow
        presets={presets}
        hue={hue}
        onPick={onChange}
        noneActive={allowNone ? hue === null : undefined}
        onNone={allowNone ? () => onChange(null) : undefined}
      />
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        accessibilityRole="button"
        className="flex-row items-center gap-1 self-start min-h-11 -ml-1 px-1"
      >
        <Text className="text-xs font-medium" style={{ color: colors.gBlue }}>
          {expanded ? 'Fewer colors' : 'More colors'}
        </Text>
        <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={16} color={colors.gBlue} />
      </TouchableOpacity>
      {expanded && (
        <View className="mt-1">
          <HueSlider value={hue ?? 217} onChange={onChange} />
        </View>
      )}
    </View>
  );
}

export default function SettingsSection() {
  const settings = useStore((s) => s.settings);
  const setThemeMode = useStore((s) => s.setThemeMode);
  const setFontScale = useStore((s) => s.setFontScale);
  const setFontFamily = useStore((s) => s.setFontFamily);
  const setAccentHue = useStore((s) => s.setAccentHue);
  const setBackgroundHue = useStore((s) => s.setBackgroundHue);
  const setRemindersEnabled = useStore((s) => s.setRemindersEnabled);
  const setAttendanceMode = useStore((s) => s.setAttendanceMode);
  const setCollegeLocation = useStore((s) => s.setCollegeLocation);
  const { colors } = useTheme();

  const [locating, setLocating] = useState(false);

  const themeMode = settings.themeMode === 'dark' ? 'dark' : 'light';
  const fontScale = settings.fontScale ?? 'default';
  const fontFamily = settings.fontFamily ?? 'system';
  const accentHue = settings.accentHue ?? 217;
  const backgroundHue = settings.backgroundHue ?? null;
  const remindersEnabled = settings.remindersEnabled ?? false;
  const attendanceMode = settings.attendanceMode ?? 'manual';
  const collegeLocation = settings.collegeLocation ?? null;

  async function captureCollegeLocation() {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Location permission needed', 'Attendance Marker needs location access to know when you\'re at college.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCollegeLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        radiusM: collegeLocation?.radiusM ?? DEFAULT_GEOFENCE_RADIUS_M,
      });
    } catch {
      Alert.alert('Could not get your location', 'Make sure location services are on and try again.');
    } finally {
      setLocating(false);
    }
  }

  async function toggleReminders(value) {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Notifications are off',
          "Attendance Marker doesn't have permission to send notifications — enable it for this app in your phone's system settings, then try again."
        );
        return;
      }
    }
    setRemindersEnabled(value);
  }

  function showAbout() {
    Alert.alert('About Attendance Marker', ABOUT_MESSAGE);
  }

  function contactSupport() {
    const subject = encodeURIComponent('Attendance Marker — feedback');
    const body = encodeURIComponent(`\n\n—\nApp version ${appConfig.expo.version}`);
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Could not open mail app', `Reach out directly at ${SUPPORT_EMAIL}`);
    });
  }

  function resetAppData() {
    Alert.alert(
      'Reset all app data?',
      'This clears every subject, timetable entry, attendance record, syllabus, exam, and GPA entry on this device. Your appearance settings are kept. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const keepSettings = useStore.getState().settings;
            useStore.persist.clearStorage();
            useStore.setState({ ...initialState, settings: keepSettings });
          },
        },
      ]
    );
  }

  return (
    <View className="flex-1">
      <SettingsCard icon="palette" title="Appearance" hint="Choose how Attendance Marker looks.">
        <Text className="text-xs font-medium text-on-surface-secondary mb-1.5">Theme</Text>
        <PillGroup options={THEME_OPTIONS} value={themeMode} onChange={setThemeMode} />

        <Text className="text-xs font-medium text-on-surface-secondary mb-1.5 mt-3.5">Font size</Text>
        <PillGroup options={FONT_SCALE_OPTIONS} value={fontScale} onChange={setFontScale} />

        <Text className="text-xs font-medium text-on-surface-secondary mb-1.5 mt-3.5">Font</Text>
        <PillGroup options={FONT_FAMILY_OPTIONS} value={fontFamily} onChange={setFontFamily} wrap />

        <Text className="text-xs font-medium text-on-surface-secondary mb-2 mt-3.5">Accent color</Text>
        <ColorPicker presets={ACCENT_HUE_PRESETS} hue={accentHue} onChange={setAccentHue} colors={colors} />

        <Text className="text-xs font-medium text-on-surface-secondary mb-2 mt-4">Background tint</Text>
        <Text className="text-2xs text-on-surface-tertiary mb-2 -mt-1.5">A subtle color cast over the app's background, not a solid fill — text stays readable.</Text>
        <ColorPicker presets={ACCENT_HUE_PRESETS} hue={backgroundHue} onChange={setBackgroundHue} allowNone colors={colors} />
      </SettingsCard>

      <SettingsCard icon="notifications" title="Notifications">
        <View className="flex-row items-center gap-3 py-1">
          <View className="flex-1 min-w-0">
            <Text className="text-sm font-medium text-on-surface">Daily reminder</Text>
            <Text className="text-xs text-on-surface-tertiary">
              A {DEFAULT_REMINDER_HOUR > 12 ? DEFAULT_REMINDER_HOUR - 12 : DEFAULT_REMINDER_HOUR} PM nudge on days you still have unmarked classes — skipped automatically once everything's marked.
            </Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={toggleReminders}
            trackColor={{ false: colors.outlineVariant, true: colors.gBlue }}
            thumbColor="#FFFFFF"
          />
        </View>
      </SettingsCard>

      <SettingsCard
        icon="location-on"
        title="Attendance mode"
        hint="Automatic/Partial prompt you to confirm attendance when you're near college during a scheduled class — they never mark it for you silently."
      >
        <PillGroup options={ATTENDANCE_MODE_OPTIONS} value={attendanceMode} onChange={setAttendanceMode} />

        {attendanceMode !== 'manual' && (
          <View className="mt-3.5">
            <Text className="text-xs font-medium text-on-surface-secondary mb-1.5">College location</Text>
            {collegeLocation ? (
              <View className="flex-row items-center gap-2 mb-2">
                <MaterialIcons name="check-circle" size={16} color={colors.gGreenDark} />
                <Text className="text-xs text-on-surface-tertiary flex-1">
                  Set — within {collegeLocation.radiusM}m of {collegeLocation.latitude.toFixed(4)}, {collegeLocation.longitude.toFixed(4)} counts as "at college". Also add class times in Setup → Timetable so prompts know when to fire.
                </Text>
              </View>
            ) : (
              <Text className="text-xs text-g-red mb-2">Not set yet — stand at your college and tap below.</Text>
            )}
            <TouchableOpacity
              onPress={captureCollegeLocation}
              disabled={locating}
              className="flex-row items-center justify-center gap-2 rounded-lg border border-outline-variant py-3 min-h-11"
            >
              {locating ? <ActivityIndicator size="small" color={colors.gBlue} /> : <MaterialIcons name="my-location" size={16} color={colors.gBlue} />}
              <Text className="text-sm font-medium text-g-blue">{collegeLocation ? 'Update to my current location' : 'Use my current location'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SettingsCard>

      <SettingsCard icon="help" title="Help & feedback">
        <TouchableOpacity
          onPress={contactSupport}
          className="flex-row items-center gap-3 py-1 min-h-11"
          accessibilityRole="button"
        >
          <View className="w-9 h-9 rounded-full items-center justify-center bg-g-blue-container">
            <MaterialIcons name="mail-outline" size={17} color={colors.gBlueDark} />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-sm font-medium text-on-surface">Email the developer</Text>
            <Text className="text-xs text-on-surface-tertiary" numberOfLines={1}>{SUPPORT_EMAIL}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceTertiary} />
        </TouchableOpacity>
      </SettingsCard>

      <SettingsCard icon="info" title="About">
        <TouchableOpacity
          onPress={showAbout}
          accessibilityRole="button"
          className="flex-row items-center justify-between py-1 min-h-11"
        >
          <Text className="text-sm text-on-surface-secondary">Attendance Marker</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-sm font-medium text-on-surface-tertiary">v{appConfig.expo.version}</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceTertiary} />
          </View>
        </TouchableOpacity>
      </SettingsCard>

      <TouchableOpacity
        onPress={resetAppData}
        className="flex-row items-center justify-center gap-2 py-3.5 rounded-full border min-h-11"
        style={{ borderColor: colors.gRed }}
      >
        <MaterialIcons name="delete-outline" size={17} color={colors.gRed} />
        <Text className="text-sm font-medium" style={{ color: colors.gRed }}>Reset all app data</Text>
      </TouchableOpacity>
    </View>
  );
}
