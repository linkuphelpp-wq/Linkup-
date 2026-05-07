import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Fingerprint, CheckCircle, Shield } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function AppLockScreen({ onBack }) {
  const { lockEnabled, enableBiometric, disableBiometric } = useAppLock();
  const [saved, setSaved] = useState(false);

  const handleToggle = async () => {
    if (lockEnabled) {
      disableBiometric();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      const success = await enableBiometric();
      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-32 text-right" dir="rtl">
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-gray-200/60 px-5 pt-12 pb-4 text-center shadow-sm"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">قفل التطبيق</h1>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">حماية إضافية باستخدام بصمتك</p>
      </motion.header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">تفعيل القفل بالبصمة</p>
                <p className="text-xs text-gray-500 mt-1">
                  عند الفتح سيُطلب التحقق من هويتك
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className={`w-14 h-8 rounded-full transition-colors relative ${lockEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${lockEnabled ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 leading-relaxed">
                عند تفعيل القفل، سيُطلب منك التحقق من هويتك باستخدام بصمة إصبعك عند فتح التطبيق. في حال عدم استجابة البصمة، يمكنك استخدام كلمة مرور جهازك (PIN أو النقش) كبديل من خلال نافذة النظام التي ستظهر تلقائياً.
              </p>
            </div>
          </div>
        </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-700"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-bold">
              {lockEnabled ? 'تم تفعيل القفل بنجاح' : 'تم تعطيل القفل بنجاح'}
            </span>
          </motion.div>
        )}
      </main>
    </div>
  );
}