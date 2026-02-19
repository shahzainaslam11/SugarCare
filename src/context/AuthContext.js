/**
 * Centralized Auth Context - session management & App Store compliance
 * - Syncs with Redux auth state
 * - Provides logout (with nav reset) and deleteAccount
 * - Ensures restoreSession runs on app launch
 */

import React, {createContext, useContext, useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  initializeAuth,
  logoutUser,
  logout as logoutRedux,
  deleteAccountUser,
} from '../redux/slices/authSlice';
import {clearSecureCredentials} from '../services/secureStorage';
import {triggerSessionExpired} from '../services/sessionManager';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const dispatch = useDispatch();
  const {user, accessToken, loading: authLoading, isInitialized} = useSelector(
    state => state.auth,
  );

  const isAuthenticated = Boolean(accessToken && user);

  const restoreSession = useCallback(async () => {
    await dispatch(initializeAuth());
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (_) {}
    await clearSecureCredentials();
    await require('@react-native-async-storage/async-storage').default.multiRemove([
      'accessToken',
      'refreshToken',
      'user',
      'aiConsent',
    ]);
    dispatch(logoutRedux());
    triggerSessionExpired();
  }, [dispatch]);

  const deleteAccount = useCallback(async () => {
    await dispatch(deleteAccountUser()).unwrap();
    await logout();
  }, [dispatch, logout]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const value = {
    user,
    accessToken,
    isAuthenticated,
    loading: authLoading && !isInitialized,
    logout,
    restoreSession,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
