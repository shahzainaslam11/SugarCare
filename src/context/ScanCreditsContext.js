import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCAN_CREDITS_KEY = 'foodScanCredits';
const ScanCreditsContext = createContext(null);

export function ScanCreditsProvider({children}) {
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const persistQueueRef = useRef(Promise.resolve());

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
    }),
    [scanCount, loading, addScans, consumeOneScan],
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
