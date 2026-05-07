import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { LogOut, Mail, Lock, User, Trash2, Shield, ChevronRight, Pencil, Smartphone, Sparkles, X, Zap, Crown, ArrowRight } from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';

// ───────── صف الإجراءات بتصميم عصري ─────────
const ProfileRow = ({ icon: Icon, label, value, onClick, danger, color = 'purple' }) => {
  const colorsMap = {
    purple: 'from-purple-500 to-indigo-500 bg-purple-50 text-purple-600',
    blue: 'from-blue-500 to-cyan-500 bg-blue-50 text-blue-600',
    green: 'from-emerald-500 to-teal-500 bg-emerald-50 text-emerald-600',
    orange: 'from-orange-500 to-red-500 bg-orange-50 text-orange-600',
    red: 'from-red-500 to-rose-500 bg-red-50 text-red-600',
  };
  const colorSet = danger ? colorsMap.red : colorsMap[color] || colorsMap.purple;

  return (
    <motion.button
      whileHover={{ y: -3, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100/80 shadow-sm hover:shadow-md transition-all text-right group overflow-hidden relative"
    >
      {/* طبقة التأثير الخلفي عند التحويم */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-transparent to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
      
      <div className={`relative p-2.5 rounded-xl bg-gradient-to-br ${colorSet} text-white shadow-md group-hover:shadow-lg transition-all group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0 relative">
        <p className={`text-sm font-bold ${danger ? 'text-red-700' : 'text-gray-900'}`}>{label}</p>
        {value && <p className="text-xs text-gray-500 mt-0.5 truncate">{value}</p>}
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all shrink-0" />
    </motion.button>
  );
};

// ───────── مودال تغيير الاسم بتصميم فاخر ─────────
const NameChangeModal = ({ open, onClose, currentName, onSave }) => {
  const [newName, setNewName] = useState(currentName || '');

  const handleSave = () => {
    if (newName.trim()) {
      onSave(newName.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-purple-500" />
                <h3 className="text-xl font-bold text-gray-900">تغيير الاسم</h3>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">الاسم الجديد</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="أدخل اسمك الجديد"
                  className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-200 text-lg"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 font-medium transition-all"
                >
                  إلغاء
                </motion.button>
                <motion.button
                  whileTap={newName.trim() ? { scale: 0.95 } : {}}
                  onClick={handleSave}
                  disabled={!newName.trim()}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
                >
                  حفظ
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ───────── المكون الرئيسي (شاشة الملف الشخصي الجديدة) ─────────
export default function ProfileScreen({ user, onUpdateProfile, onLogout, onChangeEmail, onResetPassword, onSwitchAccount }) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);

  const handleDelete = async () => {
    setDeleting(true); setError('');
    try {
      const u = auth.currentUser;
      if (!u) throw new Error('لا يوجد مستخدم');
      await deleteDoc(doc(db, 'users', u.uid));
      const savedU = localStorage.getItem('my_username');
      if (savedU) await deleteDoc(doc(db, 'usernames', savedU)).catch(() => {});
      await deleteUser(u);
      localStorage.clear(); sessionStorage.clear();
      await signOut(auth);
    } catch (e) {
      setError(e.code === 'auth/requires-recent-login' ? 'يجب إعادة تسجيل الدخول أولاً' : 'تعذر الحذف');
    } finally { setDeleting(false); }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'مستخدم';
  const email = user?.email || '';
  const username = localStorage.getItem('my_username') || '';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-32 text-right" dir="rtl">
      {/* الهيدر الزجاجي */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-gray-200/40 px-5 pt-12 pb-4 text-center shadow-sm"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Crown className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            الملف الشخصي
          </h1>
        </div>
        <p className="text-sm text-gray-500">معلومات حسابك وإعداداته</p>
      </motion.div>

      {/* المحتوى الرئيسي */}
      <div className="px-4 py-6 space-y-8 max-w-lg mx-auto w-full">
        
        {/* بطاقة الملف الشخصي العليا */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="relative overflow-hidden rounded-3xl bg-white border border-gray-100/80 shadow-lg"
        >
          {/* شريط زخرفي علوي */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
          
          <div className="relative flex flex-col items-center pt-14 pb-8 px-6">
            {/* الصورة الرمزية - تظهر من الأعلى */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Avatar className="w-28 h-28 border-4 border-white shadow-xl ring-4 ring-purple-500/10">
                  <AvatarImage src={user?.photoURL} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-4xl font-bold">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              {/* زر تعديل الصورة */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNameModal(true)}
                className="absolute -bottom-1 -right-1 w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-100 hover:bg-purple-50 active:scale-90 transition-all"
              >
                <Pencil className="w-4 h-4" />
              </motion.button>
            </div>

            {/* الاسم والمعرف */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-center mt-4"
            >
              <h2 className="text-2xl font-black text-gray-900">{displayName}</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">@{username || 'غير محدد'}</p>
              
              {/* شارة الحالة النشطة */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.45, type: 'spring', stiffness: 200, damping: 15 }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 shadow-sm"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-emerald-500"
                />
                <Sparkles className="w-3.5 h-3.5" />
                حساب نشط
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* قسم المعلومات الأساسية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 px-1 mb-2">
            <User className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">المعلومات الأساسية</h3>
          </div>
          
          <ProfileRow icon={User} label="الاسم المعروض" value={displayName} onClick={() => setShowNameModal(true)} color="purple" />
          <ProfileRow icon={Mail} label="البريد الإلكتروني" value={email} onClick={onChangeEmail} color="blue" />
          <ProfileRow icon={Lock} label="كلمة المرور" value="••••••••" onClick={onResetPassword} color="green" />
        </motion.div>

        {/* قسم إدارة الحساب */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 20 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 px-1 mb-2">
            <Shield className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">إدارة الحساب</h3>
          </div>
          
          <ProfileRow icon={Smartphone} label="الدخول بحساب آخر" onClick={onSwitchAccount} color="orange" />
          <ProfileRow icon={LogOut} label="تسجيل الخروج" onClick={onLogout} color="red" />
        </motion.div>

        {/* قسم حذف الحساب */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
        >
          <AnimatePresence mode="wait">
            {!showDelete ? (
              <motion.button
                key="show-delete"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDelete(true)}
                className="w-full flex items-center justify-center gap-3 py-4 text-red-500 font-bold text-sm bg-white border border-red-100 rounded-2xl hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              >
                <Trash2 className="w-5 h-5" /> حذف الحساب نهائياً
              </motion.button>
            ) : (
              <motion.div
                key="confirm-delete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border-2 border-red-200 rounded-2xl p-6 space-y-5 text-center shadow-lg"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"
                >
                  <Trash2 className="w-8 h-8 text-red-600" />
                </motion.div>
                
                <div>
                  <p className="text-red-800 font-bold text-lg mb-1">هل أنت متأكد؟</p>
                  <p className="text-sm text-gray-500">هذا الإجراء لا يمكن التراجع عنه.</p>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDelete(false)}
                    className="flex-1 h-11 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 font-medium transition-all"
                  >
                    إلغاء
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-md shadow-red-200 disabled:opacity-50 transition-all"
                  >
                    {deleting ? 'جارٍ...' : 'تأكيد الحذف'}
                  </motion.button>
                </div>
                
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* مودال تغيير الاسم */}
      <NameChangeModal 
        open={showNameModal} 
        onClose={() => setShowNameModal(false)} 
        currentName={displayName}
        onSave={(name) => onUpdateProfile?.({ displayName: name })}
      />
    </div>
  );
}