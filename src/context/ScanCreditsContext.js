import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {fetchIapBalance} from '../redux/slices/iapSlice';

const SCAN_CREDITS_KEY = 'foodScanCredits';
const ScanCreditsContext = createContext(null);

export function ScanCreditsProvider({children}) {
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const persistQueueRef = useRef(Promise.resolve());
  const dispatch = useDispatch();
  const {accessToken} = useSelector(state => state.auth);

  useEffect(() => {
    const hydrateCredits = async () => {
      try {
        const stored = await AsyncStorage.getItem(SCAN_CREDITS_KEY);
        setScanCount(stored ? Number(stored) || 0 : 0);
      } finally {
        setLoading(false);
      }
    };

    hydrateCredits();
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!accessToken) {
      setScanCount(0);
      return 0;
    }
    const balance = await dispatch(fetchIapBalance()).unwrap();
    setScanCount(balance);
    await AsyncStorage.setItem(SCAN_CREDITS_KEY, String(balance));
    return balance;
  }, [accessToken, dispatch]);

  useEffect(() => {
    let cancelled = false;
    const syncBalance = async () => {
      if (!accessToken) {
        if (!cancelled) {
          setLoading(false);
          setScanCount(0);
        }
        return;
      }
      try {
        const balance = await dispatch(fetchIapBalance()).unwrap();
        if (!cancelled) {
          setScanCount(balance);
          await AsyncStorage.setItem(SCAN_CREDITS_KEY, String(balance));
        }
      } catch (_) {
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    syncBalance();
    return () => {
      cancelled = true;
    };
  }, [accessToken, dispatch]);

  const updateCredits = useCallback(
    async updater => {
      const nextPersistPromise = persistQueueRef.current.then(async () => {
        const currentStored = await AsyncStorage.getItem(SCAN_CREDITS_KEY);
        const current = currentStored ? Number(currentStored) || 0 : 0;
        const next = Math.max(0, updater(current));
        await AsyncStorage.setItem(SCAN_CREDITS_KEY, String(next));
        setScanCount(next);
        return next;
      });
      persistQueueRef.current = nextPersistPromise.catch(() => undefined);
      return nextPersistPromise;
    },
    [],
  );

  const addScans = useCallback(
    async amount => {
      return updateCredits(current => current + Number(amount || 0));
    },
    [updateCredits],
  );

  const consumeOneScan = useCallback(async () => {
    return updateCredits(current => current - 1);
  }, [updateCredits]);

  const value = useMemo(
    () => ({
      scanCount,
      loading,
      addScans,
      consumeOneScan,
      refreshBalance,
    }),
    [scanCount, loading, addScans, consumeOneScan, refreshBalance],
  );

  return <ScanCreditsContext.Provider value={value}>{children}</ScanCreditsContext.Provider>;
}

export function useScanCredits() {
  const context = useContext(ScanCreditsContext);
  if (!context) {
    throw new Error('useScanCredits must be used within ScanCreditsProvider');
  }
  return context;
}
