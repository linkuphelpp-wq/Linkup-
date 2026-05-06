import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { LogOut, Mail, Lock, User, Trash2, Shield, ChevronLeft, Pencil, Smartphone, Sparkles, X } from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';

const ProfileRow = ({ icon: Icon, label, value, onClick, danger }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-right group ${danger ? 'bg-red-50/50 hover:bg-red-100/80 border border-red-100' : 'bg-white hover:bg-gray-50/80 border border-gray-100 shadow-sm'}`}>
    <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${danger ? 'bg-red-100 text-red-600 group-hover:bg-red-200' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-bold ${danger ? 'text-red-700' : 'text-gray-900'}`}>{label}</p>
      {value && <p className="text-xs text-gray-500 mt-0.5 truncate">{value}</p>}
    </div>
    <ChevronLeft className={`w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-1 ${danger ? 'text-red-400' : 'text-gray-300'}`} />
  </button>
);

// ✅ مكون المودال الحديث لتغيير الاسم - فقط هذا تم تحسينه
const NameChangeModal = ({ open, onClose, currentName, onSave }) => {
  const [newName, setNewName] = useState(currentName || '');
  
  if (!open) return null;

  const handleSave = () => {
    if (newName.trim()) {
      onSave(newName.trim());
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">تغيير الاسم</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">الاسم الجديد</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="أدخل اسمك الجديد"
              className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-200"
              autoFocus
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">إلغاء</Button>
            <Button onClick={handleSave} disabled={!newName.trim()} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold shadow-md shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50">
              حفظ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="min-h-screen flex flex-col bg-slate-50/50 pb-32">
      <div className="bg-white px-5 pt-14 pb-8 rounded-b-3xl shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-600 to-blue-500 opacity-10"></div>
        <div className="relative inline-block mb-4">
          <Avatar className="w-28 h-28 border-4 border-white shadow-xl ring-4 ring-purple-500/10 mx-auto">
            <AvatarImage src={user?.photoURL} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-4xl font-bold">{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <button onClick={() => setShowNameModal(true)} 
            className="absolute bottom-1 right-1 w-9 h-9 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-lg border border-gray-100 hover:bg-purple-50 active:scale-90 transition-all">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-2xl font-black text-gray-900">{displayName}</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">@{username || 'غير محدد'}</p>
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> حساب نشط
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-5 pt-6 space-y-6 pb-8">
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">المعلومات الأساسية</h3>
          <ProfileRow icon={User} label="الاسم المعروض" value={displayName} onClick={() => setShowNameModal(true)} />
          <ProfileRow icon={Mail} label="البريد الإلكتروني" value={email} onClick={onChangeEmail} />
          <ProfileRow icon={Lock} label="كلمة المرور" value="••••••••" onClick={onResetPassword} />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">إدارة الحساب</h3>
          <ProfileRow icon={Smartphone} label="الدخول بحساب آخر" onClick={onSwitchAccount} />
          <ProfileRow icon={LogOut} label="تسجيل الخروج" onClick={onLogout} />
        </section>

        <section className="pt-4 border-t border-gray-200">
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className="w-full flex items-center justify-center gap-2 py-3.5 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-colors border border-transparent hover:border-red-100">
              <Trash2 className="w-4 h-4" /> حذف الحساب نهائياً
            </button>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-4 text-center shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>              <p className="text-red-800 font-bold text-sm">هل أنت متأكد؟ هذا الإجراء لا يمكن التراجع عنه.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">إلغاء</Button>
                <Button onClick={handleDelete} disabled={deleting} className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20">
                  {deleting ? 'جارٍ...' : 'تأكيد الحذف'}
                </Button>
              </div>
              {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            </div>
          )}
        </section>
      </main>

      {/* ✅ المودال الحديث لتغيير الاسم - هذا فقط تم تحسينه */}
      <NameChangeModal 
        open={showNameModal} 
        onClose={() => setShowNameModal(false)} 
        currentName={displayName}
        onSave={(name) => onUpdateProfile?.({ displayName: name })}
      />
    </div>
  );
}