import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search, Trash2, CheckCircle, XCircle, AlertTriangle, Download, Bell, Key,
  Users, Shield, Zap, UserPlus, ArrowLeft, Copy, Check, Mail, MessageCircle,
  User, Star, Crown, Sparkles, Activity, Eye, EyeOff, MoreHorizontal
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import {
  collection, query, getDocs, onSnapshot, doc, updateDoc, deleteDoc,
  writeBatch, orderBy, limit, addDoc, serverTimestamp, setDoc, where
} from 'firebase/firestore';

// ───────── دائرة إحصائية متحركة ─────────
const StatRing = ({ value, max, color, label, icon: Icon }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="relative flex flex-col items-center"
    >
      <svg width="90" height="90" className="transform -rotate-90">
        <defs>
          <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.from} />
            <stop offset="100%" stopColor={color.to} />
          </linearGradient>
          <filter id={`glow-${label}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="45" cy="45" r="36" fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <motion.circle
          cx="45" cy="45" r="36"
          fill="none"
          stroke={`url(#grad-${label})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter={`url(#glow-${label})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Icon className="w-4 h-4 text-gray-600 mb-0.5" />
        <span className="text-base font-black text-gray-900">{value}</span>
      </div>
      <p className="text-[10px] text-gray-500 mt-1 font-medium">{label}</p>
    </motion.div>
  );
};

// ───────── بطاقة مستخدم ثلاثية الأبعاد ─────────
const UserCard3D = ({ user, index, onToggleAdmin, onToggleBan, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showActions, setShowActions] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5
    });
  };

  const isBanned = user.status === 'banned';
  const isAdmin = user.isAdmin === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { setIsHovered(true); setShowActions(true); }}
      onMouseLeave={() => { setIsHovered(false); setShowActions(false); }}
      style={{
        transform: isHovered ? `perspective(800px) rotateX(${mousePos.y * 6}deg) rotateY(${mousePos.x * 6}deg)` : 'perspective(800px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="relative overflow-hidden rounded-2xl bg-white border border-gray-100/80 shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* تأثير الإضاءة المتحركة */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${(mousePos.x + 0.5) * 100}% ${(mousePos.y + 0.5) * 100}%, rgba(139,92,246,0.12) 0%, transparent 50%)`
        }}
      />

      {/* شريط الحالة العلوي */}
      <div className={`absolute top-0 left-0 w-full h-1 ${isBanned ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} />
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* الصورة الرمزية مع شارة الصلاحية */}
          <div className="relative shrink-0">
            <Avatar className="w-14 h-14 border-2 border-white shadow-md ring-2 ring-purple-100">
              <AvatarImage src={user.photoURL} className="object-cover" />
              <AvatarFallback className={`text-lg font-bold ${isAdmin ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'}`}>
                {user.email?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            {isAdmin && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-md border-2 border-white"
              >
                <Crown className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>

          {/* معلومات المستخدم */}
          <div className="flex-1 min-w-0 text-right">
            <p className="font-bold text-gray-900 text-sm truncate">{user.displayName || user.email?.split('@')[0]}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">{user.email}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">@{user.username || 'غير محدد'}</p>
            
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                isBanned ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isBanned ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                {isBanned ? 'محظور' : 'نشط'}
              </span>
              {user.warning && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                  <AlertTriangle className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات - تظهر عند التحويم */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleAdmin(user.id, user.isAdmin)}
                  className={`p-2 rounded-xl transition-colors ${isAdmin ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600'}`}
                  title={isAdmin ? 'إزالة المشرف' : 'تعيين كمشرف'}
                >
                  <Crown className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleBan(user.id, user.status)}
                  className={`p-2 rounded-xl transition-colors ${
                    isBanned ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                  title={isBanned ? 'فك الحظر' : 'حظر'}
                >
                  {isBanned ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(user.id, user.username)}
                  className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ───────── المكون الرئيسي ─────────
export default function UserManagementScreen({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const stats = {
    total: users?.length || 0,
    active: (users || []).filter(u => u.status !== 'banned').length,
    banned: (users || []).filter(u => u.status === 'banned').length,
    admins: (users || []).filter(u => u.isAdmin === true).length,
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleAdmin = async (userId, currentAdmin) => {
    setActionLoading(`admin-${userId}`);
    try {
      await updateDoc(doc(db, 'users', userId), { isAdmin: !currentAdmin });
      showToast(currentAdmin ? 'تم إزالة صلاحية المشرف' : 'تم تعيينه كمشرف');
    } catch (e) { showToast('فشل التحديث', 'error'); }
    finally { setActionLoading(null); }
  };

  const toggleBan = async (userId, currentStatus) => {
    setActionLoading(`ban-${userId}`);
    try {
      await updateDoc(doc(db, 'users', userId), { status: currentStatus === 'banned' ? 'online' : 'banned' });
      showToast(currentStatus === 'banned' ? 'تم فك الحظر' : 'تم حظر المستخدم');
    } catch (e) { showToast('فشل التحديث', 'error'); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (userId, username) => {
    if (!confirm(`حذف نهائي لـ ${username || userId}؟`)) return;
    setActionLoading(`delete-${userId}`);
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', userId));
      if (username) batch.delete(doc(db, 'usernames', username));
      await batch.commit();
      showToast('تم الحذف بنجاح');
    } catch (e) { showToast('فشل الحذف', 'error'); }
    finally { setActionLoading(null); }
  };

  const filteredUsers = (users || []).filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.displayName || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-32 text-right" dir="rtl">
      {/* الهيدر الزجاجي */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-gray-200/60 px-5 pt-12 pb-4 shadow-sm"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </motion.button>
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-500" />
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">إدارة المستخدمين</h1>
                </div>
                <p className="text-sm text-gray-500 mt-1">تحكم كامل بالمستخدمين وصلاحياتهم</p>
              </div>
            </div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full"
            >
              {filteredUsers.length} مستخدم
            </motion.span>
          </div>
        </div>
      </motion.header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-8 space-y-8">
        {/* حلقات إحصائية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm flex justify-center">
            <StatRing value={stats.total} max={Math.max(stats.total, 1)} color={{ from: '#6366f1', to: '#8b5cf6' }} label="الإجمالي" icon={Users} />
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm flex justify-center">
            <StatRing value={stats.active} max={Math.max(stats.total, 1)} color={{ from: '#10b981', to: '#14b8a6' }} label="نشط" icon={Activity} />
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm flex justify-center">
            <StatRing value={stats.banned} max={Math.max(stats.total, 1)} color={{ from: '#ef4444', to: '#f43f5e' }} label="محظور" icon={Shield} />
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm flex justify-center">
            <StatRing value={stats.admins} max={Math.max(stats.total, 1)} color={{ from: '#f59e0b', to: '#fbbf24' }} label="مشرفين" icon={Crown} />
          </div>
        </motion.div>

        {/* شريط البحث */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          className="relative"
        >
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="ابحث عن مستخدم بالبريد أو المعرف أو الاسم..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-12 pr-12 pl-4 rounded-2xl bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-purple-500/40 text-sm shadow-sm transition-all"
          />
        </motion.div>

        {/* شبكة بطاقات المستخدمين */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"
            />
            <p className="text-sm text-gray-500 font-medium">جاري تحميل البيانات...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Users className="w-9 h-9 text-purple-600/70" />
            </div>
            <p className="text-gray-800 font-bold text-lg">لا يوجد مستخدمين مطابقين</p>
            <p className="text-sm text-gray-500 mt-1.5">جرب مصطلح بحث آخر</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredUsers.map((user, index) => (
              <UserCard3D
                key={user.id}
                user={user}
                index={index}
                onToggleAdmin={toggleAdmin}
                onToggleBan={toggleBan}
                onDelete={deleteUser}
              />
            ))}
          </div>
        )}
      </main>

      {/* إشعار التوست */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 ${
              toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'
            } text-white`}
          >
            {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}