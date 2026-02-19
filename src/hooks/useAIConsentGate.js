/**
 * Hook to gate AI features - shows consent modal if not yet consented
 */

import {useState, useRef, useCallback} from 'react';
import {ensureAIConsent, createAIConsentResolver} from '../utilities/ensureAIConsent';
import {showError} from '../utilities';

export function useAIConsentGate() {
  const [showModal, setShowModal] = useState(false);
  const resolverRef = useRef(null);

  const gateAIAction = useCallback(async callback => {
    const ok = await ensureAIConsent(() => {
      resolverRef.current = createAIConsentResolver();
      setShowModal(true);
      return resolverRef.current.promise;
    });
    if (!ok) {
      showError('AI features require your consent to process data.');
      return false;
    }
    if (typeof callback === 'function') {
      await callback();
    }
    return true;
  }, []);

  const handleAccept = useCallback(() => {
    resolverRef.current?.resolve(true);
    resolverRef.current = null;
    setShowModal(false);
  }, []);

  const handleDecline = useCallback(() => {
    resolverRef.current?.resolve(false);
    resolverRef.current = null;
    setShowModal(false);
  }, []);

  return {
    gateAIAction,
    showModal,
    setShowModal,
    handleAccept,
    handleDecline,
  };
}
