import 'react-native-gesture-handler';
import React, {useEffect, useRef} from 'react';
import MainAppNav from './src/navigation';
import FlashMessage from 'react-native-flash-message';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './src/redux/store';
import {AuthProvider} from './src/context/AuthContext';
import {ScanCreditsProvider} from './src/context/ScanCreditsContext';
import {IAPProvider} from './src/context/IAPContext';
import {ActivityIndicator, Platform, View} from 'react-native';
import notifee, {EventType} from '@notifee/react-native';
import {fcmService, FCM_TOKEN_STORAGE_KEY} from './src/utilities/NotificationsService/FCMService';
import {displayFCMAsSystemNotification} from './src/utilities/NotificationsService/displayFCMAsNotification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {registerDeviceToken} from './src/redux/slices/notificationSlice';
import {withIAPContext} from 'react-native-iap';

const App = () => {
  const onOpenNotificationRef = useRef<(data: Record<string, unknown>, remoteMessage: unknown) => void>(() => {});

  useEffect(() => {
    const handleOpenNotification = (data: Record<string, unknown>, remoteMessage: unknown) => {
      __DEV__ && console.log('Notification opened', data, remoteMessage);
      // Optional: navigate to a screen based on data
    };
    onOpenNotificationRef.current = handleOpenNotification;

    // iOS: request Notifee permission early so foreground notifications can be displayed.
    if (Platform.OS === 'ios') {
      notifee.requestPermission().catch(() => {});
    }

    // Push notifications: Android works on emulator; iOS requires a real device (Simulator cannot receive APNs).
    fcmService.register(
      (token: string) => {
        AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token).catch(() => {});
        if (__DEV__) console.log('FCM Token:', token);
        const accessToken = store.getState().auth?.accessToken;
        if (accessToken && token) {
          // @ts-expect-error - registerDeviceToken payload typed loosely in store
          store.dispatch(registerDeviceToken({fcm_token: token}));
        }
      },
      (_data: Record<string, unknown>, remoteMessage: unknown) => {
        // Show as system notification (banner + tray), not in-app showMessage
        if (remoteMessage) {
          const msg = remoteMessage as import('@react-native-firebase/messaging').FirebaseMessagingTypes.RemoteMessage;
          // On iOS, notification messages are already shown by the system (APNs). Showing again via Notifee causes 2 notifications.
          const notif = msg?.notification;
          const iosHasNotificationPayload = Platform.OS === 'ios' && notif && (notif.title || notif.body);
          if (!iosHasNotificationPayload) {
            displayFCMAsSystemNotification(msg);
          } else {
            // Still update app icon badge when we skip displaying (e.g. iOS notification message)
            notifee.incrementBadgeCount().catch(() => {});
          }
        }
      },
      (data: Record<string, unknown>, remoteMessage: unknown) => {
        onOpenNotificationRef.current(data || {}, remoteMessage);
      },
    );

    // When user taps a notification we displayed in foreground (Notifee)
    const unsubscribeNotifee = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS && detail?.notification?.data) {
        onOpenNotificationRef.current(detail.notification.data as Record<string, unknown>, null);
      }
    });

    // If token arrived before auth rehydrated, sync token to backend once auth is ready
    const syncTokenTimeout = setTimeout(() => {
      const accessToken = store.getState().auth?.accessToken;
      if (!accessToken) return;
      AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY).then(fcmToken => {
        if (fcmToken) {
          store.dispatch(registerDeviceToken({fcm_token: fcmToken} as {fcm_token: string}));
        }
      });
    }, 6000);

    return () => {
      clearTimeout(syncTokenTimeout);
      unsubscribeNotifee();
      fcmService.unRegister();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        }
        persistor={persistor}>
        <AuthProvider>
          <ScanCreditsProvider>
            <IAPProvider>
              <MainAppNav />
              <FlashMessage position="top" />
            </IAPProvider>
          </ScanCreditsProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
};

export default withIAPContext(App);
