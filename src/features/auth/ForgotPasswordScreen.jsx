import { useState } from 'react';
import { ArrowLeft, Mail, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      setError(err.code === 'auth/user-not-found' ? 'هذا البريد غير مسجل لدينا' : 'حدث خطأ، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="px-5 pt-12 pb-4 flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">نسيت كلمة المرور؟</h2>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-4 pb-24 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 text-center space-y-6">
          
          {!success ? (
            <>
              <div>
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">استعادة الحساب</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  أدخل بريدك الإلكتروني المسجل، وسنرسل لك رابطاً خاصاً لتعيين كلمة مرور جديدة.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-right">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">البريد الإلكتروني</label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="example@mail.com" 
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-blue-200 text-left dir-ltr" 
                    required 
                  />
                </div>

                {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2 justify-center"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

                <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  {loading ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
                </Button>
              </form>
            </>
          ) : (
            <div className="py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">تم الإرسال بنجاح!</h3>
              <p className="text-sm text-gray-500 mb-6">
                يرجى التحقق من صندوق الوارد في <span className="font-bold text-gray-800">{email}</span> واتباع التعليمات.
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