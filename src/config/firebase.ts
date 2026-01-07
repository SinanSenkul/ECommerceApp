import { initializeApp } from 'firebase/app';
import {getAuth} from 'firebase/auth';

// Optionally import the services that you want to use
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
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
export const auth = getAuth(app);

// export {auth}
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
