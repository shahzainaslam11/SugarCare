// utils/firebaseErrors.js
export const firebaseErrorMessages = {
  'auth/invalid-credential':
    'Your login credentials are incorrect. Please try again.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
};

export const getFirebaseErrorMessage = error => {
  if (!error?.code) return 'Something went wrong. Please try again.';
  return (
    firebaseErrorMessages[error.code] ||
    'An unexpected error occurred. Please try again.'
  );
};
