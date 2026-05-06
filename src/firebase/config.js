import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAJcSl5mKrjJYH9pHKJQVHfufrfk0KcCHg",
  authDomain: "tero-2792b.firebaseapp.com",
  projectId: "tero-2792b",
  storageBucket: "tero-2792b.firebasestorage.app",
  messagingSenderId: "307482241190",
  appId: "1:307482241190:web:5a0439c9a1bdd0574b6c67"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);