import React, {createContext, useContext, useEffect, useState} from 'react';
import {Alert, Linking, Platform} from 'react-native';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import NetInfo from '@react-native-community/netinfo';

export const checkConnected = () => {
	return NetInfo.fetch().then(state => {
		return state.isConnected;
	});
};

const OnlineStatusContext = createContext(true);

export const OnlineStatusProvider = ({children}) => {
	const [isOffline, setOfflineStatus] = useState(false);

	useEffect(() => {
		const removeNetInfoSubscription = NetInfo.addEventListener(state => {
			const offline = !(state.isConnected && state.isInternetReachable);
			setOfflineStatus(offline);
		});
		return () => removeNetInfoSubscription();
	}, []);

	return (
		<OnlineStatusContext.Provider value={isOffline}>
			{children}
		</OnlineStatusContext.Provider>
	);
};

export const useOnlineStatus = () => {
	const store = useContext(OnlineStatusContext);
	return store;
};

export const PLATFORM_CAMERA_PERMISSIONS = {
	ios: PERMISSIONS.IOS.CAMERA,
	android: PERMISSIONS.ANDROID.CAMERA,
};

export const PLATFORM_MICROPHONE_PERMISSIONS = {
	ios: PERMISSIONS.IOS.MICROPHONE,
	android: PERMISSIONS.ANDROID.RECORD_AUDIO,
};

export const PLATFORM_NOTIFICATION_PERMISSIONS = {
	android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
};

export const REQUEST_PERMISSION_TYPE = {
	camera: PLATFORM_CAMERA_PERMISSIONS,
	microphone: PLATFORM_MICROPHONE_PERMISSIONS,
	notification: PLATFORM_NOTIFICATION_PERMISSIONS,
};

export const checkPermission = async type => {
	const permissions = await REQUEST_PERMISSION_TYPE[type][Platform.OS];

	if (!permissions) {
		return true;
	}
	try {
		var result = await check(permissions);

		if (result === RESULTS.GRANTED) {
			return true;
		} else {
			return requestPermission(permissions, type);
		}
	} catch (error) {
		return false;
	}
};

export const requestPermission = async (permissions, type) => {
	try {
		var result = await request(permissions);
		if (result === 'granted') {
			return true;
		} else if (result === 'blocked') {
			Alert.alert('Permissions', `WinRate needs permission to access ${type}`, [
				{
					text: 'Ok',
					onPress: () => Linking.openSettings(),
				},
				{
					text: 'Cancel',
					onPress: () => {
						return false;
					},
				},
			]);

			return false;
		} else if (result === 'limited') {
			Alert.alert('Permissions', `WinRate needs permission to access ${type}`, [
				{
					text: 'Ok',
					onPress: () => Linking.openSettings(),
				},
				{
					text: 'Cancel',
					onPress: () => {
						return false;
					},
				},
			]);
			return false;
		} else if (result === 'unavailable') {
			Alert.alert('Permissions', `WinRate needs permission to access ${type}`, [
				{
					text: 'Ok',
					onPress: () => Linking.openSettings(),
				},
				{
					text: 'Cancel',
					onPress: () => {
						return false;
					},
				},
			]);
			return false;
		} else if (result === 'denied') {
			Alert.alert('Permissions', `WinRate needs permission to access ${type}`, [
				{
					text: 'Ok',
					onPress: () => Linking.openSettings(),
				},
				{
					text: 'Cancel',
					onPress: () => {
						return false;
					},
				},
			]);
			return false;
		}
	} catch (error) {
		return false;
	}
};
