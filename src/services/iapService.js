import {Platform} from 'react-native';
import {
  initConnection as initIapConnection,
  endConnection,
  getProducts as getIapProducts,
  requestPurchase as requestIapPurchase,
  finishTransaction as finishIapTransaction,
  getAvailablePurchases,
} from 'react-native-iap';
import {FOOD_SCAN_PRODUCT_IDS} from '../constants/iapProducts';

export {FOOD_SCAN_PRODUCT_IDS};

export const initConnection = async () => {
  try {
    return await initIapConnection();
  } catch (error) {
    throw new Error(error?.message || 'Unable to connect to store');
  }
};

export const closeConnection = async () => {
  try {
    await endConnection();
  } catch (_) {}
};

export const getProducts = async () => {
  try {
    return await getIapProducts({skus: FOOD_SCAN_PRODUCT_IDS});
  } catch (error) {
    throw new Error(error?.message || 'Failed to fetch products');
  }
};

export const requestPurchase = async productId => {
  try {
    return await requestIapPurchase({
      sku: productId,
      ...(Platform.OS === 'android' ? {skus: [productId]} : {}),
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });
  } catch (error) {
    throw error;
  }
};

export const finishTransaction = async (purchase, isConsumable = true) => {
  try {
    return await finishIapTransaction({
      purchase,
      isConsumable,
    });
  } catch (error) {
    throw new Error(error?.message || 'Failed to finalize transaction');
  }
};

export const restorePurchases = async () => {
  try {
    return await getAvailablePurchases();
  } catch (error) {
    throw new Error(error?.message || 'Failed to restore purchases');
  }
};
