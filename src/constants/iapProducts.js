import {Platform} from 'react-native';

/**
 * Product IDs must match the store exactly (case-sensitive), character-for-character:
 * - App Store Connect → app → Monetization → In-App Purchases → Product ID
 * - Play Console → Monetize → Products → Product ID
 *
 * Common mistake: IDs here are e.g. food_scan_5 but ASC has com.yourcompany.app.scan5 → Invalid product ID.
 * Fix: paste your real Product IDs into the platform arrays below (and update SCAN_CREDITS_BY_PRODUCT_ID keys).
 *
 * Products must be configured as consumables (or non-consumables) queried via getProducts.
 * Auto-renewable subscriptions belong in getSubscriptions instead — different API.
 */
const IOS_IAP_PRODUCT_IDS = ['food_scan_basic', 'food_scan_standard', 'food_scan_premium'];
const ANDROID_IAP_PRODUCT_IDS = ['food_scan_basic', 'food_scan_standard', 'food_scan_premium'];

export const FOOD_SCAN_PRODUCT_IDS = Platform.select({
  ios: IOS_IAP_PRODUCT_IDS,
  android: ANDROID_IAP_PRODUCT_IDS,
  default: IOS_IAP_PRODUCT_IDS,
});

/** Credits granted per store productId (keys must match FOOD_SCAN_PRODUCT_IDS entries). */
export const SCAN_CREDITS_BY_PRODUCT_ID = {
  food_scan_basic: 100,
  food_scan_standard: 200,
  food_scan_premium: 'unlimited',
};

/** UI + logical plan id (plan id === store productId when IDs align). */
export const FOOD_SCAN_PLANS = [
  {
    id: 'food_scan_basic',
    title: 'Basic',
    label: 'Basic',
    credits: 100,
    description: 'Start your smarter health journey.',
  },
  {
    id: 'food_scan_standard',
    title: 'Standard',
    label: 'Popular',
    credits: 200,
    description: 'Smarter insights for daily wellness.',
  },
  {
    id: 'food_scan_premium',
    title: 'Premium',
    label: 'Premium',
    credits: 'Unlimited',
    description: 'Unlimited access to predictive AI insights.',
  },
];
