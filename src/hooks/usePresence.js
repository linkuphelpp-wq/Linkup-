import { useEffect, useRef } from 'react';
import { auth, rtdb, db } from '../firebase/config';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';

export const usePresence = () => {
  const user = auth.currentUser;
  const isUpdating = useRef(false);

  useEffect(() => {
    if (!user?.uid) return;

    const userStatusRef = ref(rtdb, `status/${user.uid}`);
    const connectedRef = ref(rtdb, '.info/connected');

    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === false || isUpdating.current) return;
      isUpdating.current = true;

      onDisconnect(userStatusRef)
        .set({
          state: 'offline',
          lastChanged: serverTimestamp(),
        })
        .then(() => {
          return set(userStatusRef, {
            state: 'online',
            lastChanged: serverTimestamp(),
          });
        })
        .then(() => {
          return updateDoc(doc(db, 'users', user.uid), {
            status: 'online',
            lastSeen: new Date(),
          });
        })
        .catch((err) => console.error('خطأ في إعداد الحضور:', err))
        .finally(() => {
          isUpdating.current = false;
        });
    });

    const unsubscribeStatus = onValue(userStatusRef, (snap) => {
      const data = snap.val();
      if (data && data.state && !isUpdating.current) {
        updateDoc(doc(db, 'users', user.uid), {
          status: data.state,
          lastSeen: data.lastChanged ? new Date(data.lastChanged) : new Date(),
        }).catch(console.error);
      }
    });

    return () => {
      unsubscribeConnected();
      unsubscribeStatus();
    };
  }, [user?.uid]);
};