import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, Video, Phone, MessageCircle, Filter, Sparkles,
  Trash2, Star, UserPlus, X, Check, AlertCircle, Pencil,
  ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth, db } from '../../firebase/config';
import {
  collection, query, where, onSnapshot, getDocs, deleteDoc,
  doc, addDoc, serverTimestamp, getDoc, updateDoc
} from 'firebase/firestore';
import { toast } from 'sonner';

// ───────── الشعار ─────────
const LinkUpLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-9 h-9">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl rotate-6 opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl -rotate-6 opacity-20"></div>
      <div className="absolute inset-0 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
        <MessageCircle className="w-5 h-5 text-purple-600" />
      </div>
    </div>
    <span className="text-2xl font-black tracking-tight text-gray-900">
      Link<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Up</span>
    </span>
  </div>
);

// ✅ دالة الاسم الآمن
const getSafeName = (contact) => {
  const emailPattern = /@/;
  const candidates = [
    contact?.localDisplayName,
    contact?.displayName,
    contact?.username,
    contact?.name,
  ];
  for (let candidate of candidates) {
    if (candidate && !emailPattern.test(candidate)) {
      return candidate;
    }
  }
  return 'مستخدم';
};

// ───────── بطاقة جهة الاتصال (معدّلة بتأثيرات حركية) ─────────
const ContactCard = ({ contact, onCall, onChat, onDelete, onToggleFavorite, isFavorite, onEdit, unreadCount = 0, index = 0 }) => {
  const [status, setStatus] = useState('offline');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!contact.uid) return;
    const unsub = onSnapshot(doc(db, 'users', contact.uid), (snap) => {
      if (snap.exists()) {
        setStatus(snap.data().status || 'offline');
      } else {
        setStatus('offline');
      }
    });
    return () => unsub();
  }, [contact.uid]);

  const safeName = getSafeName(contact);
  const statusDot = status === 'online' ? 'bg-emerald-500' : 'bg-gray-300';
  const statusText = status === 'online' ? 'متصل الآن' : 'غير متصل';

  const handleCallPress = (type) => {
    if (status !== 'online') {
      toast.error('المستخدم غير متصل حاليًا', {
        description: 'لا يمكن إجراء المكالمة الآن، حاول لاحقًا',
      });
      return;
    }
    onCall?.(contact, type);
    setExpanded(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -3, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* الصف الرئيسي */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {/* نجمة المفضلة */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => onToggleFavorite?.(contact)}
            className={`shrink-0 p-1 rounded-full transition-all ${isFavorite ? 'text-yellow-500 hover:bg-yellow-100' : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-100'}`}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-500' : ''}`} />
          </motion.button>

          {/* الصورة + مؤشر الحالة */}
          <div className="relative shrink-0">
            <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-2 ring-purple-500/10">
              <AvatarImage src={contact.photoURL} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold text-lg">
                {safeName.charAt(0)?.toUpperCase() || 'م'}
              </AvatarFallback>
            </Avatar>
            <motion.span
              animate={{ scale: status === 'online' ? [1, 1.2, 1] : 1 }}
              transition={{ repeat: status === 'online' ? Infinity : 0, duration: 2 }}
              className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusDot} shadow-sm`}
            />
          </div>

          {/* الاسم والحالة */}
          <div className="flex-1 min-w-0 text-right">
            <p className="font-bold text-gray-900 truncate text-base">@{safeName}</p>
            <p className="text-xs text-gray-500">{statusText}</p>
          </div>

          {/* عدد غير المقروء */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="min-w-[22px] h-5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-md px-1.5"
            >
              <span className="text-[10px] font-bold text-white">{unreadCount}</span>
            </motion.div>
          )}

          {/* زر القلم (تعديل الاسم) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit?.(contact)}
            className="p-2.5 rounded-full bg-gray-50 text-amber-600 hover:bg-amber-100 active:scale-90 transition-all"
            title="تعديل الاسم"
          >
            <Pencil className="w-4 h-4" />
          </motion.button>

          {/* زر السهم (توسيع/طي الشريط السفلي) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-90 transition-all"
            title="خيارات"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* شريط الأزرار المنسدل (مع حركة انسيابية) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 flex items-center justify-around border-t border-gray-100 mt-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCallPress('video')}
                className="flex flex-col items-center gap-1 text-purple-600 hover:bg-purple-50 p-2 rounded-xl transition-colors"
              >
                <Video className="w-5 h-5" />
                <span className="text-xs font-medium">فيديو</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCallPress('audio')}
                className="flex flex-col items-center gap-1 text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs font-medium">صوت</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { onChat?.(contact); setExpanded(false); }}
                className="flex flex-col items-center gap-1 text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-medium">محادثة</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setExpanded(false); onToggleFavorite?.(contact); }}
                className="flex flex-col items-center gap-1 text-yellow-500 hover:bg-yellow-50 p-2 rounded-xl transition-colors"
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                <span className="text-xs font-medium">مفضلة</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setExpanded(false); onDelete?.(contact); }}
                className="flex flex-col items-center gap-1 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-xs font-medium">حذف</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ───────── مودال تأكيد الحذف ─────────
const DeleteConfirmModal = ({ open, contact, onConfirm, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-5"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">تأكيد الحذف</h2>
            <p className="text-sm text-gray-500 mt-2">
              هل أنت متأكد من حذف <strong>@{getSafeName(contact)}</strong>؟
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl">إلغاء</Button>
            <Button onClick={onConfirm} className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white">حذف</Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ───────── مودال تعديل الاسم ─────────
const EditNameModal = ({ open, contact, onSave, onClose }) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setNewName(contact?.localDisplayName || '');
  }, [contact]);

  const handleSave = () => {
    if (!newName.trim()) return;
    onSave(contact, newName.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-5"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">تعديل الاسم</h2>
              <button onClick={onClose}><X className="w-5 h-5" /></button>
            </div>
            <Input
              placeholder="الاسم الجديد"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="mb-4 h-12"
              autoFocus
            />
            <Button onClick={handleSave} disabled={!newName.trim()} className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white">
              حفظ
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ───────── المكون الرئيسي ─────────
export default function ContactsScreen({ onCall, onChat }) {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('contact_favorites') || '[]'); } catch { return []; }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  const currentUser = auth.currentUser;

  // جلب جهات الاتصال
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(collection(db, 'contacts'), where('participants', 'array-contains', currentUser.uid));
    const unsub = onSnapshot(q, async (snap) => {
      const contactsList = await Promise.all(snap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const contactId = data.participants.find(p => p !== currentUser.uid);
        if (!contactId) return null;

        let userData = {};
        try {
          const userSnap = await getDoc(doc(db, 'users', contactId));
          if (userSnap.exists()) {
            userData = userSnap.data();
          }
        } catch {}

        return {
          id: docSnap.id,
          uid: contactId,
          email: userData.email || data.email || '',
          username: data.username || userData.username || '',
          photoURL: userData.photoURL || '',
          localDisplayName: data.displayName || '',
          displayName: userData.displayName || '',
        };
      }));
      setContacts(contactsList.filter(Boolean));
    });
    return () => unsub();
  }, [currentUser]);

  // عداد غير المقروء
  useEffect(() => {
    if (!currentUser?.uid) return;
    const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
    const unsub = onSnapshot(chatsQuery, (snapshot) => {
      const counts = {};
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const otherUserId = data.participants.find(p => p !== currentUser.uid);
        if (otherUserId && data.unreadCount) {
          counts[otherUserId] = (counts[otherUserId] || 0) + data.unreadCount;
        }
      });
      setUnreadCounts(counts);
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => { localStorage.setItem('contact_favorites', JSON.stringify(favorites)); }, [favorites]);

  const toggleFavorite = (contact) => {
    const id = contact.uid || contact.username;
    setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const q = query(collection(db, 'contacts'), where('participants', 'array-contains', currentUser.uid));
      const snapshot = await getDocs(q);
      const docToDelete = snapshot.docs.find(d => d.data().participants.includes(deleteTarget.uid));
      if (docToDelete) await deleteDoc(doc(db, 'contacts', docToDelete.id));
    } catch (err) {
      console.error('فشل الحذف:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEditSave = async (contact, newName) => {
    if (!newName) return;
    setContacts(prev =>
      prev.map(c =>
        (c.uid || c.username) === (contact.uid || contact.username)
          ? { ...c, localDisplayName: newName }
          : c
      )
    );
    try {
      const q = query(collection(db, 'contacts'), where('participants', 'array-contains', currentUser.uid));
      const snapshot = await getDocs(q);
      const docToUpdate = snapshot.docs.find(d => d.data().participants.includes(contact.uid));
      if (docToUpdate) {
        await updateDoc(doc(db, 'contacts', docToUpdate.id), { displayName: newName });
      }
    } catch (err) {
      console.error('فشل التعديل:', err);
    }
  };

  const handleAddContact = async () => {
    const trimmed = addUsername.trim();
    if (!trimmed || !currentUser) return;
    setAddLoading(true);
    setAddError('');
    setAddSuccess('');
    try {
      const usernameDoc = await getDoc(doc(db, 'usernames', trimmed));
      if (!usernameDoc.exists()) { setAddError('المعرف غير موجود'); return; }
      const targetUid = usernameDoc.data().uid;
      if (targetUid === currentUser.uid) { setAddError('لا يمكنك إضافة نفسك'); return; }
      const existingQuery = query(collection(db, 'contacts'), where('participants', 'array-contains', currentUser.uid));
      const existingSnap = await getDocs(existingQuery);
      if (existingSnap.docs.some(d => d.data().participants.includes(targetUid))) {
        setAddError('موجود بالفعل في جهات الاتصال'); return;
      }
      const targetSnap = await getDoc(doc(db, 'users', targetUid));
      const targetData = targetSnap.exists() ? targetSnap.data() : {};
      await addDoc(collection(db, 'contacts'), {
        participants: [currentUser.uid, targetUid],
        displayName: targetData.displayName || targetData.email || '',
        email: targetData.email || '',
        username: trimmed,
        createdAt: serverTimestamp(),
      });
      setAddSuccess('تمت الإضافة بنجاح');
      setAddUsername('');
      setTimeout(() => setShowAddModal(false), 800);
    } catch (err) {
      console.error(err);
      setAddError('حدث خطأ أثناء الإضافة');
    } finally {
      setAddLoading(false);
    }
  };

  const filteredContacts = useMemo(() => {
    let list = contacts;
    if (activeFilter === 'favorites') list = list.filter(c => favorites.includes(c.uid || c.username));
    else if (activeFilter === 'online') list = list.filter(c => c.status === 'online');
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(c =>
        (c.username || '').toLowerCase().includes(term) ||
        (c.localDisplayName || '').toLowerCase().includes(term) ||
        (c.displayName || '').toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term)
      );
    }
    return [...list].sort((a, b) => {
      const aFav = favorites.includes(a.uid || a.username) ? 1 : 0;
      const bFav = favorites.includes(b.uid || b.username) ? 1 : 0;
      return bFav - aFav;
    });
  }, [contacts, activeFilter, searchTerm, favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-24 text-right" dir="rtl">
      {/* مودال الإضافة */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-5"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">إضافة جهة اتصال</h2>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <Input placeholder="أدخل المعرف (username)" value={addUsername} onChange={e => { setAddUsername(e.target.value); setAddError(''); setAddSuccess(''); }} className="mb-3 h-12" disabled={addLoading} />
              {addError && <p className="text-red-500 text-sm mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {addError}</p>}
              {addSuccess && <p className="text-green-600 text-sm mb-2 flex items-center gap-1"><Check className="w-4 h-4" /> {addSuccess}</p>}
              <Button onClick={handleAddContact} disabled={addLoading || !addUsername.trim()} className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                {addLoading ? 'جارٍ...' : 'إضافة'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal open={!!deleteTarget} contact={deleteTarget} onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)} />
      <EditNameModal open={!!editTarget} contact={editTarget} onSave={handleEditSave} onClose={() => setEditTarget(null)} />

      {/* الهيدر الزجاجي العصري */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-12 pb-4 shadow-sm"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-between mb-5">
          <LinkUpLogo />
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAddModal(true)}
              className="rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 h-10 w-10 flex items-center justify-center"
            >
              <UserPlus className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 h-10 w-10 flex items-center justify-center"
            >
              <Filter className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-purple-500" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">جهات الاتصال</h1>
          </div>
          <p className="text-sm text-gray-500">تواصل بسهولة مع الأشخاص المهمين لديك</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'favorites', 'online'].map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap shrink-0 transition-all duration-300 ${activeFilter === filter ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md shadow-purple-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {filter === 'all' && <><Sparkles className="w-3.5 h-3.5" /> الكل</>}
              {filter === 'favorites' && 'المفضلة'}
              {filter === 'online' && 'متصل الآن'}
            </motion.button>
          ))}
        </div>
      </motion.header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 overflow-y-auto px-5 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input placeholder="ابحث عن اسم أو رقم..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-12 pr-12 pl-4 rounded-2xl bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-purple-500/40 text-sm placeholder:text-gray-400 shadow-sm transition-all" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between mb-4 px-1"
        >
          <h3 className="text-sm font-bold text-gray-800">جهات الاتصال</h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{filteredContacts.length}</span>
        </motion.div>

        {filteredContacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Users className="w-9 h-9 text-purple-600/70" />
            </div>
            <p className="text-gray-800 font-bold text-lg">لا توجد جهات اتصال</p>
            <p className="text-sm text-gray-500 mt-1.5 max-w-[200px]">ابدأ بإضافة أصدقائك لبدء التواصل</p>
          </motion.div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredContacts.map((contact, index) => (
              <ContactCard
                key={contact.uid || contact.username}
                contact={contact}
                onCall={onCall}
                onChat={onChat}
                onDelete={setDeleteTarget}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(contact.uid || contact.username)}
                onEdit={setEditTarget}
                unreadCount={unreadCounts[contact.uid] || 0}
                index={index}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}