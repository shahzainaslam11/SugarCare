/**
 * FCM (Firebase Cloud Messaging) service — modular API (v22+):
 * - iOS: requestPermission, then getToken (Firebase auto-registers for remote messages)
 * - Android 33+: POST_NOTIFICATIONS, then getToken
 * - Foreground: onMessage; Background/quit: setBackgroundMessageHandler (index.js)
 * - Opened: onNotificationOpenedApp, getInitialNotification
 */

import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  requestPermission,
  deleteToken,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import {AppState, Platform, PermissionsAndroid} from 'react-native';

function getMessagingInstance() {
  return getMessaging(getApp());
}

/** Key used in AsyncStorage for the FCM token (send this to your backend for targeting). */
export const FCM_TOKEN_STORAGE_KEY = '@sugarcare_fcm_token';

const GET_TOKEN_RETRY_DELAY_MS = Platform.OS === 'android' ? 4000 : 2000;
const GET_TOKEN_RETRY_ATTEMPTS = Platform.OS === 'android' ? 6 : 3;
const ANDROID_INITIAL_DELAY_MS = 3000;
/** iOS: wait for APNs token before getToken (avoids "APNS token not set" / no delivery on device). */
const IOS_INITIAL_DELAY_MS = 6000;
const FOREGROUND_RETRY_DELAY_MS = 2000;

class FCMService {
  _tokenRefreshUnsubscribe = null;
  _foregroundUnsubscribe = null;
  _appStateSubscription = null;

  /**
   * Request notification permission and start listeners.
   * @param {Function} onRegister - (fcmToken: string) => void
   * @param {Function} onNotification - (data, remoteMessage) => void — foreground only
   * @param {Function} onOpenNotification - (data, remoteMessage) => void — user tapped notification
   */
  register = (onRegister, onNotification, onOpenNotification) => {
    this._onRegister = onRegister;
    this.requestPermission()
      .then(() => {
        if (Platform.OS === 'android') {
          setTimeout(() => this.getTokenWithRetry(onRegister), ANDROID_INITIAL_DELAY_MS);
        } else {
          // iOS: delay so APNs token is set before getToken (required for FCM delivery on real device).
          setTimeout(() => this.getTokenWithRetry(onRegister), IOS_INITIAL_DELAY_MS);
        }
      })
      .catch(err => {
        if (__DEV__) console.warn('[FCM] requestPermission failed', err?.message ?? err);
      });
    this.createNotificationListeners(
      onRegister,
      onNotification,
      onOpenNotification,
    );
    if (typeof this.setupForegroundTokenRetry === 'function') {
      this.setupForegroundTokenRetry(onRegister);
    }
  };

  /** When app comes to foreground, try getToken once (Android; helps after SERVICE_NOT_AVAILABLE). */
  setupForegroundTokenRetry(onRegister) {
    if (Platform.OS !== 'android') return;
    this._appStateSubscription = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active') return;
      setTimeout(() => {
        getToken(getMessagingInstance())
          .then(fcmToken => {
            if (fcmToken && onRegister) onRegister(fcmToken);
          })
          .catch(() => {});
      }, FOREGROUND_RETRY_DELAY_MS);
    });
  }

  requestPermission = async () => {
    const messaging = getMessagingInstance();
    if (Platform.OS === 'ios') {
      // Firebase auto-registers for remote messages by default; no need to call registerDeviceForRemoteMessages.
      const authStatus = await requestPermission(messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
      return enabled;
    }
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  getTokenWithRetry = (onRegister, attempt = 0) => {
    getToken(getMessagingInstance())
      .then(fcmToken => {
        if (fcmToken && onRegister) onRegister(fcmToken);
      })
      .catch(err => {
        if (__DEV__) console.warn('[FCM] getToken attempt', attempt + 1, err?.message ?? err);
        if (attempt < GET_TOKEN_RETRY_ATTEMPTS - 1) {
          setTimeout(
            () => this.getTokenWithRetry(onRegister, attempt + 1),
            GET_TOKEN_RETRY_DELAY_MS,
          );
        }
      });
  };

  getToken = onRegister => {
    this.getTokenWithRetry(onRegister || this._onRegister);
  };

  createNotificationListeners = (
    onRegister,
    onNotification,
    onOpenNotification,
  ) => {
    const messaging = getMessagingInstance();

    // User opened app from notification (background)
    onNotificationOpenedApp(messaging, remoteMessage => {
      if (remoteMessage && onOpenNotification) {
        const notification = remoteMessage.notification || {};
        const data = remoteMessage.data || {};
        onOpenNotification({...data, ...notification}, remoteMessage);
      }
    });

    // App opened from quit state via notification
    getInitialNotification(messaging)
      .then(remoteMessage => {
        if (remoteMessage && onOpenNotification) {
          const notification = remoteMessage.notification || {};
          const data = remoteMessage.data || {};
          onOpenNotification({...data, ...notification}, remoteMessage);
        }
      })
      .catch(() => {});

    // Foreground messages
    this._foregroundUnsubscribe = onMessage(messaging, async remoteMessage => {
      if (onNotification) {
        const notification = remoteMessage.notification || {};
        const data = remoteMessage.data || {};
        onNotification({...data, ...notification}, remoteMessage);
      }
    });

    // Token refresh
    this._tokenRefreshUnsubscribe = onTokenRefresh(messaging, fcmToken => {
      if (fcmToken && onRegister) onRegister(fcmToken);
    });
  };

  unRegister = () => {
    if (typeof this._foregroundUnsubscribe === 'function') {
      this._foregroundUnsubscribe();
    }
    if (typeof this._tokenRefreshUnsubscribe === 'function') {
      this._tokenRefreshUnsubscribe();
    }
    if (this._appStateSubscription) {
      this._appStateSubscription.remove();
      this._appStateSubscription = null;
    }
  };

  deleteToken = () => {
    deleteToken(getMessagingInstance()).catch(() => {});
  };
}

export const fcmService = new FCMService();
