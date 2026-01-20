import { initializeApp } from 'firebase/app';
import {getAuth} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Optionally import the services that you want to use
// import {...} from 'firebase/database';
// 
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDizqH8AkQnqBMp9E4TdHyco8_woAJ_XGg",
  authDomain: "smart-e-commerce-app-249a0.firebaseapp.com",
  projectId: "smart-e-commerce-app-249a0",
  storageBucket: "smart-e-commerce-app-249a0.firebasestorage.app",
  messagingSenderId: "61896383686",
  appId: "1:61896383686:web:1038e6544b306b0f3ccbc7",
  measurementId: "G-8Q4V73V4Q0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export {auth, db}
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
