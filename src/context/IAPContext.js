import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIAP} from 'react-native-iap';
import {showError, showSuccess} from '../utilities';
import {useScanCredits} from './ScanCreditsContext';
import * as iapService from '../services/iapService';
import {FOOD_SCAN_PRODUCT_IDS, SCAN_CREDITS_BY_PRODUCT_ID} from '../constants/iapProducts';

const PROCESSED_PURCHASES_KEY = 'processedIapTransactions';

const IAPContext = createContext(null);

const getTransactionId = purchase =>
  purchase?.transactionId ||
  purchase?.transactionIdentifier ||
  purchase?.purchaseToken ||
  purchase?.id ||
  '';

export function IAPProvider({children}) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [processedTransactions, setProcessedTransactions] = useState(new Set());
  const {addScans} = useScanCredits();
  /** Optional: e.g. PurchaseScreen registers `navigation.goBack` after credits are granted. */
  const afterSuccessfulPurchaseRef = useRef(null);

  const {connected, products, getProducts, currentPurchase, currentPurchaseError} = useIAP();

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(PROCESSED_PURCHASES_KEY)
      .then(cached => {
        if (cached && mounted) {
          setProcessedTransactions(new Set(JSON.parse(cached)));
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!connected) {
      return;
    }
    let cancelled = false;
    const loadProducts = async () => {
      try {
        await getProducts({skus: iapService.FOOD_SCAN_PRODUCT_IDS});
      } catch (error) {
        if (!cancelled) {
          showError(error?.message || 'Store unavailable. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [connected, getProducts]);

  useEffect(() => {
    if (!__DEV__ || !products?.length) {
      return;
    }
    const returnedIds = new Set(
      products.map(p => p.productId || p.id).filter(Boolean),
    );
    const missing = FOOD_SCAN_PRODUCT_IDS.filter(sku => !returnedIds.has(sku));
    if (missing.length > 0) {
      console.warn(
        '[IAP] Store did not return these SKUs:',
        missing,
        '\nPricing shows Unavailable until each exists on the platform you are running (iOS: App Store Connect; Android: Play Console), exact Product ID, metadata complete, active.',
      );
    }
  }, [products]);

  const markProcessed = useCallback(async transactionId => {
    setProcessedTransactions(prev => {
      const next = new Set(prev);
      next.add(transactionId);
      AsyncStorage.setItem(PROCESSED_PURCHASES_KEY, JSON.stringify([...next])).catch(
        () => {},
      );
      return next;
    });
  }, []);

  useEffect(() => {
    const handlePurchase = async () => {
      if (!currentPurchase?.productId) {
        return;
      }

      const scanCredit = SCAN_CREDITS_BY_PRODUCT_ID[currentPurchase.productId];
      if (!scanCredit) {
        return;
      }

      const transactionId = getTransactionId(currentPurchase);
      if (!transactionId) {
        return;
      }

      if (processedTransactions.has(transactionId)) {
        await iapService.finishTransaction(currentPurchase, true);
        setIsProcessing(false);
        return;
      }

      try {
        await iapService.finishTransaction(currentPurchase, true);
        await addScans(scanCredit);
        await markProcessed(transactionId);
        showSuccess('Purchase successful 🎉');
        afterSuccessfulPurchaseRef.current?.();
      } catch (error) {
        showError(error?.message || 'Unable to complete transaction');
      } finally {
        setIsProcessing(false);
      }
    };

    handlePurchase();
  }, [addScans, currentPurchase, markProcessed, processedTransactions]);

  useEffect(() => {
    if (!currentPurchaseError) {
      return;
    }
    setIsProcessing(false);
    if (currentPurchaseError.code === 'E_USER_CANCELLED') {
      showError('Purchase cancelled.');
      return;
    }
    if (currentPurchaseError.code === 'E_NETWORK_ERROR') {
      showError('Network error. Please try again.');
      return;
    }
    showError(currentPurchaseError?.message || 'Purchase failed. Please try again.');
  }, [currentPurchaseError]);

  const purchasePlan = useCallback(
    async productId => {
      if (!connected) {
        showError('Store unavailable. Please try again later.');
        return;
      }
      const fromStore = products?.find(
        p => p.productId === productId || p.id === productId,
      );
      if (!fromStore) {
        showError(
          'This product is not available from the store. Confirm the Product ID matches App Store Connect / Play Console exactly.',
        );
        return;
      }
      const sku = fromStore.productId || fromStore.id;
      if (!sku || !SCAN_CREDITS_BY_PRODUCT_ID[sku]) {
        showError(
          'Unknown product. Add this Product ID to the app configuration (SCAN_CREDITS_BY_PRODUCT_ID).',
        );
        return;
      }
      setIsProcessing(true);
      try {
        await iapService.requestPurchase(sku);
      } catch (error) {
        setIsProcessing(false);
        if (error?.code === 'E_USER_CANCELLED') {
          showError('Purchase cancelled.');
          return;
        }
        showError(error?.message || 'Unable to start purchase');
      }
    },
    [connected, products],
  );

  const refreshProducts = useCallback(async () => {
    try {
      await getProducts({skus: iapService.FOOD_SCAN_PRODUCT_IDS});
    } catch (error) {
      showError(error?.message || 'Unable to refresh products');
    }
  }, [getProducts]);

  const restorePurchases = useCallback(async () => {
    setIsRestoring(true);
    try {
      await iapService.restorePurchases();
      showSuccess('Restore completed. Consumables may not be restorable on iOS.');
    } catch (error) {
      showError(error?.message || 'Restore failed');
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const setAfterSuccessfulPurchase = useCallback(fn => {
    afterSuccessfulPurchaseRef.current = typeof fn === 'function' ? fn : null;
  }, []);

  const value = useMemo(
    () => ({
      connected,
      products,
      isBootstrapping,
      isProcessing,
      isRestoring,
      purchasePlan,
      restorePurchases,
      refreshProducts,
      setAfterSuccessfulPurchase,
    }),
    [
      connected,
      products,
      isBootstrapping,
      isProcessing,
      isRestoring,
      purchasePlan,
      restorePurchases,
      refreshProducts,
      setAfterSuccessfulPurchase,
    ],
  );

  return <IAPContext.Provider value={value}>{children}</IAPContext.Provider>;
}

export function useIapManager() {
  const context = useContext(IAPContext);
  if (!context) {
    throw new Error('useIapManager must be used within IAPProvider');
  }
  return context;
}
