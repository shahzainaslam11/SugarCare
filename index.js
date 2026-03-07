/**
 * @format
 */

import './silenceFirebaseDeprecations';
import {Platform} from 'react-native';
import {AppRegistry} from 'react-native';
import {getApp} from '@react-native-firebase/app';
import {getMessaging, setBackgroundMessageHandler} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

const messaging = getMessaging(getApp());

const ANDROID_CHANNEL_ID = 'sugarcare_default';

// Notifee: handle notification press when app is in background/quit (required to avoid warning).
notifee.onBackgroundEvent(async () => {
  // App will open via FCM; no UI updates here.
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  try {
    await notifee.createChannel({
      id: ANDROID_CHANNEL_ID,
      name: 'SugarCare',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  } catch (_e) {}
}

// Create Android default channel at startup so FCM can show notification messages (background/quit).
ensureAndroidChannel();

// Must be registered outside of React and before the app component (background/quit state).
// For data-only messages: display locally so user sees a notification on both iOS and Android.
// For notification messages: system shows it; we don't duplicate.
const shownBackgroundIds = new Set();
const MAX_BG_IDS = 50;
setBackgroundMessageHandler(messaging, async remoteMessage => {
  if (__DEV__) {
    console.log('[FCM] Background message', remoteMessage?.messageId, remoteMessage?.data);
  }
  const notif = remoteMessage?.notification || {};
  const data = remoteMessage?.data || {};
  const hasNotificationPayload = notif && (notif.title || notif.body);
  const title = notif?.title ?? data?.title ?? 'SugarCare';
  const body = notif?.body ?? data?.body ?? data?.message ?? ' ';

  // On iOS: notification messages are shown by the system; skip our display to avoid duplicate.
  // On Android: always display here (system does not always show when app is background/quit).
  if (Platform.OS === 'ios' && hasNotificationPayload) {
    notifee.incrementBadgeCount().catch(() => {});
    return;
  }

  // Dedupe: same messageId can fire twice on some devices
  const mid = remoteMessage?.messageId;
  if (mid && shownBackgroundIds.has(mid)) return;
  if (mid) {
    shownBackgroundIds.add(mid);
    if (shownBackgroundIds.size > MAX_BG_IDS) {
      const first = shownBackgroundIds.values().next().value;
      shownBackgroundIds.delete(first);
    }
  }

  await ensureAndroidChannel();
  try {
    const payload = {
      title: title || 'SugarCare',
      body: body || ' ',
      data: data || {},
      android: {
        channelId: ANDROID_CHANNEL_ID,
        pressAction: {id: 'default'},
      },
    };
    if (Platform.OS === 'ios') {
      payload.ios = {sound: 'default'};
    }
    await notifee.displayNotification(payload);
    notifee.incrementBadgeCount().catch(() => {});
  } catch (_e) {}
});

AppRegistry.registerComponent(appName, () => App);
