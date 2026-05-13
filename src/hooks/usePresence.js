import { useEffect, useRef } from 'react';
import { auth, db } from '../firebase/config';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export const usePresence = () => {
  const user = auth.currentUser;
  const heartbeatRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    let isMounted = true;

    // تعيين متصل عند الدخول
    const setOnline = async () => {
      try {
        await setDoc(userRef, { status: 'online', lastSeen: new Date() }, { merge: true });
      } catch (error) {
        console.error('فشل تعيين الحالة متصل:', error);
      }
    };

    // تعيين غير متصل عند الخروج
    const setOffline = async () => {
      try {
        await setDoc(userRef, { status: 'offline', lastSeen: new Date() }, { merge: true });
      } catch (error) {
        console.error('فشل تعيين الحالة غير متصل:', error);
      }
    };

    setOnline();

    // نبض كل 30 ثانية لتأكيد الاتصال
    heartbeatRef.current = setInterval(setOnline, 30000);

    // الاستماع لتغيير حالة المستخدم (اختياري للتطبيقات الأخرى)
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // يمكن استخدام هذه البيانات في أي مكان آخر، لكننا نعتمد على setDoc أعلاه
      }
    });

    // عند الخروج أو إغلاق الصفحة
    const handleBeforeUnload = () => setOffline();
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatRef.current);
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      if (isMounted) {
        setOffline();
        isMounted = false;
      }
    };
  }, [user?.uid]);
};