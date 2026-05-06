import { useState } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '../../firebase/config';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail } from 'firebase/auth';

export default function ChangeEmailScreen({ onSuccess, onBack }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newEmail) { setError('يرجى ملء جميع الحقول'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      setSuccess('تم تحديث البريد بنجاح');
      onSuccess?.(user);
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' ? 'كلمة المرور غير صحيحة' : 'فشل التحديث، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  return (
    <div className="pt-28 px-5 pb-24 min-h-screen bg-slate-50/50 flex items-start justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 space-y-6 relative">

        {/* زر الرجوع إلى البروفايل */}
        <button
          onClick={onBack}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
        >
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center mb-2">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-7 h-7 text-purple-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">تغيير البريد</h2>
          <p className="text-sm text-gray-500 mt-1">قم بتحديث بريدك الإلكتروني لحسابك</p>
        </div>

        {/* البريد الحالي */}
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">البريد الحالي</label>
          <div className="h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center text-gray-600 text-sm font-medium">
            {user?.email || 'غير محدد'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* كلمة المرور الحالية */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">تأكيد كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="pr-12 h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-purple-200" required />
            </div>
          </div>

          {/* البريد الجديد */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">البريد الإلكتروني الجديد</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@example.com" className="pr-12 h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-purple-200" required />
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm p-3 rounded-xl flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" />{success}</div>}

          <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? 'جارٍ التحديث...' : 'تحديث البريد'}
          </Button>
        </form>
      </div>
    </div>
  );
}