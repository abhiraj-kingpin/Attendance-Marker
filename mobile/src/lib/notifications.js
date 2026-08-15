import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const REMINDER_ID = 'attendance-daily-reminder';
const CHANNEL_ID = 'default';
export const DEFAULT_REMINDER_HOUR = 19;
export const DEFAULT_REMINDER_MINUTE = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let channelReady = null;
function ensureChannel() {
  if (Platform.OS !== 'android') return Promise.resolve();
  if (!channelReady) {
    channelReady = Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Attendance reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return channelReady;
}

export async function getNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestNotificationPermission() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function syncDailyReminder({ enabled, pendingCount, hour = DEFAULT_REMINDER_HOUR, minute = DEFAULT_REMINDER_MINUTE }) {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  if (!enabled || pendingCount <= 0) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await ensureChannel();

  const now = new Date();
  const fireDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (fireDate.getTime() <= now.getTime()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'Mark your attendance',
      body: `You have ${pendingCount} unmarked class${pendingCount === 1 ? '' : 'es'} today.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate, channelId: CHANNEL_ID },
  });
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
}
