/**
 * Display an FCM remote message as a system notification (status bar / banner)
 * so push notifications appear as real notifications when app is in foreground.
 * Uses Notifee on both Android and iOS.
 *
 * Note: iOS Simulator cannot receive remote (APNs) push notifications. Test push
 * on a real iOS device.
 */

import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

const ANDROID_CHANNEL_ID = 'sugarcare_default';

let channelCreated = false;
let iosPermissionRequested = false;

/** Dedupe: avoid showing the same FCM message twice (e.g. when both system and onMessage fire on iOS). */
const DEDUPE_WINDOW_MS = 30000; // 30s — same title+body within window = one notification
const MAX_RECENT = 50;
const recentMessageTimes = new Map();

function shouldSkipDuplicate(messageId) {
  if (!messageId) return false;
  const now = Date.now();
  const last = recentMessageTimes.get(messageId) || 0;
  if (now - last < DEDUPE_WINDOW_MS) return true;
  recentMessageTimes.set(messageId, now);
  if (recentMessageTimes.size > MAX_RECENT) {
    let oldestKey = null;
    let oldestTime = Infinity;
    recentMessageTimes.forEach((t, id) => {
      if (t < oldestTime) {
        oldestTime = t;
        oldestKey = id;
      }
    });
    if (oldestKey != null) recentMessageTimes.delete(oldestKey);
  }
  return false;
}

async function ensureAndroidChannel() {
  if (channelCreated || Platform.OS !== 'android') return;
  try {
    await notifee.createChannel({
      id: ANDROID_CHANNEL_ID,
      name: 'SugarCare',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
    channelCreated = true;
  } catch (e) {
    if (__DEV__) console.warn('[FCM] createChannel failed', e?.message ?? e);
  }
}

async function ensureIOSPermission() {
  if (Platform.OS !== 'ios' || iosPermissionRequested) return;
  try {
    await notifee.requestPermission();
    iosPermissionRequested = true;
  } catch (e) {
    if (__DEV__) console.warn('[FCM] iOS requestPermission failed', e?.message ?? e);
  }
}

/**
 * Show the FCM message as a system notification (foreground).
 * Call this from onMessage / onNotification when app is in foreground.
 * @param {import('@react-native-firebase/messaging').FirebaseMessagingTypes.RemoteMessage} remoteMessage
 */
export async function displayFCMAsSystemNotification(remoteMessage) {
  const notif = remoteMessage?.notification || {};
  const data = remoteMessage?.data || {};
  const title =
    notif?.title ?? data?.title ?? 'Notification';
  const body =
    notif?.body ?? data?.body ?? data?.message ?? '';

  const messageId = remoteMessage?.messageId;
  if (shouldSkipDuplicate(messageId)) {
    if (__DEV__) console.log('[FCM] Skipping duplicate notification', messageId);
    return;
  }
  const contentKey = `${title}|${body}`;
  if (shouldSkipDuplicate(contentKey)) {
    if (__DEV__) console.log('[FCM] Skipping duplicate by content', contentKey);
    return;
  }

  await ensureAndroidChannel();
  await ensureIOSPermission();

  try {
    const notificationPayload = {
      title: title || 'SugarCare',
      body: body || ' ',
      data: data || {},
      android: {
        channelId: ANDROID_CHANNEL_ID,
        pressAction: { id: 'default' },
      },
    };
    if (Platform.OS === 'ios') {
      notificationPayload.ios = {
        sound: 'default',
      };
    }
    await notifee.displayNotification(notificationPayload);
    // Increment app icon badge when a new notification is shown (iOS and Android where supported)
    notifee.incrementBadgeCount().catch(() => {});
  } catch (e) {
    if (__DEV__) console.warn('[FCM] displayNotification failed', e?.message ?? e);
  }
}
