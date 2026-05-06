import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { ArrowLeft, Trash2, Bell } from 'lucide-react';

const ADMIN_UID = 'REPLACE_WITH_YOUR_ADMIN_UID'; // ⚡️ استبدله بمعرف المسؤول

export default function NotificationsScreen({ onBack }) {
  const [notifications, setNotifications] = useState([]);
  const isAdmin = auth.currentUser?.uid === ADMIN_UID;

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(list);
    });
    return () => unsub();
  }, []);

  const deleteNotification = async (id) => {
    if (!isAdmin) return;
    const ok = confirm('حذف هذا الإشعار؟ سيُحذف من الجميع.');
    if (!ok) return;
    await deleteDoc(doc(db, 'notifications', id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="px-5 py-4 max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5 ml-2" /> رجوع
          </Button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Bell className="h-6 w-6" /> الإشعارات
        </h2>
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 py-10">لا توجد إشعارات حالياً</p>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => (
              <div key={notif.id} className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <Bell className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-800">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notif.timestamp?.toDate?.()?.toLocaleString('ar-SA')}
                  </p>
                </div>
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => deleteNotification(notif.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}