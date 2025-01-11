// config/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase, increment, get } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpctrSR49FIGKJ6YR6cB29PFq3mbhYr-c",
  authDomain: "difia-6ea10.firebaseapp.com",
  projectId: "difia-6ea10",
  storageBucket: "difia-6ea10.firebasestorage.app",
  messagingSenderId: "813501718648",
  appId: "1:813501718648:web:06a62e51cd06ed2fee0d8d",
  // Menambahkan URL database yang benar untuk region Asia Tenggara
  databaseURL: "https://difia-6ea10-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app); // Inisialisasi Realtime Database

export const googleProvider = new GoogleAuthProvider();

export { app, auth, db, rtdb, increment, get };