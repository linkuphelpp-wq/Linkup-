import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../../firebase/config';
import {
  collection, query, where, getDocs, addDoc, serverTimestamp,
  doc, onSnapshot, updateDoc
} from 'firebase/firestore';
import { toast } from 'sonner';
import {
  X, Copy, MessageCircle, UserPlus, Phone, Video, Star,
  Pencil, Shield, Calendar, Clock, Mail, User, CheckCircle, XCircle
} from 'lucide-react';

export default function ContactInfoModal({ open, member, onClose, onOpenChat, onCall }) {
  const [isContact, setIsContact] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!member?.uid || !open) return;
    const unsub = onSnapshot(doc(db, 'users', member.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData({
          ...data,
          lastSeen: data.lastSeen?.toDate?.() || (data.lastSeen ? new Date(data.lastSeen) : null),
          createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : null),
        });
      }
    });
    const checkContact = async () => {
      const q = query(collection(db, 'contacts'), where('participants', 'array-contains', currentUser.uid));
      const snap = await getDocs(q);
      const exists = snap.docs.some(d => d.data().participants.includes(member.uid));
      setIsContact(exists);
    };
    checkContact();
    const favs = JSON.parse(localStorage.getItem('contact_favorites') || '[]');
    setIsFavorite(favs.includes(member.uid));
    return () => unsub();
  }, [member, open, currentUser.uid]);

  const getStatus = () => {
    if (!userData) return { text: 'غير متصل', color: 'bg-gray-400', dot: 'bg-gray-400' };
    if (userData.status === 'online') return { text: 'متصل الآن', color: 'text-emerald-600', dot: 'bg-emerald-500' };
    if (userData.lastSeen) {
      const diff = Date.now() - userData.lastSeen.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return { text: 'قبل لحظات', color: 'text-gray-500', dot: 'bg-gray-400' };
      if (mins < 60) return { text: `قبل ${mins} دقيقة`, color: 'text-gray-500', dot: 'bg-gray-400' };
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return { text: `قبل ${hrs} ساعة`, color: 'text-gray-500', dot: 'bg-gray-400' };
      return { text: `قبل ${Math.floor(hrs / 24)} يوم`, color: 'text-gray-500', dot: 'bg-gray-400' };
    }
    return { text: 'غير متصل', color: 'text-gray-500', dot: 'bg-gray-400' };
  };

  const addToContacts = async () => {
    try {
      await addDoc(collection(db, 'contacts'), {
        participants: [currentUser.uid, member.uid],
        displayName: member.name || '',
        username: member.username || '',
        email: userData?.email || '',
        createdAt: serverTimestamp(),
      });
      setIsContact(true);
      toast.success('تمت الإضافة إلى جهات الاتصال');
    } catch (err) { toast.error('فشل الإضافة'); }
  };

  const toggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem('contact_favorites') || '[]');
    const updated = favs.includes(member.uid) ? favs.filter(id => id !== member.uid) : [...favs, member.uid];
    localStorage.setItem('contact_favorites', JSON.stringify(updated));
    setIsFavorite(prev => !prev);
  };

  const copyUsername = () => {
    if (member.username) {
      navigator.clipboard.writeText(member.username);
      toast.success('تم نسخ المعرف');
    }
  };

  const startChat = () => {
    if (!isContact) {
      addToContacts().then(() => onOpenChat?.({ uid: member.uid, displayName: member.name, username: member.username }));
    } else {
      onOpenChat?.({ uid: member.uid, displayName: member.name, username: member.username });
    }
  };

  const handleCall = (type) => {
    if (userData?.status !== 'online') {
      toast.error('المستخدم غير متصل حاليًا');
      return;
    }
    onCall?.(member, type);
  };

  const status = getStatus();
  const joinDate = userData?.createdAt?.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  const displayName = member.name || member.username || 'مستخدم';

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            {/* خلفية زخرفية */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-b-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* زر الإغلاق */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* صورة الملف الشخصي والحالة */}
              <div className="flex flex-col items-center mb-6 mt-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white">
                    {displayName.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <motion.span
                    animate={{ scale: userData?.status === 'online' ? [1, 1.2, 1] : 1 }}
                    transition={{ repeat: userData?.status === 'online' ? Infinity : 0, duration: 2 }}
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${status.dot} shadow`}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-3">{displayName}</h3>
                {member.username && (
                  <p className="text-sm text-gray-500">@{member.username}</p>
                )}
                <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${status.color}`}>
                  {status.text}
                </p>

                {/* مفضلة */}
                <button
                  onClick={toggleFavorite}
                  className={`mt-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                    isFavorite ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  {isFavorite ? 'مفضلة' : 'إضافة للمفضلة'}
                </button>
              </div>

              {/* معلومات إضافية */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2">
                {userData?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                )}
                {joinDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>انضم {joinDate}</span>
                  </div>
                )}
                {userData?.lastSeen && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>آخر ظهور {userData.lastSeen.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>

              {/* أزرار التواصل */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  onClick={startChat}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-xs font-medium">محادثة</span>
                </button>
                <button
                  onClick={() => handleCall('audio')}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-xs font-medium">مكالمة صوت</span>
                </button>
                <button
                  onClick={() => handleCall('video')}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  <Video className="w-5 h-5" />
                  <span className="text-xs font-medium">فيديو</span>
                </button>
              </div>

              {/* أزرار الإجراءات */}
              <div className="space-y-2">
                {!isContact ? (
                  <button
                    onClick={addToContacts}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    إضافة لجهات الاتصال
                  </button>
                ) : (
                  <button
                    onClick={() => { onClose(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    تعديل الاسم
                  </button>
                )}
                <button
                  onClick={copyUsername}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  نسخ المعرف
                </button>
                {isContact && (
                  <button
                    onClick={toggleFavorite}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${
                      isFavorite ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                    {isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}