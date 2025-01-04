import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpctrSR49FIGKJ6YR6cB29PFq3mbhYr-c",
  authDomain: "difia-6ea10.firebaseapp.com",
  projectId: "difia-6ea10",
  storageBucket: "difia-6ea10.firebasestorage.app",
  messagingSenderId: "813501718648",
  appId: "1:813501718648:web:06a62e51cd06ed2fee0d8d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { app, auth, db };