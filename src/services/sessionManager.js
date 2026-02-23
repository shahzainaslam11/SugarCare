/**
 * Session manager - handles session expiry callbacks (401, logout, etc.)
 * Used by apiClient and AuthContext to trigger navigation reset.
 */

let _onSessionExpired = null;

export function setOnSessionExpired(callback) {
  _onSessionExpired = callback;
}

export function clearSessionExpiredCallback() {
  _onSessionExpired = null;
}

export function triggerSessionExpired() {
  if (typeof _onSessionExpired === 'function') {
    _onSessionExpired();
  }
}
