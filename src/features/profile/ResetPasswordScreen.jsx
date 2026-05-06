import { useState } from 'react';
import { ArrowLeft, Lock, Shield, AlertCircle, CheckCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '../../firebase/config';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function ResetPasswordProfileScreen({ onBack, onOpenForgotPassword }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('يرجى ملء جميع الحقول'); return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين'); return;
    }
    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل'); return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('كلمة المرور الحالية غير صحيحة. إذا نسيتها، استخدم رابط إعادة التعيين أدناه.');
      } else {
        setError('حدث خطأ أثناء التغيير. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 px-5 pb-24 min-h-screen bg-slate-50/50 flex items-start justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 space-y-6">
        
        {/* ✅ زر الرجوع الجديد */}
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-gray-500">العودة للملف الشخصي</span>
        </div>

        <div className="text-center mb-2">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-purple-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">تغيير كلمة المرور</h2>
          <p className="text-sm text-gray-500 mt-1">أدخل كلمة المرور الحالية للتحقق أولاً</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">كلمة المرور الحالية</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="pr-12 h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-purple-200" required />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button type="button" onClick={onOpenForgotPassword} className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-1.5 flex items-center gap-1 transition-colors">
                <Mail className="w-3.5 h-3.5" /> نسيت كلمة المرور؟ إرسال رابط إعادة التعيين
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">كلمة المرور الجديدة</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="pr-12 h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-purple-200" required />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">تأكيد كلمة المرور الجديدة</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pr-12 h-12 rounded-xl bg-white border-gray-200 focus-visible:ring-purple-200" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

            <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? 'جارٍ التحقق والتحديث...' : 'تحديث كلمة المرور'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">تم التغيير بنجاح!</h3>
            <p className="text-sm text-gray-500 mb-6">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
            <Button onClick={onBack} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold">العودة للملف الشخصي</Button>
          </div>
        )}
      </div>
    </div>
  );
}