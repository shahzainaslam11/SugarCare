/**
 * AI consent gate - ensures user has agreed to AI data disclosure before AI features
 * Use with useAIConsentGate hook for the simplest integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {AI_CONSENT_KEY} from '../components/AIConsentModal';

/**
 * Check if user has already consented
 */
export async function hasAIConsent() {
  try {
    const value = await AsyncStorage.getItem(AI_CONSENT_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Request AI consent - returns true if already consented or user accepts, false if user declines.
 * Pass setShowModal and a ref for the resolver.
 *
 * Usage:
 *   const [showAIConsent, setShowAIConsent] = useState(false);
 *   const aiResolverRef = useRef(null);
 *
 *   const handleScan = async () => {
 *     const ok = await ensureAIConsent(() => {
 *       aiResolverRef.current = createResolver();
 *       setShowAIConsent(true);
 *       return aiResolverRef.current.promise;
 *     });
 *     if (!ok) {
 *       showError('AI features require consent.');
 *       return;
 *     }
 *     // proceed
 *   };
 */
export async function ensureAIConsent(onShowModal) {
  if (await hasAIConsent()) return true;
  if (typeof onShowModal === 'function') {
    return onShowModal();
  }
  return false;
}

export function createAIConsentResolver() {
  let res = null;
  const promise = new Promise(resolve => {
    res = resolve;
  });
  return {promise, resolve: res};
}
