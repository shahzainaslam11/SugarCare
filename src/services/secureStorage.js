/**
 * Secure storage for sensitive auth data (tokens, userId).
 * Uses react-native-keychain on device; falls back to AsyncStorage only for non-sensitive app data.
 */

import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.sugarcare.app.auth';
const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
};

/**
 * Save credentials to Keychain (secure)
 */
export async function setSecureCredentials(accessToken, refreshToken, userId) {
  try {
    if (accessToken) {
      await Keychain.setGenericPassword(KEYS.ACCESS_TOKEN, accessToken, {
        service: `${SERVICE_NAME}.access`,
      });
    }
    if (refreshToken) {
      await Keychain.setGenericPassword(KEYS.REFRESH_TOKEN, refreshToken, {
        service: `${SERVICE_NAME}.refresh`,
      });
    }
    if (userId != null) {
      await Keychain.setGenericPassword(KEYS.USER_ID, String(userId), {
        service: `${SERVICE_NAME}.user`,
      });
    }
    return true;
  } catch (error) {
    console.warn('[SecureStorage] setSecureCredentials error:', error?.message);
    return false;
  }
}

/**
 * Get stored credentials from Keychain
 */
export async function getSecureCredentials() {
  try {
    const [accessResult, refreshResult, userResult] = await Promise.all([
      Keychain.getGenericPassword({service: `${SERVICE_NAME}.access`}),
      Keychain.getGenericPassword({service: `${SERVICE_NAME}.refresh`}),
      Keychain.getGenericPassword({service: `${SERVICE_NAME}.user`}),
    ]);

    const accessToken = accessResult?.password ?? null;
    const refreshToken = refreshResult?.password ?? null;
    const userId = userResult?.password ?? null;

    return {accessToken, refreshToken, userId};
  } catch (error) {
    console.warn('[SecureStorage] getSecureCredentials error:', error?.message);
    return {accessToken: null, refreshToken: null, userId: null};
  }
}

/**
 * Clear all secure credentials
 */
export async function clearSecureCredentials() {
  try {
    await Promise.all([
      Keychain.resetGenericPassword({service: `${SERVICE_NAME}.access`}),
      Keychain.resetGenericPassword({service: `${SERVICE_NAME}.refresh`}),
      Keychain.resetGenericPassword({service: `${SERVICE_NAME}.user`}),
    ]);
    return true;
  } catch (error) {
    console.warn('[SecureStorage] clearSecureCredentials error:', error?.message);
    return false;
  }
}
