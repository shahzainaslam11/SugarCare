import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIAP} from 'react-native-iap';
import {useDispatch} from 'react-redux';
import {showError, showSuccess} from '../utilities';
import {useScanCredits} from './ScanCreditsContext';
import * as iapService from '../services/iapService';
import {FOOD_SCAN_PRODUCT_IDS, SCAN_CREDITS_BY_PRODUCT_ID} from '../constants/iapProducts';
import {verifyAndCreditPurchase} from '../redux/slices/iapSlice';

const PROCESSED_PURCHASES_KEY = 'processedIapTransactions';

const IAPContext = createContext(null);

const getTransactionId = purchase =>
  purchase?.transactionId ||
  purchase?.transactionIdentifier ||
  purchase?.purchaseToken ||
  purchase?.id ||
  '';

const isLikelyJws = value => {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  return trimmed.split('.').length === 3;
};

const getIosSignedTransactionInfo = purchase => {
  const directCandidates = [
    purchase?.signedTransactionInfo,
    purchase?.signedTransactionInfoIOS,
    purchase?.transactionReceiptIOS,
    purchase?.transactionReceipt,
  ];

  const directMatch = directCandidates.find(isLikelyJws);
  if (directMatch) {
    return directMatch;
  }

  if (typeof purchase?.originalJson === 'string') {
    try {
      const parsed = JSON.parse(purchase.originalJson);
      const nestedCandidates = [
        parsed?.signedTransactionInfo,
        parsed?.signed_transaction_info,
        parsed?.transactionReceipt,
      ];
      const nestedMatch = nestedCandidates.find(isLikelyJws);
      if (nestedMatch) {
        return nestedMatch;
      }
    } catch (_) {}
  }

  return null;
};

const getIosReceiptData = purchase => {
  const directCandidates = [
    purchase?.transactionReceipt,
    purchase?.transactionReceiptIOS,
    purchase?.receiptData,
  ];
  const direct = directCandidates.find(value => typeof value === 'string' && value.trim());
  if (direct) {
    return direct;
  }
  const originalJsonValue = purchase?.originalJson;
  if (typeof originalJsonValue === 'string') {
    try {
      const parsed = JSON.parse(originalJsonValue);
      const nested = [
        parsed?.transactionReceipt,
        parsed?.receiptData,
        parsed?.receipt_data,
      ].find(value => typeof value === 'string' && value.trim());
      if (nested) {
        return nested;
      }
    } catch (_) {}
  }
  if (originalJsonValue && typeof originalJsonValue === 'object') {
    const nested = [
      originalJsonValue?.transactionReceipt,
      originalJsonValue?.receiptData,
      originalJsonValue?.receipt_data,
    ].find(value => typeof value === 'string' && value.trim());
    if (nested) {
      return nested;
    }
  }
  return null;
};

export function IAPProvider({children}) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [processedTransactions, setProcessedTransactions] = useState(new Set());
  const dispatch = useDispatch();
  const {refreshBalance} = useScanCredits();
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
        const signedTransactionInfo = getIosSignedTransactionInfo(currentPurchase);
        const iosReceiptData = getIosReceiptData(currentPurchase);
        const purchaseToken =
          currentPurchase?.purchaseToken ||
          currentPurchase?.purchaseTokenAndroid ||
          currentPurchase?.transactionReceipt;

        const iosTransactionId =
          currentPurchase?.transactionId ||
          currentPurchase?.transactionIdentifier ||
          currentPurchase?.originalTransactionIdentifierIOS ||
          '';

        if (Platform.OS === 'ios' && !signedTransactionInfo && !iosReceiptData && !iosTransactionId) {
          throw new Error(
            'iOS purchase payload missing transaction proof (JWS/receipt/transactionId).',
          );
        }

        await dispatch(
          verifyAndCreditPurchase({
            platform: Platform.OS,
            product_id: currentPurchase.productId,
            signed_transaction_info: signedTransactionInfo,
            receipt_data: iosReceiptData,
            transactionReceipt: iosReceiptData,
            transaction_id: iosTransactionId,
            purchase_token: purchaseToken,
            package_name: 'com.sugarcare.app',
          }),
        ).unwrap();
        await iapService.finishTransaction(currentPurchase, true);
        await markProcessed(transactionId);
        await refreshBalance();
        showSuccess('Purchase successful 🎉');
        afterSuccessfulPurchaseRef.current?.();
      } catch (error) {
        const resolvedMessage =
          typeof error === 'string' ? error : error?.message || 'Unable to complete transaction';
        showError(resolvedMessage);
      } finally {
        setIsProcessing(false);
      }
    };

    handlePurchase();
  }, [currentPurchase, dispatch, markProcessed, processedTransactions, refreshBalance]);

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
