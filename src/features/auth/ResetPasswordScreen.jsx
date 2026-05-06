import { useState } from 'react';
import { ArrowLeft, Lock, Shield, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function ResetPasswordScreen({ onBack }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('كلمتا المرور غير متطابقتين'); return; }
    setLoading(true); setError('');
    try {
      // ملاحظة: في التطبيق الحقيقي يجب تمرير oobCode من الرابط
      // await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err) {
      setError('الرابط غير صالح أو منتهي الصلاحية');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="px-5 pt-12 pb-4 flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">تعيين كلمة مرور جديدة</h2>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-4 pb-24 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 text-center space-y-6">
          
          {!success ? (
            <>
              <div>
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-purple-600" />                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">تأمين حسابك</h3>
                <p className="text-sm text-gray-500">
                  اختر كلمة مرور قوية لا تقل عن 6 أحرف لحماية بياناتك.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-right">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      type={showPass ? 'text' : 'password'} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-200" 
                      required 
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-200" 
                      required 
                    />
                  </div>
                </div>

                {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2 justify-center"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

                <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  {loading ? 'جارٍ الحفظ...' : 'تأكيد كلمة المرور'}
                </Button>
              </form>
            </>
          ) : (            <div className="py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">تم التغيير بنجاح!</h3>
              <p className="text-sm text-gray-500 mb-6">
                يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
              </p>
              <Button onClick={onBack} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold">
                العودة لتسجيل الدخول
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}