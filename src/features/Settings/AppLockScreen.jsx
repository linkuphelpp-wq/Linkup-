import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Eye, EyeOff, Fingerprint, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppLock } from '../../context/AppLockContext';

export default function AppLockScreen({ onBack }) {
  const { lockEnabled, enableLock, disableLock, biometricEnabled, enableBiometric, disableBiometric } = useAppLock();
  const [enabled, setEnabled] = useState(lockEnabled);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [saved, setSaved] = useState(false);
  const [oldPin, setOldPin] = useState('');

  const handleToggle = () => {
    if (enabled) {
      if (oldPin === localStorage.getItem('app_lock_pin')) {
        disableLock();
        setEnabled(false);
        setOldPin('');
        setPin('');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('رمز PIN الحالي غير صحيح');
      }
    } else {
      setEnabled(true);
    }
  };

  const handleSave = () => {
    if (pin.length < 4 || pin.length > 6) {
      alert('يجب أن يكون رمز PIN بين 4 و 6 أرقام');
      return;
    }
    enableLock(pin, 0);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEnableBiometric = async () => {
    const success = await enableBiometric();
    if (success) {
      alert('تم تفعيل البصمة بنجاح');
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
        <p className="text-sm text-gray-500 mt-1">حماية إضافية لتطبيقك</p>
      </motion.header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900">تفعيل القفل الأمني</p>
              <p className="text-xs text-gray-500 mt-1">طلب رمز PIN عند كل فتح</p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`w-14 h-8 rounded-full transition-colors relative ${enabled ? 'bg-purple-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : ''}`} />
          </button>
        </motion.div>

        {enabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm space-y-5"
          >
            {lockEnabled ? (
              <>
                <label className="text-sm font-bold text-gray-700 block">أدخل رمز PIN الحالي للإلغاء</label>
                <div className="relative">
                  <Input
                    type={showPin ? 'text' : 'password'}
                    value={oldPin}
                    onChange={e => setOldPin(e.target.value)}
                    placeholder="••••••"
                    maxLength={6}
                    className="h-14 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-200 text-center tracking-[0.5em] text-xl font-mono"
                  />
                  <button onClick={() => setShowPin(!showPin)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <Button
                  onClick={handleToggle}
                  className="w-full h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-base shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
                >
                  تعطيل القفل
                </Button>
              </>
            ) : (
              <>
                <label className="text-sm font-bold text-gray-700 block">تعيين رمز PIN جديد</label>
                <div className="relative">
                  <Input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-6 أرقام"
                    maxLength={6}
                    className="h-14 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-200 text-center tracking-[0.5em] text-xl font-mono"
                  />
                  <button onClick={() => setShowPin(!showPin)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* زر البصمة */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-6 h-6 text-purple-600" />
                    <span className="text-sm font-medium">فتح بالبصمة</span>
                  </div>
                  {biometricEnabled ? (
                    <button
                      onClick={disableBiometric}
                      className="px-4 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-bold hover:bg-red-200 transition-colors"
                    >
                      إلغاء
                    </button>
                  ) : (
                    <button
                      onClick={handleEnableBiometric}
                      className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-600 text-xs font-bold hover:bg-purple-200 transition-colors"
                    >
                      تفعيل
                    </button>
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={pin.length < 4}
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  حفظ القفل
                </Button>
              </>
            )}
          </motion.div>
        )}

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-700"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-bold">تم الحفظ بنجاح</span>
          </motion.div>
        )}
      </main>
    </div>
  );
}