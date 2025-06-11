// Import
import { REACT_APP_APPID, REACT_APP_AUTH_DOMAIN, REACT_APP_FIREBASE_API_KEY, REACT_APP_MEASUREMENTID, REACT_APP_PROJECT_ID, REACT_APP_SENDERID, REACT_APP_STORAGE_BUCKET } from "@env";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: REACT_APP_AUTH_DOMAIN,
  projectId: REACT_APP_PROJECT_ID,
  storageBucket: REACT_APP_STORAGE_BUCKET,
  messagingSenderId: REACT_APP_SENDERID,
  appId: REACT_APP_APPID,
  measurementId: REACT_APP_MEASUREMENTID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage();

// console.log(REACT_APP_FIREBASE_API_KEY);

export { auth, db, storage };
