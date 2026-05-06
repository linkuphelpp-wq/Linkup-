import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { X, Copy, MessageCircle, UserPlus } from 'lucide-react';

export default function ContactInfoModal({ open, member, onClose, onOpenChat }) {
  const [isContact, setIsContact] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!member?.uid) return;
    const checkContact = async () => {
      const q = query(collection(db, 'contacts'), where('participants', 'array-contains', currentUser.uid));
      const snap = await getDocs(q);
      const exists = snap.docs.some(d => d.data().participants.includes(member.uid));
      setIsContact(exists);
    };
    checkContact();
  }, [member]);

  const addToContacts = async () => {
    try {
      await addDoc(collection(db, 'contacts'), {
        participants: [currentUser.uid, member.uid],
        displayName: member.name || '',
        username: member.username || '',
        email: '',
        createdAt: serverTimestamp(),
      });
      setIsContact(true);
      toast.success('تمت الإضافة إلى جهات الاتصال');
    } catch (err) { toast.error('فشل الإضافة'); }
  };

  const copyUsername = () => {
    if (member.username) {
      navigator.clipboard.writeText(member.username);
      toast.success('تم نسخ المعرف');
    }
  };

  const startChat = () => {
    // إذا لم يكن مضافًا، أضفه أولاً ثم افتح المحادثة
    if (!isContact) {
      addToContacts().then(() => {
        onOpenChat?.({ uid: member.uid, displayName: member.name, username: member.username });
      });
    } else {
      onOpenChat?.({ uid: member.uid, displayName: member.name, username: member.username });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-80 text-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5" /></button>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          {member.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <h3 className="font-bold text-lg mb-2">{member.name}</h3>
        {member.username && <p className="text-gray-500 text-sm mb-4">@{member.username}</p>}

        <div className="space-y-3">
          {!isContact && (
            <button onClick={addToContacts} className="w-full flex items-center justify-center gap-2 py-2 bg-purple-50 text-purple-700 rounded-lg">
              <UserPlus className="w-4 h-4" /> إضافة لجهات الاتصال
            </button>
          )}
          <button onClick={copyUsername} className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-700 rounded-lg">
            <Copy className="w-4 h-4" /> نسخ المعرف
          </button>
          <button onClick={startChat} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <MessageCircle className="w-4 h-4" /> محادثة مباشرة
          </button>
        </div>
      </div>
    </div>
  );
}