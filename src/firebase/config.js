import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCXQUQ12WH0LQRPyuszK8sSfw_nyb7Mnss",
  authDomain: "tero-2792b.firebaseapp.com",
  databaseURL: "https://tero-2792b-default-rtdb.firebaseio.com",
  projectId: "tero-2792b",
  storageBucket: "tero-2792b.firebasestorage.app",
  messagingSenderId: "1077235796363",
  appId: "1:1077235796363:web:4ea99f463a2805d6a75c64",
  measurementId: "G-YR0TL5WXDJ"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { auth, db, storage, rtdb, app };