// src/config/firebase.js
import {getAuth} from '@react-native-firebase/auth';
import {getFirestore} from '@react-native-firebase/firestore';
import {getApp, initializeApp} from '@react-native-firebase/app';

let app;

// Safely get or initialize the Firebase app
try {
  app = getApp();
} catch (error) {
  app = initializeApp();
}

// Initialize services
const auth = getAuth(app);
const firestore = getFirestore(app);

// Export the Firebase Auth and Firestore instances
export {auth, firestore};
