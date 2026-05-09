import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
// App Check تم تعطيله مؤقتًا للتشخيص
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyCzDq5YrWhsbeA0DvmaM5IYV_PmZ4ivHjE",
  authDomain: "p2p-call-app-a1418.firebaseapp.com",
  databaseURL: "https://p2p-call-app-a1418-default-rtdb.firebaseio.com",
  projectId: "p2p-call-app-a1418",
  storageBucket: "p2p-call-app-a1418.firebasestorage.app",
  messagingSenderId: "1077235796363",
  appId: "1:1077235796363:web:4ea99f463a2805d6a75c64",
  measurementId: "G-YR0TL5WXDJ"
};

const app = initializeApp(firebaseConfig);

// ✅ تم تعطيل App Check مؤقتًا لتحديد سبب فشل تسجيل الدخول
// if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
//   initializeAppCheck(app, {
//     provider: new ReCaptchaV3Provider('6LfOud8sAAAAAGKE0hvOqVr16UN2_tqB5PU3nMrM'),
//     isTokenAutoRefreshEnabled: true,
//   });
// }

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

// الاتصال بالمحاكيات المحلية ( Emulators ) - يتم تفعليها يدويًا عند الحاجة
// connectAuthEmulator(auth, "http://localhost:9099");
// connectFirestoreEmulator(db, "localhost", 8080);

export { auth, db, storage, rtdb, app };