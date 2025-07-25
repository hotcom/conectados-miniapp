// Firebase configuration for DoeAgora MVP
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbbr-MUTRZ5oPl7f5M-IxlYYfIRvFxi9s",
  authDomain: "doeagora-b6616.firebaseapp.com",
  projectId: "doeagora-b6616",
  storageBucket: "doeagora-b6616.firebasestorage.app",
  messagingSenderId: "978712844622",
  appId: "1:978712844622:web:7ba8c800a6c9e77a60261f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Export the app
export default app;
