import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function VerifyEmailScreen({ onVerified, onRetry }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (e) {
      console.error('خطأ في إعادة الإرسال:', e);
    }
    setSending(false);
  };

  const handleCheckAgain = async () => {
    if (onRetry) {
      onRetry();
    } else {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        onVerified();
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-5">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg mb-6">
          <Mail className="h-10 w-10" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">تأكيد البريد الإلكتروني</h1>
        <p className="text-gray-600 mb-2">
          لقد أرسلنا رابط تحقق إلى بريدك الإلكتروني
        </p>
        <p className="text-sm font-mono text-blue-600 bg-blue-50 rounded-lg py-2 px-4 mb-6">
          {auth.currentUser?.email || 'بريدك الإلكتروني'}
        </p>

        {sent && (
          <p className="text-green-600 text-sm mb-4 bg-green-50 py-2 px-3 rounded-full">
            تم إرسال رابط التحقق مجدداً
          </p>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleCheckAgain}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            تحققت بالفعل
          </Button>

          <Button
            onClick={handleResend}
            disabled={sending}
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Mail className="h-5 w-5 mr-2" />
            {sending ? 'جاري الإرسال...' : 'إعادة إرسال رابط التحقق'}
          </Button>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full h-12 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-2" />
            تسجيل الخروج
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          لم تستلم البريد؟ تأكد من صندوق الوارد ومجلد البريد العشوائي
        </p>
      </div>
    </div>
  );
}