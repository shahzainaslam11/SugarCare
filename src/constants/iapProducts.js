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
const IOS_IAP_PRODUCT_IDS = ['food_scan_5', 'food_scan_10', 'food_scan_15', 'food_scan_25'];
const ANDROID_IAP_PRODUCT_IDS = ['food_scan_5', 'food_scan_10', 'food_scan_15', 'food_scan_25'];

export const FOOD_SCAN_PRODUCT_IDS = Platform.select({
  ios: IOS_IAP_PRODUCT_IDS,
  android: ANDROID_IAP_PRODUCT_IDS,
  default: IOS_IAP_PRODUCT_IDS,
});

/** Credits granted per store productId (keys must match FOOD_SCAN_PRODUCT_IDS entries). */
export const SCAN_CREDITS_BY_PRODUCT_ID = {
  food_scan_5: 5,
  food_scan_10: 10,
  food_scan_15: 15,
  food_scan_25: 25,
};

/** UI + logical plan id (plan id === store productId when IDs align). */
export const FOOD_SCAN_PLANS = [
  {
    id: 'food_scan_5',
    title: '5 Food Scans',
    label: 'Starter',
    scans: 5,
    description: 'Perfect for trying food analysis.',
  },
  {
    id: 'food_scan_10',
    title: '10 Food Scans',
    label: 'Popular',
    scans: 10,
    description: 'Best for regular weekly tracking.',
  },
  {
    id: 'food_scan_15',
    title: '15 Food Scans',
    label: 'Plus',
    scans: 15,
    description: 'More scans for steady habits.',
  },
  {
    id: 'food_scan_25',
    title: '25 Food Scans',
    label: 'BEST VALUE',
    scans: 25,
    description: 'Maximum savings for daily use.',
    bestValue: true,
  },
];
